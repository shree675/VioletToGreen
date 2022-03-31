import * as vscode from "vscode";
const fs = require("fs");
const path = require("path");
import { SidebarSelectionProvider } from "./SidebarSelectionProvider";
import { SidebarReadabilityProvider } from "./SidebarReadabilityProvider";
import { SidebarLinksProvider } from "./SidebarLinksProvider";
import { linkComments } from "./parser";
import { Metrics } from "./readabilityMetrics";

const createFile = () => {
  var workspace = vscode.workspace?.workspaceFolders;
  if (workspace === null || workspace === undefined) {
    vscode.window.showErrorMessage("No workspace found");
    return false;
  }
  var filepath = path.join(
    workspace[0].uri.fsPath,
    "violettogreen.config.json"
  );
  fs.open(filepath, "r", (fileNotExists: Boolean, file: any) => {
    if (fileNotExists) {
      fs.writeFile(filepath, JSON.stringify([]), (err: any) => {
        if (err) {
          vscode.window.showErrorMessage(err);
          return false;
        }
      });
    }
  });
  return true;
};

function updateDiagnostics(
  document: vscode.TextDocument,
  collection: vscode.DiagnosticCollection
): void {
  if (document) {
    collection.set(document.uri, [
      {
        code: "",
        message: "This is a test for displaying diagnostic messages",
        range: new vscode.Range(
          new vscode.Position(3, 4),
          new vscode.Position(3, 10)
        ),
        severity: vscode.DiagnosticSeverity.Information,
        source: "",
        relatedInformation: [
          new vscode.DiagnosticRelatedInformation(
            new vscode.Location(
              document.uri,
              new vscode.Range(
                new vscode.Position(1, 8),
                new vscode.Position(1, 9)
              )
            ),
            "Additional information about the diagnostic"
          ),
        ],
      },
    ]);
  } else {
    collection.clear();
  }
}

export function activate(context: vscode.ExtensionContext) {
  if (!createFile()) {
    return;
  }

  const decoration = vscode.window.createTextEditorDecorationType({
    gutterIconPath: vscode.Uri.joinPath(
      context.extensionUri,
      "media",
      "checklist.svg"
    ).path,
  });

  const editor = vscode.window.activeTextEditor;

  editor?.setDecorations(decoration, [
    new vscode.Range(new vscode.Position(1, 1), new vscode.Position(2, 4)),
  ]);

  const collection = vscode.languages.createDiagnosticCollection("test");
  if (vscode.window.activeTextEditor) {
    updateDiagnostics(vscode.window.activeTextEditor.document, collection);
  }
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        updateDiagnostics(editor.document, collection);
      }
    })
  );

  const sidebarLinksProvider = new SidebarLinksProvider(context.extensionUri);
  const sidebarSelectionProvider = new SidebarSelectionProvider(
    context.extensionUri,
    sidebarLinksProvider
  );
  const sidebarReadabilityProvider = new SidebarReadabilityProvider(
    context.extensionUri
  );

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "violet-to-green-selection",
      sidebarSelectionProvider
    )
  );

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "violet-to-green-readability",
      sidebarReadabilityProvider
    )
  );

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "violet-to-green-links",
      sidebarLinksProvider
    )
  );

  vscode.commands.executeCommand(
    "workbench.view.extension.violet-to-green-sidebar-view"
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("violet-to-green.helloWorld", () => {
      vscode.window.showInformationMessage("Hello World from VioletToGreen!");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("violet-to-green.refresh", async () => {
      await vscode.commands.executeCommand("workbench.action.closeSidebar");
      await vscode.commands.executeCommand(
        "workbench.view.extension.violet-to-green-sidebar-view"
      );
    })
  );

  vscode.commands.registerCommand("violet-to-green.linkAutomatically", () => {
    const parser = linkComments(vscode.window.activeTextEditor);
    const metrics = new Metrics();
    const editor = vscode.window.activeTextEditor;
    var links = [];
    var keywordsArray: string[] = [];

    metrics.getBlocks();

    const containsKeyword = (
      keywords: string[],
      comment: any,
      commentText: string,
      metricsArray: any,
      nextNonEmpty: any
    ) => {
      for (const keyword in keywords) {
        if (commentText.includes(keyword)) {
          for (var i = 0; i < metricsArray.length; i++) {
            if (metricsArray[i].startLine === nextNonEmpty) {
              links.push([
                convertToObject(comment),
                convertToObject(metricsArray[i]),
              ]);
              return true;
            }
          }
        }
      }
      return false;
    };

    const containsKeywordPrev = (
      keywords: string[],
      comment: any,
      commentText: string,
      metricsArray: any,
      prevNonEmpty: any
    ) => {
      for (const keyword in keywords) {
        if (commentText.includes(keyword)) {
          for (var i = metricsArray.length - 1; i >= 0; i--) {
            if (metricsArray[i].endLine === prevNonEmpty) {
              links.push([
                convertToObject(comment),
                convertToObject(metricsArray[i]),
              ]);
              return true;
            }
          }
        }
      }
      return false;
    };

    const notContainsKeyword = (
      nextNonEmpty: any,
      comment: any,
      metricsArray: any
    ) => {
      for (var i = 0; i < metricsArray.length; i++) {
        if (metricsArray[i].startLine === nextNonEmpty) {
          links.push([
            convertToObject(comment),
            convertToObject(metricsArray[i]),
          ]);
          return true;
        }
      }
      return false;
    };

    const notContainsKeywordInline = (comment: any, metricsArray: any) => {
      for (var i = 0; i < metricsArray.length; i++) {
        if (
          metricsArray[i].startLine === comment.startLine &&
          metricsArray[i].endLine === comment.startLine
        ) {
          links.push([
            convertToObject(comment),
            convertToObject(metricsArray[i]),
          ]);
          return true;
        }
      }
      return false;
    };

    const containsKeywordInside = (
      keywords: any,
      comment: any,
      commentText: string,
      metricsArray: any,
      prevNonEmpty: any
    ) => {
      for (const keyword in keywords) {
        if (commentText.includes(keyword)) {
          for (var i = 0; i < metricsArray.length; i++) {
            if (metricsArray[i].startLine === prevNonEmpty) {
              links.push([
                convertToObject(comment),
                convertToObject(metricsArray[i]),
              ]);
              return true;
            }
          }
        }
      }
      return false;
    };

    const convertToObject = (value: any) => {
      return {
        startLine: value.startLine,
        startCharacter: value.startCharacter
          ? value.startCharacter
          : value.startColumn,
        endLine: value.endLine,
        endCharacter: value.endCharacter ? value.endCharacter : value.endColumn,
      };
    };

    findLinks: for (const comment of parser?.comments!) {
      var nextNonEmpty = -1;
      var prevNonEmpty = -1;
      for (var i = comment.endLine; i < parser?.lines.length!; i++) {
        if (parser!.lines[i].length > 0) {
          nextNonEmpty = i + 1;
          break;
        }
      }
      for (var i = comment.startLine; i >= 0; i--) {
        if (parser!.lines[i].length > 0) {
          prevNonEmpty = i;
          break;
        }
      }
      const pos1 = new vscode.Position(
        comment.startLine - 1,
        comment.startCharacter
      );
      const pos2 = new vscode.Position(
        comment.endLine - 1,
        comment.endCharacter
      );
      const commentText = editor?.document
        .getText(new vscode.Selection(pos1, pos2))
        .toLocaleLowerCase();
      // if it is a multiline and single line comment
      if (
        comment.type === parser?.enums.multiline ||
        comment.type === parser?.enums.singleLine
      ) {
        if (nextNonEmpty !== -1) {
          keywordsArray = ["class", "@author", "program"];
          if (
            containsKeyword(
              keywordsArray,
              comment,
              commentText!,
              metrics.classes,
              nextNonEmpty
            )
          ) {
            continue findLinks;
          }

          keywordsArray = ["interface", "@author"];
          if (
            containsKeyword(
              keywordsArray,
              comment,
              commentText!,
              metrics.interfaces,
              nextNonEmpty
            )
          ) {
            continue findLinks;
          }

          // if next line is function declaration
          keywordsArray = [
            "@param",
            "@return",
            "function",
            "method",
            "routine",
            "routines",
            "subroutine",
            "subroutines",
            "returns",
            "@throws",
            "@exception",
            "driver",
            "constructor",
            "destructor",
            "recurse",
            "recursive",
            "recursion",
            "create",
            "creating",
            "recursing",
          ];
          if (!commentText?.includes("above")) {
            if (
              containsKeyword(
                keywordsArray,
                comment,
                commentText!,
                metrics.methods,
                nextNonEmpty
              )
            ) {
              continue findLinks;
            }
          } else {
            if (
              containsKeywordPrev(
                keywordsArray,
                comment,
                commentText!,
                metrics.methods,
                prevNonEmpty
              )
            ) {
              continue findLinks;
            }
          }

          // if next line is @Override or @Deprecated, then its next line is a function
          if (
            parser.lines[nextNonEmpty - 1].trim() === "@Override" ||
            parser.lines[nextNonEmpty - 1].trim() === "@Deprecated"
          ) {
            var tempNextLine = nextNonEmpty + 1;
            for (var i = nextNonEmpty + 1; i < parser.lines.length; i++) {
              if (parser.lines[i].length > 0) {
                tempNextLine = i + 1;
                break;
              }
            }
            for (var i = 0; i < metrics.methods.length; i++) {
              if (metrics.methods[i].startLine === tempNextLine) {
                links.push([
                  convertToObject(comment),
                  convertToObject(metrics.methods[i]),
                ]);
                continue findLinks;
              }
            }
          }

          // if next line contains for or while loop
          keywordsArray = [
            "loop",
            "loops",
            "iteration",
            "iterations",
            "iterate",
            "iterates",
            "go through",
            "goes through",
            "fill",
            "until",
          ];
          if (!commentText?.includes("above")) {
            if (
              containsKeyword(
                keywordsArray,
                comment,
                commentText!,
                metrics.forLoops,
                nextNonEmpty
              )
            ) {
              continue findLinks;
            }
            if (
              containsKeyword(
                keywordsArray,
                comment,
                commentText!,
                metrics.whileLoops,
                nextNonEmpty
              )
            ) {
              continue findLinks;
            }
          } else {
            if (
              containsKeywordPrev(
                keywordsArray,
                comment,
                commentText!,
                metrics.forLoops,
                prevNonEmpty
              )
            ) {
              continue findLinks;
            }
            if (
              containsKeywordPrev(
                keywordsArray,
                comment,
                commentText!,
                metrics.whileLoops,
                prevNonEmpty
              )
            ) {
              continue findLinks;
            }
          }

          // if next line contains switch statement
          keywordsArray = ["switch", "switching", "based on", "cases"];
          if (
            containsKeyword(
              keywordsArray,
              comment,
              commentText!,
              metrics.switchStatements,
              nextNonEmpty
            )
          ) {
            continue findLinks;
          }

          // if next line contains case statement
          keywordsArray = ["case", "default", "if"];
          if (
            containsKeyword(
              keywordsArray,
              comment,
              commentText!,
              metrics.caseBlocks,
              nextNonEmpty
            )
          ) {
            continue findLinks;
          }

          // if next line contains if, else if or else statements
          keywordsArray = [
            "else",
            "check",
            "checking",
            "whether",
            "else if",
            "elif",
            "if",
            "otherwise",
          ];
          if (
            containsKeyword(
              keywordsArray,
              comment,
              commentText!,
              metrics.ifElseStatements,
              nextNonEmpty
            )
          ) {
            continue findLinks;
          }

          // if the next line is a variable declaration
          keywordsArray = [
            "initialize",
            "variable",
            "value",
            "store",
            "stores",
            "declare",
            "declaring",
            "create",
            "creating",
          ];
          if (
            containsKeyword(
              keywordsArray,
              comment,
              commentText!,
              metrics.initAndDeclStatements,
              nextNonEmpty
            )
          ) {
            continue findLinks;
          }

          // if the next line is an assignment statement
          keywordsArray = [
            "assign",
            "set",
            "update",
            "increment",
            "decrement",
            "store",
            "stores",
          ];
          if (
            containsKeyword(
              keywordsArray,
              comment,
              commentText!,
              metrics.assignmentStatements,
              nextNonEmpty
            )
          ) {
            continue findLinks;
          }

          // if the above condition is not satisfied
          // if next line is a class declaration
          if (notContainsKeyword(nextNonEmpty, comment, metrics.classes)) {
            continue findLinks;
          }

          // if next line is an interface declaration
          if (notContainsKeyword(nextNonEmpty, comment, metrics.interfaces)) {
            continue findLinks;
          }
          // first link it if the next line is a function
          if (!commentText?.includes("above")) {
            if (notContainsKeyword(nextNonEmpty, comment, metrics.methods)) {
              continue findLinks;
            }
          }

          // second link it if the next line is a loop statement
          if (notContainsKeyword(nextNonEmpty, comment, metrics.forLoops)) {
            continue findLinks;
          }
          if (notContainsKeyword(nextNonEmpty, comment, metrics.whileLoops)) {
            continue findLinks;
          }

          // third link it if the next line is a conditional statement
          if (
            notContainsKeyword(nextNonEmpty, comment, metrics.ifElseStatements)
          ) {
            continue findLinks;
          }

          // fourth link it if the next line is a declaration or assignment statement
          if (
            notContainsKeyword(
              nextNonEmpty,
              comment,
              metrics.initAndDeclStatements
            )
          ) {
            continue findLinks;
          }
          if (
            notContainsKeyword(
              nextNonEmpty,
              comment,
              metrics.assignmentStatements
            )
          ) {
            continue findLinks;
          }
        } else if (prevNonEmpty !== -1) {
          // check if the comment is written inside a function body
          keywordsArray = [
            "@param",
            "@return",
            "function",
            "method",
            "routine",
            "routines",
            "subroutine",
            "subroutines",
            "returns",
            "@throws",
            "@exception",
            "driver",
            "constructor",
            "destructor",
            "recurse",
            "recursive",
            "recursion",
            "create",
            "creating",
            "recursing",
          ];
          if (
            containsKeywordInside(
              keywordsArray,
              comment,
              commentText!,
              metrics.methods,
              prevNonEmpty
            )
          ) {
            continue findLinks;
          }

          // check if the comment is written inside a loop body
          keywordsArray = [
            "loop",
            "loops",
            "iteration",
            "iterations",
            "iterate",
            "iterates",
            "go through",
            "goes through",
            "fill",
            "until",
          ];

          if (
            containsKeywordInside(
              keywordsArray,
              comment,
              commentText!,
              metrics.forLoops,
              prevNonEmpty
            ) ||
            containsKeywordInside(
              keywordsArray,
              comment,
              commentText!,
              metrics.whileLoops,
              prevNonEmpty
            )
          ) {
            continue findLinks;
          }

          // check if the comment is written inside an if, elif or else body
          keywordsArray = [
            "else",
            "check",
            "checking",
            "whether",
            "else if",
            "elif",
            "if",
            "otherwise",
          ];
          if (
            containsKeywordInside(
              keywordsArray,
              comment,
              commentText!,
              metrics.ifElseStatements,
              prevNonEmpty
            )
          ) {
            continue findLinks;
          }

          // check if the comment is written inside a case block
          keywordsArray = ["case", "default", "if"];
          if (
            containsKeywordInside(
              keywordsArray,
              comment,
              commentText!,
              metrics.caseBlocks,
              prevNonEmpty
            )
          ) {
            continue findLinks;
          }
        }
      } else {
        // if the current line is a declaration statement
        if (notContainsKeywordInline(comment, metrics.initAndDeclStatements)) {
          continue findLinks;
        }

        // if the current line is an assignment statement
        if (notContainsKeywordInline(comment, metrics.assignmentStatements)) {
          continue findLinks;
        }

        // if the current line is an if, else if or else statement
        if (notContainsKeywordInline(comment, metrics.ifElseStatements)) {
          continue findLinks;
        }
      }
    }
    console.log("links:", links);
  });
}

export function deactivate() {}

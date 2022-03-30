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
      metricsArray: any
    ) => {
      for (const keyword in keywords) {
        if (commentText.includes(keyword)) {
          for (var i = 0; i < metricsArray.length; i++) {
            if (metricsArray[i].startLine > comment.startLine) {
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

    const notContainsKeyword = (comment: any, metricsArray: any) => {
      for (var i = 0; i < metricsArray.length; i++) {
        if (metricsArray[i].startLine > comment.startLine) {
          links.push([
            convertToObject(comment),
            convertToObject(metricsArray[i]),
          ]);
          return true;
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
      // if it is a multiline comment
      if (comment.type === parser?.enums.multiline) {
        var nextNonEmpty = -1;
        for (var i = comment.endLine; i < parser.lines.length; i++) {
          if (parser.lines[i].length > 0) {
            nextNonEmpty = i + 1;
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

        if (nextNonEmpty !== -1) {
          // if next line is a class declaration
          if (notContainsKeyword(comment, metrics.classes)) {
            continue findLinks;
          }

          // if next line is an interface declaration
          if (notContainsKeyword(comment, metrics.interfaces)) {
            continue findLinks;
          }

          // if the class declaration is somewhere else
          keywordsArray = ["class", "@author", "program"];
          if (
            containsKeyword(
              keywordsArray,
              comment,
              commentText!,
              metrics.classes
            )
          ) {
            continue findLinks;
          }

          // if the interface declaration is somewhere else
          keywordsArray = ["interface", "@author"];
          if (
            containsKeyword(
              keywordsArray,
              comment,
              commentText!,
              metrics.interfaces
            )
          ) {
            continue findLinks;
          }

          // if next line is function declaration
          if (!commentText?.includes("above")) {
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
              containsKeyword(
                keywordsArray,
                comment,
                commentText!,
                metrics.methods
              )
            ) {
              continue findLinks;
            }
          }

          // if next line is @Override or @Deprecated, then its next line is a function
          if (
            parser.lines[nextNonEmpty].trim() === "@Override" ||
            parser.lines[nextNonEmpty].trim() === "@Deprecated"
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
          if (!commentText?.includes("above")) {
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
              containsKeyword(
                keywordsArray,
                comment,
                commentText!,
                metrics.forLoops
              )
            ) {
              continue findLinks;
            }
            if (
              containsKeyword(
                keywordsArray,
                comment,
                commentText!,
                metrics.whileLoops
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
              metrics.switchStatements
            )
          ) {
            continue findLinks;
          }

          // if next line contains case statement
          if (!commentText?.includes("above")) {
            keywordsArray = ["case", "default", "if"];
            if (
              containsKeyword(
                keywordsArray,
                comment,
                commentText!,
                metrics.caseBlocks
              )
            ) {
              continue findLinks;
            }
          }

          // if next line contains if, else if or else statements
          if (!commentText?.includes("above")) {
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
                metrics.ifElseStatements
              )
            ) {
              continue findLinks;
            }
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
              metrics.initAndDeclStatements
            )
          ) {
            continue findLinks;
          }

          // if the next line is an assignment statements
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
              metrics.assignmentStatements
            )
          ) {
            continue findLinks;
          }

          // if the above condition is not satisfied
          // first link it if the next line is a loop statement
          if (notContainsKeyword(comment, metrics.forLoops)) {
            continue findLinks;
          }
          if (notContainsKeyword(comment, metrics.whileLoops)) {
            continue findLinks;
          }

          // otherwise check if it is an assignment statement again
        }
      }
    }
    console.log("links:", links);
  });
}

export function deactivate() {}

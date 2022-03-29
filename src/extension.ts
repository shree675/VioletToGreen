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

    metrics.getBlocks();

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
          for (var i = 0; i < metrics.classes.length; i++) {
            if (metrics.classes[i].startLine === nextNonEmpty) {
              links.push([
                convertToObject(comment),
                convertToObject(metrics.classes[i]),
              ]);
              continue findLinks;
            }
          }

          // if next line is an interface declaration
          for (var i = 0; i < metrics.interfaces.length; i++) {
            if (metrics.interfaces[i].startLine === nextNonEmpty) {
              links.push([
                convertToObject(comment),
                convertToObject(metrics.interfaces[i]),
              ]);
              continue findLinks;
            }
          }

          // if the class declaration is somewhere else
          if (
            commentText?.includes("class") ||
            commentText?.includes("@author") ||
            commentText?.includes("program")
          ) {
            // find and link the nearest class declaration
            for (var i = 0; i < metrics.classes.length; i++) {
              if (metrics.classes[i].startLine > comment.startLine) {
                links.push([
                  convertToObject(comment),
                  convertToObject(metrics.classes[i]),
                ]);
                continue findLinks;
              }
            }
          }

          // if the interface declaration is somewhere else
          if (
            commentText?.includes("interface") ||
            commentText?.includes("@author")
          ) {
            // find and link the nearest interface declaration
            for (var i = 0; i < metrics.interfaces.length; i++) {
              if (metrics.interfaces[i].startLine > comment.startLine) {
                links.push([
                  convertToObject(comment),
                  convertToObject(metrics.interfaces[i]),
                ]);
                continue findLinks;
              }
            }
          }

          // if next line is function declaration
          if (
            !commentText?.includes("above") &&
            (commentText?.includes("@param") ||
              commentText?.includes("@return") ||
              commentText?.includes("function") ||
              commentText?.includes("method") ||
              commentText?.includes("routine") ||
              commentText?.includes("routine") ||
              commentText?.includes("subroutine") ||
              commentText?.includes("subroutines") ||
              commentText?.includes("returns") ||
              commentText?.includes("@throws") ||
              commentText?.includes("@exception") ||
              commentText?.includes("driver") ||
              commentText?.includes("constructor") ||
              commentText?.includes("destructor") ||
              commentText?.includes("recurse") ||
              commentText?.includes("recursive") ||
              commentText?.includes("recursion"))
          ) {
            for (var i = 0; i < metrics.methods.length; i++) {
              if (metrics.methods[i].startLine === nextNonEmpty) {
                links.push([
                  convertToObject(comment),
                  convertToObject(metrics.methods[i]),
                ]);
                continue findLinks;
              }
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

          // if next line contains for loop
          if (
            commentText?.includes("loop") ||
            commentText?.includes("loops") ||
            commentText?.includes("iteration") ||
            commentText?.includes("iterations") ||
            commentText?.includes("iterate") ||
            commentText?.includes("iterates") ||
            commentText?.includes("go through") ||
            commentText?.includes("goes through") ||
            commentText?.includes("fill")
          ) {
            for (var i = 0; i < metrics.forLoops.length; i++) {
              if (metrics.forLoops[i].startLine === nextNonEmpty) {
                links.push([
                  convertToObject(comment),
                  convertToObject(metrics.forLoops[i]),
                ]);
                continue findLinks;
              }
            }
            for (var i = 0; i < metrics.whileLoops.length; i++) {
              if (metrics.whileLoops[i].startLine === nextNonEmpty) {
                links.push([
                  convertToObject(comment),
                  convertToObject(metrics.whileLoops[i]),
                ]);
                continue findLinks;
              }
            }
          }

          // if next line contains if, else if or else statements
          if (
            commentText?.includes("else") ||
            commentText?.includes("check") ||
            commentText?.includes("checking") ||
            commentText?.includes("whether") ||
            commentText?.includes("else if") ||
            commentText?.includes("elif") ||
            commentText?.includes("if")
          ) {
            for (var i = 0; i < metrics.ifElseStatements.length; i++) {
              if (metrics.ifElseStatements[i].startLine === nextNonEmpty) {
                links.push([
                  convertToObject(comment),
                  convertToObject(metrics.ifElseStatements[i]),
                ]);
                continue findLinks;
              }
            }
          }
        }
      }
    }
    console.log("links:", links);
  });
}

export function deactivate() {}

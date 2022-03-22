import * as vscode from "vscode";
const path = require("path");
const fs = require("fs");
import { getNonce } from "./getNonce";

export class SidebarLinksProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    const filepath = path.join(
      vscode.workspace?.workspaceFolders![0].uri.fsPath,
      "violettogreen.config.json"
    );

    const decorate = (selection: any, decorationType: any, editor: any) => {
      const range = new vscode.Range(
        selection.startLine,
        selection.startCharacter,
        selection.endLine,
        selection.endCharacter
      );
      editor.setDecorations(decorationType, [range]);
    };

    var decorationType: any = [];

    function createDecoration(type: Number) {
      decorationType.push(
        vscode.window.createTextEditorDecorationType({
          backgroundColor:
            type === 0 ? "rgba(0, 0, 255, 0.2)" : "rgba(0, 255, 0, 0.2)",
          isWholeLine: false,
          rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        })
      );
    }

    var arrayRange: any = [];

    vscode.window.onDidChangeTextEditorSelection((e) => {
      var cursor = vscode.window.activeTextEditor?.selection.active;
      while (decorationType.length > 0) {
        decorationType[decorationType.length - 1].dispose();
        decorationType.pop();
      }
      arrayRange.forEach((range: any) => {
        if (
          (cursor?.line! > range[0].startLine &&
            cursor?.line! < range[0].endLine) ||
          (cursor?.line! > range[1].startLine &&
            cursor?.line! < range[1].endLine) ||
          (cursor?.line! === range[0].startLine &&
            cursor?.character! >= range[0].startCharacter) ||
          (cursor?.line! === range[0].endLine &&
            cursor?.character! <= range[0].endCharacter) ||
          (cursor?.line! === range[1].startLine &&
            cursor?.character! >= range[1].startCharacter) ||
          (cursor?.line! === range[1].endLine &&
            cursor?.character! <= range[1].endCharacter)
        ) {
          const filepath = vscode.window.activeTextEditor?.document.fileName;
          if (filepath === range[0].filepath) {
            createDecoration(0);
            decorate(
              range[0],
              decorationType[decorationType.length - 1],
              vscode.window.activeTextEditor
            );
          }
          if (filepath === range[1].filepath) {
            createDecoration(1);
            decorate(
              range[1],
              decorationType[decorationType.length - 1],
              vscode.window.activeTextEditor
            );
          }
        }
      });
    });

    webviewView.webview.onDidReceiveMessage((data: any) => {
      switch (data.type) {
        case "info": {
          if (!data.value) {
            return;
          }
          vscode.window.showInformationMessage(data.value);
          break;
        }
        case "error": {
          if (!data.value) {
            return;
          }
          vscode.window.showErrorMessage(data.value);
          break;
        }
        case "requestForConfigLinks": {
          var links;

          fs.readFile(filepath, (err: any, fileData: any) => {
            links = JSON.parse(fileData);
            if (err) {
              vscode.window.showErrorMessage(err);
            }
            arrayRange = links;
            this._view?.webview.postMessage({
              type: "configLinks",
              value: links,
            });
          });
          break;
        }
        case "updateConfigLinks": {
          fs.writeFile(filepath, JSON.stringify(data.value), (err: any) => {
            if (err) {
              vscode.window.showErrorMessage(err);
              return false;
            }
          });
          break;
        }
        case "gotoLine": {
          var openFile = vscode.Uri.file(data.value.filepath);
          vscode.workspace.openTextDocument(openFile).then((doc) => {
            vscode.window
              .showTextDocument(
                doc,
                data.value.type === 1
                  ? { viewColumn: vscode.ViewColumn.Two }
                  : { viewColumn: vscode.ViewColumn.One }
              )
              .then(() => {
                let editor = vscode.window.activeTextEditor;
                let rangeStart = editor?.document.lineAt(
                  parseInt(data.value.startLine)
                ).range;
                const pos1 = new vscode.Position(
                  data.value.startLine,
                  data.value.startCharacter
                );
                const pos2 = new vscode.Position(
                  data.value.endLine,
                  data.value.endCharacter
                );
                editor!.selection = new vscode.Selection(pos1, pos2);
                editor?.revealRange(rangeStart!);
              });
          });
        }
      }
    });
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );

    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/sidebarLinks.js")
    );
    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "out",
        "compiled/sidebarLinks.css"
      )
    );

    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
        -->
        <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
        <link href="${styleMainUri}" rel="stylesheet">
        <script nonce="${nonce}">
          const tsvscode = acquireVsCodeApi();
        </script>
			</head>
      <body>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }
}

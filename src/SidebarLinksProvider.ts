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
      // Allow scripts in the webview
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    const filepath = path.join(
      vscode.workspace?.workspaceFolders![0].uri.fsPath,
      "violettogreen.config.json"
    );

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
                  ? {
                      viewColumn: vscode.ViewColumn.Beside,
                    }
                  : {}
              )
              .then(() => {
                let editor = vscode.window.activeTextEditor;
                let rangeStart = editor?.document.lineAt(
                  parseInt(data.value.startLine)
                ).range;
                let rangeEnd = editor?.document.lineAt(
                  parseInt(data.value.endLine)
                ).range;
                editor!.selection = new vscode.Selection(
                  rangeStart?.start!,
                  rangeEnd?.end!
                );
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

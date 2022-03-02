import * as vscode from "vscode";
import fs = require("fs");
import path = require("path");

export function activate(context: vscode.ExtensionContext) {
  var formattedStrings: string = "";

  let disposableSave = vscode.commands.registerCommand(
    "automate-task.save",
    () => {
      if (formattedStrings === "") {
        vscode.window.showErrorMessage("No links to save");
        return;
      }
      var dir = path.resolve(
        __dirname,
        "../../../Dataset/RealWorldData/Annotations"
      );

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }

      const filepath = vscode.window.activeTextEditor?.document.fileName;
      const filename = filepath
        ?.replace(/^.*[\\\/]/, "")
        .replace(/\..*/, ".txt");

      fs.writeFile(
        path.resolve(__dirname, dir, filename!),
        formattedStrings,
        function (err) {
          if (err) {
            throw err;
          }
          formattedStrings = "";
          vscode.window.showInformationMessage(
            "Links saved to " + path.resolve(__dirname, dir)
          );
        }
      );
    }
  );

  let disposable = vscode.commands.registerCommand(
    "automate-task.automate",
    () => {
      var editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      let ranges: any[] = [];
      var selection: any;
      var formattedString: string = "";

      vscode.window
        .showInformationMessage(
          "Select the comment and click on 'Next'",
          "Next"
        )
        .then((e) => {
          selection = editor?.selection;
          ranges.push(selection?.start.line);
          ranges.push(selection?.start.character);
          ranges.push(selection?.end.line);
          ranges.push(selection?.end.character);
          vscode.window
            .showInformationMessage(
              "Select the code snippet and click on 'Link' to link previously selected comment with code",
              "Link"
            )
            .then((e) => {
              selection = editor?.selection;
              ranges.push(selection?.start.line);
              ranges.push(selection?.start.character);
              ranges.push(selection?.end.line);
              ranges.push(selection?.end.character);
              vscode.window
                .showInputBox({
                  prompt:
                    "Type some message about the link [leave blank if nothing]",
                })
                .then((message: any) => {
                  var comment = "";

                  if (message === undefined || message.trim() === "") {
                    comment = "``";
                  } else {
                    comment = "`" + message + "`";
                  }

                  for (var i = 0; i < 8; i++) {
                    if (i !== 7) {
                      formattedString += ranges[i] + 1 + ",";
                    } else {
                      formattedString += ranges[i] + 1;
                    }
                  }

                  formattedString += " " + comment + "\n";

                  formattedStrings += formattedString;

                  vscode.window.showInformationMessage(
                    "Linked successfully. Run the command 'automate-task.save' to save the links"
                  );
                });
            });
        });
    }
  );

  context.subscriptions.push(disposable);
  context.subscriptions.push(disposableSave);
}

export function deactivate() {}

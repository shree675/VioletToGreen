# VioletToGreen Automating Annotations

## About

This is a VSCode extension to automate the task of linking code and comments and recording them in a file.

The VSCode extension is present inside the **./automate-task** folder.

## Instructions

- Navigate into `./automate-task` folder and open VSCode.
- Run `npm install` to install all the dependencies.
- Press <kbd>F5</kbd> to run the extension.
- A new window will be opened. Open the required file to be annotated inside the new VSCode window.
- Press <kbd>Ctrl+Shift+P</kbd> and type _automate-task.automate_ to start linking the code and comments. After linking, type a message in the prompt to save the message along with the links. Press <kbd>Esc</kbd> or leave the prompt empty if you do not want to add any message.
- Repeat the above process until all the links are recorded.
- To save the links to a file, press <kbd>Ctrl+Shift+P</kbd> and type _automate-task.save_ to save the links. The links will be saved to `../Dataset/RealWorldData/Annotations`.

## Notes

1. Refer to `./automate-task/vsc-extension-quickstart.md` for more information on setting up the extension.
2. The format of the output file is as described below:

[Comment_start_line],[Comment_start_character],[Comment_end_line],[Comment_end_character],[Code_start_line],[Code_start_character],[Code_end_line],[Code_end_character] \`[Message]\`

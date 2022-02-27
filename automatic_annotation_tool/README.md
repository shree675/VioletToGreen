# VioletToGreen Automating Annotations

## About

This is a VSCode extension to automate the task of linking code and comments and recording them in a file.

The VSCode extension is present inside the **./automate-task** folder.

## Instructions

- Navigate into `./automate-task` folder and open VSCode.
- Press <kbd>F5</kbd> to run the extension.
- A new window will be opened. Open the required file to be annotated inside the new VSCode window.
- Press <kbd>Ctrl+Shift+P</kbd> and type _automate-task.automate_ to start linking the code and comments. After linking, type a message in the prompt to save the message along with the links. Press <kbd>Esc</kbd> or leave the prompt empty if you do not want to add any message.
- Repeat the above process until all the links are recorded.
- To save the links to a file, press <kbd>Ctrl+Shift+P</kbd> and type _automate-task.save_ to save the links. The links will be saved to `./automate-task/link_files/output_links.txt`.

## Notes

1. The whole `./automate-task/link_files` directory is gitignored. The output file is not pushed to the repository.
2. Refer to `./automate-task/vsc-extension-quickstart.md` for more information on setting up the extension.
3. The format of the output file is as described below:

[Comment start line],[Comment_start_character],[Comment end line],[Comment_end_character],[Code start line],[Code_start_character],[Code end line],[Code_end_character] \`[Message]\`

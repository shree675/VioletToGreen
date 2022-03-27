import * as vscode from "vscode";

enum CommentType {
  inline,
  singleLine,
  multiline,
}

export function linkComments(editor?: vscode.TextEditor) {
  if (!editor) {
    return;
  }

  const singleLineComment = /\/\/.*/g;
  const multilineComment = /\/\*[\s\S]*?\*\//gm;
  const text = editor.document.getText();
  const lines = text.split("\n");
  const comments: Array<{
    fullLine?: string;
    lineNumber: Number;
    comment: string;
    type: CommentType;
    // startCharacter: Number;
    // startLine: Number;
    // endCharacter: Number;
    // endLine: Number;
  }> = [];

  const matches = text.matchAll(multilineComment);
  for (const match in matches) {
    comments.push({
        comment: match[0],
        lineNumber: 0,
        type: CommentType.multiline,
    });
  }

    for (const line of lines) {
      //   check if the comment is a single line comment
      if (singleLineComment.test(line)) {
        // check if the comment is a single-line comment
          if (line.trim().startsWith("//")) {
            comments.push({
              fullLine: line,
              lineNumber: lines.indexOf(line) + 1,
              comment: line.match(singleLineComment)![0],
              type: CommentType.singleLine,
            });
          } else {
            // check if the comment is an inline comment
            comments.push({
              fullLine: line,
              lineNumber: lines.indexOf(line) + 1,
              comment: line.match(singleLineComment)![0],
              type: CommentType.inline,
            });
          }
      }
    }
    console.log("Comments:", comments);
}


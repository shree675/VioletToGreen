import * as vscode from "vscode";
import axios from "axios";

// types of comments
enum CommentType {
  inline,
  singleLine,
  multiline,
}

/**
 * A function that returns the line number of the matched comment
 * @param text full text of the document
 * @param index the matched index
 * @returns the line number in the document
 */
const getLine = (text: string, index: number) => {
  const numNewLines = text.slice(0, index).split("\n").length;
  return numNewLines;
};

/**
 * A function that returns the column number of the matched comment
 * @param text full text of the document
 * @param index the matched index
 * @returns the line number in the document
 */
const getColumn = (text: string, index: number) => {
  const numNewLines = text.slice(0, index).split("\n").length - 1;
  const numSpaces = text.slice(0, index).split("\n")[numNewLines].length;
  return numSpaces + 1;
};

const TAG = "COMMENTS";

export function linkComments(text: string) {
  if (!text) {
    return null;
  }

  const singleLinedComments = /[/]{2}.*(?:(?:\r\n|\r|\n) *[/].*)*/gm;
  const multilinedComment = /\/\*[\s\S]*?\*\//gm;

  const lines = text.split("\n");

  const comments: Array<{
    comment: string;
    type: CommentType;
    startCharacter: number;
    startLine: number;
    endCharacter: number;
    endLine: number;
  }> = [];

  const multiLineMatches = text.matchAll(multilinedComment);
  for (const match of multiLineMatches) {
    // TODO: match.index will not be null
    // because we are having a global flag in the pattern
    // but make sure to try to come up with cases where this can
    // be null

    const startLine = getLine(text, match.index!);
    const endLine = getLine(text, match.index! + match[0].length);

    const startCharacter = getColumn(text, match.index!);
    const endCharacter = getColumn(text, match.index! + match[0].length);

    comments.push({
      comment: match[0],
      startCharacter,
      startLine,
      endCharacter,
      endLine,
      type: CommentType.multiline,
    });
  }

  const singleLineMatches = text.matchAll(singleLinedComments);
  for (const match of singleLineMatches) {
    const startLine = getLine(text, match.index!);
    const endLine = getLine(text, match.index! + match[0].length);

    const startCharacter = getColumn(text, match.index!);
    const endCharacter = getColumn(text, match.index! + match[0].length);

    let commentType = CommentType.inline;

    if (lines[startLine - 1].trim().startsWith("//")) {
      commentType = CommentType.singleLine;
    }

    comments.push({
      comment: match[0],
      startCharacter,
      startLine,
      endCharacter,
      endLine,
      type: commentType,
    });
  }

  console.log(TAG, comments);
  return { comments: comments, lines: lines, enums: CommentType };
}

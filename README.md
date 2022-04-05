# VioletToGreen

## About
VioletToGreen is a VS Code extension that helps in improving maintainability and understandability of your code.

## Abstract
The aim of the project is to improve maintainability and understandability of the code by leveraging the comments written by the user. Developers often tend to forget to update the corresponding comments after updating the code, which leads to less maintaiability over time. Our tool aims at tackling this problem in a novel way. The tool is delivered in the form of a VS Code extension which helps the programmer maintain the readability on the fly. The tool had 2 main features i.e, linking the comments and code, and suggesting where to insert a commnet based on a custom readability metric. The linking of comments is done in both manual and automatic ways. For manual linking, appropriate UI has been implemented and these links will be stored in a file. For automatic linking, a few heuristic rules have been devised based on the commenting habits of a typical programmer keeping mind various cases possible including slighltly anomolous ones. For comment suggestion functionality, we are analysing various source code components (functions, blocks, loops, branchs, etc.) and predicting readability score. We use this readability score along with the code-to-comment ratio to decide whether a comment is needed or not, based on a threshold value for bith the metrics. Once the linking is done, in the future if the user edits a piece of code that is linked, the tool prompts the user to update the corresponding comment. This linking is also useful when a programmer is trying to understand a code base, in which case the tool helps the user to visualize exactly which part of the code is linked to which comment.

## Objectives
The main objectives of the tool include linking code to comment either manually or automatically. Prompting the user to update a particular comment after the code has been modified which is linked to it. Suggest the user where to insert a comment based on the custom readability score.

## UI Features
1. As soon as the extension is active, a dedicated side panel opens up with three sub panels.

<img src="https://user-images.githubusercontent.com/58718144/161588846-5893f14e-218d-4281-b6af-ce4f27f14d1c.png" height="350px"></img>

2. Highlight a comment or a code snippet and click on **Select** to select and link them.

<img src="https://user-images.githubusercontent.com/58718144/161590252-e7af3fe8-8cd7-4796-a18a-95427a031fc7.png" height="350px"></img>

3. Click on **Link** to link them. The linked snippets will be displayed in the **LINKS** panel.
4. Placing the cursor on either the linked comment will highlight the corresponding code snippet and vice-versa. Comments are highlighted in blue and code snippets in green.

<img src="https://user-images.githubusercontent.com/58718144/161590673-2be178ea-95ec-412b-8f22-5d8453bb38e2.png" height="350px"></img>

5. If a highlighted region is edited by the user, the linked region will also adapt to include or exclude the new set of lines.
6. A link can also be present across two different files. The path of each snippet in each link will be displayed in the tooltip component.
7. Clicking on the blue and green regions on the side panel will make the editor navigate to the appropriate linked positions by displaying the comment on the left and the corresponding code snippet on the right of a split window.

<img src="https://user-images.githubusercontent.com/58718144/161591435-4a15b5a5-3caa-4938-9334-1b5ac6256233.png" height="380px"></img>

8. Any link can be deleted by clicking on the delete icon of the corresponding link on the left panel.
9. The links are saved in a config file so that the links will persist in all sessions of VS Code. The config file can also be shared with different users so that they will also be provided with the same links and highlights.
10. The middle panel will be used to display suggestions on inserting comments in release 2. The UI also has the provision to highlight an entire code segment with information squiggles to represent high complexity of understandability.

## Instructions

1. Clone the repository.
2. Run the following commands:

```
$ npm install
$ npm run watch
```

3. Click on <kbd>F5</kbd> to run.
4. There is a command avaliable - *linkAutomatically* that will link comments and code snippets, but this feature will be integrated in release 2. On the side panel, a list icon will be present. Click on it to see the panels.

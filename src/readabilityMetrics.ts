import * as vscode from "vscode";
const { parse } = require("java-parser");

export class Metrics {
  public methods: any = [];
  public classes: any = [];
  public interfaces: any = [];
  public forLoops: any = [];
  public ifStatements: any = [];
  public whileLoops: any = [];
  public switchStatements: any = [];
  public doStatements: any = [];

  public getBlocks = () => {
    const editor = vscode.window.activeTextEditor;
    const javaText = editor?.document.getText();
    const cst = parse(javaText);

    let q = [cst];
    let curl = 1;
    let nextl = 0;

    while (q.length > 0) {
      let s = q.shift();
      curl--;

      process.stdout.write(`${s.name},`);

      if (s.name === "methodDeclaration") {
        this.methods.push(s.location);
      } else if (s.name === "classDeclaration") {
        this.classes.push(s.location);
      } else if (s.name === "forStatement") {
        this.forLoops.push(s.location);
      } else if (s.name === "ifStatement") {
        this.ifStatements.push(s.location);
      } else if (s.name === "whileStatement") {
        this.whileLoops.push(s.location);
      } else if (s.name === "switchStatement") {
        this.switchStatements.push(s.location);
      } else if (s.name === "doStatement") {
        this.doStatements.push(s.location);
      } else if (s.name === "interfaceDeclaration") {
        this.interfaces.push(s.location);
      }

      if (s.children) {
        for (let [_, val] of Object.entries(s.children)) {
          if (Array.isArray(val)) {
            q = q.concat(val);
            nextl += val.length;
          } else {
            q.push(val);
            nextl++;
          }
        }
      }

      if (curl === 0) {
        curl = nextl;
        nextl = 0;
      }
    }

    this.forLoops = this.removeNested(this.forLoops, this.forLoops);

    console.log(this.forLoops);
  };

  removeNested = (innerArray: any, outerArray: any) => {
    var temp: any[] = [];
    var flag: boolean;

    for (let i = 0; i < innerArray.length; i++) {
      flag = false;
      for (let j = 0; j < outerArray.length; j++) {
        if (
          (innerArray[i].startLine > outerArray[j].startLine &&
            innerArray[i].endLine < outerArray[j].endLine) ||
          (innerArray[i].startCharacter > outerArray[j].startCharacter &&
            innerArray[i].startLine === outerArray[j].startLine) ||
          (innerArray[i].endCharacter < outerArray[j].endCharacter &&
            innerArray[i].endLine === outerArray[j].endLine)
        ) {
          if (i !== j) {
            flag = true;
            break;
          }
        }
      }
      if (!flag) {
        temp.push(innerArray[i]);
      }
    }
    innerArray = [];
    for (let i = 0; i < temp.length; i++) {
      innerArray.push(temp[i]);
    }
    return innerArray;
  };
}

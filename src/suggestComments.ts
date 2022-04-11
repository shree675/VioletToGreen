// //import { runHeuristics } from "./heuristics";

import { config } from "process";
import axios from "axios";

const fs = require("fs");
// //const path = require("path");

function suggestComments(javaText: string, uri: string, configPath: string) {
  console.log("Hello from suggestComments");

  var lines: string;
  var configFile: any;
  var configOut: any[] = [];
  (async () => {
    lines = fs.readFileSync(configPath);
    configFile = JSON.parse(lines);
  })();
  //just read from config file
  console.log(configFile.length);
  for (let i = 0; i < configFile.length; i++) {
    //console.log (typeof configFile[i]);
    if (configFile[i][0]["filepath"] === uri) {
      var configOut: any[];
      configOut.push(configFile[i]);
    }
  }
  return configOut;
  //console.log(configFile);
  //links =
}

// TODO : get the JAVA text from the active editor
var filepath = "../Dataset/ToyData/CodeFiles/EggDropping.java";
var javaText: string = "";
(async () => {
  javaText = fs.readFileSync(filepath).toString();
  console.log("Javatext", javaText);
  //javaText = lines;
})();

//var javaText =
//  "public class BubbleSortExample { static void bubbleSort(int[] arr) {  int n = arr.length; int temp = 0;  for(int i=0; i < n; i++){  for(int j=1; j < (n-i); j++){  if(arr[j-1] > arr[j]){  temp = arr[j-1];  arr[j-1] = arr[j];  arr[j] = temp;}}}}}";

//__dirname +
var uri = "../Dataset/ToyData/CodeFiles/EggDropping.java";
//var uri =
//"d:\\books and documents\\6th semester\\SE Lab\\VioletToGreen\\Dataset\\ToyData\\CodeFiles\\EggDropping.java";
var configPath = "./violettogreen.config.json";
var configOut = suggestComments(javaText, uri, configPath);
var payload = {
  code: javaText,
  configs: configOut,
};
console.log(payload);

axios
  .post("http://localhost:3000/suggest_comments", payload)
  .then((response) => {
    console.log(response.data);
  });

export default suggestComments;

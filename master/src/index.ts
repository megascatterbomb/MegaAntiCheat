import {parse_demo} from "mcd-demo-parser";
import fs from "fs";

const file = fs.readFileSync("/home/ox/Desktop/Round 1 Map 1 Borneo.dem");
const demo = parse_demo(file);

console.log("Hello MasterBase!");
console.log(`${demo.info}`);
import {parse_demo} from "mcd-demo-parser";
import fs from "fs";

const file = fs.readFileSync("path_to_demo");

const demo = parse_demo(file);

console.log("Hello MasterBase!");
console.log(`${JSON.stringify(demo.info)}}`);
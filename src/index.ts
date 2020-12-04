import * as lineReader from "line-reader";
import * as fs from "fs";
import * as Promise from "bluebird";
import { Card } from "./type";
import insert from "./insert";
import * as dotenv from "dotenv";
const validPath = __dirname + "/../private/valid.txt";
const errorPath = __dirname + "/../private/error.txt";
const error2Path = __dirname + "/../private/error2.txt";
const eachLine = Promise.promisify<
  Error | void,
  string,
  (line: string) => void
>(lineReader.eachLine);
export function getValidCard() {
  const filePath = __dirname + "/../private/cards.txt";
  console.log(filePath);
  let outdated = 0;
  let total = 0;
  lineReader.eachLine(filePath, function (line) {
    // if (outdated > 3) {
    //   throw "cancel";
    // }
    total++;
    const [, rest] = line.split("=");
    const expiration_date = rest.slice(0, 4);
    const year = Number(expiration_date.slice(0, 2));
    const month = Number(expiration_date.slice(2, 4));
    if (year <= 20 && month <= 12) {
      // console.log(expiration_date);
      outdated++;
      console.log(outdated, total);
    } else {
      fs.writeFileSync(validPath, line + "\n", { flag: "a" });
    }
  });
  //14670 99999
}
export async function test() {
  dotenv.config();
  console.log(process.env);
}
export async function acessDB() {
  const set = new Set<string>();
  eachLine(validPath, function (line) {
    set.add(line);
  })
    .then(() => {
      console.log(set.size);
      // throw set.size;
      return Array.from(set);
    })
    .then((array) =>
      array.map((line: string) => {
        const [pan, rest] = line.split("=");
        const expiration_date = rest.slice(0, 4);
        const service_code = rest.slice(4, 7);
        const pin_verification_data = rest.slice(7, 12);
        const discretionary_data = rest.slice(12);
        return {
          raw: line,
          pan,
          expiration_date,
          service_code,
          pin_verification_data,
          discretionary_data,
        };
      })
    )
    .then((arr: Card[]) => {
      const arrays = [],
        size = 100;
      while (arr.length > 0) {
        arrays.push(arr.splice(0, size));
      }
      return arrays;
    })
    .then((arrays) =>
      Promise.all(
        arrays.map(async (arr, i) => {
          await Promise.delay(60 * i);
          return insert({ data: arr }).catch((err) => {
            // fs.writeFileSync(errorPath, JSON.stringify(arr) + ",\n", {
            //   flag: "a",
            // })
            console.warn(err);
          });
        })
      )
    )
    .then(console.log)
    .then(() => console.log("done"))
    .catch(function (err) {
      console.error(err);
    });
}
acessDB();
export function errorDataHandle() {
  const file: string = fs.readFileSync(errorPath, "utf8");
  const arrays = JSON.parse("[" + file + "[]]");
  const emtpy = arrays.pop();
  console.log(emtpy, arrays.length);
  Promise.all(
    arrays.map(async (arr: Card[], i: number) => {
      await Promise.delay(100 * i);
      return insert({ data: arr }).catch(() =>
        fs.writeFileSync(error2Path, JSON.stringify(arr) + ",\n", {
          flag: "a",
        })
      );
    })
  )
    .then(console.log)
    .then(() => console.log("done"));
}
// errorDataHandle();

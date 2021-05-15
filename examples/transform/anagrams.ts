import {
  groupBy,
  filter,
  mapValues,
  toArray,
  uniq,
  indexBy,
  join,
  pipe,
  truncate,
} from "lodash/fp";
import { readFileSync } from "fs";
import { left, right } from "fp-ts/Either";
import * as io from "fp-ts/IOEither";
import { pipe as pipeFP } from "fp-ts/function";
import { resolve } from "path";

type Dictionary = { [key: string]: string };

function ok<T>(result: T) {
  return right(result);
}
function error<T>(reason: T) {
  return left(reason);
}

module File {
  export function open(path: string) {
    return io.tryCatch(
      () => {
        const result = readFileSync(path);
        return result;
      },
      (e) => {
        return new Error(String(e));
      }
    );
  }
}

function find_matching_lines(pattern: string) {
  return (content: Buffer) => {
    console.log("never called");
    return pipe(
      (r: Buffer) => {
        return r.toString().split("\n");
      },
      filter((s: string) => s.includes(pattern))
    )(content);
  };
}

function truncate_lines(content: string[]) {
  return pipeFP(content, mapValues(truncate({ length: 20 })), (d) =>
    toArray(d)
  );
}

function unless_empty(result: string[]) {
  if (result.length > 0) {
    return ok(result);
  }
  return error(new Error("nothing found"));
}
function find_all(fileName: string, pattern: string) {
  return pipeFP(
    fileName,
    File.open,
    io.map((b) => find_matching_lines(pattern)(b)),
    io.map((l) => truncate_lines(l)),
    io.chain((e) => io.fromEither(unless_empty(e))),
    io.mapLeft((e) => e.message)
  )();
}

function generate(words: string[]): Dictionary {
  return pipe(indexBy(pipe(codepoints, sortAlphabets)))(words);
}
function look_up_by_signature(dict: Dictionary) {
  return (key: string) => {
    return dict[key];
  };
}

const codepoints = (string: string) => {
  return [...string];
};
const subsets = <T>(theArray: T[]) =>
  theArray.reduce(
    (subsets: T[][], value) =>
      subsets.concat(subsets.map((set) => [value, ...set])),
    [[]]
  );
const longerThan = <T>(length: number) =>
  pipe(filter((v: T[]) => v.length >= length));

const groupByLength = <T>(array: T[][]) => groupBy("length", array);

const sortAlphabets = function (charsOrString: string[] | string) {
  const chars =
    typeof charsOrString == "string" ? charsOrString.split("") : charsOrString;
  return chars.sort().join("");
};

const asSignature = pipe(mapValues(sortAlphabets), toArray, uniq);

export const all_subset_longer_than = (length: number) =>
  pipe(codepoints, subsets, longerThan(length));

export const find_in_directory = (words: string[]) => (signatures: string[]) =>
  pipe(
    mapValues(pipe(look_up_by_signature(generate(words)))),
    mapValues(join("")),
    filter((v) => !!v)
  )(signatures);

export const anagrams_in = (word: string) =>
  pipe(
    all_subset_longer_than(3),
    asSignature,
    find_in_directory([
      "vinyl",
      "test",
      "pizza",
      "ivy",
      "nil",
      "yin",
      "inly",
      "liny",
      "viny",
    ]),
    groupByLength
  )(word);

console.log(find_all(resolve(__dirname, "./test.txt"), "a"));

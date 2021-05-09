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
  isEmpty,
} from "lodash/fp";
import { readFileSync } from "fs";
type GenericFunction = <T>(x: T) => T;

type Dictionary = { [key: string]: string };
type ResultOk<T> = ["ok", T];
type ResultError<T> = ["error", T];

function ok<T>(result: T) {
  return ["ok", result] as ResultOk<T>;
}
function error<T>(reason: T) {
  return ["error", reason] as ResultError<T>;
}

const unless_ok = <T, G, H>(callback: H) => (
  test: ResultOk<T> | ResultError<G>
) => {
  if (test[0] === "ok") {
    return callback(test[1]);
  } else {
    return test;
  }
};
module File {
  export function open(path: string) {
    try {
      const result = readFileSync("./test");
      return ["ok", result] as ResultOk<Buffer>;
    } catch (e) {
      return ["error", e.message] as ResultError<string>;
    }
  }
}

function ok_unless_empty<T>(result: T | null) {
  if (isEmpty(result)) {
    return ok(result);
  }
  return error("nothing found" as const);
}

function find_matching_lines(pattern: string) {
  return (content: Buffer) => {
    return pipe(
      (r: Buffer) => {
        return r.toString().split("/n");
      },
      filter((s: string) => s.includes(pattern)),
      ok
    )(content);
  };
}

function truncate_lines(content: string[]) {
  return pipe(mapValues(truncate({ length: 20 })), toArray, ok)(content);
}
const test = unless_ok(() => find_matching_lines("test")(Buffer.from("aaaaa")));

function find_all(fileName: string, pattern: string) {
  return pipe(
    File.open,
    unless_ok(find_matching_lines(pattern)),
    unless_ok(truncate_lines)
  )(fileName);
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

console.log();

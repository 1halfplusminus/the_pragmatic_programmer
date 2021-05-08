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

type Dictionary = { [key: string]: string };
type ResultOk<T> = ["ok", T];

type ResultError<T> = ["error", T];
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

function find_matching_lines(pattern: string) {
  return (content: ResultOk<Buffer> | ResultError<any>) => {
    if (content[0] == "ok") {
      return pipe(
        (r: Buffer) => {
          return r.toString().split("/n");
        },
        filter((s: string) => s.includes(pattern))
      )(content[1]);
    } else {
      return ["error", content[1]];
    }
  };
}

function truncate_lines(content: ResultOk<string[]> | ResultError<any>) {
  if (content[0] == "ok") {
    return pipe(mapValues(truncate({ length: 20 })), toArray)(content[1]);
  } else {
    return ["error", content[1]];
  }
}

function find_all(fileName: string, pattern: string) {
  return pipe(
    File.open,
    find_matching_lines(pattern),
    truncate_lines
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

console.log(anagrams_in("vinyl"));

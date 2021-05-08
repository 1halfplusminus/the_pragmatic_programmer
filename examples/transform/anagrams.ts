import {
  groupBy,
  filter,
  mapValues,
  toArray,
  uniq,
  indexBy,
  join,
} from "lodash/fp";
import pipe from "lodash/fp/pipe";

type Dictionary = { [key: string]: string };

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

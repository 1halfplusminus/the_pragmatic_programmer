import {
  groupBy,
  filter,
  mapValues,
  toArray,
  uniq,
  union,
  uniqBy,
  isEqual,
} from "lodash/fp";
import pipe from "lodash/fp/pipe";

const codepoints = (string: String) => {
  return [...string];
};
const subsets = <T>(theArray: T[]) =>
  theArray.reduce(
    (subsets: T[][], value) =>
      subsets.concat(subsets.map((set) => [value, ...set])),
    [[]]
  );
const longerThan = <T>(length: number) =>
  pipe(filter((v: T[]) => v.length > length));

const groupByLength = <T>(array: T[][]) => groupBy("length", array);

const sortAlphabets = function (charsOrString: String[] | String) {
  const chars =
    charsOrString instanceof String ? charsOrString.split("") : charsOrString;
  return chars.sort().join("");
};

const asSignature = pipe(mapValues(sortAlphabets), toArray, uniq);

export const all_subset_longer_than = (length: number) =>
  pipe(codepoints, subsets, longerThan(length));

console.log(
  pipe(all_subset_longer_than(3), asSignature, groupByLength)("vinyl")
);

import { groupBy, filter } from "lodash/fp";
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

export const all_subset_longer_than = (length: number) =>
  pipe(codepoints, subsets, longerThan(length), groupByLength);

console.log(all_subset_longer_than(3)("vinyl"));

import { groupBy, mapValues, toArray, flattenDepth, first } from "lodash/fp";
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
const longerThanThree = <T>(array: T[][]) => array.filter((t) => t.length > 3);
const groupByLength = <T>(array: T[][]) => groupBy("length", array);
const allCodepoints = pipe(mapValues(codepoints), toArray);
const allSubsets = pipe(mapValues(subsets), toArray, first);

const result = pipe(
  allCodepoints,
  allSubsets,
  longerThanThree,
  groupByLength
)(["vinyl"]);

console.log(result);

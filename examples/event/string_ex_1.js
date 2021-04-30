import inquirer from "inquirer";

/** @typedef {{ prop1: string, prop2: string, prop3?: number }} SpecialType */
/**
 * @typedef  {"header" | "data" | "trailer" | "other" } Event
 * @typedef  { "initial" | "reading" | "done" | "error" } State
 */

/**
 * @type {[key: State]: [key: Event]: State}
 */
const transitions = {
  initial: {
    header: "reading",
  },
  reading: {
    data: "reading",
    trailer: "done",
  },
};

/**
 * @type {State}
 */
let state = "initial";

while (state != "done" && state != "error") {
  /** @type {{choices:Event[]}} */
  const prompt = {
    type: "list",
    name: "event",
    choices: ["data","header","other","trailer"],
    message: "event",
  };
  const result = await inquirer.prompt([prompt]);
  state = transitions[state][result.event] || "error";
  console.log(state);
}

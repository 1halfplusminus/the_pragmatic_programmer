import inquirer from "inquirer";

/** @typedef {{ prop1: string, prop2: string, prop3?: number }} SpecialType */
/**
 * @typedef  {"header" | "data" | "trailer" | "other" } Event
 * @typedef  { "initial" | "reading" | "done" | "error" } State
 */
const handler = {
  get: (target,prop) => {
    return prop in target  ? target[prop] :   [
      "error",
      () => {
        console.log("I'm in error");
      },
    ]
  },
};

/** @type { ([key: Event]: [State, () => void]) => [key: Event]: [State, () => void]} **/
const createTransition = (transition ) => {
  return new Proxy(transition,handler);
}
/**
 * @type {[key: State]: [key: Event]: State}
 */
const transitions =  {
  initial: createTransition({
    header: [
      "reading",
      () => {
        console.log("I'm parsing header");
      },
    ]
  }),
  reading: createTransition({
    data: [
      "reading",
      () => {
        console.log("I'm reading");
      },
    ],
    trailer: [
      "done",
      () => {
        console.log("I'm done");
      },
    ],
  }),
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
    choices: ["data", "header", "other", "trailer"],
    message: "event",
  };
  const result = await inquirer.prompt([prompt]);
  const [newState, action] = transitions[state][result.event];
  state = newState;
  action();
  console.log(state);
}

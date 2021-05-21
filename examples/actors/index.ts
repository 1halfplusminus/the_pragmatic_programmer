import { ActorFunc, start, dispatch, stop, spawnStateless, spawn } from "nact";

declare interface State {
  waiter: string;
}
declare type HungryForPie = {
  type: "hungry for pie";
};
declare type Order = {
  type: "order";
  customer: string;
  wants: string;
};
declare type Message = Order | HungryForPie;

const system = start();

const customerActor = spawn(
  system,
  (state: State, msg: Message, ctx) => {
    if (msg.type === "hungry for pie") {
      return dispatch(state.waiter, {
        type: "order",
        customer: ctx.self,
        wants: "pie",
      });
    }
  },
  "customer"
);

import {
  ActorFunc,
  start,
  dispatch,
  stop,
  spawnStateless,
  spawn,
  Ref,
} from "nact";

declare interface State {
  waiter: string;
  pieCase: Ref<unknown>;
}
declare type HungryForPie = {
  type: "hungry for pie";
};
declare type Order = {
  type: "order";
  customer: Ref<PieCase>;
  wants: string;
};
declare type PutOnTable = {
  type: "put on table";
  food: string;
};
declare type NoPieLeft = {
  type: "no pie left";
};

declare type GetSlice = {
  type: "get slice";
  customer: Ref<Customer>;
  waiter: Ref<Waiter>;
};

declare type Message = Order | HungryForPie | PutOnTable | NoPieLeft;

declare type Customer = {
  name: string;
};
declare type Waiter = {};
declare type PieCase = {};

const isCustomer = (type: any): type is Customer => "name" in type;
const system = start();

const customerActor = spawn(
  system,
  (state: State, msg: Message, { self }) => {
    if (isCustomer(self)) {
      if (msg.type === "hungry for pie") {
        return dispatch(state.waiter, {
          type: "order",
          customer: self,
          wants: "pie",
        });
      }
      if (msg.type === "put on table") {
        console.log(`${self.name} sees ${msg.food} appear on the table`);
      }
      if (msg.type === "no pie left") {
        console.log(`${name} sulks...`);
      }
    }
  },
  "customer"
);

const waiterActor = spawn(
  system,
  (state: State, msg: Message, { self }) => {
    if (msg.type === "order") {
      if (msg.wants == "pie") {
        dispatch(state.pieCase, {
          type: "get slice",
          waiter: self,
          customer: msg.customer,
        } as GetSlice);
      } else {
        console.log(`Don't know ho to oder ${msg.wants}`);
      }
    }
  },
  "waiter"
);

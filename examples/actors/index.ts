import { start, dispatch, spawn } from "nact";
declare type Ref<T> = T;
declare interface State {
  waiter: Ref<Waiter>;
  pieCase: Ref<PieCase>;
  slices: string[];
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
  msg: string;
};

declare type GetSlice = {
  type: "get slice";
  customer: Ref<Customer>;
  waiter: Ref<Waiter>;
};

declare type AddToOrder = {
  type: "add to order";
  food: string;
  customer: Ref<Customer>;
};

declare type Error = {
  type: "error";
  msg: string;
  customer: Ref<Customer>;
};

declare type Message =
  | Order
  | HungryForPie
  | PutOnTable
  | NoPieLeft
  | AddToOrder
  | Error
  | GetSlice;

declare type Customer = {
  name: string;
};
declare type Waiter = {};

declare type PieCase = {};

const isCustomer = (type: any): type is Customer => "name" in type;
const system = start();
const initalState = { slices: ["apple", "peach", "cherry"] };

const pieCaseActor = spawn(
  system,
  (state = initalState, msg: Message, { self }) => {
    if (msg.type === "get slice") {
      if (state.slices.length == 0) {
        dispatch(msg.waiter, {
          type: "error",
          msg: "no pie left",
          customer: msg.customer,
        } as Error);
        return state;
      } else {
        const slice = state.slices.shift() + " pie slice";
        dispatch(msg.customer, {
          type: "put on table",
          food: slice,
        } as PutOnTable);
        dispatch(msg.waiter, {
          type: "add to order",
          food: slice,
          customer: msg.customer,
        });
        return state;
      }
    }
  },
  "pieCase"
);

const waiterActor = spawn(
  system,
  (
    state: State = { ...initalState, pieCase: pieCaseActor, waiter: {} },
    msg: Message,
    { self }
  ) => {
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
    if (msg.type === "add to order") {
      console.log(`Waiter adds ${msg.food} to ${msg.customer.name}'s order`);
    }
    if (msg.type === "error") {
      dispatch(msg.customer, {
        type: "no pie left",
        msg: msg.msg,
      } as NoPieLeft);
      console.log(
        `\nThe waiter apologizes to ${msg.customer.name}: ${msg.msg}`
      );
    }
    return state;
  },
  "waiter"
);

const customerActorFactory = (name: string) =>
  spawn(
    system,
    (
      state = {
        waiter: waiterActor,
      },
      msg: Message,
      { self }
    ) => {
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
          console.log(`${self.name} sulks...`);
        }
      }
      return state;
    },
    name
  );

const customerActor1 = customerActorFactory("Allan");
const customerActor2 = customerActorFactory("Pas-Riche");

dispatch(customerActor1, { type: "hungry for pie" } as HungryForPie);
dispatch(customerActor2, { type: "hungry for pie" } as HungryForPie);
dispatch(customerActor1, { type: "hungry for pie" } as HungryForPie);
dispatch(customerActor2, { type: "hungry for pie" } as HungryForPie);
dispatch(customerActor1, { type: "hungry for pie" } as HungryForPie);

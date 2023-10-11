import { SSTConfig } from "sst";
import { MainStack } from "./stacks/MainStack";

export default {
  config(_input) {
    return {
      name: "rentalize-sst",
      region: "eu-north-1",
    };
  },
  stacks(app) {
    app.stack(MainStack);
  }
} satisfies SSTConfig;

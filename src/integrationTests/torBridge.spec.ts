import { serial, TestInterface } from "ava";
import { cypherNodeHttpTransport } from "cyphernode-js-sdk";
import { cyphernodeTorBridge } from "../bridge/cyphernodeTorBridge";
import { events } from "../constants";
import { spy } from "sinon";
const log = debug("sifir:test");
const test = serial as TestInterface<any>;
test.before(async t => {
  t.context = {};
});
// This test needs a bit of scafolding, to create a docker container, label it to get traefik traffic the run it
// Will get to it eventually
test.skip("Shoud be able to route a message to TORs brdige though TOR networks", async t => {
  // load up bridge
  const transport = spy(cypherNodeHttpTransport());
  const { startBridge } = cyphernodeTorBridge({ transport });
  const api = startBridge();
  await new Promise((res, rej) => setTimeout(res, 15000));
  // TODO add caller here after we finish docker file for cn
  t.true(transport.get.calledOnce);
  t.pass();
});

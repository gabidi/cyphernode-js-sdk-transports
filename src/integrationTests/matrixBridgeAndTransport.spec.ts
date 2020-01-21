import { serial, TestInterface } from "ava";
import {
  btcClient as _btcClient,
  cypherNodeHttpTransport
} from "cyphernode-js-sdk";
import { cypherNodeMatrixBridge } from "../bridge/cypherNodeMatrixBridge";
import { cypherNodeMatrixTransport } from "../transports/cyphernodeMatrixTransport";
import { getSyncMatrixClient } from "../lib/matrixUtil";
import { events } from "../constants";
import sinon from "sinon";
const test = serial as TestInterface<any>; //FIXME this bullshit, interface for Matrix
test.before(async t => {
  t.context = {
    getSyncMatrixClient,
    apiKey: process.env.CYPHERNODE_API_KEY,
    baseUrl: process.env.SIFIR_MATRIX_SERVER,
    password: process.env.SIFIR_MATRIX_PASS,
    user: process.env.SIFIR_MATRIX_USER,
    phoneUser: process.env.SIFIR_PHONE_MATRIX_USER,
    phoneUserPassword: process.env.SIFIR_PHONE_MATRIX_PASS
  };
});
test("Should be able to send message to devices directly", async t => {
  const { baseUrl, getSyncMatrixClient, apiKey, user, password } = t.context;
  //---- Setup server
  const nodeDeviceId = "myCyphernode";
  const clientId = "myPhone";
  const bridgeInboundMiddleware = ({ event, accountsPairedDeviceList }) => {
    const eventSender = event.getSender();
    t.is(eventSender, user);
    t.true(Object.keys(accountsPairedDeviceList).includes(eventSender));
    const content = event.getContent();
    return JSON.parse(content.body);
  };
  const bridgeOutboundMiddleware = sinon.stub().resolvesArg(0);
  const serverMatrixClient = await getSyncMatrixClient({
    baseUrl,
    password,
    user,
    deviceId: nodeDeviceId
  });

  const { startBridge } = cypherNodeMatrixBridge({
    transport: cypherNodeHttpTransport(),
    client: serverMatrixClient,
    inboundMiddleware: bridgeInboundMiddleware,
    outboundMiddleware: bridgeOutboundMiddleware
  });

  await startBridge({
    accountsPairedDeviceList: {
      [user]: [clientId]
    }
  });
  //--- Setup client (frontside)
  const transportInboundmiddleware = ({ event, nodeAccountUser }) => {
    t.true(event.getSender() === nodeAccountUser);
    const { body, msgtype } = event.getContent();
    const { nonce, reply } = JSON.parse(body);
    return { nonce, reply };
  };
  const transportOutboundmiddleware = sinon.stub().resolvesArg(0);
  const transportMatrixClient = await getSyncMatrixClient({
    baseUrl,
    password,
    user,
    deviceId: clientId
  });
  const transport = await cypherNodeMatrixTransport({
    nodeAccountUser: user,
    nodeDeviceId,
    client: transportMatrixClient,
    msgTimeout: 1200000,
    inboundMiddleware: transportInboundmiddleware,
    outboundMiddleware: transportOutboundmiddleware
  });
  const btcClient = _btcClient({ transport });
  // Send your request
  const hash = await btcClient.getBestBlockHash();
  t.true(transportOutboundmiddleware.calledOnce);
  t.true(bridgeOutboundMiddleware.calledOnce);
  t.true(!!hash.length);
});

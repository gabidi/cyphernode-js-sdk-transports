import { serial, TestInterface } from "ava";
import {
  btcClient as _btcClient,
  cypherNodeHttpTransport
} from "cyphernode-js-sdk";
import { cypherNodeMatrixBridge } from "../bridge/cypherNodeMatrixBridge";
import { cypherNodeMatrixTransport } from "../transports/cyphernodeMatrixTransport";
import { getSyncMatrixClient } from "../lib/matrixUtil";
import { events } from "../constants";
const test = serial as TestInterface<any>; //FIXME this bullshit, interface for Matrix
test.before(async t => {
  t.context = {
    getSyncMatrixClient,
    apiKey: process.env.CYPHERNODE_API_KEY,
    baseUrl: process.env.CYPHERNODE_MATRIX_SERVER,
    password: process.env.CYPHERNODE_MATRIX_PASS,
    user: process.env.CYPHERNODE_MATRIX_USER
  };
});
test("Should be able to send message to devices directly", async t => {
  const { baseUrl, getSyncMatrixClient, apiKey, user, password } = t.context;
  // Setup server
  const nodeDeviceId = "myCyphernode";
  const serverMatrixClient = await getSyncMatrixClient({
    baseUrl,
    password,
    user,
    deviceId: nodeDeviceId
  });

  const { startBridge } = cypherNodeMatrixBridge({
    nodeAccountUser: user,
    transport: cypherNodeHttpTransport(),
    client: serverMatrixClient
  });

  const clientId = "myPhone";
  await startBridge({
    authorizedDevices: [clientId]
  });
  // Setup client (frontside)
  const transportMatrixClient = await getSyncMatrixClient({
    baseUrl,
    password,
    user,
    deviceId: clientId
  });
  const btcClient = _btcClient({
    transport: await cypherNodeMatrixTransport({
      nodeAccountUser: user,
      nodeDeviceId,
      client: transportMatrixClient,
      msgTimeout: 1200000
    })
  });
  // Send your request
  const hash = await btcClient.getBestBlockHash();
  t.true(!!hash.length);
});
test.skip("Should be able to route and process a cypherNode-sdk request over Matrix", async t => {
  const { baseUrl, getSyncMatrixClient, getTransport, apiKey } = t.context;
  // Setup server
  const serverMatrixClient = await getSyncMatrixClient({
    baseUrl,
    password: process.env.CYPHERNODE_MATRIX_PASS,
    user: process.env.CYPHERNODE_MATRIX_USER
  });

  const { startBridge, getRoomId } = cypherNodeMatrixBridge({
    transport: getTransport(),
    client: serverMatrixClient
  });
  await startBridge({
    inviteUser: [process.env.CYPHERNODE_MATRIX_TEST_CLIENT_USER]
  });
  // Setup client (frontside)
  const transportMatrixClient = await getSyncMatrixClient({
    baseUrl,
    password: process.env.CYPHERNODE_MATRIX_TEST_CLIENT_PASS,
    user: process.env.CYPHERNODE_MATRIX_TEST_CLIENT_USER
  });
  const btcClient = _btcClient({
    transport: await cypherNodeMatrixTransport({
      client: transportMatrixClient,
      roomId: getRoomId()
    })
  });
  // Send your request
  const hash = await btcClient.getBestBlockHash();
  t.true(!!hash.length);
});

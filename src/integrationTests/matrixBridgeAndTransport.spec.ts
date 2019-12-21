import { serial, TestInterface } from "ava";
import {
  btcClient as _btcClient,
  cypherNodeHttpTransport
} from "cyphernode-js-sdk";
import { cypherNodeMatrixBridge } from "../bridge/cypherNodeMatrixBridge";
import { cypherNodeMatrixTransport } from "../transports/cyphernodeMatrixTransport";
import { getSyncMatrixClient, verificationMethods } from "../lib/matrixUtil";
import uuid from "uuid/v4";
import { events } from "../constants";
import debug from "debug";
const log = debug("sifir:test");
const test = serial as TestInterface<any>; //FIXME this bullshit, interface for Matrix
test.before(async t => {
  t.context = {
    getSyncMatrixClient,
    apiKey: process.env.CYPHERNODE_API_KEY,
    baseUrl: process.env.CYPHERNODE_MATRIX_SERVER,
    password: process.env.CYPHERNODE_MATRIX_PASS,
    user: process.env.CYPHERNODE_MATRIX_USER,
    phoneUser: "@e684968c440ba877d73d8ff62bae31277f8c0279:matrix.sifir.io",
    phoneUserPassword: "daYw5a7Mwv3nywXOU+67avsrsNySW5EdIEkIupt3vwY"
  };
});
test("Should be able to route an e2e message from client transport to lsning bridge", async t => {
  const {
    baseUrl,
    getSyncMatrixClient,
    apiKey,
    user,
    password,
    phoneUser,
    phoneUserPassword
  } = t.context;
  // Setup server
  const nodeDeviceId = `bridge`;
  const serverMatrixClient = await getSyncMatrixClient({
    baseUrl,
    password,
    user,
    deviceId: nodeDeviceId
  });

  const { startBridge } = cypherNodeMatrixBridge({
    transport: cypherNodeHttpTransport(),
    client: serverMatrixClient
  });

  const clientId = `client`;
  const roomId = await startBridge({
    inviteUser: phoneUser
  });
  // Setup client (frontside)
  const transportMatrixClient = await getSyncMatrixClient({
    baseUrl,
    password: phoneUserPassword,
    user: phoneUser,
    deviceId: clientId
  });
  const transport = await cypherNodeMatrixTransport({
    roomId,
    client: transportMatrixClient,
    msgTimeout: 18000
  });
  // Verify devices
  serverMatrixClient.setGlobalBlacklistUnverifiedDevices(true);
  transportMatrixClient.setGlobalBlacklistUnverifiedDevices(true);
  // Setup server to respond to verify request from phone
  const serverVerifyPromise = new Promise((res, rej) => {
    serverMatrixClient.on("Room.timeline", async e => {
      const content = e.getContent();
      if (!content || content.msgtype !== "m.key.verification.request") return;
      if (content.to !== serverMatrixClient.getUserId()) return;
      log("got request", content, content.msgtype);
      //const me = client && client.getUserId();
      const serverVerifier = serverMatrixClient.acceptVerificationDM(
        e,
        verificationMethods.SAS
      );
      serverVerifier.on("show_sas", e => {
        e.confirm();
      });
      await serverVerifier.verify();
      res();
    });
  });
  // Start verification request
  const phoneVerifier = await transportMatrixClient.requestVerificationDM(
    user,
    roomId,
    [verificationMethods.SAS]
  );
  phoneVerifier.on("show_sas", r => {
    r.confirm();
  });
  await Promise.all([phoneVerifier.verify(), serverVerifyPromise]);
  // Encrypt room and wait for conifmrionat
  await serverMatrixClient.setRoomEncryption(roomId, {
    algorithm: "m.megolm.v1.aes-sha2"
  });
  await transportMatrixClient.setRoomEncryption(roomId, {
    algorithm: "m.megolm.v1.aes-sha2"
  });
  // init client and send request
  const btcClient = _btcClient({ transport });
  const hash = await btcClient.getBestBlockHash();
  t.true(!!hash.length);
  const balance = await btcClient.getBalance();
  t.true(!isNaN(balance));
});

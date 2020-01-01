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
    baseUrl: process.env.SIFIR_MATRIX_SERVER,
    password: process.env.SIFIR_MATRIX_PASS,
    user: process.env.SIFIR_MATRIX_USER,
    phoneUser: process.env.SIFIR_PHONE_MATRIX_USER,
    phoneUserPassword: process.env.SIFIR_PHONE_MATRIX_PASS
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
  // ---- Setup server (bridge)
  const nodeDeviceId = uuid();
  const phoneDeviceId = uuid();
  const serverMatrixClient = await getSyncMatrixClient({
    baseUrl,
    password,
    user,
    deviceId: nodeDeviceId
  });

  const { startBridge, inviteUserToNewRoom } = cypherNodeMatrixBridge({
    transport: cypherNodeHttpTransport(),
    client: serverMatrixClient
  });
  const { roomId } = await inviteUserToNewRoom(phoneUser, phoneDeviceId);
  await startBridge();
  // ------------- Setup client (transport)
  const transportMatrixClient = await getSyncMatrixClient({
    baseUrl,
    password: phoneUserPassword,
    user: phoneUser,
    deviceId: phoneDeviceId
  });
  const transport = await cypherNodeMatrixTransport({
    roomId,
    client: transportMatrixClient,
    msgTimeout: 1800,
    approvedDeviceList: [nodeDeviceId],
    approvedUserList: [user]
  });
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
        debug("------------------server Sas", e);
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
    debug("-------------------phone sas", r);
    r.confirm();
  });
  await Promise.all([phoneVerifier.verify(), serverVerifyPromise]);
  debug("Verifier done");
  await new Promise((res, rej) => setTimeout(res, 10000));
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
test.todo(
  "A non verified device will result in a command being ignored or rejected"
);

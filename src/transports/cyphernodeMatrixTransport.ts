import { queue } from "async";
import uuid from "uuid/v4";
import _debug from "debug";
import { EventEmitter } from "events";
import { getSyncMatrixClient } from "../lib/matrixUtil";
import { events } from "../constants";
import olm from "olm";
const cypherNodeMatrixTransport = async ({
  nodeDeviceId = "",
  nodeAccountUser = "",
  client = getSyncMatrixClient(),
  emitter = new EventEmitter(),
  msgTimeout = 30000,
  maxCmdConcurrency = 2,
  acceptVerifiedDeviceOnly = true,
  acceptEncryptedEventsOnly = true,
  log = _debug("sifir:transport")
} = {}): Promise<{ get: Function; post: Function }> => {
  if (!nodeDeviceId || !nodeAccountUser)
    throw "Must provide device id to send commands to ";
  const matrixClient = client.then ? await client : client;

  // Setup room lsner, re-emits room commands as nonce events on emitter:w
  matrixClient.on("toDeviceEvent", event => {
    // // we know we only want to respond to messages
    if (event.getType() !== events.COMMAND_REPLY) return;
    log(events.COMMAND_REPLY, event.getContent());
    const eventSender = event.getSender();
    if (eventSender !== nodeAccountUser) {
      log("Got command reply from a different account!");
      return;
    }
    // if (matrixClient.checkUserTrust(eventSender).isCrossSigningVerified()) {
    // log("User is not trusted!");
    // }
    // Check if device is verified
    if (acceptVerifiedDeviceOnly) {
      const senderKey = event.getSenderKey();
      // Check our accept device keys ? Maybe this is the key to send during pairing ?
      if (
        matrixClient
          .checkDeviceTrust(eventSender, nodeDeviceId)
          .isCrossSigningVerified()
      ) {
        log(
          "[ERROR] Recieved commmand reply from unVerified device!",
          event.getDate(),
          event.getId(),
          event.getSender()
        );
        return;
      }
    }
    // Check is ecnrypted
    if (event.isEncrypted()) {
      event.decrypt();
    } else {
      if (acceptEncryptedEventsOnly) {
        log(
          "[ERROR] Recieved unencrypted commmand reply with encryptedOnly flag on!"
        );
        return;
      }
    }
    const { body, msgtype } = event.getContent();
    const { nonce, reply } = JSON.parse(body);
    emitter.emit(nonce, { ...reply });
  });

  // Serialize command sending on matrix
  const _commandQueue = queue(async ({ method, command, param, nonce }, cb) => {
    const payload = {
      [nodeAccountUser]: {
        [nodeDeviceId]: {
          body: JSON.stringify({ method, command, param, nonce }),
          msgtype: events.COMMAND_REQUEST
        }
      }
    };
    log("Transport::Command queue sending", method, command, nonce, payload);
    await matrixClient.sendToDevice(events.COMMAND_REQUEST, payload, nonce);
    cb();
  }, maxCmdConcurrency);
  // Sends uuids the comand  and sends it to queue
  // @return a promise that fullfills with commands reply (when emitter emits nonce)
  const _sendCommand = ({
    method,
    command,
    payload
  }: {
    method: "GET" | "POST";
    command: String;
    payload: any;
  }) => {
    const nonce = uuid();
    const commandPromise = new Promise((res, rej) => {
      const timeOut = setTimeout(() => {
        rej({
          err: `Message ${nonce.slice(0, 4)}-${nonce.slice(
            -4
          )} ${method}:${command} timedout`
        });
      }, msgTimeout);
      emitter.once(nonce, ({ err, ...data }) => {
        clearTimeout(timeOut);
        err ? rej({ err }) : res(data);
      });
    });
    _commandQueue.push({
      method,
      command,
      param: payload,
      nonce
    });
    return commandPromise;
  };
  const get = (command: String, payload: any) =>
    _sendCommand({ method: "GET", command, payload });
  const post = (command: String, payload: any) =>
    _sendCommand({ method: "POST", command, payload });
  return { get, post };
};
export { cypherNodeMatrixTransport };

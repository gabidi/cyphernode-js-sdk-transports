import { queue } from "async";
import uuid from "uuid/v4";
import _debug from "debug";
import { EventEmitter } from "events";
import { getSyncMatrixClient } from "../lib/matrixUtil";
import { events } from "../constants";
import { verifyEventSenderIsTrusted } from "../lib/helper/verifyEvents";
const cypherNodeMatrixTransport = async ({
  roomId = null,
  client = getSyncMatrixClient(),
  emitter = new EventEmitter(),
  msgTimeout = 30000,
  maxCmdConcurrency = 2,
  approvedDeviceList = [],
  approvedUserList = [],
  log = _debug("sifir:transport")
} = {}): Promise<{ get: Function; post: Function }> => {
  const matrixClient = client.then ? await client : client;
  if (!roomId) throw "Must provide a room for the transport";
  if (!matrixClient.isCryptoEnabled())
    throw "Crypto not enabled on client with required encryption flag set";
  const transportRoom = matrixClient.getRoom(roomId);
  if (!transportRoom.roomId) throw "Invalid room passed or cannot find room";
  // Check if we're note members yet of this room and join
  if (transportRoom.getMyMembership() === "invite") {
    await matrixClient.joinRoom(roomId);
    log("transport joined room", transportRoom.roomId);
  }
  matrixClient.on("Event.decrypted", async event => {
    // we are only intested in messages for our room
    if (event.getRoomId() !== transportRoom.roomId) return;
    if (!approvedUserList.includes(event.getSender())) return;
    if (event.getSender() === matrixClient.getUserId()) return;
    // Check is ecnrypted
    if (!event.isEncrypted()) {
      log(
        "recieved unencrypted commmand reply with encryptedOnly flag on!",
        event.getType(),
        event.getContent()
      );
      return;
    }

    log("decrypted event", event.getSender(), event.getContent());
    // we know we only want to respond to messages
    if (event.getType() !== events.COMMAND_REPLY) return;

    try {
      await verifyEventSenderIsTrusted(matrixClient, event, approvedDeviceList);
    } catch (err) {
      log("error validating event sender trust", err);
      return;
    }
    const { body, msgtype } = event.getContent();
    // Make sure this is reply not echo
    if (msgtype !== events.COMMAND_REPLY) return;
    const { nonce, reply } = JSON.parse(body);
    emitter.emit(nonce, { ...reply });
    // });
  });

  // Serialize command sending on matrix
  const _commandQueue = queue(async ({ method, command, param, nonce }, cb) => {
    log("command queue sending", method, command, nonce);
    await matrixClient.sendEvent(roomId, events.COMMAND_REQUEST, {
      body: JSON.stringify({ method, command, param, nonce }),
      msgtype: events.COMMAND_REQUEST
    });
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

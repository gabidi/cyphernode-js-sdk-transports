import { queue } from "async";
import uuid from "uuid/v4";
import _debug from "debug";
import { EventEmitter } from "events";
import { getSyncMatrixClient } from "../lib/matrixUtil";
import { events } from "../constants";
const cypherNodeMatrixTransport = async ({
  roomId = null,
  client = getSyncMatrixClient(),
  emitter = new EventEmitter(),
  msgTimeout = 30000,
  maxCmdConcurrency = 2,
  acceptVerifiedDeviceOnly = true,
  acceptEncryptedEventsOnly = true,
  log = _debug("sifir:transport")
} = {}): Promise<{ get: Function; post: Function }> => {
  if (!roomId) throw "Must provide a room for the transport";
  const matrixClient = client.then ? await client : client;
  const transportRoom = await matrixClient.joinRoom(roomId);
  log("transport joined room", transportRoom.roomId);
  matrixClient.on("Event.decrypted", async event => {
    // matrixClient.on("Room.timeline", (event, room, toStartOfTimeline) => {
    // we are only intested in messages for our room
    if (event.getRoomId() !== transportRoom.roomId) return;
    if (event.getSender() === matrixClient.getUserId()) return;
    // Check is ecnrypted
    if (!event.isEncrypted() && acceptEncryptedEventsOnly) {
      log(
        "recieved unencrypted commmand reply with encryptedOnly flag on!",
        event.getType(),
        event.getContent()
      );
      return;
    }

    // event.once("Event.decrypted", () => {
    log("decrypted event", event.getSender(), event.getContent());
    // we know we only want to respond to messages
    if (event.getType() !== events.COMMAND_REPLY) return;
    const userVerified = await matrixClient.isEventSenderVerified(event);
    log("user verified status is", userVerified);
    // if (matrixClient.checkUserTrust(event.getSender()).isCrossSigningVerified()) {
    // log("User is not trusted!");
    // }
    // Check if device is verified
    //if (acceptVerifiedDeviceOnly) {
    //  const senderKey = event.getSenderKey();
    //  // Check our accept device keys ? Maybe this is the key to send during pairing ?
    //  if (
    //    matrixClient
    //      .checkDeviceTrust(eventSender, nodeDeviceId)
    //      .isCrossSigningVerified()
    //  ) {
    //    log(
    //      "[ERROR] Recieved commmand reply from unVerified device!",
    //      event.getDate(),
    //      event.getId(),
    //      event.getSender()
    //    );
    //    return;
    //  }
    //}
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

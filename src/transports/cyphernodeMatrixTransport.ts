import { queue } from "async";
import uuid from "uuid/v4";
import _debug from "debug";
import { EventEmitter } from "events";
import { getSyncMatrixClient } from "../lib/matrixUtil";
import { events } from "../constants";
const debug = _debug("sifir:transport");
const cypherNodeMatrixTransport = async ({
  nodeDeviceId = "",
  nodeAccountUser = "",
  client = getSyncMatrixClient(),
  emitter = new EventEmitter(),
  msgTimeout = 30000
} = {}): Promise<{ get: Function; post: Function }> => {
  if (!nodeDeviceId || !nodeAccountUser)
    throw "Must provide device id to send commands to ";
  const matrixClient = client.then ? await client : client;
  // Setup room lsner, re-emits room commands as nonce events on emitter:w
  matrixClient.on("toDeviceEvent", event => {
    // // we know we only want to respond to messages
    if (event.getType() !== events.COMMAND_REPLY) return;
    debug(events.COMMAND_REPLY, event.getContent());
    if (event.getSender() !== nodeAccountUser) {
      // TODO should send message to user phone in this cas
      console.error("Got command reply from a different account!");
      return;
    }
    const { body, msgtype } = event.getContent();
    const { nonce, reply } = JSON.parse(body);
    emitter.emit(nonce, { ...reply });
  });

  // Serialize command sending on matrix
  const _commandQueue = queue(async ({ method, command, param, nonce }) => {
    const payload = {
      [nodeAccountUser]: {
        [nodeDeviceId]: {
          body: JSON.stringify({ method, command, param, nonce }),
          msgtype: events.COMMAND_REQUEST
        }
      }
    };
    debug("Transport::Command queue sending", method, command, nonce, payload);
    await matrixClient.sendToDevice(events.COMMAND_REQUEST, payload, nonce);
  }, 1);
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

// FIXME update this on next cyphernode sdk release
import { cypherNodeHttpTransport } from "cyphernode-js-sdk";
import matrix from "matrix-js-sdk";
import { queue } from "async";
import uuid from "uuid/v4";
import { EventEmitter } from "events";
import _debug from "debug";
import { getSyncMatrixClient } from "../lib/matrixUtil";
import { events } from "../constants";
const debug = _debug("sifir:bridge");
const cypherNodeMatrixBridge = ({
  nodeAccountUser = "",
  client = getSyncMatrixClient(),
  transport = cypherNodeHttpTransport()
} = {}): {
  startBridge: Function;
} => {
  let serverRoom;
  const startBridge = async ({
    signedRequestsOnly = true,
    signingKeys = []
  } = {}) => {
    debug("starting bridge", signedRequestsOnly);
    const { get, post } = transport;
    const _client = client.then ? await client : client;
    _client.on("toDeviceEvent", async event => {
      debug("got event", event.getType(), event.getSender());
      if (event.getType() !== events.COMMAND_REQUEST) {
        return;
      }
      if (event.getSender() !== nodeAccountUser) {
        // TODO should send message to user phone in this cas
        console.error("Got command from a different account!");
        return;
      }
      const content = event.getContent();
      debug("got command!", content);
      if (signedRequestsOnly) {
        const { sig, deviceId } = content;
        // Load the devices rsk
        //
        // TODO 1. validate RSK key is valid , 2. singature with rsk is valid
      }
      const { method, command, param = null, nonce } = JSON.parse(content.body);
      let reply;
      switch (method) {
        case "GET":
          debug("processing get", command);
          reply = await get(command, param);
          break;
        case "POST":
          debug("processing post", command);
          reply = await post(command, param);
          break;
        default:
          console.error("Unknown method", method);
          return;
      }
      const devicesConnected = await _client.getDevices();
      const accountMessages = devicesConnected.devices.reduce(
        (payload, { device_id }) => {
          payload[device_id] = {
            body: JSON.stringify({ reply, nonce }),
            msgtype: events.COMMAND_REQUEST
          };
          return payload;
        },
        {}
      );
      debug("sending reply to", nonce, reply, accountMessages);
      await _client.sendToDevice(
        events.COMMAND_REPLY,
        {
          [nodeAccountUser]: accountMessages
        },
        nonce
      );
      debug("finished processing command");
    });
    debug("finish starting bridge");
  };
  return {
    startBridge
  };
};
export { cypherNodeMatrixBridge };

// FIXME update this on next cyphernode sdk release
import { cypherNodeHttpTransport } from "cyphernode-js-sdk";
import matrix from "matrix-js-sdk";
import { queue } from "async";
import uuid from "uuid/v4";
import { EventEmitter } from "events";
import _debug from "debug";
import { getSyncMatrixClient } from "../lib/matrixUtil";
import { events } from "../constants";
import olm from "olm";

const cypherNodeMatrixBridge = ({
  nodeAccountUser = "",
  client = getSyncMatrixClient(),
  transport = cypherNodeHttpTransport(),
  log = _debug("sifir:transport")
} = {}): {
  startBridge: Function;
} => {
  const startBridge = async ({
    acceptVerifiedDeviceOnly = true,
    acceptEncryptedEventsOnly = true
  } = {}) => {
    log("starting bridge");
    const { get, post } = transport;
    const _client = client.then ? await client : client;

    if (acceptEncryptedEventsOnly && !_client.isCryptoEnabled())
      throw "Crypto not enabled on client with required encryption flag set";

    _client.on("toDeviceEvent", async event => {
      log("got event", event.getType(), event.getSender());
      if (event.getType() !== events.COMMAND_REQUEST) {
        return;
      }
      if (event.getSender() !== nodeAccountUser) {
        // TODO should send message to user phone in this cas
        console.error("Got command from a different account!");
        return;
      }
      // FIXME HERE check device verd + encryp
      const content = event.getContent();
      log("got command!", content);
      const { method, command, param = null, nonce } = JSON.parse(content.body);
      let reply;
      try {
        switch (method) {
          case "GET":
            log("processing get", command);
            reply = await get(command, param);
            break;
          case "POST":
            log("processing post", command);
            reply = await post(command, param);
            break;
          default:
            console.error("Unknown command method", method);
            return;
        }
      } catch (error) {
        log("Error sending command to transport", error);
        reply = { error };
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
      log("sending reply to", nonce, reply, accountMessages);
      await _client.sendToDevice(
        events.COMMAND_REPLY,
        {
          [nodeAccountUser]: accountMessages
        },
        nonce
      );
      log("finished processing command");
    });
    log("finish starting bridge");
  };
  return {
    startBridge
  };
};
export { cypherNodeMatrixBridge };

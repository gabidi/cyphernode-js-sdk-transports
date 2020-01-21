// FIXME update this on next cyphernode sdk release
import { cypherNodeHttpTransport } from "cyphernode-js-sdk";
import matrix from "matrix-js-sdk";
import { queue } from "async";
import uuid from "uuid/v4";
import { EventEmitter } from "events";
import _debug from "debug";
import { getSyncMatrixClient } from "../lib/matrixUtil";
import { events } from "../constants";
import { MatrixBridgeParam, AccountDevicesDict } from "../types/interfaces";
const debug = _debug("sifir:bridge");
const cypherNodeMatrixBridge = ({
  client = getSyncMatrixClient(),
  transport = cypherNodeHttpTransport(),
  inboundMiddleware,
  outboundMiddleware
}: MatrixBridgeParam): {
  startBridge: Function;
} => {
  if (!inboundMiddleware || !outboundMiddleware) {
    throw "Throw must supply outbound and inbound message processing";
  }
  const startBridge = async ({
    accountsPairedDeviceList
  }: {
    accountsPairedDeviceList: AccountDevicesDict;
  }) => {
    if (!accountsPairedDeviceList)
      throw "cannot start birding wihtout list of paired devices";
    debug("starting bridge", accountsPairedDeviceList);
    const { get, post } = transport;
    const _client = client.then ? await client : client;
    _client.on("toDeviceEvent", async event => {
      debug("got event", event.getType(), event.getSender());
      if (event.getType() !== events.COMMAND_REQUEST) {
        return;
      }
      let reply;
      try {
        const content = await inboundMiddleware({
          event,
          accountsPairedDeviceList
        });
        const { method, command, param = null, nonce } = content;
        if (!method.length || !command.length || !nonce.length)
          throw "Invalid event content parsed";
        debug("got command!", method, command);
        let payload;
        switch (method) {
          case "GET":
            debug("processing get", command);
            payload = await get(command, param);
            break;
          case "POST":
            debug("processing post", command);
            payload = await post(command, param);
            break;
          default:
            console.error("Unknown command method", method, command);
            return;
        }
        let body = JSON.stringify({ reply: payload, nonce });
        body = await outboundMiddleware(body);
        reply = Object.entries(accountsPairedDeviceList).reduce(
          (dict, [account, devices]) => {
            debug("preparing reply to", account, devices);
            dict[account] = {};
            devices.forEach(device => {
              dict[account][device] = { body };
            });
            return dict;
          },
          <object>{}
        );
      } catch (err) {
        debug("Error sending command to transport", err);
        reply = { err };
      }
      debug("Bridge sending command reply", reply);
      await _client.sendToDevice(events.COMMAND_REPLY, reply);
      //const devicesConnected = await _client.getDevices();
      //const accountMessages = devicesConnected.devices.reduce(
      //  (payload, { device_id }) => {
      //    payload[device_id] = {
      //      body: JSON.stringify({ reply, nonce }),
      //      msgtype: events.COMMAND_REQUEST
      //    };
      //    return payload;
      //  },
      //  {}
      //);
      //const devicesConnected = await _client.getDevices();
      //const accountMessages = devicesConnected.devices.reduce(
      //  (payload, { device_id }) => {
      //    payload[device_id] = {
      //      body: JSON.stringify({ reply, nonce }),
      //      msgtype: events.COMMAND_REQUEST
      //    };
      //    return payload;
      //  },
      //  {}
      //);
      //debug("sending reply to", nonce, reply, accountMessages);
      //await _client.sendToDevice(
      //  events.COMMAND_REPLY,
      //  {
      //    [nodeAccountUser]: accountMessages
      //  },
      //  nonce
      //);
      debug("finished processing command");
    });
    debug("finish starting bridge");
  };
  return {
    startBridge
  };
};
export { cypherNodeMatrixBridge };

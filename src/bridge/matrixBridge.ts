import { cypherNodeHttpTransport } from "cyphernode-js-sdk";
import matrix from "matrix-js-sdk";
import { queue } from "async";
import uuid from "uuid/v4";
import { EventEmitter } from "events";
import _debug from "debug";
import { getSyncMatrixClient } from "../lib/matrixUtil";
import { events } from "../constants";
import { MatrixBridgeParam, AccountDevicesDict } from "../types/interfaces";
import { commandBroadcaster } from "../lib/commandBroadcaster";

const matrixBridge = ({
  client = getSyncMatrixClient(),
  bridge = new EventEmitter(),
  log = _debug("matrixbridge"),
  inboundMiddleware,
  outboundMiddleware
}: MatrixBridgeParam): {
  startBridge: Function;
} => {
  if (!inboundMiddleware || !outboundMiddleware) {
    throw "Throw must supply outbound and inbound message processing";
  }
  const { syncEmitCommand } = commandBroadcaster({
    source: "matrixBridge",
    bridge
  });
  const startBridge = async ({
    accountsPairedDeviceList
  }: {
    accountsPairedDeviceList?: AccountDevicesDict;
  } = {}) => {
    log("starting bridge with device account list", accountsPairedDeviceList);
    const _client = client.then ? await client : client;
    _client.on("toDeviceEvent", async event => {
      log("got event", event.getType(), event.getSender());
      if (event.getType() !== events.COMMAND_REQUEST) {
        return;
      }
      let reply;
      try {
        const content = await inboundMiddleware({
          event,
          accountsPairedDeviceList
        });
        const { method, command, param = null, nonce, ...rest } = content;
        if (!method.length || !command.length || !nonce.length)
          throw "Invalid event content parsed";
        log("got command!", method, command);
        const payload = await syncEmitCommand({
          method,
          command,
          param,
          nonce,
          ...rest
        });
        let bodyToProcess = JSON.stringify({ reply: payload, nonce });
        const { deviceId, eventSender, body } = await outboundMiddleware(
          bodyToProcess
        );
        if (deviceId && eventSender) {
          reply = {
            [eventSender]: {
              [deviceId]: {
                body
              }
            }
          };
        }
        // If middleware does not return the deviceId and Sender, then fallback to provided list
        else {
          reply = Object.entries(accountsPairedDeviceList).reduce(
            (dict, [account, devices]) => {
              log("preparing reply to", account, devices);
              dict[account] = {};
              devices.forEach(device => {
                dict[account][device] = { body };
              });
              return dict;
            },
            <object>{}
          );
        }
      } catch (err) {
        log("Error sending command to transport", err);
        reply = { err };
      }
      log("Bridge sending command reply", reply);
      await _client.sendToDevice(events.COMMAND_REPLY, reply);
      log("finished processing command");
    });
    log("finish starting bridge");
  };
  return {
    startBridge
  };
};
export { matrixBridge };

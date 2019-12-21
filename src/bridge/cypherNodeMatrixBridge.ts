// FIXME update this on next cyphernode sdk release
import { cypherNodeHttpTransport } from "cyphernode-js-sdk";
import matrix from "matrix-js-sdk";
import { queue } from "async";
import uuid from "uuid/v4";
import { EventEmitter } from "events";
import _debug from "debug";
import { getSyncMatrixClient } from "../lib/matrixUtil";
import { events } from "../constants";

const cypherNodeMatrixBridge = ({
  client = getSyncMatrixClient(),
  transport = cypherNodeHttpTransport(),
  log = _debug("sifir:bridge")
} = {}): {
  startBridge: Function;
} => {
  /**
   * Starts the bridge and returns the private roomId the user needs to join
   */
  const startBridge = async ({
    inviteUser,
    acceptVerifiedDeviceOnly = true,
    acceptEncryptedEventsOnly = true
  } = {}): Promise<string> => {
    if (!inviteUser) throw "Cannot start room bridge without user to invite";
    log("starting bridge for user", inviteUser);
    const { get, post } = transport;
    const _client = client.then ? await client : client;

    if (acceptEncryptedEventsOnly && !_client.isCryptoEnabled())
      throw "Crypto not enabled on client with required encryption flag set";

    const _room = await client.createRoom({
      invite: [inviteUser],
      visibility: "private",
      name: `cyphernode-${uuid()}`,
      room_alias_name: `cyphernode-${uuid()}`
    });
    const serverRoom = await client.joinRoom(_room.room_id);
    // FIXME i think this has to be called after devices are verified
    //await client.setRoomEncryption(serverRoom.roomId, {
    //  algorithm: "m.megolm.v1.aes-sha2"
    //});

    log("bridge created and joined new room", serverRoom.roomId);
    _client.on("Event.decrypted", async event => {
      // _client.on("Room.timeline", async function(event, room, toStartOfTimeline) {
      // we know we only want to respond to command
      if (event.getRoomId() !== _room.room_id) return;
      if (event.getSender() === _client.getUserId()) return;
      // Check encryption
      if (!event.isEncrypted() && acceptEncryptedEventsOnly) {
        log(
          "[ERROR] Recieved unencrypted commmand reply with encryptedOnly flag on!",
          event.getType(),
          event.getContent()
        );
        return;
      }
      // event.once("Event.decrypted", async () => {
      log("decrypted event", event.getSender(), event.getContent());
      // we are only intested in cyphernode.commnads for our room
      if (event.getContent().msgtype !== events.COMMAND_REQUEST) return;
      const { nonce, method, command, param = null } = JSON.parse(
        // note only body is JSON string
        event.getContent().body
      );
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
      log("send Event", nonce, reply);
      await _client.sendEvent(serverRoom.roomId, events.COMMAND_REPLY, {
        body: JSON.stringify({ nonce, reply }),
        msgtype: events.COMMAND_REPLY
      });
      // });
    });
    log("finish starting bridge");
    return serverRoom.roomId;
  };
  return {
    startBridge
  };
};
export { cypherNodeMatrixBridge };

// FIXME update this on next cyphernode sdk release
import { cypherNodeHttpTransport } from "cyphernode-js-sdk";
import matrix from "matrix-js-sdk";
import { queue } from "async";
import uuid from "uuid/v4";
import { EventEmitter } from "events";
import _debug from "debug";
import { getSyncMatrixClient } from "../lib/matrixUtil";
import { events } from "../constants";
import { verifyEventSenderIsTrusted } from "../lib/helper/verifyEvents";
const cypherNodeMatrixBridge = ({
  client = getSyncMatrixClient(),
  transport = cypherNodeHttpTransport(),
  log = _debug("sifir:bridge"),
  approvedRoomList = [],
  approvedUserList = [],
  approvedDeviceList = []
} = {}): {
  startBridge: Function;
  inviteUserToNewRoom: Function;
} => {
  const inviteUserToNewRoom = async user => {
    if (!user) throw "Cannot start room bridge without user to invite";
    const _client = client.then ? await client : client;
    const _room = await _client.createRoom({
      invite: [user],
      visibility: "private",
      name: `cyphernode-${uuid()}`,
      room_alias_name: `cyphernode-${uuid()}`
    });
    const serverRoom = await _client.joinRoom(_room.room_id);
    log("bridge created and joined new room", serverRoom.roomId);
    approvedRoomList.push(_room.room_id);
    approvedUserList.push(user);
    return serverRoom;
  };
  /**
   * Starts the bridge and returns the private roomId the user needs to join
   */
  const startBridge = async (): Promise<void> => {
    const { get, post } = transport;
    const _client = client.then ? await client : client;

    if (!_client.isCryptoEnabled())
      throw "Crypto not enabled on client with required encryption flag set";

    _client.on("Event.decrypted", async event => {
      // _client.on("Room.timeline", async function(event, room, toStartOfTimeline) {
      // make sure room is in list of approved rooms
      if (!approvedRoomList.includes(event.getRoomId())) return;
      // make sure user sending message is in approved
      // We check autneticitiy of user in abit
      if (!approvedUserList.includes(event.getSender())) return;
      // make sure it's not an echo of our own message
      if (event.getSender() === _client.getUserId()) return;
      // Check encryption
      if (!event.isEncrypted()) {
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
      try {
        await verifyEventSenderIsTrusted(_client, event, approvedDeviceList);
      } catch (err) {
        log("error validating event sender trust", err);
        return;
      }
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
      await _client.sendEvent(event.getRoomId(), events.COMMAND_REPLY, {
        body: JSON.stringify({ nonce, reply }),
        msgtype: events.COMMAND_REPLY
      });
      // });
    });
    log("finish starting bridge");
  };
  return {
    startBridge,
    inviteUserToNewRoom
  };
};
export { cypherNodeMatrixBridge };

import { MatrixClient, MatrixEvent } from "./../matrixUtil";
const verifyEventSenderIsTrusted = async (
  client: MatrixClient,
  event: MatrixEvent,
  approvedDeviceList: [string]
) => {
  if (!approvedDeviceList || approvedDeviceList.length < 1)
    throw "Cannot verify event sender with no approved device list";
  // Check sender + device are verfied
  // TODO we verify each device individually and do not use crosssigning yet. I think this is a feature not a bug
  // in this context.
  const userVerified = await client.isEventSenderVerified(event);
  if (!userVerified) {
    throw "user sending command is verified status is unverified";
  }
  const { device_id: deviceId } = event.event.content;
  if (!approvedDeviceList.find(d => d === deviceId)) {
    throw "user devices is not on accepted list";
    return;
  }
};

export { verifyEventSenderIsTrusted };

import matrix from "matrix-js-sdk";
import _debug from "debug";
const debug = _debug("matrixutil:");
const getSyncMatrixClient = async ({
  user = process.env.CYPHERNODE_MATRIX_USER,
  password = process.env.CYPHERNODE_MATRIX_PASS,
  baseUrl = process.env.CYPHERNODE_MATRIX_SERVER,
  deviceId = undefined,
  ...opts
} = {}): Promise<matrix.MatrixClient> => {
  debug("Conneting to", baseUrl, user);
  const matrixClient = await matrix.createClient({
    baseUrl,
    initialSyncLimit: 100,
    timelineSupport: true,
    ...opts
  });
  await matrixClient.login("m.login.password", {
    user,
    password,
    device_id: deviceId
  });
  matrixClient.startClient();
  let syncFailCount = 0;
  return new Promise((res, rej) => {
    matrixClient.once(
      "sync",
      (syncState: string, a, event: matrix.EventTimeline) => {
        if (syncState === "ERROR") {
          debug("Matrix Sync error", event, syncState, a);
          if (event) {
            if (!event.error.data) {
              debug("event.error.data is missing: ", event.error);
            }
            if (event.error.data.errcode === "M_UNKNOWN_TOKEN") {
              debug("toggleMatrixLoginModal", true);
            }
            matrixClient.stop();
            rej(event);
          }
          if (syncFailCount >= 3) {
            debug(
              "error",
              "Could not connect to matrix more than 3 time. Disconnecting."
            );
            // transportMatrixClient.stop();
            rej(`Matrix client failed to sync more than ${syncFailCount}`);
          } else {
            debug(
              "error",
              `Could not connect to matrix server. ${
                syncFailCount ? "Attempt " + syncFailCount : ""
              }`
            );
            syncFailCount++;
          }
        } else if (syncState === "SYNCING") {
          debug("client is in SYNCING state");
          syncFailCount = 0;
        } else if (syncState === "PREPARED") {
          debug("client is in PREPARED state");
          res(matrixClient);
        }
      }
    );
  });
};
export { getSyncMatrixClient };

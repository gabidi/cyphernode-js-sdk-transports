import matrix from "matrix-js-sdk";
import _debug from "debug";
const debug = _debug("matrixutil:");
// TODO There's got to be a better way to this
type MatrixClient = import("@types/matrix-js-sdk").MatrixClient;
type EventTimeline = import("@types/matrix-js-sdk").EventTimeline;
const getSyncMatrixClient = async ({
  user = process.env.SIFIR_MATRIX_USER,
  password = process.env.SIFIR_MATRIX_PASS,
  baseUrl = process.env.SIFIR_MATRIX_SERVER,
  deviceId = undefined,
  loginType = "m.login.password",
  loginOpts = {},
  ...opts
} = {}): Promise<MatrixClient> => {
  debug("Connecting to", baseUrl, user);
  const matrixClient: MatrixClient = await matrix.createClient({
    baseUrl,
    initialSyncLimit: 100,
    timelineSupport: true,
    deviceId,
    ...opts
  });
  debug("login in with", loginType, loginOpts);
  await matrixClient.login(loginType, {
    user,
    password,
    device_id: deviceId,
    ...loginOpts
  });
  matrixClient.startClient();
  let syncFailCount = 0;
  return new Promise((res, rej) => {
    matrixClient.once("sync", (syncState: string, a, event: EventTimeline) => {
      if (syncState === "ERROR") {
        debug("Matrix Sync error", event, syncState, a);
        if (event) {
          if (!event.error.data) {
            debug("event.error.data is missing: ", event.error);
          }
          if (event.error.data.errcode === "M_UNKNOWN_TOKEN") {
            // debug("need to login", true);
          }
          matrixClient.stop();
          rej(event);
        }
        if (syncFailCount >= 3) {
          debug(
            "error",
            "Could not connect to matrix more than 3 time. Disconnecting."
          );
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
    });
  });
};
export { getSyncMatrixClient };

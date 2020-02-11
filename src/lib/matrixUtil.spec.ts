/**
 * Simple test that shows the constructions of a Matrix-js-sdk client
 * with a custom request handler.
 * Why?
 * Browser-request is ancient and breaks in React Native
 */
import { serial, TestInterface } from "ava";
import { getSyncMatrixClient } from "../lib/matrixUtil";
import * as axios from "axios";
const test = serial as TestInterface<any>;
test("Should be able to instantiate a matrix client with axios as it's request handler", async t => {
  const client = await getSyncMatrixClient({
    baseUrl: process.env.SIFIR_MATRIX_SERVER,
    password: process.env.SIFIR_MATRIX_PASS,
    user: process.env.SIFIR_MATRIX_USER,
    request: async (options: any, cb: Function) => {
      const opts = {
        ...options,
        url: options.uri,
        data: options.body,
        params: options.qs
      };
      try {
        const resp = await axios.request(opts);
        cb(null, resp, JSON.stringify(resp.data));
      } catch (err) {
        cb(err);
      }
    }
  });
  const devices = await client.getDevices();
  t.true(!!Object.keys(devices).length);
});

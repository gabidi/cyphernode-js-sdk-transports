const commandBroadcaster = ({ bridge, timeoutMs = 3000 } = {}) => {
  if (!bridge) "Must init commandBroadcaster with event emitter as bridge";
  const syncEmitCommand = ({
    command,
    method,
    param,
    nonce
  }: {
    command: string;
    method: string;
    param: string;
    nonce: string;
  }) => {
    const replyPromise = new Promise((res, rej) => {
      const timeout = setTimeout(
        () => rej(`${command}/${method} with ${nonce} timedout!`),
        timeoutMs
      );
      bridge.on(nonce, (payload: any) => {
        clearTimeout(timeout);
        const { err } = payload;
        if (err) rej({ err });
        else res(payload);
      });
    });
    bridge.emit("torBridgeCommand", { command, method, param, nonce });
    return replyPromise;
  };
  return { syncEmitCommand };
};
export { commandBroadcaster };

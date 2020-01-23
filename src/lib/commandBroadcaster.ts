const commandBroadcaster = ({ source, bridge, timeoutMs = 3000 } = {}) => {
  if (!bridge) "Must init commandBroadcaster with event emitter as bridge";
  if (!source) "Must init commandBroadcaster with source";
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
      bridge.once(nonce, (payload: any) => {
        clearTimeout(timeout);
        const { err } = payload;
        if (err) rej({ err });
        else res(payload);
      });
    });
    bridge.emit("sifirBridgeCommand", {
      source,
      command,
      method,
      param,
      nonce
    });
    return replyPromise;
  };
  return { syncEmitCommand };
};
export { commandBroadcaster };

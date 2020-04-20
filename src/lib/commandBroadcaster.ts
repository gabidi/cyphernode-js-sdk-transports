const commandBroadcaster = ({
  source,
  bridge,
  timeoutMs = process.env.BRIDGE_COMMAND_BROADCAST_TIMEOUT || 3000
} = {}) => {
  if (!bridge) "Must init commandBroadcaster with event emitter as bridge";
  if (!source) "Must init commandBroadcaster with source";
  const syncEmitCommand = ({
    command,
    method,
    param,
    nonce,
    ...rest
  }: {
    command: string;
    method: string;
    param: string;
    nonce: string;
    rest?: any;
  }) => {
    const replyPromise = new Promise((res, rej) => {
      const timeout = setTimeout(
        () =>
          rej(`${command}/${method} with ${nonce} timedout after ${timeoutMs}`),
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
      nonce,
      ...rest
    });
    return replyPromise;
  };
  return { syncEmitCommand };
};
export { commandBroadcaster };

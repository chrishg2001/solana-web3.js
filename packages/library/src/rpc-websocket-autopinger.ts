import type { IRpcWebSocketTransport } from '@solana/rpc-transport';

type Config<TTransport extends IRpcWebSocketTransport> = Readonly<{
    intervalMs: number;
    transport: TTransport;
}>;

const PING_PAYLOAD = {
    jsonrpc: '2.0',
    method: 'ping',
} as const;

export function getWebSocketTransportWithAutoping<TTransport extends IRpcWebSocketTransport>({
    intervalMs,
    transport,
}: Config<TTransport>): TTransport {
    const pingableConnections = new Map<
        Awaited<ReturnType<IRpcWebSocketTransport>>,
        Awaited<ReturnType<IRpcWebSocketTransport>>
    >();
    return (async (...args) => {
        const connection = await transport(...args);
        let intervalId: number | undefined;
        function sendPing() {
            connection.send_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(PING_PAYLOAD);
        }
        function restartPingTimer() {
            clearInterval(intervalId);
            intervalId = setInterval(sendPing, intervalMs);
        }
        if (pingableConnections.has(connection) === false) {
            pingableConnections.set(connection, {
                [Symbol.asyncIterator]: connection[Symbol.asyncIterator].bind(connection),
                send_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: (
                    ...args: Parameters<typeof connection.send_DO_NOT_USE_OR_YOU_WILL_BE_FIRED>
                ) => {
                    restartPingTimer();
                    return connection.send_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(...args);
                },
            });
            (async () => {
                try {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    for await (const _ of connection) {
                        restartPingTimer();
                    }
                } catch {
                    /* empty */
                } finally {
                    pingableConnections.delete(connection);
                    clearInterval(intervalId);
                    if (handleOffline) {
                        globalThis.window.removeEventListener('offline', handleOffline);
                    }
                    if (handleOnline) {
                        globalThis.window.removeEventListener('online', handleOnline);
                    }
                }
            })();
            if (!__BROWSER__ || globalThis.navigator.onLine) {
                restartPingTimer();
            }
            let handleOffline;
            let handleOnline;
            if (__BROWSER__) {
                handleOffline = () => {
                    clearInterval(intervalId);
                };
                handleOnline = () => {
                    sendPing();
                    restartPingTimer();
                };
                globalThis.window.addEventListener('offline', handleOffline);
                globalThis.window.addEventListener('online', handleOnline);
            }
        }
        return pingableConnections.get(connection)!;
    }) as TTransport;
}

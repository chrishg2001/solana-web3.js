import { pipe } from '@solana/functional';
import { createWebSocketTransport } from '@solana/rpc-transport';
import { ClusterUrl } from '@solana/rpc-types';

import { getWebSocketTransportWithAutoping } from './rpc-websocket-autopinger';
import { getWebSocketTransportWithConnectionSharding } from './rpc-websocket-connection-sharding';

type Config<TClusterUrl extends ClusterUrl> = Readonly<{
    url: TClusterUrl;
}>;

export function createDefaultRpcSubscriptionsTransport<TClusterUrl extends ClusterUrl>(
    config: Config<TClusterUrl> & {
        /**
         * You might like to open more subscriptions per connection than your RPC provider allows
         * for. Using the initial payload as input, return a shard key from this method to assign
         * subscriptions to separate connections. One socket will be opened per shard key.
         */
        getShard?: (payload: unknown) => string;
        intervalMs?: number;
        sendBufferHighWatermark?: number;
    },
) {
    const { getShard, intervalMs, ...rest } = config;
    return pipe(
        createWebSocketTransport<TClusterUrl>({
            ...rest,
            sendBufferHighWatermark:
                config.sendBufferHighWatermark ??
                // Let 128KB of data into the WebSocket buffer before buffering it in the app.
                131_072,
        }),
        transport =>
            getWebSocketTransportWithAutoping({
                intervalMs: intervalMs ?? 5_000,
                transport,
            }),
        transport =>
            getWebSocketTransportWithConnectionSharding({
                getShard,
                transport,
            }),
    );
}

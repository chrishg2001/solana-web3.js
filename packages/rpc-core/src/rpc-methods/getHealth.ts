import type { IRpcApiMethods } from '@solana/rpc-types';

type GetHealthApiResponse = 'ok';

export interface GetHealthApi extends IRpcApiMethods {
    /**
     * Returns the health status of the node ("ok" if healthy).
     */
    getHealth(
        // FIXME: https://github.com/solana-labs/solana-web3.js/issues/1389
        NO_CONFIG?: Record<string, never>,
    ): GetHealthApiResponse;
}

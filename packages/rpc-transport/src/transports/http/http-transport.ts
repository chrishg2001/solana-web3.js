import fetchImpl from '@solana/fetch-impl';
import { ClusterUrl } from '@solana/rpc-types';

import { IRpcTransport, IRpcTransportFromClusterUrl } from '../transport-types';
import { SolanaHttpError } from './http-transport-errors';
import {
    AllowedHttpRequestHeaders,
    assertIsAllowedHttpRequestHeaders,
    normalizeHeaders,
} from './http-transport-headers';

type Config<TClusterUrl extends ClusterUrl> = Readonly<{
    headers?: AllowedHttpRequestHeaders;
    url: TClusterUrl;
}>;

export function createHttpTransport<TClusterUrl extends ClusterUrl>({
    headers,
    url,
}: Config<TClusterUrl>): IRpcTransportFromClusterUrl<TClusterUrl> {
    if (__DEV__ && headers) {
        assertIsAllowedHttpRequestHeaders(headers);
    }
    const customHeaders = headers && normalizeHeaders(headers);
    return async function makeHttpRequest<TResponse>({
        payload,
        signal,
    }: Parameters<IRpcTransport>[0]): Promise<TResponse> {
        const body = JSON.stringify(payload);
        const requestInfo = {
            body,
            headers: {
                ...customHeaders,
                // Keep these headers lowercase so they will override any user-supplied headers above.
                accept: 'application/json',
                'content-length': body.length.toString(),
                'content-type': 'application/json; charset=utf-8',
            },
            method: 'POST',
            signal,
        };
        const response = await fetchImpl(url, requestInfo);
        if (!response.ok) {
            throw new SolanaHttpError({
                message: response.statusText,
                statusCode: response.status,
            });
        }
        return (await response.json()) as TResponse;
    } as IRpcTransportFromClusterUrl<TClusterUrl>;
}

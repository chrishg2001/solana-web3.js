import type { Signature } from '@solana/keys';
import type { Commitment, IRpcApiMethods, RpcResponse, Slot, U64UnsafeBeyond2Pow53Minus1 } from '@solana/rpc-types';

import { TransactionError } from '../transaction-error';

/** @deprecated */
type TransactionStatusOk = Readonly<{
    Ok: null;
}>;

/** @deprecated */
type TransactionStatusErr = Readonly<{
    Err: TransactionError;
}>;

type SignatureStatusResult = Readonly<{
    /**
     * Number of blocks since signature confirmation, null if rooted,
     * as well as finalized by a supermajority of the cluster
     */
    confirmations: U64UnsafeBeyond2Pow53Minus1 | null;
    /**
     * The transaction's cluster confirmation status; either `processed`,
     * `confirmed`, or `finalized`.
     */
    confirmationStatus: Commitment | null;
    /** Error if transaction failed, null if transaction succeeded */
    err: TransactionError | null;
    /** The slot the transaction was processed */
    slot: Slot;
    /**
     * @deprecated Transaction status
     */
    status: TransactionStatusOk | TransactionStatusErr;
}>;

type GetSignatureStatusesBase = ReadonlyArray<SignatureStatusResult | null>;

type GetSignatureStatusesApiResponse = RpcResponse<GetSignatureStatusesBase>;

export interface GetSignatureStatusesApi extends IRpcApiMethods {
    /**
     * Returns the statuses of a list of signatures.
     * Each signature must be a txid, the first signature of a transaction.
     *
     * Note: Unless the `searchTransactionHistory` configuration parameter is
     * included, this method only searches the recent status cache of
     * signatures, which retains statuses for all active slots plus
     * `MAX_RECENT_BLOCKHASHES` rooted slots.
     */
    getSignatureStatuses(
        /**
         * An array of transaction signatures to confirm,
         * as base-58 encoded strings (up to a maximum of 256)
         */
        signatures: Signature[],
        config?: Readonly<{
            /**
             * if `true` - a Solana node will search its ledger cache for any
             * signatures not found in the recent status cache
             */
            searchTransactionHistory?: boolean;
        }>,
    ): GetSignatureStatusesApiResponse;
}

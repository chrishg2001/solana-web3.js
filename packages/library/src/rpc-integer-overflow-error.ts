import { SOLANA_ERROR__RPC_INTEGER_OVERFLOW, SolanaError } from '@solana/errors';
import { KeyPath } from '@solana/rpc-core/dist/types/tree-traversal';

export function createSolanaJsonRpcIntegerOverflowError(
    methodName: string,
    keyPath: KeyPath,
    value: bigint,
): SolanaError<typeof SOLANA_ERROR__RPC_INTEGER_OVERFLOW> {
    let argumentLabel = '';
    if (typeof keyPath[0] === 'number') {
        const argPosition = keyPath[0] + 1;
        const lastDigit = argPosition % 10;
        const lastTwoDigits = argPosition % 100;
        if (lastDigit == 1 && lastTwoDigits != 11) {
            argumentLabel = argPosition + 'st';
        } else if (lastDigit == 2 && lastTwoDigits != 12) {
            argumentLabel = argPosition + 'nd';
        } else if (lastDigit == 3 && lastTwoDigits != 13) {
            argumentLabel = argPosition + 'rd';
        } else {
            argumentLabel = argPosition + 'th';
        }
    } else {
        argumentLabel = `\`${keyPath[0].toString()}\``;
    }
    const path =
        keyPath.length > 1
            ? keyPath
                  .slice(1)
                  .map(pathPart => (typeof pathPart === 'number' ? `[${pathPart}]` : pathPart))
                  .join('.')
            : undefined;
    const error = new SolanaError(SOLANA_ERROR__RPC_INTEGER_OVERFLOW, {
        argumentLabel,
        keyPath: keyPath as readonly (string | number | symbol)[],
        methodName,
        optionalPathLabel: path ? ` at path \`${path}\`` : '',
        value,
        ...(path !== undefined ? { path } : undefined),
    });
    if ('captureStackTrace' in Error && typeof Error.captureStackTrace === 'function') {
        Error.captureStackTrace(error, createSolanaJsonRpcIntegerOverflowError);
    }
    return error;
}

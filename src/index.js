/**
 * Inspired by `eth-json-rpc-infura`
 * URL: https: //github.com/MetaMask/eth-json-rpc-infura
 */
const createAsyncMiddleware = require('json-rpc-engine/src/createAsyncMiddleware')
const JsonRpcError = require('json-rpc-error')
const PocketJSCore = require('pocket-js-core')
const Pocket = PocketJSCore.Pocket
const Relay = PocketJSCore.Relay

const RETRIABLE_ERRORS = [
    // ignore server overload errors
    'Gateway timeout',
    'ETIMEDOUT',
    'ECONNRESET',
    // ignore server sent html error pages
    // or truncated json responses
    'SyntaxError',
]

function createPocketMiddleware(devID, opts = {}) {
    const network = opts.network || 'ETH'
    const netID = opts.netID || '1'
    const requestTimeout = opts.requestTimeout || 10000
    const retryTimeout = opts.retryTimeout || 1000
    const maxAttempts = opts.maxAttempts || 5

    if(!devID) {
        throw createMissingDevIDError();
    }

    // Create new Pocket instance
    const pocket = new Pocket({
        devID: devID,
        networkName: network,
        netIDs: [netID],
        requestTimeOut: requestTimeout
    });

    return createAsyncMiddleware(async (req, res, next) => {
        // retry maxAttempts times, if error matches filter
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                // attempt request
                const response = await pocket.sendRelay(
                    new Relay(network, netID, JSON.stringify(normalizeReq(req)), pocket.configuration)
                )
                var error
                if (response instanceof Error || !response) {
                    error = response || new Error('Unknown error')
                    throw error
                }

                // Parse result
                const parsedResponse = JSON.parse(response)
                // finally return result
                res.result = parsedResponse.result
                res.error = parsedResponse.error
                break
            } catch (err) {
                // an error was caught while performing the request
                // if not retriable, resolve with the encountered error
                if (!isRetriableError(err)) {
                    // abort with error
                    throw err
                }
                // if no more attempts remaining, throw an error
                const remainingAttempts = maxAttempts - attempt
                if (!remainingAttempts) {
                    const errMsg = `Max Retries reached - \nOriginal Error:\n${err.toString()}\n\n`
                    const retriesExhaustedErr = new Error(errMsg)
                    throw retriesExhaustedErr
                }
                // otherwise, ignore error and retry again after timeout
                await timeout(retryTimeout)
            }
        }
        // request was handled correctly, end
    })
}

function timeout(length) {
    return new Promise((resolve) => {
        setTimeout(resolve, length)
    })
}

function isRetriableError(err) {
    const errMessage = err.toString()
    return RETRIABLE_ERRORS.some(phrase => errMessage.includes(phrase))
}

// strips out extra keys that could be rejected by strict nodes like parity
function normalizeReq(req) {
    return {
        id: req.id,
        jsonrpc: req.jsonrpc,
        method: req.method,
        params: req.params,
    }
}

function createMissingDevIDError() {
    let msg = `Missing Developer ID for Pocket Core MVP, for more information see here: https://docs.pokt.network/docs/how-to-participate`
    return createInternalError(msg);
}

function createInternalError(msg) {
    const err = new Error(msg)
    return new JsonRpcError.InternalError(err)
}

module.exports = createPocketMiddleware
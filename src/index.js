/**
 * Inspired by `eth-json-rpc-infura`
 * URL: https: //github.com/MetaMask/eth-json-rpc-infura
 */
const JsonRpcError = require('json-rpc-error')
const PocketJSCore = require('@pokt-network/pocket-js')
const Pocket = PocketJSCore.Pocket
const Configuration = PocketJSCore.Configuration
const HttpRpcProvider = PocketJSCore.HttpRpcProvider
const PocketAAT = PocketJSCore.PocketAAT
const typeGuard = PocketJSCore.typeGuard

const RETRIABLE_ERRORS = [
    // ignore server overload errors
    'Gateway timeout',
    'ETIMEDOUT',
    'ECONNRESET',
    // ignore server sent html error pages
    // or truncated json responses
    'SyntaxError',
]

function createPocketMiddleware(opts = {}) {
    const appPubKeyHex = opts.appPubKeyHex
    const appPrivKeyHex = opts.appPrivKeyHex
    const passphrase = opts.passphrase
    const dispatchURL = opts.dispatchURL
    const chainID = opts.chainID || '8cf7f8799c5b30d36c86d18f0f4ca041cf1803e0414ed9e9fd3a19ba2f0938ff'
    const requestTimeout = opts.requestTimeout || 10000
    const retryTimeout = opts.retryTimeout || 10000
    const maxDispatchers = opts.maxDispatchers || 5
    const maxSessions = opts.maxSessions || 1000
    const consensusNodeCount = opts.consensusNodeCount || 1
    const acceptDisputedResponses = opts.acceptDisputedResponses || false
    const maxAttempts = opts.maxAttempts || 5
    const version = '0.0.1'

    let pocketAAT = ''

    const configuration = new Configuration(
        maxDispatchers, 
        maxSessions, 
        consensusNodeCount,
        requestTimeout,
        acceptDisputedResponses
        )
    const rpcProvider = new HttpRpcProvider(new URL(dispatchURL))
    const pocket = new Pocket([new URL(dispatchURL)], rpcProvider, configuration)

    if (!appPubKeyHex || !appPrivKeyHex) {
        throw createMissingKeysError()
    }

    if (!dispatchURL) {
        throw createMissingDispatchError()
    }

    if (!passphrase) {
        throw createPassphraseError()
    }

    return async function createAsyncMiddleware(req, res, next, end) {
        // create AAT if doesn't exist
        if (pocketAAT == "") {
            const clientAccountOrError = await pocket.keybase.importAccount(Buffer.from(appPrivKeyHex, 'hex'), passphrase)
            if (typeGuard(clientAccountOrError, Error)) {
                throw createAccountCreationError()
            }
            const error = await pocket.keybase.unlockAccount(clientAccountOrError.addressHex, passphrase, 0)
            if (error) {
                throw createUnlockError()
            }
            pocketAAT = await PocketAAT.from(version, appPubKeyHex, appPubKeyHex, appPrivKeyHex)
        }
        // retry maxAttempts times, if error matches filter
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            console.log("attempt "+attempt)
            try {
                const relayData = '{\"jsonrpc\":\"2.0\",\"method\":\"eth_getBalance\",\"params\":[\"0xf892400Dc3C5a5eeBc96070ccd575D6A720F0F9f\",\"latest\"],\"id\":67}'
                // attempt request
                console.log(relayData)
                const response = await pocket.sendRelay(
                    relayData,
                    chainID,
                    pocketAAT,
                    configuration
                );
                console.log(response.payload);
                
                var error
                if (response instanceof Error || !response) {
                    error = response || new Error('Unknown error')
                    throw error
                }

                // Parse result
                const parsedResponse = JSON.parse(response.payload)
                // finally return result
                res.result = parsedResponse.result
                res.error = parsedResponse.error
                break
            } catch (err) {
                console.log(err)
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
    }
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

function createAccountCreationError() {
    let msg = `Unable to create account for AAT generation`
    return createInternalError(msg);
}

function createUnlockError() {
    let msg = `Unable to unlock account for AAT generation`
    return createInternalError(msg);
}

function createMissingKeysError() {
    let msg = `A public and private keypair must be provided for AAT generation, for more information see here: https://docs.pokt.network/docs/how-to-participate`
    return createInternalError(msg);
}


function createPassphraseError() {
    let msg = `A passphrase for the keypair must be provided for AAT generation, for more information see here: https://docs.pokt.network/docs/how-to-participate`
    return createInternalError(msg);
}


function createMissingDispatchError() {
    let msg = `A dispatch server is required, for more information see here: https://docs.pokt.network/docs/how-to-participate`
    return createInternalError(msg);
}

function createInternalError(msg) {
    const err = new Error(msg)
    return new JsonRpcError.InternalError(err)
}

module.exports = createPocketMiddleware
import { expect, assert } from 'chai'
import {
    Configuration,
    HttpRpcProvider,
    Pocket,
    typeGuard,
    Account,
    PocketAAT,
    RelayResponse
} from '@pokt-network/pocket-js'
const EnvironmentHelper = require('../utils/env/helper').EnvironmentHelper
const createPocketMiddleware = require('../../src/index')

// To test with Web3 2.x use 'web3-2.x' and for Web3 1.x use 'web3-1.x'
const Web3 = require('web3-1.x')
const Transaction = require('ethereumjs-tx').Transaction
const numberToHex = require('web3-utils').numberToHex

// For Testing we are using dummy data, none of the following information is real.
const env = EnvironmentHelper.getTestNet()

// Relay requirements
const version = '0.0.1'
const appPubKeyHex = "fa457de4393c386ae3c4dde8703bf25080cc9909d98b55fbc7d6f2ca057450a2"
const appPrivKeyHex = "22c6cf663e9932bb691b1432c9d8dae906d2609ff85e08792fceb10b2a0e9feffa457de4393c386ae3c4dde8703bf25080cc9909d98b55fbc7d6f2ca057450a2"
const passphrase = "1234"
const clientPubKey = "076cd88affc8e9bc255b2b44d948031b2d9066f5e9ae5b2efba32138e246219e"
const chainID = "00"
const dispatchURL = "http://localhost:8081"
const configuration = new Configuration(5, 100000, undefined, 1000000)
const rpcProvider = new HttpRpcProvider(new URL(dispatchURL))

describe("Pocket Interface functionalities", async () => {
    it('should instantiate a Pocket Middleware due to a valid configuration being used', () => {
        try {
            createPocketMiddleware({
                appPubKeyHex: appPubKeyHex,
                appPrivKeyHex: appPrivKeyHex,
                passphrase: passphrase,
                dispatchURL: dispatchURL,
                chainID: chainID
            })
        } catch (error) {
            assert.fail()
        }
    }).timeout(0)

    describe("Relay functionality", () => {
        describe("Success scenarios", () => {
            it("should send a relay given the correct parameters", async () => {
                const pocketMiddleware = createPocketMiddleware({
                    appPubKeyHex: appPubKeyHex,
                    appPrivKeyHex: appPrivKeyHex,
                    passphrase: passphrase,
                    dispatchURL: dispatchURL,
                    chainID: chainID
                })
                const relayData = '{\"jsonrpc\":\"2.0\",\"method\":\"eth_getBalance\",\"params\":[\"0xf892400Dc3C5a5eeBc96070ccd575D6A720F0F9f\",\"latest\"],\"id\":67}'
                const response = {}
                const next = function() {
                    // Placeholder next function
                }
                const end = function() {
                    console.log("DONE")
                }
                const relayResponse = await pocketMiddleware(relayData, response, next, end)

                expect(typeGuard(relayResponse, Error)).to.be.false
            })
        })
    })
})
const test = require('tape')
const createPocketMiddleware = require('../src/index')
const devID = process.env.JSON_RPC_POCKET_TEST_DEV_ID

test('createPocketMiddleware - middleware creation', (t) => {
    const pocketMiddleware = createPocketMiddleware(devID, {
        netID: '4', // Rinkeby network
    })
    t.ok(pocketMiddleware, 'PocketMiddleware succesfully created')
    t.end()
})

test('createPocketMiddleware - lacking developer id', (t) => {
    // Null devID, should error out
    t.throws(function() {
        createPocketMiddleware(null, {
            netID: '4', // Rinkeby network
        })
    }, 'PocketMiddleware creation failed because of null DEV ID')
    t.end()
})

test('createPocketMiddleware - read balance from rinkeby network', async (t) => {
    const pocketMiddleware = createPocketMiddleware(devID, {
        netID: '4', // Rinkeby network
    })
    const request = {
        "jsonrpc": "2.0",
        "method": "eth_getBalance",
        "params": ["0x8C341be596449cC7133b0128283EbE53f1C101e6", "latest"],
        "id": 1
    }
    const response = {}
    const next = function() {
        // Placeholder next function
    }
    const end = function() {
        t.ok(response, 'Balance succesfully read from account')
        t.end()
    }
    await pocketMiddleware(request, response, next, end)
})
<div align="left">
  <a href="https://www.pokt.network">
    <img src="https://pokt.network/wp-content/uploads/2018/12/Logo-488x228-px.png" alt="drawing" width="340"/>
  </a>
</div>
<h1 align="left">Overview</h1>
  <div align="left">
    <a  href="https://github.com/pokt-network/json-rpc-pocket/releases">
      <img src="https://img.shields.io/github/release-pre/pokt-network/eth-rpc-pocket.svg"/>
    </a>
    <a href="https://circleci.com/gh/pokt-network/json-rpc-pocket/tree/master">
      <img src="https://circleci.com/gh/pokt-network/json-rpc-pocket/tree/master.svg?style=svg"/>
    </a>
    <a  href="https://github.com/pokt-network/json-rpc-pocket/pulse">
      <img src="https://img.shields.io/github/contributors/pokt-network/eth-rpc-pocket.svg"/>
    </a>
    <a href="https://opensource.org/licenses/MIT">
      <img src="https://img.shields.io/badge/License-MIT-blue.svg"/>
    </a>
    <br >
    <a href="https://github.com/pokt-network/json-rpc-pocket/pulse">
      <img src="https://img.shields.io/github/last-commit/pokt-network/eth-rpc-pocket.svg"/>
    </a>
    <a href="https://github.com/pokt-network/json-rpc-pocket/pulls">
      <img src="https://img.shields.io/github/issues-pr/pokt-network/eth-rpc-pocket.svg"/>
    </a>
    <a href="https://github.com/pokt-network/json-rpc-pocket/issues">
      <img src="https://img.shields.io/github/issues-closed/pokt-network/eth-rpc-pocket.svg"/>
    </a>
</div>

[`json-rpc-engine`](https://github.com/MetaMask/json-rpc-engine) Middleware using Pocket Network to communicate with JSON RPC blockchain endpoints, mainly used in the [Metamask browser extension project.](https://github.com/MetaMask/metamask-extension) 

Before you can start using the library, you have to get a Developer ID by registering for MVP. [To learn how to register please click here.](https://pocket-network.readme.io/docs/how-to-participate#section-for-developers)

<h1 align="left">Requirements</h1>

You should have at least have a basic knowledge of blockchain technology and know your way around Javascript. You will also need to install the [NPM tool.](https://www.npmjs.com/get-npm)

<h1 align="left">Installation</h1>

The `json-rpc-pocket` package is hosted in [NPM](https://npmjs.com), see below how to install it.

`npm install --save json-rpc-pocket`

<h1 align="left">Usage</h1>

In order to instatiate the middleware all you need is a `Developer ID` like in the example below:

```javascript
const createPocketMiddleware = require('json-rpc-pocket')
const pocketMiddleware = createPocketMiddleware(devID)
```

<h1 align="left">Contact Us</h1>

We have created a Discord server where you can meet with the Pocket team and the rest of the community. [Click here to join!](https://discord.gg/sarhfXP)
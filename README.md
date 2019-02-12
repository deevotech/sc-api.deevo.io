# supply-chain-service
Food supply chain RESTful API Service (NodeJS) is designed and implemented with Domain-Driven Design (DDD).
Designed to connect to Hyperledger's first network (docker-compose-e2e-cli.yaml).

# Remember on Channel.js file, change:
let use_admin_signer = true;
if (request.txId) {
  use_admin_signer = request.txId.isAdmin();
}

# Using package.json 
{
  "name": "supply-chain-service",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "start": "node ./bin/www"
  },
  "dependencies": {
    "body-parser": "^1.18.3",
    "cookie-parser": "~1.3.5",
    "debug": "^4.1.0",
    "express": "^4.16.3",
    "fabric-ca-client": "1.3.0",
    "fabric-client": "1.3.0",
    "grpc": "^1.15.1",
    "jade": "~1.11.0",
    "mongoose": "^4.4.10",
    "mongoose-currency": "^0.2.0",
    "morgan": "^1.9.1",
    "serve-favicon": "^2.5.0",
    "swagger-jsdoc": "3.2.3",
    "swagger-ui-express": "4.0.1"
  }
}

# To start app:
1. clone this repo from github
2. cd to supply-chain-service
3. run: npm install
4. run: utils/get-remote-config.sh with appropriate parameters
5. run: node utils/enrollAdmin.js
6. run: npm start

  If it shows up: [API Server is running at http://localhost:3001/] means that api server is started up successfuly.

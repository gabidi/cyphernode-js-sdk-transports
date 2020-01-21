# --- WIP ----
# Cyphernode JS SDK transports
The purpose of this stack is to enable different means of communication via modular transports.
Transports are an abstraction layer that present a unified interface for Cyphernode's JS sdk to able to able to communicate with cyphernode over differnet 'wires'.

## Currently Included Stacks: 
### Matrix.org
This SDK includes helpers and tools that bridge and integrate the Bitcoin network into [Matrix.org](https://matrix.org) distribu  ted communication architecture.
I have this inhert belief that mixing an encrypted,federated and distirbuted communication protocol with Bitcoin's disitrbuted exchaJnge of value network is a reciepe for magic to happen.

### Integration Tests
Integration tests currently cover
1. Matrix transport and Bridge: Ability to use Matrix.io to communicate with your Cyphernode in a disritbuted and e2e encrypted fashi
on.

#### Integration Test requirements and steps:

1. Must have a valid matrix synapse server url
2. Must have two pairs of matrix user logins (One to be used to test the server and the other the client)
Best way is to amend the previously mentioned .env file with the following variables:

```bash
SIFIR_MATRIX_USER=
SIFIR_MATRIX_PASS=
SIFIR_MATRIX_SERVER=
SIFIR_PHONE_MATRIX_USER=
SIFIR_PHONE_MATRIX_PASS=
```
#### Running Integration test steps:

1- Build the docker container, run the following command in the root directory of the repo:
```bash
docker build --tag cyphernode-js-sdk:intergrationTests
```
2-  Run the integration tests in the container just built : 
```bash
docker run -it \
        --network=cyphernodenet \
        --env-file .env \
	-e CYPHERNODE_GATEKEEPER_CERT_CA=$(cat test.pem)
	# -e NODE_TLS_REJECT_UNAUTHORIZED=0 \
        -e CYPHERNODE_GATEWAY_URL="https://dist_gatekeeper_1:443/v0/" \
        cyphernode-js-sdk:intergrationTests node /app/node_modules/ava/cli.js integrationTests/*.spec.js
```
A helper script that runs the exact same commands as above is located in:
```bash
./scripts/docker-integrationTests.sh
```
### TODO
- ~ E2E Encryption  Done(ish)!
- ~ Tor transport~ Done !


# OAT

This tool will allow you to test OpenAlias records.

## Verifications

- Verify DNSSec is enabled and valid for a given the domain
- Compute and validate the checksum
- For ETH based coins it will use ec_Recover to verify the address signature is intact
- Payload signature from OAT api is intact


## How it works

It relies on a node backend that serves a public API to allow you to perform DNSSec lookups from clients that might not have access to DNSSec in their environment.

A request is sent to the API which performs a lookup using Google DNS over HTTP. The response is signed so that clients can verify authenticity of the lookup. The response is basically what is returned when doing any lookup using Google DNS over HTTP.

The API documentation is a work in progress. The plan is to move the API from to it's own repo and provide a npm package to make it easy to use in JS apps.

## Running your own

Currently you'll need to generate your own private key if you want to run an API server. The server needs to use Google DNS for it's lookups. Don't run the server in it's current state without replacing the private key in oat_server.js. This will be easier to setup when I have a bit more time.


## References Used

https://openalias.org/#extend
https://kjur.github.io/jsrsasign/
https://kjur.github.io/jsrsasign/sample/sample-rsasign.html
https://github.com/kjur/jsrsasign/wiki/Tutorial-for-Signature-class
https://kjur.github.io/jsrsasign/api/symbols/KJUR.crypto.Signature.html
https://developers.google.com/speed/public-dns/docs/dns-over-https
https://wiki.parity.io/JSONRPC-personal-module#personal_sign
https://wiki.parity.io/JSONRPC-personal-module#personal_ecrecover
http://restify.com/docs/home


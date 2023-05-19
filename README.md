# crd-tweet
A peer to peer eventually consistent twitter prototype. `crd-tweet` is built with SQLite, React, and WebRTC. It uses a WebAssembly port of SQLite to run the database directly in the web client's browser UI thread. Data is modeled using CRDTs and is replicated asynchronously over WebRTC.

Live demo [here](https://discrete.events/crd-tweet).

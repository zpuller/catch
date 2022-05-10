'use strict';

var path = require('path');

const express = require('express');
const { Server } = require('ws');

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';

const dist = path.join(__dirname, 'frontend/dist');
console.log(dist)
const server = express()
    .use(express.static(dist))
    .listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new Server({ server });

const state = { players: [] }
let id = 0
const playersPriv = []
const wsToId = {}

const registerNewPlayer = (ws, data) => {
    ws.send(JSON.stringify({ "op": "set_id", "id": id }))
    state.players.push({
        username: data.username
    })
    playersPriv.push({ "conn": ws })
    wsToId[ws] = id
    id++
    playersPriv.forEach(p => p.conn.send(JSON.stringify(state)))
}

const disconnectPlayer = (ws) => {
    console.log('Client disconnected')
    state.players.splice(wsToId[ws], 1)
    playersPriv.splice(wsToId[ws], 1)

    playersPriv.forEach(p => p.conn.send(JSON.stringify(state)))
}

wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.on('close', () => {
        disconnectPlayer(ws)
    });
    ws.onmessage = (e) => {
        const data = JSON.parse(e.data)
        switch (data.op) {
            case "set_username":
                registerNewPlayer(ws, data)
                break
        }
    }
});

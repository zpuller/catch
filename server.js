'use strict';

var path = require('path');

const express = require('express');
const { Server } = require('ws');

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';

const dist = path.join(__dirname, 'frontend/dist');
const server = express()
    .use(express.static(dist))
    .listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new Server({ server });

const state = { players: [] }
let id = 0
const playersPriv = []

const broadcastState = () => {
    playersPriv.forEach(p => p.conn.send(JSON.stringify({ op: 'update_state', state })))
}

const registerNewPlayer = (ws, username) => {
    ws.send(JSON.stringify({ 'op': 'set_id', 'id': ws.id }))
    playersPriv.forEach(p => p?.conn.send(JSON.stringify({ op: 'player_joined', id: ws.id, username })))
    state.players.push({
        username,
        position: {
            player: { x: 0, z: 0 },
            leftCon: { x: 0, y: 0, z: 0 },
            rightCon: { x: 0, y: 0, z: 0 },
        },
        rotation: {
            leftCon: { x: 0, y: 0, z: 0 },
            rightCon: { x: 0, y: 0, z: 0 },
        },
    })
    playersPriv.push({ 'conn': ws })
    broadcastState()
}

const handlePlayerState = (data) => {
    if (state.players[data.id]) {
        state.players[data.id].position = data.position
        state.players[data.id].rotation = data.rotation
    }
}

const disconnectPlayer = (id) => {
    delete state.players[id]
    delete playersPriv[id]

    playersPriv.forEach(p => p?.conn.send(JSON.stringify({ op: 'player_disconnected', id })))
}

wss.on('connection', (ws) => {
    ws.id = id
    id++
    console.log('Client connected');
    ws.on('close', () => {
        console.log('client', ws.id, 'disconnected')
        disconnectPlayer(ws.id)
    });
    ws.onmessage = (e) => {
        const data = JSON.parse(e.data)
        switch (data.op) {
            case 'set_username':
                registerNewPlayer(ws, data.username)
                break

            case 'player_position':
                handlePlayerState(data)
                break
        }
    }
});

setInterval(broadcastState, 1000)

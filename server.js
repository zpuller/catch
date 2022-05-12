'use strict'

var path = require('path')

const express = require('express')
const { Server } = require('ws')

const PORT = process.env.PORT || 3000

const dist = path.join(__dirname, 'frontend/dist')
const server = express()
    .use(express.static(dist))
    .listen(PORT, () => console.log(`Listening on ${PORT}`))

const wss = new Server({ server })
let id = 0

const state = { players: [] }
const playersPriv = []

const defaultPlayer = () => {
    return {
        player: {
            position: { x: 0, z: 0 },
        },
        leftCon: {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 }
        },
        rightCon: {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 }
        },
    }
}

const broadcastState = () => {
    playersPriv.forEach(p => p.conn.send(JSON.stringify({ op: 'update_state', state })))
}

const broadcastBallState = (state) => {
    playersPriv.forEach(p => p.conn.send(JSON.stringify({ op: 'update_ball_state', state })))
}

const registerNewPlayer = (ws) => {
    ws.send(JSON.stringify({ 'op': 'set_id', 'id': ws.id }))
    playersPriv.filter(p => p).forEach(p => p.conn.send(JSON.stringify({ op: 'player_joined', id: ws.id })))
    state.players.push(defaultPlayer())
    playersPriv.push({ 'conn': ws })
    broadcastState()
}

const handlePlayerState = (id, data) => {
    state.players[id] = data.state
}

const handleBallState = (data) => {
    broadcastBallState(data.state)
}

const disconnectPlayer = (id) => {
    delete state.players[id]
    delete playersPriv[id]

    playersPriv.filter(p => p).forEach(p => p.conn.send(JSON.stringify({ op: 'player_disconnected', id })))
}

wss.on('connection', (ws) => {
    console.log('Client connected')

    ws.id = id
    id++

    ws.on('close', () => {
        console.log('client', ws.id, 'disconnected')
        disconnectPlayer(ws.id)
    })
    ws.onmessage = (e) => {
        const data = JSON.parse(e.data)
        switch (data.op) {
            case 'player_state':
                handlePlayerState(ws.id, data)
                break

            case 'ball_state':
                handleBallState(data)
                break
        }
    }

    registerNewPlayer(ws)
})

setInterval(broadcastState, 33)

'use strict'

var path = require('path')

const express = require('express')
const { Server } = require('ws')

const mode = process.env.MODE || 'prod'
console.log(`running in ${mode} mode`)

const PORT = process.env.PORT || 3000

const dist = path.join(__dirname, 'frontend/dist')

let server

if (mode === 'prod') {
    server = express()
        .use(express.static(dist))
        .listen(PORT, () => console.log(`Listening on ${PORT}`))
} else {
    const livereload = require('livereload')
    const liveReloadServer = livereload.createServer()
    liveReloadServer.watch(dist)

    const connectLivereload = require('connect-livereload')

    server = express()
        .use(connectLivereload())
        .use(express.static(dist))
        .listen(PORT, () => console.log(`Listening on ${PORT}`))

    liveReloadServer.server.once('connection', () => {
        setTimeout(() => {
            liveReloadServer.refresh('/')
        }, 500)
    })
}

const wss = new Server({ server })
let id = 0

const state = { players: {} }
const playersPriv = {}

const defaultEntity = () => { return { position: [], quaternion: [], } }
const defaultPlayer = () => {
    return {
        player: defaultEntity(),
        leftCon: defaultEntity(),
        rightCon: defaultEntity(),
    }
}

const broadcastState = () => {
    Object.values(playersPriv).forEach(p => p.conn.send(JSON.stringify({ op: 'update_state', state })))
}

const broadcastBallState = (state) => {
    Object.values(playersPriv).forEach(p => p.conn.send(JSON.stringify({ op: 'update_ball_state', state })))
}

const registerNewPlayer = (ws) => {
    ws.send(JSON.stringify({ 'op': 'set_id', 'id': ws.id }))
    Object.values(playersPriv).forEach(p => p.conn.send(JSON.stringify({ op: 'player_joined', id: ws.id })))
    state.players[ws.id] = defaultPlayer()
    playersPriv[ws.id] = { 'conn': ws }
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

    Object.values(playersPriv).forEach(p => p.conn.send(JSON.stringify({ op: 'player_disconnected', id })))
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

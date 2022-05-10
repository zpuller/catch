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

wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.on('close', () => console.log('Client disconnected'));
    ws.onmessage = (e) => {
        // console.log(e.data)
        // console.log(JSON.stringify(e.data).length)
        let aClients = [...wss.clients]
        aClients.filter(c => c != ws).forEach(c => {
            c.send(e.data)
        })
    }
});

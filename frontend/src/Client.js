export default class Client {
    constructor(username) {
        this.username = username
        this.stateHandler = null
        // var HOST = location.origin.replace(/^http/, 'ws')
        var HOST = location.origin.replace(/^http/, 'ws').replace(/8080/, '3000')
        this.ws = new WebSocket(HOST);
        var el;

        this.ws.onmessage = this.handleMessage.bind(this)

        this.ws.onopen = function (event) {
            this.ws.send(JSON.stringify({ op: 'set_username', username: username }))
        }.bind(this)
    }

    handleMessage(event) {
        const data = JSON.parse(event.data)
        // console.log(data)
        switch (data.op) {
            case 'set_id':
                this.handleSetId(data.id)
                break

            case 'player_joined':
                this.handlePlayerJoined({ id: data.id, username: data.username })
                break

            case 'player_disconnected':
                this.handlePlayerDisconnected(data.id)
                break

            case 'update_state':
                this.handleUpdateState(data.state)
        }
    }

    handleUpdateState(state) {
        console.log('client handle state', state)
        if (this.stateHandler) {
            this.stateHandler.handleUpdateState(state)
        }
    }

    handleSetId(id) {
        this.id = id
    }

    handlePlayerJoined(player) {
        console.log('client player joined', player)
        if (this.stateHandler) {
            this.stateHandler.handlePlayerJoined(player)
        }
    }

    handlePlayerDisconnected(id) {
        console.log('client player diconnected', id)
        if (this.stateHandler) {
            this.stateHandler.handlePlayerDisconnected(id)
        }
    }

    emitPlayerState(position, rotation) {
        this.ws.send(JSON.stringify({ op: 'player_position', id: this.id, position, rotation }))
    }
}
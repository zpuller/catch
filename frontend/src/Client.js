export default class Client {
    constructor() {
        // var HOST = location.origin.replace(/^http/, 'ws')
        var HOST = location.origin.replace(/^http/, 'ws').replace(/8080/, '3000')
        this.ws = new WebSocket(HOST);

        this.ws.onmessage = this.handleMessage.bind(this)

        this.eventListeners = []
    }

    subscribeToEvents(listener) {
        this.eventListeners.push(listener)
    }

    handleMessage(event) {
        const data = JSON.parse(event.data)
        // console.log(data)
        switch (data.op) {
            case 'set_id':
                this.handleSetId(data.id)
                break

            case 'player_joined':
                this.handlePlayerJoined(data.id)
                break

            case 'player_disconnected':
                this.handlePlayerDisconnected(data.id)
                break

            case 'update_state':
                this.handleUpdateState(data.state)
                break

            case 'update_ball_state':
                this.handleUpdateBallState(data.state)
                break
        }
    }

    handleUpdateState(state) {
        // console.log('client handle state', state)
        this.eventListeners.forEach(l => l.handleUpdateState(state))
    }

    handleUpdateBallState(state) {
        this.eventListeners.forEach(l => l.handleUpdateBallState(state))
    }

    handleSetId(id) {
        this.id = id
    }

    handlePlayerJoined(id) {
        console.log('client player joined', id)
        this.eventListeners.forEach(l => l.handlePlayerJoined(id))
    }

    handlePlayerDisconnected(id) {
        console.log('client player diconnected', id)
        this.eventListeners.forEach(l => l.handlePlayerDisconnected(id))
    }

    emitPlayerState(state) {
        // TODO don't need to send id
        this.ws.send(JSON.stringify({ op: 'player_state', id: this.id, state }))
    }

    emitBallState(state) {
        this.ws.send(JSON.stringify({ op: 'ball_state', state }))
    }
}
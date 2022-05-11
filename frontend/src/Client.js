export default class Client {
    constructor(username) {
        this.username = username
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

            case 'update_state':
                this.handleUpdateState(data.state)
        }
    }

    handleUpdateState(state) {
        console.log('handle state', state)
    }

    handleSetId(id) {
        this.id = id
    }

    emitPlayerState(position, rotation) {
        this.ws.send(JSON.stringify({ op: 'player_position', id: this.id, position, rotation }))
    }
}
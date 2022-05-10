export default class Client {
    constructor(username) {
        this.username = username
        var HOST = location.origin.replace(/^http/, 'ws')
        // var HOST = location.origin.replace(/^http/, 'ws').replace(/8080/, '3000')
        var ws = new WebSocket(HOST);
        var el;

        ws.onmessage = this.handle_message.bind(this)

        ws.onopen = function (event) {
            ws.send(JSON.stringify({ op: 'set_username', username: username }))
        }

        // setInterval(() => { ws.send(username) }, 1000)
    }

    handle_message(event) {
        const data = JSON.parse(event.data)
        console.log(data)
        switch (data.op) {
            case "set_id":
                this.handle_set_id(data.id)
                break

        }
    }

    handle_set_id(id) {
        this.id = id
    }
}
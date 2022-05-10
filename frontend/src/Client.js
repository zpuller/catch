export default class Client {
    constructor(username) {
        this.username = username
        var HOST = location.origin.replace(/^http/, 'ws')
        // var HOST = location.origin.replace(/^http/, 'ws').replace(/8080/, '3000')
        var ws = new WebSocket(HOST);
        var el;

        ws.onmessage = function (event) {
            console.log(event.data)
            // console.log(JSON.stringify(event.data).length)
            // ws.send('test')
        };

        ws.onopen = function (event) {
            ws.send(JSON.stringify({ op: 'set_username', username: username }))
        }

        // setInterval(() => { ws.send(username) }, 1000)
    }
}
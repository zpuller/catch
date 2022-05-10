export default class Client {
    constructor(username) {
        this.username = username
        var HOST = location.origin.replace(/^http/, 'ws')
        var ws = new WebSocket(HOST);
        var el;

        ws.onmessage = function (event) {
            console.log(event.data)
            // console.log(JSON.stringify(event.data).length)
            // ws.send('test')
        };

        setInterval(() => { ws.send(username) }, 1000)
    }
}
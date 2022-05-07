const init = () => {
    var HOST = 'ws://localhost:3000'
    var ws = new WebSocket(HOST);
    var el;

    ws.onmessage = function (event) {
        // console.log(event)
    };
}

export default { init }
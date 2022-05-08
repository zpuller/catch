const init = () => {
    var HOST = location.origin.replace(/^http/, 'ws')
    var ws = new WebSocket(HOST);
    var el;

    ws.onmessage = function (event) {
        console.log(event)
    };
}

export default { init }
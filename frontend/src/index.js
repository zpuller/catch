import _ from 'lodash';

function component() {
    const element = document.createElement('div');

    // Lodash, now imported by this script
    element.innerHTML = _.join(['Hello', 'webpack'], ' ');

    return element;
}

document.body.appendChild(component());

var HOST = 'ws://localhost:3000'
console.log(HOST)
var ws = new WebSocket(HOST);
var el;

ws.onmessage = function (event) {
    console.log(event)
};
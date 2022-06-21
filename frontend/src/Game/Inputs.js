const makeListeners = () => {
    return {
        joystick: [],
        trigger: [],
        squeeze: [],
        aTouched: [],
        aDown: [],
        aPressed: [],
        bTouched: [],
        bDown: [],
        bPressed: [],
        selectStart: [],
        selectEnd: [],
        squeezeStart: [],
        squeezeEnd: [],
    }
}


export default class Inputs {
    constructor() {
        this.listeners = {
            left: makeListeners(),
            right: makeListeners(),
        }

        const handlers = h => {
            const ls = this.listeners[h]
            return {
                onSelectStart: function () { ls.selectStart.forEach(l => l()) },
                onSelectEnd: function () { ls.selectEnd.forEach(l => l()) },
                onSqueezeStart: function () { ls.squeezeStart.forEach(l => l()) },
                onSqueezeEnd: function () { ls.squeezeEnd.forEach(l => l()) },
            }
        }
        this.leftConEventHandlers = handlers('left')
        this.rightConEventHandlers = handlers('right')

        const toggle = pressed => e => {
            if (e.key === 'a') {
                this.aPressed = pressed
            }
            if (e.key === 'b') {
                this.bPressed = pressed
            }
            if (e.key === 's') {
                this.sPressed = pressed
            }
        }
        window.addEventListener('keypress', toggle(true))
        window.addEventListener('keyup', toggle(false))

        this.wasPressed = {
            'left': Array(8).fill(false),
            'right': Array(8).fill(false),
        }
    }

    addListener(h, e, f) {
        this.listeners[h][e].push(f)
    }

    handleInput(source) {
        const h = source.handedness
        const ls = this.listeners[h]
        const a = source.gamepad.axes
        const [x, z] = [a[2], a[3]]
        ls.joystick.forEach(l => l(x, z))

        const b = source.gamepad.buttons
        ls.trigger.forEach(l => l(b[0].value))
        ls.squeeze.forEach(l => l(b[1].value))

        if (b[0].pressed) {
            console.log(h, 'trigger')
        }
        if (b[1].pressed) {
            console.log(h, 'squeeze')
        }
        if (b[3].touched) {
            console.log(h, 'joystick touched')
        }
        if (b[3].pressed || this.sPressed) {
            console.log(h, 'joystick pressed')
            if (!this.wasPressed[h][3]) {
            }
        }
        this.wasPressed[h][3] = b[3].pressed || this.sPressed
        if (b[4].touched) {
            console.log(h, 'a touched')
        }
        if (b[4].pressed || this.aPressed) {
            console.log(h, 'a pressed')
            if (!this.wasPressed[h][4]) {
                ls.aPressed.forEach(l => l())
            }
        }
        this.wasPressed[h][4] = b[4].pressed || this.aPressed
        if (b[5].touched) {
            console.log(h, 'b touched')
        }
        if (b[5].pressed || this.bPressed) {
            console.log(h, 'b pressed')
            if (!this.wasPressed[h][5]) {
                ls.bPressed.forEach(l => l())
            }
        }
        this.wasPressed[h][5] = b[5].pressed || this.bPressed
    }

    handleInputs(inputs) {
        for (const source of inputs) {
            this.handleInput(source)
        }
    }
}
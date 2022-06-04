import * as THREE from 'three'

// TODO lefty support
const leftHandlers = (game) => {
    const data = new THREE.Vector3()
    return {
        onSelectStart: function () { },
        onSelectEnd: function () { },
        onSqueezeStart: function () { game.tryCatch(this, true) },
        onSqueezeEnd: function () { game.tryThrow(this) },
    }
}

const rightHandlers = (game) => {
    const data = new THREE.Vector3()
    return {
        onSelectStart: function () { game.teleport.startPoint(this) },
        onSelectEnd: function () { game.teleport.go(this) },
        onSqueezeStart: function () { game.tryCatch(this, false) },
        onSqueezeEnd: function () { game.tryThrow(this) },
    }
}

export default class Inputs {
    constructor(game) {
        this.game = game
        this.leftConEventHandlers = leftHandlers(this.game)
        this.rightConEventHandlers = rightHandlers(this.game)

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

    handleLeftInput(source) {
        const h = 'left'
        const a = source.gamepad.axes
        const [x, z] = [a[2], a[3]]
        this.game.movePlayer(x, z)
        const b = source.gamepad.buttons
        this.game.clenchLeftHand(b[1].value)

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
            }
        }
        this.wasPressed[h][4] = b[4].pressed || this.aPressed
        if (b[5].touched) {
            console.log(h, 'b touched')
        }
        if (b[5].pressed || this.bPressed) {
            console.log(h, 'b pressed')
        }
        this.wasPressed[h][5] = b[5].pressed || this.bPressed
    }

    handleRightInput(source) {
        const h = 'right'
        const a = source.gamepad.axes
        const [x, z] = [a[2], a[3]]
        this.game.rotatePlayer(x)
        const b = source.gamepad.buttons
        this.game.clenchRightHand(b[1].value)

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
                this.game.resetBallAboveRightCon()
            }
        }
        this.wasPressed[h][4] = b[4].pressed || this.aPressed
        if (b[5].touched) {
            console.log(h, 'b touched')
        }
        if (b[5].pressed || this.bPressed) {
            console.log(h, 'b pressed')
            if (!this.wasPressed[h][5]) {
                this.game.toggleGui()
            }
        }
        this.wasPressed[h][5] = b[5].pressed || this.bPressed
    }

    handleInputs(inputs) {
        if (inputs) {
            for (const source of inputs) {
                if (source.handedness === 'left') {
                    this.handleLeftInput(source)
                } else {
                    this.handleRightInput(source)
                }
            }
        }
    }
}
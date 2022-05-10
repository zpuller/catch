import * as THREE from 'three'

import Objects from './Assets/Objects'

import Physics from './Physics'
import WebXR from './WebXR'

const handlers = (game) => {
    return {
        onSelectStart: function () {
            this.userData.isSelecting = true
            game.physics.resetBall()
        },

        onSelectEnd: function () {
            this.userData.isSelecting = false
        },

        onSqueezeStart: function () {
            this.userData.isSqueezing = true
            game.physics.doCatch(this, this.mesh)
        },

        onSqueezeEnd: function () {
            this.userData.isSqueezing = false
            if (this.userData.isHolding) {
                game.physics.doThrow(this)
            }

            game.mesh.material.color.setHex(0x04f679)
            this.userData.isHolding = false
        },
    }
}

export default class Game {
    constructor(renderer, scene, cameraGroup) {
        this.clock = new THREE.Clock()
        this.elapsedTime = this.clock.getElapsedTime()
        this.timeframes = Array(5).fill(1)

        this.player = cameraGroup
        this.mesh = new Objects(scene)

        let res = WebXR.init(renderer, handlers(this), cameraGroup)
        this.controller1 = res.controller1
        this.controller2 = res.controller2

        this.physics = new Physics(this.timeframes, this.mesh)

        scene.add(WebXR.buildNewPlayer(renderer))
    }

    handleController(controller) {
        controller.userData.prevPositions = controller.userData.prevPositions.slice(1)
        controller.userData.prevPositions.push(controller.position.toArray())
    }

    handleInputs(inputs) {
        if (inputs) {
            for (const source of inputs) {
                // console.log(source.handedness)
                let a = source.gamepad.axes
                let [x, z] = [a[2], a[3]]
                this.player.position.x += .01 * x
                this.player.position.z += .01 * z
                // for (const button of source.gamepad.buttons) {
                //     console.log(button)
                // }
            }
        }

        this.handleController(this.controller1)
        this.handleController(this.controller2)
    }

    update(inputs) {
        const prevTime = this.elapsedTime
        this.elapsedTime = this.clock.getElapsedTime()
        const dt = this.elapsedTime - prevTime
        let ks = [...this.timeframes.keys()].slice(1)
        ks.forEach(i => {
            this.timeframes[i - 1] = this.timeframes[i]
        })
        this.timeframes[this.timeframes.length - 1] = dt

        this.handleInputs(inputs)
        this.physics.update(this.controller1, this.controller2)
    }
}
import * as THREE from 'three'

import Objects from './Assets/Objects'

import Physics from './Physics'
import WebXR from './WebXR'

const clock = new THREE.Clock()
let elapsedTime = clock.getElapsedTime()
let timeframes = Array(5).fill(1)

let player
let controller1, controller2

let mesh

let handlers = {
    onSelectStart: function () {
        this.userData.isSelecting = true
        Physics.resetBall()
    },

    onSelectEnd: function () {
        this.userData.isSelecting = false
    },

    onSqueezeStart: function () {
        this.userData.isSqueezing = true
        Physics.doCatch(this, mesh)
    },

    onSqueezeEnd: function () {
        this.userData.isSqueezing = false
        if (this.userData.isHolding) {
            Physics.doThrow(this)
        }

        mesh.material.color.setHex(0x04f679)
        this.userData.isHolding = false
    },
}

const handleController = (controller) => {
    controller.userData.prevPositions = controller.userData.prevPositions.slice(1)
    controller.userData.prevPositions.push(controller.position.toArray())
}

const handleInputs = (inputs, controller1, controller2) => {
    if (inputs) {
        for (const source of inputs) {
            // console.log(source.handedness)
            let a = source.gamepad.axes
            let [x, z] = [a[2], a[3]]
            player.position.x += .01 * x
            player.position.z += .01 * z
            // for (const button of source.gamepad.buttons) {
            //     console.log(button)
            // }
        }
    }

    handleController(controller1)
    handleController(controller2)
}

const init = (renderer, scene, cameraGroup) => {
    player = cameraGroup
    mesh = Objects.init(scene)

    let res = WebXR.init(renderer, handlers, cameraGroup)
    controller1 = res.controller1
    controller2 = res.controller2

    Physics.init(timeframes, mesh)
}

const update = (inputs) => {
    const prevTime = elapsedTime
    elapsedTime = clock.getElapsedTime()
    const dt = elapsedTime - prevTime
    let ks = [...timeframes.keys()].slice(1)
    ks.forEach((i) => {
        timeframes[i - 1] = timeframes[i]
    })
    timeframes[timeframes.length - 1] = dt

    handleInputs(inputs, controller1, controller2)
    Physics.update(controller1, controller2)
}

export default { init, update }
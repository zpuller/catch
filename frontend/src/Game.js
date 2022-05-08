import * as THREE from 'three'

import Objects from './Assets/Objects'

import Physics from './Physics'
import WebXR from './WebXR'

const clock = new THREE.Clock()
let elapsedTime = clock.getElapsedTime()
let timeframes = Array(5).fill(1)

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

const init = (renderer, scene) => {
    mesh = Objects.init(scene)

    let res = WebXR.init(renderer, scene, handlers)
    controller1 = res.controller1
    controller2 = res.controller2

    Physics.init(timeframes, mesh)
}

const update = (renderer) => {
    const prevTime = elapsedTime
    elapsedTime = clock.getElapsedTime()
    const dt = elapsedTime - prevTime
    let ks = [...timeframes.keys()].slice(1)
    ks.forEach((i) => {
        timeframes[i - 1] = timeframes[i]
    })
    timeframes[timeframes.length - 1] = dt

    WebXR.handleInputs(renderer, controller1, controller2)
    Physics.update(controller1, controller2)
}

export default { init, update }
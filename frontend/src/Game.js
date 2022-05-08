import * as THREE from 'three'

import Physics from './Physics'
import WebXR from './WebXR'

let controller1, controller2

const clock = new THREE.Clock()
let elapsedTime = clock.getElapsedTime()
let timeframes = Array(5).fill(1)

const init = (renderer, scene, mesh) => {
    let res = WebXR.init(renderer, scene, mesh)
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

    Physics.update(controller2)

    WebXR.handleInputs(renderer)
    WebXR.handleController(controller1)
    WebXR.handleController(controller2)
}

export default { init, update }
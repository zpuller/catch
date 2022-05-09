import * as math from 'mathjs'
import * as THREE from 'three'

let velocity = new THREE.Vector3()
const gravity = 0.0004
const leftOffset = new THREE.Vector3(.07, .07, -.07)
const rightOffset = new THREE.Vector3(-.07, .07, -.07)
let timeframes
let mesh

const init = (pTimeframes, pMesh) => {
    timeframes = pTimeframes
    mesh = pMesh

    resetBall()
}

const linearRegressionQuadratic = (positions, frametimes) => {
    const X = frametimes.map((t) => [1, t, t * t]);
    const Xt = math.transpose(X);
    const theta = math.multiply(math.multiply(math.inv(math.multiply(Xt, X)), Xt), positions);
    return theta;
}

const doThrow = (controller) => {
    const frametimes = Array(5).fill(0)
    frametimes[0] = timeframes[0]
    let ks = [...frametimes.keys()]
    ks.slice(1).forEach((i) => {
        frametimes[i] = frametimes[i - 1] + timeframes[i]
    })
    const theta = linearRegressionQuadratic(controller.userData.prevPositions, frametimes)

    velocity.fromArray(theta[1])
    velocity.multiplyScalar(0.01)
}

const doCatch = (controller) => {
    let distance = controller.position.distanceTo(mesh.position)
    if (distance < 0.2) {
        controller.userData.isHolding = true
        mesh.material.color.setHex(0xffffff)
    }
}

let controllerWorldPosition = new THREE.Vector3()
const update = (controller1, controller2) => {
    if (controller1.userData.isHolding) {
        mesh.position.copy(controller1.getWorldPosition(controllerWorldPosition)).add(leftOffset)
        return
    }
    if (controller2.userData.isHolding) {
        mesh.position.copy(controller2.getWorldPosition(controllerWorldPosition)).add(rightOffset)
        return
    }

    velocity.y -= gravity
    mesh.position.add(velocity)
}

const resetBall = () => {
    mesh.position.fromArray([0, 1.6, -0.5])
    velocity.fromArray([0, 0, 0])
}

export default { init, doThrow, doCatch, update, resetBall }
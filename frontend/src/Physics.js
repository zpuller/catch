import * as math from 'mathjs'
import * as THREE from 'three'

export default class Physics {
    constructor(pTimeframes, pMesh) {
        this.controllerWorldPosition = new THREE.Vector3()
        this.velocity = new THREE.Vector3()
        this.gravity = 0.0004
        this.leftOffset = new THREE.Vector3(.07, .07, -.07)
        this.rightOffset = new THREE.Vector3(-.07, .07, -.07)
        this.timeframes = pTimeframes
        this.mesh = pMesh

        this.resetBall()
    }

    linearRegressionQuadratic(positions, frametimes) {
        const X = frametimes.map((t) => [1, t, t * t]);
        const Xt = math.transpose(X);
        const theta = math.multiply(math.multiply(math.inv(math.multiply(Xt, X)), Xt), positions);
        return theta;
    }

    doThrow(controller) {
        const frametimes = Array(5).fill(0)
        frametimes[0] = this.timeframes[0]
        let ks = [...frametimes.keys()]
        ks.slice(1).forEach((i) => {
            frametimes[i] = frametimes[i - 1] + this.timeframes[i]
        })
        const theta = this.linearRegressionQuadratic(controller.userData.prevPositions, frametimes)

        this.velocity.fromArray(theta[1])
        this.velocity.multiplyScalar(0.01)
    }

    doCatch(controller) {
        let distance = controller.position.distanceTo(this.mesh.position)
        if (distance < 0.2) {
            controller.userData.isHolding = true
            this.mesh.material.color.setHex(0xffffff)
        }
    }

    update(controller1, controller2) {
        if (controller1.userData.isHolding) {
            this.mesh.position.copy(controller1.getWorldPosition(this.controllerWorldPosition)).add(this.leftOffset)
            return
        }
        if (controller2.userData.isHolding) {
            this.mesh.position.copy(controller2.getWorldPosition(this.controllerWorldPosition)).add(this.rightOffset)
            return
        }

        this.velocity.y -= this.gravity
        this.velocity.y = Math.max(this.velocity.y, -1)
        this.mesh.position.add(this.velocity)
        this.mesh.position.y = Math.max(this.mesh.position.y, this.mesh.geometry.parameters.radius)
    }

    resetBall() {
        this.mesh.position.set(0, 1.6, -0.5)
        this.velocity.set(0, 0, 0)
    }
}

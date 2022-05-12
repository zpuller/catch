import * as math from 'mathjs'
import * as THREE from 'three'

export default class Physics {
    constructor(pTimeframes, pBall) {
        this.controllerWorldPosition = new THREE.Vector3()
        this.gravity = 0.0004
        // this.leftOffset = new THREE.Vector3(.07, .07, -.07)
        // this.rightOffset = new THREE.Vector3(-.07, .07, -.07)
        this.timeframes = pTimeframes
        this.ball = pBall
        this.ball.velocity = new THREE.Vector3()
        console.log(this.ball)

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

        this.ball.velocity.fromArray(theta[1])
        this.ball.velocity.multiplyScalar(0.01)
    }

    doCatch(controller) {
        let distance = controller.position.distanceTo(this.ball.mesh.position)
        if (distance < 0.2) {
            // TODO might not need this after we have full ball state
            // controller.userData.isHolding = true
            this.ball.mesh.material.color.setHex(0xffffff)
        }
    }

    update(controller1, controller2, players) {
        // if (controller1.userData.isHolding) {
        //     this.ball.mesh.position.copy(controller1.getWorldPosition(this.controllerWorldPosition)).add(this.leftOffset)
        //     return
        // }
        // if (controller2.userData.isHolding) {
        //     this.ball.mesh.position.copy(controller2.getWorldPosition(this.controllerWorldPosition)).add(this.rightOffset)
        //     return
        // }

        switch (this.ball.state) {
            case 'free':
                this.ball.velocity.y -= this.gravity
                this.ball.velocity.y = Math.max(this.ball.velocity.y, -1)
                this.ball.mesh.position.add(this.ball.velocity)
                this.ball.mesh.position.y = Math.max(this.ball.mesh.position.y, this.ball.mesh.geometry.parameters.radius)
                break

            case 'held':
                const player = players[this.ball.holding]
                const p = this.ball.mesh.position
                p.copy(player.player.position)
                p.y = 0

                const con = this.ball.hand == 'left' ? player.leftCon : player.rightCon
                p.add(con.position)
        }
    }

    resetBall() {
        this.ball.mesh.position.set(0, 1.6, -0.5)
        this.ball.velocity.set(0, 0, 0)
    }
}

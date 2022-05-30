import * as math from 'mathjs'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { Matrix4 } from 'three'

export default class Physics {
    constructor(pBall, pWall, pLeftHand, pRightHand) {
        this.vec3Buffer = new THREE.Vector3()
        this.quaternionBuffer = new THREE.Quaternion()
        this.scaleOne = new THREE.Vector3(1, 1, 1)
        this.clock = new THREE.Clock()
        this.elapsedTime = this.clock.getElapsedTime()
        this.timeframes = Array(10).fill(1)
        this.ball = pBall
        this.wall = pWall
        this.leftHand = pLeftHand
        this.rightHand = pRightHand

        this.world = new CANNON.World({
            gravity: new CANNON.Vec3(0, -9.8, 0)
        })
        this.world.allowSleep = true

        const r = .04
        this.ball.body = new CANNON.Body({
            mass: 5,
            shape: new CANNON.Sphere(r),
            collisionFilterGroup: 2,
        })
        this.ball.body.linearDamping = .5
        this.ball.body.angularDamping = .5
        this.world.addBody(this.ball.body)

        this.leftHand.body = new CANNON.Body({
            mass: 5,
            shape: new CANNON.Sphere(r),
            collisionFilterGroup: 1,
            collisionFilterMask: 1,
        })
        this.world.addBody(this.leftHand.body)

        this.rightHand.body = new CANNON.Body({
            mass: 5,
            shape: new CANNON.Sphere(r),
            collisionFilterGroup: 1,
            collisionFilterMask: 1,
        })
        this.world.addBody(this.rightHand.body)
    }

    linearRegressionQuadratic(positions, frametimes) {
        const X = frametimes.map((t) => [1, t]);
        const Xt = math.transpose(X);
        const theta = math.multiply(math.multiply(math.inv(math.multiply(Xt, X)), Xt), positions);
        return theta;
    }

    doThrow(controller) {
        this.ball.body.wakeUp()

        const frametimes = Array(10).fill(0)
        frametimes[0] = this.timeframes[0]
        let ks = [...frametimes.keys()]
        ks.slice(1).forEach((i) => {
            frametimes[i] = frametimes[i - 1] + this.timeframes[i]
        })
        const theta = this.linearRegressionQuadratic(controller.userData.prevPositions, frametimes)
        const v = theta[1]
        const scalar = 2
        this.ball.body.velocity.set(scalar * v[0], scalar * v[1], scalar * v[2])

        return this.ball.body.velocity
    }

    doCatch(controller) {
        const distance = controller.getWorldPosition(this.vec3Buffer).distanceTo(this.ball.mesh.position)
        return distance < 0.2
    }

    sleepBall() {
        this.ball.body.sleep()
    }

    updateBallState(v, p) {
        const b = this.ball.body
        b.wakeUp()
        if (v) {
            b.velocity.set(v.x, v.y, v.z)
        }

        if (p) {
            b.position.set(p.x, p.y, p.z)
        }
    }

    resetBall(x, y, z) {
        const b = this.ball.body
        b.wakeUp()
        b.position.set(x, y, z)
        b.velocity.set(0, 0, 0)
        b.quaternion.setFromEuler(0, 0, 0)

        const v = b.velocity
        const p = b.position
        return { v, p }
    }

    saveDt() {
        const prevTime = this.elapsedTime
        this.elapsedTime = this.clock.getElapsedTime()
        const dt = this.elapsedTime - prevTime
        let ks = [...this.timeframes.keys()].slice(1)
        ks.forEach(i => {
            this.timeframes[i - 1] = this.timeframes[i]
        })
        this.timeframes[this.timeframes.length - 1] = dt
    }

    update(players, leftCon, rightCon) {
        this.saveDt()

        {
            const p = leftCon.getWorldPosition(this.vec3Buffer)
            const b = this.leftHand.body
            b.position.set(p.x, p.y, p.z)
            b.velocity.set(0, 0, 0)
        }

        {
            const p = rightCon.getWorldPosition(this.vec3Buffer)
            const b = this.rightHand.body
            b.position.set(p.x, p.y, p.z)
            b.velocity.set(0, 0, 0)
        }

        this.world.fixedStep()

        this.scaleOne.set(1, 1, 1)
        if (this.ball.state === 'held') {
            const p = this.vec3Buffer
            const q = this.quaternionBuffer
            const player = players[this.ball.holding]
            const pp = player.player.position
            p.fromArray(pp)
            const pTransform = new Matrix4().compose(p, q.fromArray(player.player.quaternion), this.scaleOne)

            const con = this.ball.hand == 'left' ? player.leftCon : player.rightCon
            const cp = con.position
            p.fromArray(cp)
            const cTransform = new Matrix4().compose(p, q.fromArray(con.quaternion), this.scaleOne)

            const transform = pTransform.multiply(cTransform)
            transform.decompose(p, q, this.scaleOne)

            this.ball.body.position.copy(p)
            this.ball.body.quaternion.copy(q)
        }
    }
}

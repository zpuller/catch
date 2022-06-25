import * as math from 'mathjs'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { ShapeType, threeToCannon } from 'three-to-cannon'
import { Matrix4 } from 'three'

export default class Physics {
    constructor(pLeftHand, pRightHand) {
        this.vec3Buffer = new THREE.Vector3()
        this.quaternionBuffer = new THREE.Quaternion()
        this.scaleOne = new THREE.Vector3(1, 1, 1)
        this.clock = new THREE.Clock()
        this.elapsedTime = this.clock.getElapsedTime()
        this.timeframes = Array(10).fill(1)
        this.leftHand = pLeftHand
        this.rightHand = pRightHand

        this.world = new CANNON.World({
            gravity: new CANNON.Vec3(0, -9.8, 0)
        })
        this.world.allowSleep = true

        this.addHand(this.leftHand)
        this.addHand(this.rightHand)

        this.groundMaterial = new CANNON.Material('ground')
        this.defaultMaterial = new CANNON.Material('default')
    }

    enableSlippery() {
        this.world.addContactMaterial(new CANNON.ContactMaterial(this.groundMaterial, this.defaultMaterial, {
            friction: 0.002,
            restitution: 0.1,
            contactEquationStiffness: 1e8,
            contactEquationRelaxation: 3,
        }))
    }

    createBoxBody(mesh, material, mass, handler, type) {
        mass = mass || type === CANNON.Body.DYNAMIC ? 0.5 : 0
        material = material || this.defaultMaterial
        const body = new CANNON.Body({ type, mass, material, sleepSpeedLimit: 1.0, sleepTimeLimit: 1.0 })
        const p = mesh.getWorldPosition(new THREE.Vector3())
        body.position.copy(p)
        body.quaternion.copy(mesh.quaternion)

        const { shape } = threeToCannon(mesh, { type: ShapeType.BOX })
        body.addShape(shape)
        if (handler) {
            console.log('handler', handler)
            body.addEventListener('collide', handler)
        }
        this.world.addBody(body)

        return body
    }

    createStaticBox(mesh, material, mass, handler) {
        return this.createBoxBody(mesh, material, mass, handler, CANNON.Body.STATIC)
    }

    createDynamicBox(mesh, material, mass, handler) {
        return this.createBoxBody(mesh, material, mass, handler, CANNON.Body.DYNAMIC)
    }

    createBall(radius, mass, material, sleepSpeedLimit = 1.0, sleepTimeLimit = 1.0) {
        material = material || this.defaultMaterial
        const body = new CANNON.Body({
            type: CANNON.Body.DYNAMIC,
            mass,
            material,
            shape: new CANNON.Sphere(radius),
            collisionFilterGroup: 2,
            sleepSpeedLimit,
            sleepTimeLimit,
        })

        this.world.addBody(body)
        return body
    }

    addHand(hand) {
        const r = 0.04
        hand.body = new CANNON.Body({
            mass: 5,
            shape: new CANNON.Sphere(r),
            collisionFilterGroup: 1,
            collisionFilterMask: 1,
        })
        this.world.addBody(hand.body)
    }

    linearRegressionQuadratic(positions, frametimes) {
        const X = frametimes.map((t) => [1, t]);
        const Xt = math.transpose(X);
        const theta = math.multiply(math.multiply(math.inv(math.multiply(Xt, X)), Xt), positions);
        return theta;
    }

    doThrow(controller, ball) {
        ball.body.wakeUp()
        ball.localHeld = false

        const frametimes = Array(10).fill(0)
        frametimes[0] = this.timeframes[0]
        let ks = [...frametimes.keys()]
        ks.slice(1).forEach((i) => {
            frametimes[i] = frametimes[i - 1] + this.timeframes[i]
        })
        const theta = this.linearRegressionQuadratic(controller.userData.prevPositions, frametimes)
        const v = theta[1]
        const scalar = 10 / ball.body.mass
        ball.body.velocity.set(scalar * v[0], scalar * v[1], scalar * v[2])

        return ball.body.velocity
    }

    doCatch(controller, ball) {
        const distance = controller.getWorldPosition(this.vec3Buffer).distanceTo(ball.mesh.position)
        ball.localHeld = distance < 0.2
        return ball.localHeld
    }

    sleepBall(ball) {
        ball.body.sleep()
    }

    updateBallState(ball, v, p) {
        const b = ball.body
        b.wakeUp()
        if (v) {
            b.velocity.set(v.x, v.y, v.z)
        }

        if (p) {
            b.position.set(p.x, p.y, p.z)
        }
    }

    resetBall(ball, x, y, z) {
        const b = ball.body
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
        this.dt = dt
        let ks = [...this.timeframes.keys()].slice(1)
        ks.forEach(i => {
            this.timeframes[i - 1] = this.timeframes[i]
        })
        this.timeframes[this.timeframes.length - 1] = dt
    }

    update(players, leftCon, rightCon, ball) {
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
        if (ball.localHeld) {
            const p = this.vec3Buffer
            ball.mesh.getWorldPosition(p)
            const q = ball.mesh.quaternion

            ball.body.position.copy(p)
            ball.body.quaternion.copy(q)
        } else if (ball.state === 'held') {
            const p = this.vec3Buffer
            const q = this.quaternionBuffer
            const player = players[ball.holding]
            const pp = player.player.position
            p.fromArray(pp)
            const pTransform = new Matrix4().compose(p, q.fromArray(player.player.quaternion), this.scaleOne)

            const con = ball.hand == 'left' ? player.leftCon : player.rightCon
            const cp = con.position
            p.fromArray(cp)
            const cTransform = new Matrix4().compose(p, q.fromArray(con.quaternion), this.scaleOne)

            const transform = pTransform.multiply(cTransform)
            transform.decompose(p, q, this.scaleOne)

            ball.body.position.copy(p)
            ball.body.quaternion.copy(q)
        }
    }
}

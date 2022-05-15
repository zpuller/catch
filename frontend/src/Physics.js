import * as math from 'mathjs'
import * as THREE from 'three'
import * as OIMO from 'oimo'

export default class Physics {
    constructor(pTimeframes, pBall) {
        this.controllerWorldPosition = new THREE.Vector3()
        this.gravity = 0.05
        this.timeframes = pTimeframes
        this.ball = pBall
        const friction = 0.99
        this.airFriction = new OIMO.Vec3(friction, 1, friction)

        this.world = new OIMO.World({
            timestep: 1 / 60,
            iterations: 8,
            broadphase: 2, // 1 brute force, 2 sweep and prune, 3 volume tree
            worldscale: 1,
            random: true,
            info: false, // calculate statistic or not
            gravity: [0, -5, 0]
        })

        const r = 1.05
        this.ball.body = this.world.add({
            type: 'sphere',
            size: [r],
            pos: [0, 1.6, -0.5],
            rot: [0, 0, 90],
            move: true,
            density: 1,
            friction: 0.4,
            restitution: 0.2,
            belongsTo: 1, // The bits of the collision groups to which the shape belongs.
            collidesWith: 0xffffffff, // The bits of the collision groups with which the shape collides.
        });

        this.floor = this.world.add({
            type: 'plane',
            size: [32, 2, 32],
            pos: [0, -1, 0],
            density: 1,
            restitution: 0.4,
            friction: 0.4,
        })
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
        const v = theta[1]
        this.ball.body.linearVelocity.set(v[0], v[1], v[2])
    }

    doCatch(controller) {
        const distance = controller.getWorldPosition(this.controllerWorldPosition).distanceTo(this.ball.mesh.position)
        return distance < 0.2
    }

    resetBall(x, y, z) {
        const b = this.ball.body
        b.resetPosition(x, y, z)
        b.resetRotation(0, 0, 0)
    }

    update(dt, players) {

        switch (this.ball.state) {
            case 'free':
                const l = this.ball.body.linearVelocity
                l.multiply(this.airFriction)

                const scale = 0.2
                const v = this.ball.body.linearVelocity
                this.ball.mesh.rotateX(v.z * scale)
                this.ball.mesh.rotateZ(v.x * scale * -1)
                break

            case 'held':
                const player = players[this.ball.holding]
                const p = this.controllerWorldPosition
                p.copy(player.player.position)
                p.y = 0

                const con = this.ball.hand == 'left' ? player.leftCon : player.rightCon
                p.add(con.position)

                this.ball.body.resetPosition(p.x, p.y, p.z)
        }

        this.ball.mesh.position.copy(this.ball.body.position)

        this.world.timeStep = dt
        this.world.step()
    }
}

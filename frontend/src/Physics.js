import * as math from 'mathjs'
import * as THREE from 'three'
import * as OIMO from 'oimo'

export default class Physics {
    constructor(pTimeframes, pBall, pWall) {
        this.controllerWorldPosition = new THREE.Vector3()
        this.timeframes = pTimeframes
        this.ball = pBall
        const friction = 0.99
        this.airFriction = new OIMO.Vec3(friction, 1, friction)

        this.world = new OIMO.World({
            timestep: 1 / 60,
            iterations: 8,
            broadphase: 2, // 1 brute force, 2 sweep and prune, 3 volume tree
            worldscale: 1,
            random: false,
            info: false, // calculate statistic or not
            gravity: [0, -9.8, 0]
        })

        this.floor = this.world.add({
            size: [32, 4, 32],
            pos: [0, -2, 0],
        })

        const r = .04
        this.ball.body = this.world.add({
            type: 'sphere',
            size: [r, r, r],
            pos: [0, 1.6, -0.5],
            move: true,
            density: 100
        })

        this.wall = pWall
        this.wall.body = this.world.add({
            type: 'box',
            size: [1, 1, 0.2],
            pos: [0, 0.5, -2],
            move: true,
            density: 1
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

        this.world.timeStep = dt
        this.world.step()

        this.ball.mesh.position.copy(this.ball.body.position)
        this.ball.mesh.quaternion.copy(this.ball.body.getQuaternion())

        this.wall.mesh.position.copy(this.wall.body.getPosition())
        this.wall.mesh.quaternion.copy(this.wall.body.getQuaternion())
    }
}

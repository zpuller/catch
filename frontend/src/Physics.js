import * as math from 'mathjs'
import * as THREE from 'three'
import * as OIMO from 'oimo'

export default class Physics {
    constructor(pTimeframes, pBall) {
        this.controllerWorldPosition = new THREE.Vector3()
        this.gravity = 0.05
        this.timeframes = pTimeframes
        this.ball = pBall
        this.ball.velocity = new THREE.Vector3()
        const friction = 0.99
        this.airFriction = new OIMO.Vec3(friction, 1, friction)

        this.world = new OIMO.World({
            timestep: 1 / 60,
            iterations: 8,
            broadphase: 2, // 1 brute force, 2 sweep and prune, 3 volume tree
            worldscale: 1, // scale full world 
            random: true,  // randomize sample
            info: false,   // calculate statistic or not
            gravity: [0, -9.8, 0]
        })

        const r = 1.2
        this.body = this.world.add({
            type: 'sphere', // type of shape : sphere, box, cylinder 
            size: [r], // size of shape
            pos: [0, 1.6, -0.5], // start position in degree
            rot: [0, 0, 90], // start rotation in degree
            move: true, // dynamic or statique
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

        this.ball.velocity.fromArray(theta[1])
    }

    doCatch(controller) {
        const distance = controller.getWorldPosition(this.controllerWorldPosition).distanceTo(this.ball.mesh.position)
        return distance < 0.2
    }

    resetBall() {
        const b = this.body
        b.resetPosition(0, 1.6, -0.5)
        b.linearVelocity.set(1, 0, 0)
        b.resetRotation(0, 0, 0)
    }

    update(dt) {
        this.world.timestep = dt
        this.body.linearVelocity.multiply(this.airFriction)
        const l = this.body.linearVelocity
        this.world.step()
        this.ball.mesh.position.copy(this.body.getPosition())
        const scale = -0.2
        this.ball.mesh.rotateX(this.body.linearVelocity.z * scale)
        this.ball.mesh.rotateZ(this.body.linearVelocity.x * scale)

        switch (this.ball.state) {
            // case 'free':
            //     this.ball.velocity.y -= this.gravity
            //     this.ball.velocity.y = Math.max(this.ball.velocity.y, -1000)

            //     this.ball.mesh.position.x += this.ball.velocity.x * dt
            //     this.ball.mesh.position.y += this.ball.velocity.y * dt
            //     this.ball.mesh.position.z += this.ball.velocity.z * dt

            //     this.ball.mesh.position.y = Math.max(this.ball.mesh.position.y, 0.1)
            //     break

            // case 'held':
            // const player = players[this.ball.holding]
            // const p = this.ball.mesh.position
            // p.copy(player.player.position)
            // p.y = 0

            // const con = this.ball.hand == 'left' ? player.leftCon : player.rightCon
            // p.add(con.position)
        }
    }
}

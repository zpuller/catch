import * as math from 'mathjs'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'

export default class Physics {
    constructor(pTimeframes, pBall, pWall, pLeftHand, pRightHand) {
        this.controllerWorldPosition = new THREE.Vector3()
        this.timeframes = pTimeframes
        this.ball = pBall
        this.wall = pWall
        this.leftHand = pLeftHand
        this.rightHand = pRightHand

        this.world = new CANNON.World({
            gravity: new CANNON.Vec3(0, -9.8, 0)
        })

        this.floor = new CANNON.Body({
            type: CANNON.Body.STATIC,
            shape: new CANNON.Plane()
        })
        this.floor.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
        this.world.addBody(this.floor)

        const r = .04
        this.ball.body = new CANNON.Body({
            mass: 5,
            shape: new CANNON.Sphere(r),
            collisionFilterGroup: 2,
        })
        this.ball.body.linearDamping = .5
        this.ball.body.angularDamping = .5
        this.world.addBody(this.ball.body)

        this.wall.body = new CANNON.Body({
            mass: 1,
            shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.1)),
        })
        this.wall.body.position.set(0, 0.5, -2)
        this.world.addBody(this.wall.body)

        this.leftHand.body = new CANNON.Body({
            mass: 5,
            shape: new CANNON.Sphere(r),
            collisionFilterGroup: 1,
            collisionFilterMask: 1
        })
        this.world.addBody(this.leftHand.body)

        this.rightHand.body = new CANNON.Body({
            mass: 5,
            shape: new CANNON.Sphere(r),
            collisionFilterGroup: 1,
            collisionFilterMask: 1
        })
        this.world.addBody(this.rightHand.body)
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
        const scalar = 1.5
        this.ball.body.velocity.set(scalar * v[0], scalar * v[1], scalar * v[2])
    }

    doCatch(controller) {
        const distance = controller.getWorldPosition(this.controllerWorldPosition).distanceTo(this.ball.mesh.position)
        return distance < 0.2
    }

    resetBall(x, y, z) {
        const b = this.ball.body
        b.position.set(x, y, z)
        b.velocity.set(0, 0, 0)
        b.quaternion.setFromEuler(0, 0, 0)
    }

    update(players, leftCon, rightCon) {
        this.leftHand.body.position.copy(leftCon.getWorldPosition(this.controllerWorldPosition))
        this.rightHand.body.position.copy(rightCon.getWorldPosition(this.controllerWorldPosition))

        this.world.fixedStep()

        this.wall.mesh.position.copy(this.wall.body.position)
        this.wall.mesh.quaternion.copy(this.wall.body.quaternion)

        switch (this.ball.state) {
            case 'free':
                this.ball.mesh.position.copy(this.ball.body.position)
                this.ball.mesh.quaternion.copy(this.ball.body.quaternion)
                break

            case 'held':
                const p = this.controllerWorldPosition
                const player = players[this.ball.holding]
                p.copy(player.player.position)
                p.y = 0

                const con = this.ball.hand == 'left' ? player.leftCon : player.rightCon
                p.add(con.position)

                this.ball.body.position.set(p.x, p.y, p.z)
                // TODO send quaternion over the network instead of x, y, z
                // this.ball.body.rotation.copy()
                break
        }
    }
}

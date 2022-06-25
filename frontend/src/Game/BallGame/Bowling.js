import BallGame from "./Game"

export default class Bowling extends BallGame {
    constructor(objects, xr, scene, cameraGroup, client, onInputsConnected, stats, hands, sounds) {
        super(objects, xr, scene, cameraGroup, client, onInputsConnected, stats, hands, sounds)

        this.ball.body = this.physics.createBall(0.16, 10)
        this.ball.body.addEventListener('collide', this.ballHandler)
        this.ball.body.addEventListener('sleep', () => { console.log('sleep') })
        this.ball.body.addEventListener('wakeup', () => { console.log('wakeup') })
        this.ball.mesh = this.objects.ball
        this.ballStartingPosition = this.ball.mesh.position.clone()
        this.ball.body.position.copy(this.ballStartingPosition)
        this.ball.sound = sounds.ball

        this.dynamicEntities = []

        this.physics.enableSlippery()
        this.physics.createStaticBox(this.objects.floor, this.physics.groundMaterial)
        this.objects.lanes.forEach(l => this.physics.createStaticBox(l))
        this.physics.createStaticBox(this.objects.belt, this.physics.groundMaterial)
        this.bar = {
            mesh: this.objects.bar,
            bodies: [this.physics.createDynamicBox(this.objects.bar, null, 10)],
            constraints: [],
        }
        this.addDynamicEntity(this.bar)
        this.bar.bodies[0].sleep()

        this.pins = this.objects.pins.map(mesh => { return { mesh, bodies: [this.physics.createDynamicBox(mesh)], constraints: [], } })
        this.pins.forEach(p => {
            this.addDynamicEntity(p)
            p.bodies[0].sleep()
        })
        this.pinStartingPositions = this.objects.pins.map(p => p.position.clone())

        this.animateBarBody = () => { }
        this.objects.mixer.addEventListener('finished', e => {
            if (e.action === this.objects.barAction) {
                this.animateBarBody = () => { }
                this.bar.bodies[0].sleep()
                this.resetPins()
                this.resetBall()
            }
        })

        this.inputs.addListener('right', 'aPressed', this.runBarAction.bind(this))
        window.addEventListener('keypress', e => {
            if (e.key === 'd') {
            }
        })

        this.player.position.z += 3
    }

    resetBall() {
        this.ball.body.position.copy(this.ballStartingPosition)
        this.ball.body.velocity.set(0, 0, 0)
        this.ball.body.angularVelocity.set(0, 0, 0)

        this.objects.ballAction.stop()
        this.objects.ballAction.play()
    }

    resetPins() {
        this.pins.forEach((e, i) => {
            const b = e.bodies[0]
            b.position.copy(this.pinStartingPositions[i])
            b.quaternion.set(0, 0, 0, 1)
            b.velocity.set(0, 0, 0)
            b.angularVelocity.set(0, 0, 0)
            b.sleep()
        })

        this.objects.pinsAction.stop()
        this.objects.pinsAction.play()
    }

    runBarAction() {
        this.animateBarBody = this.animateBarBodyImpl
        this.objects.barAction.stop()
        this.objects.barAction.play()
    }

    animateBarBodyImpl() {
        const b = this.bar.bodies[0]
        b.wakeUp()
        b.angularVelocity.set(0, 0, 0)
        b.quaternion.set(0, 0, 0, 1)
        b.velocity.set(0, 0, -4)

        b.position.copy(this.bar.mesh.position)
    }

    update(inputs) {
        this.animateBarBody()
        super.update(inputs)
        this.objects.mixer.update(this.physics.dt)
    }
}
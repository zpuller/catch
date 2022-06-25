import Physics from '../Physics'
import CannonDebugger from 'cannon-es-debugger'
import Utils from '../../Utils'
import Game from '../Game'

const defaultEntity = () => { return { position: [], quaternion: [], } }
const defaultPlayer = () => {
    return {
        player: defaultEntity(),
        leftCon: defaultEntity(),
        rightCon: defaultEntity(),
    }
}

export default class BallGame extends Game {
    constructor(objects, xr, scene, cameraGroup, client, onInputsConnected, stats, hands, sounds) {
        super(objects, xr, scene, cameraGroup, onInputsConnected, stats, false, hands)
        this.hands = hands
        this.client = client
        this.client.subscribeToEvents(this)
        this.handledInitialState = false

        this.players = {}
        this.playerGroups = {}

        this.ball = {
            state: 'free',
            localHeld: false,
        }

        this.ballHandler = () => {
            const b = this.ball
            const gain = Utils.clamp(b.body.velocity.length() / 5)
            if (b.sound) {
                b.sound.gain.gain.value = gain
                if (b.sound.isPlaying) {
                    b.sound.stop()
                }
                b.sound.play()
            }
        }

        this.physics = new Physics(this.leftHand, this.rightHand)

        if (MODE === 'dev') {
            this.cannonDebuggerEnabled = false
            if (this.cannonDebuggerEnabled) {
                this.cannonDebugger = new CannonDebugger(this.scene, this.physics.world)
            }
        }

        this.inputs.addListener('left', 'squeezeStart', (() => { this.tryCatch(this.leftHand.con, true) }).bind(this))
        this.inputs.addListener('left', 'squeezeEnd', (() => { this.tryThrow(this.leftHand.con) }).bind(this))
        this.inputs.addListener('right', 'squeezeStart', (() => { this.tryCatch(this.rightHand.con, false) }).bind(this))
        this.inputs.addListener('right', 'squeezeEnd', (() => { this.tryThrow(this.rightHand.con) }).bind(this))
        this.inputs.addListener('left', 'squeeze', this.clenchLeftHand.bind(this))
        this.inputs.addListener('right', 'squeeze', this.clenchRightHand.bind(this))

        this.handParams = {
            x: .035,
            y: -.015,
            z: .02,
            c: 0.5,
        }
    }

    addEntity(e) {
        e.bodies.forEach(b => this.physics.world.addBody(b))
    }

    addDynamicEntity(e) {
        this.addEntity(e)
        // this.scene.add(e.mesh)
        e.constraints.forEach(c => this.physics.world.addConstraint(c))
        this.dynamicEntities.push(e)
    }

    forEachPlayerExceptSelf(f) {
        Object.keys(this.players).filter(id => id != this.client.id).forEach(f)
    }

    handlePlayerJoined(id) {
        const player = defaultPlayer()
        player.id = id
        this.players[player.id] = player
        this.playerGroups[player.id] = this.objects.buildNewPlayer()
        this.scene.add(this.playerGroups[player.id])
    }

    handlePlayerDisconnected(id) {
        this.scene.remove(this.playerGroups[id])
        delete this.players[id]
        delete this.playerGroups[id]
    }

    handleUpdateState(state) {
        this.players = state.players

        if (!this.handledInitialState) {
            this.handledInitialState = true

            this.forEachPlayerExceptSelf(id => {
                this.playerGroups[id] = this.objects.buildNewPlayer()
                this.scene.add(this.playerGroups[id])
            })
        }
    }

    handleUpdateBallState(state) {
        this.ball.state = state.state
        this.ball.holding = state.holding
        this.ball.hand = state.hand


        const id = this.ball.holding
        if (this.ball.state === 'held') {
            this.physics.sleepBall(this.ball)
            const left = this.ball.hand === 'left'
            let grip
            if (id === this.client.id) {
                grip = left ? this.leftHand.con : this.rightHand.con
            } else {
                const g = this.playerGroups[id]
                grip = g.children[left ? 0 : 1]
            }
            const m = this.ball.mesh
            m.position.set(this.handParams.x * (left ? 1 : -1), this.handParams.y, this.handParams.z)
            grip.add(m)
        } else {
            if (id !== this.client.id) {
                this.physics.updateBallState(this.ball, state.velocity, state.position)
                this.scene.add(this.ball.mesh)
            }
        }
    }

    handleController(controller) {
        controller.userData.prevPositions = controller.userData.prevPositions.slice(1)
        controller.userData.prevPositions.push(controller.getWorldPosition(this.positionBuffer).toArray())
    }

    clenchLeftHand(x) {
        this.hands.clenchLeft(x * this.handParams.c)
    }

    clenchRightHand(x) {
        this.hands.clenchRight(x * this.handParams.c)
    }

    resetBallAboveRightCon() {
        const p = this.rightHand.con.getWorldPosition(this.positionBuffer)
        this.resetBall(p.x, p.y + 0.5, p.z)
    }

    tryCatch(con, left) {
        if (this.physics.doCatch(con, this.ball)) {
            this.ball.state = 'held'
            this.ball.holding = this.client.id
            this.ball.hand = left ? 'left' : 'right'

            this.physics.sleepBall(this.ball)
            const m = this.ball.mesh
            m.position.set(this.handParams.x * (left ? 1 : -1), this.handParams.y, this.handParams.z)
            con.add(m)

            this.client.emitBallState({
                state: this.ball.state,
                holding: this.ball.holding,
                hand: this.ball.hand,
            })
        }
    }

    tryThrow(con) {
        if (this.ball.state == 'held' && this.ball.holding == this.client.id && (this.ball.hand === 'left') === (con === this.leftHand.con)) {

            this.ball.state = 'free'
            this.scene.add(this.ball.mesh)

            const v = this.physics.doThrow(con, this.ball)
            this.client.emitBallState({
                state: this.ball.state,
                holding: this.ball.holding,
                hand: this.ball.hand,
                velocity: { x: v.x, y: v.y, z: v.z }
            })
        }
    }

    emitPlayerState() {
        const [lp, rp] = [this.leftHand.con.position, this.rightHand.con.position]
        const [lq, rq] = [this.leftHand.con.quaternion, this.rightHand.con.quaternion]
        const state = {
            player: {
                position: this.player.position.toArray(),
                quaternion: this.player.quaternion.toArray(),
            },
            leftCon: {
                position: lp.toArray(),
                quaternion: lq.toArray(),
            },
            rightCon: {
                position: rp.toArray(),
                quaternion: rq.toArray(),
            }
        }
        this.players[this.client.id] = state

        this.client.emitPlayerState(state)
    }

    updateOtherPlayerState() {
        this.forEachPlayerExceptSelf(id => {
            const p = this.players[id]
            const g = this.playerGroups[id]
            g.position.fromArray(p.player.position)
            g.quaternion.fromArray(p.player.quaternion)

            const [lp, rp] = [p.leftCon.position, p.rightCon.position]
            const [lq, rq] = [p.leftCon.quaternion, p.rightCon.quaternion]
            g.children[0].position.fromArray(lp)
            g.children[0].quaternion.fromArray(lq)
            g.children[1].position.fromArray(rp)
            g.children[1].quaternion.fromArray(rq)
        })
    }

    resetBall(x, y, z) {
        this.scene.add(this.ball.mesh)
        const { v, p } = this.physics.resetBall(this.ball, x, y, z)
        this.client.emitBallState({
            state: 'free',
            holding: this.client.id,
            velocity: { x: v.x, y: v.y, z: v.z },
            position: { x: p.x, y: p.y, z: p.z },
        })
    }

    updateMeshes() {
        this.dynamicEntities.forEach(e => {
            e.mesh.position.copy(e.bodies[0].position)
            e.mesh.quaternion.copy(e.bodies[0].quaternion)
        })

        if (this.ball.state === 'free') {
            this.ball.mesh.position.copy(this.ball.body.position)
            this.ball.mesh.quaternion.copy(this.ball.body.quaternion)
        }
    }

    update(inputs) {
        this.handleController(this.leftHand.con)
        this.handleController(this.rightHand.con)

        this.physics.update(this.players, this.leftHand.con, this.rightHand.con, this.ball)
        this.updateMeshes()

        this.emitPlayerState()
        this.updateOtherPlayerState()

        if (MODE === 'dev') {
            if (this.cannonDebuggerEnabled) {
                this.cannonDebugger.update()
            }
        }

        super.update(inputs)
    }
}
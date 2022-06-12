import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'
import { HTMLMesh } from 'three/examples/jsm/interactive/HTMLMesh'

import Objects from '../Assets/Objects'

import Physics from './Physics'
import WebXR from '../WebXR'

import CannonDebugger from 'cannon-es-debugger'
import GarbageBin from '../Assets/Entities/GarbageBin'

import Gui from './Gui'
import Teleport from './Teleport'
import Hands from '../Assets/Entities/Hands'
import GameAudio from '../Assets/GameAudio'
import Utils from '../Utils'
import Inputs from './Inputs'

// TODO move to script.js?
let stats
if (MODE === 'dev') {
    stats = Stats()
    document.body.appendChild(stats.dom)
}

const defaultEntity = () => { return { position: [], quaternion: [], } }
const defaultPlayer = () => {
    return {
        player: defaultEntity(),
        leftCon: defaultEntity(),
        rightCon: defaultEntity(),
    }
}

export default class Game {
    constructor(gltfLoader, xr, scene, cameraGroup, client, camera, onInputsConnected) {
        this.client = client
        this.client.subscribeToEvents(this)
        this.handledInitialState = false

        this.scene = scene

        this.player = cameraGroup
        this.players = {}
        this.playerGroups = {}

        this.positionBuffer = new THREE.Vector3()

        this.ball = { state: 'free', }
        this.leftHand = {}
        this.rightHand = {}

        const sounds = new GameAudio(camera)

        this.hands = new Hands(gltfLoader)

        this.inputs = new Inputs(this)
        const webXRConf = {
            xr,
            leftHandlers: this.inputs.leftConEventHandlers,
            rightHandlers: this.inputs.rightConEventHandlers,
            player: cameraGroup,
            hands: this.hands,
            onInputsConnected,
        }
        const { leftCon, rightCon, leftGrip, rightGrip } = WebXR.init(webXRConf)
        // TODO this could be optional/an object to pick up
        // this.objects.buildGlove(leftGrip)
        this.leftHand.con = leftCon
        this.rightHand.con = rightCon
        this.leftHand.grip = leftGrip
        this.rightHand.grip = rightGrip


        const ballHandler = () => {
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
        // TODO this could theoretically trigger before the assets are loaded
        const tvHandler = () => {
            if (this.objects.screen.broken) {
                return
            }
            this.objects.screen.broken = true
            this.objects.screen?.sound?.play()
            this.objects.video.pause()
            this.scene.remove(this.objects.screen)
            this.scene.add(this.objects.screenBroken)
        }
        const physicsHandlers = { ball: ballHandler, tv: tvHandler }

        this.physics = new Physics(this.ball, this.leftHand, this.rightHand, physicsHandlers)
        this.objects = new Objects(gltfLoader, this.physics)
        this.objects.buildBall(this.ball, this.scene, sounds.ball)
        this.objects.buildRoom(this.scene, sounds.tv, physicsHandlers)

        this.dynamicEntities = []

        this.addDynamicEntity(new GarbageBin({ x: 0.7, y: 0.0, z: -3 }, this.scene, gltfLoader))

        if (MODE === 'dev') {
            this.cannonDebuggerEnabled = false
            if (this.cannonDebuggerEnabled) {
                this.cannonDebugger = new CannonDebugger(this.scene, this.physics.world)
            }

            // Experimental
            const statsMesh = new HTMLMesh(stats.dom);
            statsMesh.position.x = - 0.75;
            statsMesh.position.y = 2;
            statsMesh.position.z = - 0.6;
            statsMesh.rotation.y = Math.PI / 4;
            statsMesh.scale.setScalar(2.5);
            scene.add(statsMesh);

            this.statsMesh = statsMesh
        }


        this.resetBall(0, 1.6, -0.5)

        this.teleport = new Teleport(scene, this.rightHand.con, this.objects, this.player)

        this.handParams = {
            x: .03,
            y: -.017,
            z: .03,
            c: .4,
        }

        this.debugObj = {
            x: 0,
            y: 0,
        }
        if (MODE === 'dev') {
            this.guiEnabled = true
            if (this.guiEnabled) {
                this.gui = new Gui()
                this.gui.addSlider(this.debugObj, 'x')
                this.gui.addSlider(this.debugObj, 'y')
                // this.player.add(this.gui)
            }
        }
    }

    startXRSession(xr) {
        this.headset = xr.getCamera()
        this.scene.add(this.headset)
        if (MODE === 'dev') {
            this.headset.add(this.gui)
        }
    }

    addEntity(e) {
        e.bodies.forEach(b => this.physics.world.addBody(b))
    }

    addDynamicEntity(e) {
        this.addEntity(e)
        this.scene.add(e.mesh)
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
            this.physics.sleepBall()
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
                this.physics.updateBallState(state.velocity, state.position)
                this.scene.add(this.ball.mesh)
            }
        }
    }

    handleController(controller) {
        controller.userData.prevPositions = controller.userData.prevPositions.slice(1)
        controller.userData.prevPositions.push(controller.getWorldPosition(this.positionBuffer).toArray())
    }

    movePlayer(x, z) {
        const p = this.positionBuffer
        p.set(x, 0, z)
        p.applyQuaternion(this.player.quaternion)
        this.player.position.addScaledVector(p, .01)
    }

    clenchLeftHand(x) {
        this.hands.clenchLeft(x * this.handParams.c)
    }

    clenchRightHand(x) {
        this.hands.clenchRight(x * this.handParams.c)
    }

    rotatePlayer(x) {
        this.player.rotateY(-.01 * x)
    }

    resetBallAboveRightCon() {
        const p = this.rightHand.con.getWorldPosition(this.positionBuffer)
        this.resetBall(p.x, p.y + 0.5, p.z)
    }

    toggleGui() {
        console.log('toggle gui')
        if (MODE === 'dev') {
            this.gui.toggle()
        }
    }

    tryCatch(con, left) {
        if (this.physics.doCatch(con, this.ball)) {
            this.ball.state = 'held'
            this.ball.holding = this.client.id
            this.ball.hand = left ? 'left' : 'right'

            this.physics.sleepBall()
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

            const v = this.physics.doThrow(con)
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
        const { v, p } = this.physics.resetBall(x, y, z)
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

    getRight(inputs) {
        return inputs[inputs[0].handedness === 'right' ? 0 : 1]
    }

    update(inputs) {
        this.inputs.handleInputs(inputs)
        this.handleController(this.leftHand.con)
        this.handleController(this.rightHand.con)

        this.teleport.update(this.rightHand.con)
        this.physics.update(this.players, this.leftHand.con, this.rightHand.con)
        this.updateMeshes()

        this.emitPlayerState()
        this.updateOtherPlayerState()

        if (MODE === 'dev') {
            stats.update()
            if (this.guiEnabled) {
                this.gui.update(this.rightHand.con, inputs && this.getRight(inputs))
            }
            if (this.cannonDebuggerEnabled) {
                this.cannonDebugger.update()
            }

            this.statsMesh.material.map.update()
        }
    }
}
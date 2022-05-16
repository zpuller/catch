import * as THREE from 'three'

import Objects from './Assets/Objects'

import Physics from './Physics'
import WebXR from './WebXR'

const defaultPlayer = () => {
    return {
        player: { position: { x: 0, z: 0 } },
        leftCon: {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 }
        },
        rightCon: {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 }
        }
    }
}

const handlers = (game) => {
    return {
        onSelectStart: function () {
            const data = new THREE.Vector3()
            const p = this.getWorldPosition(data)
            game.resetBall(p.x, p.y + 0.5, p.z)
        },

        onSelectEnd: function () {
        },

        onSqueezeStart: function () {
            if (game.physics.doCatch(this, this.ball)) {
                game.ball.state = 'held'
                game.ball.holding = game.client.id
                game.ball.hand = this === game.controller1 ? 'left' : 'right'

                game.client.emitBallState({
                    state: game.ball.state,
                    holding: game.ball.holding,
                    hand: game.ball.hand,
                })
            }
        },

        onSqueezeEnd: function () {
            if (game.ball.state == 'held' && game.ball.holding == game.client.id && (game.ball.hand === 'left') === (this === game.controller1)) {
                game.physics.doThrow(this)

                game.ball.state = 'free'
                game.ball.body.wakeUp()
                game.scene.add(game.ball.mesh)

                const v = game.ball.body.velocity
                game.client.emitBallState({
                    state: game.ball.state,
                    holding: game.ball.holding,
                    hand: game.ball.hand,
                    velocity: { x: v.x, y: v.y, z: v.z }
                })
            }
        },
    }
}

export default class Game {
    constructor(xr, scene, cameraGroup, client) {
        this.client = client
        this.client.subscribeToEvents(this)
        this.handledInitialState = false

        this.scene = scene

        this.player = cameraGroup
        this.players = {}
        this.playerGroups = {}

        this.clock = new THREE.Clock()
        this.elapsedTime = this.clock.getElapsedTime()
        this.timeframes = Array(5).fill(1)
        this.controllerWorldPosition = new THREE.Vector3()

        this.ball = { state: 'free', }
        this.wall = {}
        this.leftHand = {}
        this.rightHand = {}

        this.objects = new Objects()
        this.objects.buildBall(this.ball, this.scene)
        this.objects.buildRoom(this.scene)
        this.objects.buildWall(this.scene, this.wall)

        let res = WebXR.init(xr, handlers(this), cameraGroup, this.objects, scene)
        this.leftHand.con = res.controller1
        this.rightHand.con = res.controller2

        this.physics = new Physics(this.timeframes, this.ball, this.wall, this.leftHand, this.rightHand)

        this.resetBall(0, 1.6, -0.5)
    }

    forEachPlayerExceptSelf(f) {
        Object.keys(this.players).filter(id => id != this.client.id && this.players[id]).forEach(f)
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
    }

    handleUpdateState(state) {
        state.players.forEach((p, id) => {
            if (id !== this.client.id) {
                this.players[id] = p
            }
        })

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
        const id = state.holding
        this.ball.holding = id
        this.ball.hand = state.hand

        const b = this.ball.body
        if (this.ball.state === 'held') {
            b.sleep()
            const left = this.ball.hand === 'left'
            let grip
            if (id === this.client.id) {
                grip = left ? this.leftHand.con : this.rightHand.con
            } else {
                const g = this.playerGroups[id]
                grip = g.children[left ? 0 : 1]
            }
            const m = this.ball.mesh
            m.position.set(0.02 * (left ? 1 : -1), 0, 0.05)
            grip.add(m)
        } else {
            if (id === this.client.id) {
                return
            }

            b.wakeUp()
            this.scene.add(this.ball.mesh)

            if (state.velocity) {
                const v = state.velocity
                b.velocity.set(v.x, v.y, v.z)
            }

            if (state.position) {
                const p = state.position
                b.position.set(p.x, p.y, p.z)
            }
        }
    }

    handleController(controller) {
        controller.userData.prevPositions = controller.userData.prevPositions.slice(1)
        controller.userData.prevPositions.push(controller.getWorldPosition(this.controllerWorldPosition).toArray())
    }

    handleInputs(inputs) {
        if (inputs) {
            for (const source of inputs) {
                // console.log(source.handedness)
                let a = source.gamepad.axes
                let [x, z] = [a[2], a[3]]
                this.player.position.x += .01 * x
                this.player.position.z += .01 * z
                // for (const button of source.gamepad.buttons) {
                //     console.log(button)
                // }
            }
        }

        this.handleController(this.leftHand.con)
        this.handleController(this.leftHand.con)
    }

    tick() {
        const prevTime = this.elapsedTime
        this.elapsedTime = this.clock.getElapsedTime()
        const dt = this.elapsedTime - prevTime
        let ks = [...this.timeframes.keys()].slice(1)
        ks.forEach(i => {
            this.timeframes[i - 1] = this.timeframes[i]
        })
        this.timeframes[this.timeframes.length - 1] = dt
    }

    emitPlayerState() {
        const [lp, rp] = [this.leftHand.con.position, this.rightHand.con.position]
        const [lr, rr] = [this.leftHand.con.rotation, this.rightHand.con.rotation]
        const state = {
            player: { position: { x: this.player.position.x, z: this.player.position.z } },
            leftCon: {
                position: { x: lp.x, y: lp.y, z: lp.z },
                rotation: { x: lr.x, y: lr.y, z: lr.z },
            },
            rightCon: {
                position: { x: rp.x, y: rp.y, z: rp.z },
                rotation: { x: rr.x, y: rr.y, z: rr.z },
            }
        }
        this.players[this.client.id] = state

        this.client.emitPlayerState(state)
    }

    updateOtherPlayerState() {
        this.forEachPlayerExceptSelf(id => {
            const p = this.players[id]
            const g = this.playerGroups[id]
            g.position.set(p.player.position.x, 0, p.player.position.z)

            const [lp, rp] = [p.leftCon.position, p.rightCon.position]
            g.children[0].position.set(lp.x, lp.y, lp.z)
            g.children[1].position.set(rp.x, rp.y, rp.z)
        })
    }

    resetBall(x, y, z) {
        this.scene.add(this.ball.mesh)
        this.physics.resetBall(x, y, z)

        const v = this.ball.body.velocity
        const p = this.ball.body.position
        this.client.emitBallState({
            state: 'free',
            velocity: { x: v.x, y: v.y, z: v.z },
            position: { x: p.x, y: p.y, z: p.z },
        })
    }

    update(inputs) {
        this.tick()
        this.handleInputs(inputs)
        this.physics.update(this.players, this.leftHand.con, this.rightHand.con)
        this.emitPlayerState()
        this.updateOtherPlayerState()
    }
}
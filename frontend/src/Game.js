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

                const v = game.ball.body.linearVelocity
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

        this.player = cameraGroup
        this.players = {}
        this.playerGroups = {}

        this.clock = new THREE.Clock()
        this.elapsedTime = this.clock.getElapsedTime()
        this.timeframes = Array(5).fill(1)

        const objects = new Objects()
        const ball = {
            state: 'free',
            mesh: new THREE.Group()
        }
        objects.buildBall(ball, scene)
        const room = objects.buildRoom(scene)

        this.objects = objects
        this.ball = ball
        this.scene = scene

        let res = WebXR.init(xr, handlers(this), cameraGroup, this.objects, scene)
        this.controller1 = res.controller1
        this.controller2 = res.controller2

        this.controllerWorldPosition = new THREE.Vector3()

        this.physics = new Physics(this.timeframes, this.ball)

        this.handledInitialState = false

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

        const m = this.ball.mesh
        if (this.ball.state === 'held') {
            this.ball.body.isKinetic = true
            if (id !== this.client.id) {
                const g = this.playerGroups[id]
                const left = this.ball.hand === 'left'
                const grip = g.children[left ? 0 : 1]
                // grip.add(m)
                // m.position.set(0.03 * (left ? 1 : -1), 0, 0.03)
            }
        } else {
            this.ball.body.isKinetic = false
            // this.scene.add(m)
        }

        if (state.velocity) {
            const v = state.velocity
            this.ball.body.linearVelocity.set(v.x, v.y, v.z)
        }

        if (state.position) {
            const p = state.position
            this.ball.body.position.set(p.x, p.y, p.z)
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

        this.handleController(this.controller1)
        this.handleController(this.controller2)
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

        return dt
    }

    emitPlayerState() {
        const [lp, rp] = [this.controller1.position, this.controller2.position]
        const [lr, rr] = [this.controller1.rotation, this.controller2.rotation]
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

        const v = this.ball.body.linearVelocity
        const p = this.ball.body.position
        this.client.emitBallState({
            state: 'free',
            velocity: { x: v.x, y: v.y, z: v.z },
            position: { x: p.x, y: p.y, z: p.z },
        })
    }

    update(inputs) {
        const dt = this.tick()
        this.handleInputs(inputs)
        this.physics.update(dt, this.players)
        this.emitPlayerState()
        this.updateOtherPlayerState()
    }
}
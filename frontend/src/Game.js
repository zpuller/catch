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
            this.userData.isSelecting = true
            game.physics.resetBall()
        },

        onSelectEnd: function () {
            this.userData.isSelecting = false
        },

        onSqueezeStart: function () {
            this.userData.isSqueezing = true
            game.physics.doCatch(this, this.ball)
        },

        onSqueezeEnd: function () {
            this.userData.isSqueezing = false
            if (this.userData.isHolding) {
                game.physics.doThrow(this)
            }

            game.ball.material.color.setHex(0x04f679)
            this.userData.isHolding = false
        },
    }
}

export default class Game {
    constructor(xr, scene, cameraGroup, client) {
        this.client = client
        this.client.subscribeToEvents(this)

        this.players = {}
        this.playerGroups = {}

        this.clock = new THREE.Clock()
        this.elapsedTime = this.clock.getElapsedTime()
        this.timeframes = Array(5).fill(1)

        this.player = cameraGroup
        const objects = new Objects()
        const ball = objects.buildBall()
        const room = objects.buildRoom()
        scene.add(room)
        scene.add(ball)

        this.objects = objects
        this.ball = ball
        this.scene = scene

        let res = WebXR.init(xr, handlers(this), cameraGroup)
        this.controller1 = res.controller1
        this.controller2 = res.controller2

        this.physics = new Physics(this.timeframes, this.ball)

        this.handledInitialState = false
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
            this.players[id] = p
        })

        if (!this.handledInitialState) {
            this.handledInitialState = true

            this.forEachPlayerExceptSelf(id => {
                this.playerGroups[id] = this.objects.buildNewPlayer()
                this.scene.add(this.playerGroups[id])
            })
        }
    }

    handleController(controller) {
        controller.userData.prevPositions = controller.userData.prevPositions.slice(1)
        controller.userData.prevPositions.push(controller.position.toArray())
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

    update(inputs) {
        const prevTime = this.elapsedTime
        this.elapsedTime = this.clock.getElapsedTime()
        const dt = this.elapsedTime - prevTime
        let ks = [...this.timeframes.keys()].slice(1)
        ks.forEach(i => {
            this.timeframes[i - 1] = this.timeframes[i]
        })
        this.timeframes[this.timeframes.length - 1] = dt

        this.handleInputs(inputs)
        this.physics.update(this.controller1, this.controller2)

        const [lp, rp] = [this.controller1.position, this.controller2.position]
        const [lr, rr] = [this.controller1.rotation, this.controller2.rotation]
        this.client.emitPlayerState({
            player: { position: { x: this.player.position.x, z: this.player.position.z } },
            leftCon: {
                position: { x: lp.x, y: lp.y, z: lp.z },
                rotation: { x: lr.x, y: lr.y, z: lr.z },
            },
            rightCon: {
                position: { x: rp.x, y: rp.y, z: rp.z },
                rotation: { x: rr.x, y: rr.y, z: rr.z },
            }
        })

        this.forEachPlayerExceptSelf(id => {
            const p = this.players[id]
            const g = this.playerGroups[id]
            g.position.set(p.player.position.x, 0, p.player.position.z)

            const [lp, rp] = [p.leftCon.position, p.rightCon.position]
            g.children[0].position.set(lp.x, lp.y, lp.z)
            g.children[1].position.set(rp.x, rp.y, rp.z)
        })
    }
}
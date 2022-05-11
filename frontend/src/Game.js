import * as THREE from 'three'

import Objects from './Assets/Objects'

import Physics from './Physics'
import WebXR from './WebXR'

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
            game.physics.doCatch(this, this.mesh)
        },

        onSqueezeEnd: function () {
            this.userData.isSqueezing = false
            if (this.userData.isHolding) {
                game.physics.doThrow(this)
            }

            game.mesh.material.color.setHex(0x04f679)
            this.userData.isHolding = false
        },
    }
}

export default class Game {
    constructor(renderer, scene, cameraGroup, client) {
        this.renderer = renderer

        this.client = client
        this.client.stateHandler = {
            handleUpdateState: this.handleUpdateState.bind(this),
            handlePlayerJoined: this.handlePlayerJoined.bind(this),
            handlePlayerDisconnected: this.handlePlayerDisconnected.bind(this)
        }

        this.players = {}
        this.playerGroups = {}

        this.clock = new THREE.Clock()
        this.elapsedTime = this.clock.getElapsedTime()
        this.timeframes = Array(5).fill(1)

        this.player = cameraGroup
        this.mesh = new Objects(scene)
        this.scene = scene

        let res = WebXR.init(renderer, handlers(this), cameraGroup)
        this.controller1 = res.controller1
        this.controller2 = res.controller2

        this.physics = new Physics(this.timeframes, this.mesh)

        this.handledInitialState = false
    }

    handlePlayerJoined(player) {
        player.position = {
            player: { x: 0, z: 0 },
            leftCon: { x: 0, y: 0, z: 0 },
            rightCon: { x: 0, y: 0, z: 0 }
        }
        this.players[player.id] = player
        this.playerGroups[player.id] = WebXR.buildNewPlayer(this.renderer)
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

            for (const id in this.players) {
                if (id == this.client.id || this.players[id] === null) {
                    continue
                }
                this.playerGroups[id] = WebXR.buildNewPlayer(this.renderer)
                this.scene.add(this.playerGroups[id])
            }
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

        const lp = this.controller1.position
        const rp = this.controller2.position
        const lr = this.controller1.rotation
        const rr = this.controller2.rotation
        this.client.emitPlayerState({
            player: { x: this.player.position.x, z: this.player.position.z },
            leftCon: { x: lp.x, y: lp.y, z: lp.z },
            rightCon: { x: rp.x, y: rp.y, z: rp.z },
        }, {
            leftCon: { x: lr.x, y: lr.y, z: lr.z },
            rightCon: { x: rr.x, y: rr.y, z: rr.z },
        })

        // TODO refactor combine with above loop
        for (const id in this.players) {
            if (id == this.client.id || this.players[id] === null) {
                continue
            }
            const p = this.players[id]
            const g = this.playerGroups[id]
            g.position.set(p.position.player.x, 0, p.position.player.z)

            const lp = p.position.leftCon
            const rp = p.position.rightCon
            g.children[0].position.set(lp.x, lp.y, lp.z)
            g.children[1].position.set(rp.x, rp.y, rp.z)
        }
    }
}
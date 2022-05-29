import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'

import Objects from './Assets/Objects'

import Physics from './Physics'
import WebXR from './WebXR'

import CannonDebugger from 'cannon-es-debugger'
import GarbageBin from './Assets/Entities/GarbageBin'
import StaticEntities from './Assets/Entities/StaticEntities'

const stats = Stats()
document.body.appendChild(stats.dom)

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

// TODO lefty support
const handlers = (game) => {
    const data = new THREE.Vector3()
    return {
        onSelectStart: function () {
            const left = this === game.leftHand.con
            if (left) {
                const p = this.getWorldPosition(data)
                game.resetBall(p.x, p.y + 0.5, p.z)
            }
            else {
                game.pointingTeleport = true
                game.scene.add(game.rayIntersectMesh)
            }
        },

        onSelectEnd: function () {
            const left = this === game.leftHand.con
            if (!left) {
                game.player.position.copy(game.rayIntersectMesh.position)
                game.pointingTeleport = false
                game.scene.remove(game.rayIntersectMesh)
            }
        },

        onSqueezeStart: function () {
            if (game.physics.doCatch(this, this.ball)) {

                const left = this === game.leftHand.con

                game.ball.state = 'held'
                game.ball.holding = game.client.id
                game.ball.hand = left ? 'left' : 'right'

                game.physics.sleepBall()
                const m = game.ball.mesh
                m.position.set(0.02 * (left ? 1 : -1), 0, 0.05)
                this.add(m)

                game.client.emitBallState({
                    state: game.ball.state,
                    holding: game.ball.holding,
                    hand: game.ball.hand,
                })
            }
        },

        onSqueezeEnd: function () {
            if (game.ball.state == 'held' && game.ball.holding == game.client.id && (game.ball.hand === 'left') === (this === game.leftHand.con)) {

                game.ball.state = 'free'
                game.scene.add(game.ball.mesh)

                const v = game.physics.doThrow(this)
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
    constructor(gltfLoader, xr, scene, cameraGroup, client) {
        this.client = client
        this.client.subscribeToEvents(this)
        this.handledInitialState = false

        this.scene = scene

        this.player = cameraGroup
        this.players = {}
        this.playerGroups = {}

        this.controllerWorldPosition = new THREE.Vector3()

        this.ball = { state: 'free', }
        this.leftHand = {}
        this.rightHand = {}

        this.objects = new Objects(gltfLoader)
        this.objects.buildBall(this.ball, this.scene)
        this.objects.buildRoom(this.scene)

        const { leftCon, rightCon, leftGrip, rightGrip } = WebXR.init(xr, handlers(this), cameraGroup, this.objects)
        this.objects.buildGlove(leftGrip)
        this.leftHand.con = leftCon
        this.rightHand.con = rightCon
        this.leftHand.grip = leftGrip
        this.rightHand.grip = rightGrip

        this.physics = new Physics(this.ball, this.wall, this.leftHand, this.rightHand)

        this.dynamicEntities = []

        this.addEntity(new StaticEntities())

        this.addDynamicEntity(new GarbageBin({ x: 0.7, y: 1.0, z: -3 }, this.scene, gltfLoader))

        this.cannonDebugger = new CannonDebugger(this.scene, this.physics.world)

        this.resetBall(0, 1.6, -0.5)

        this.raycaster = new THREE.Raycaster()
        this.rayOrigin = new THREE.Vector3()
        this.rayDest = new THREE.Vector3()
        this.rayDirection = new THREE.Vector3()
        this.rayIntersectMesh = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({ wireframe: true }))
        this.rayCurve = new THREE.Mesh()
        this.rayCurveMat = new THREE.LineBasicMaterial({ color: '#ffffff' })
        this.rayCurveGeo = new THREE.BufferGeometry()
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
        for (const [id, p] of Object.entries(state.players)) {
            if (id !== this.client.id) {
                this.players[id] = p
            }
        }

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
            m.position.set(0.02 * (left ? 1 : -1), 0, 0.05)
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
        controller.userData.prevPositions.push(controller.getWorldPosition(this.controllerWorldPosition).toArray())
    }

    // TODO improve movement
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
        this.handleController(this.rightHand.con)
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

    updateRaycaster() {
        const c = this.rightHand.con
        c.remove(this.rayCurve)
        if (!this.pointingTeleport) {
            return
        }

        if (c.children.length === 0) {
            return
        }
        const origin = c.getWorldPosition(this.rayOrigin)
        const dest = c.children[0].getWorldPosition(this.rayDest)
        this.raycaster.set(origin, this.rayDirection.subVectors(dest, origin).normalize())
        const i = this.raycaster.intersectObject(this.objects.floor)
        if (i.length > 0) {
            const p = i[0].point
            this.rayIntersectMesh.position.copy(p)

            const distance = origin.distanceTo(p)
            const path = new THREE.Path()
            path.quadraticCurveTo(distance / 2, 1, distance, 0)
            const points = path.getPoints()
            this.rayCurveGeo.setFromPoints(points.map(p => new THREE.Vector3(0, p.y, -p.x)))

            this.rayCurve = new THREE.Line(this.rayCurveGeo, this.rayCurveMat)
            c.add(this.rayCurve)
        }
    }

    update(inputs) {
        this.handleInputs(inputs)
        this.updateRaycaster()
        this.physics.update(this.players, this.leftHand.con, this.rightHand.con)
        this.updateMeshes()
        // this.cannonDebugger.update()
        this.emitPlayerState()
        this.updateOtherPlayerState()
        stats.update()
    }
}
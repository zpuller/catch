import * as THREE from 'three'
import { HTMLMesh } from 'three/examples/jsm/interactive/HTMLMesh'

import Objects from '../Assets/ApartmentObjects'

import WebXR from '../WebXR'

import Gui from './Gui'
import Teleport from './Teleport'
import Inputs from './ApartmentInputs'

export default class Apartment {
    constructor(gltfLoader, xr, scene, cameraGroup, camera, onInputsConnected, stats) {
        this.handledInitialState = false

        this.scene = scene

        this.player = cameraGroup
        this.players = {}
        this.playerGroups = {}

        this.positionBuffer = new THREE.Vector3()

        this.leftHand = {}
        this.rightHand = {}

        this.inputs = new Inputs(this)
        const webXRConf = {
            xr,
            leftHandlers: this.inputs.leftConEventHandlers,
            rightHandlers: this.inputs.rightConEventHandlers,
            player: cameraGroup,
            onInputsConnected,
            controllerModels: true,
        }
        const { leftCon, rightCon, leftGrip, rightGrip } = WebXR.init(webXRConf)
        this.leftHand.con = leftCon
        this.rightHand.con = rightCon
        this.leftHand.grip = leftGrip
        this.rightHand.grip = rightGrip

        this.objects = new Objects(gltfLoader)
        this.objects.buildRoom(this.scene)

        this.dynamicEntities = []

        if (MODE === 'dev') {
            const statsMesh = new HTMLMesh(stats.dom);
            statsMesh.scale.setScalar(2.5);
            statsMesh.visible = false
            scene.add(statsMesh);

            this.statsMesh = statsMesh
        }

        this.teleport = new Teleport(scene, this.rightHand.con, this.objects, this.player)

        this.debugObj = {
            x: 0,
            y: 0,
        }
        if (MODE === 'dev') {
            this.guiEnabled = true
            if (this.guiEnabled) {
                this.gui = new Gui()
            }
        }
    }

    startXRSession(xr) {
        this.headset = xr.getCamera()
        this.scene.add(this.headset)
        if (MODE === 'dev') {
            this.headset.add(this.gui)
            this.headset.add(this.statsMesh)
            this.statsMesh.position.set(-0.3, 0.3, -1)
            this.statsMesh.visible = true
        }
    }

    movePlayer(x, z) {
        const p = this.positionBuffer
        p.set(x, 0, z)
        p.applyQuaternion(this.player.quaternion)
        this.player.position.addScaledVector(p, .01)
    }

    rotatePlayer(x) {
        this.player.rotateY(-.01 * x)
    }

    toggleGui() {
        console.log('toggle gui')
        if (MODE === 'dev' && this.guiEnabled) {
            this.gui.toggle()
        }
    }

    getRight(inputs) {
        return inputs[inputs[0].handedness === 'right' ? 0 : 1]
    }

    update(inputs) {
        this.inputs.handleInputs(inputs)

        this.teleport.update(this.rightHand.con)

        if (MODE === 'dev') {
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
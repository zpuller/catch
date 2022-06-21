import * as THREE from 'three'
import { HTMLMesh } from 'three/examples/jsm/interactive/HTMLMesh'

import Gui from './Gui'
import Inputs from './Inputs'

import WebXR from '../WebXR'

export default class Game {
    constructor(gltfLoader, xr, scene, cameraGroup, camera, onInputsConnected, stats, controllerModels = false, hands) {

        this.inputs = new Inputs()
        this.inputs.addListener('left', 'joystick', this.movePlayer.bind(this))
        this.inputs.addListener('right', 'joystick', this.rotatePlayer.bind(this))

        this.inputs.addListener('right', 'selectStart', (() => {
            this.teleport?.startPoint(this.rightHand.con)
        }).bind(this))
        this.inputs.addListener('right', 'selectEnd', (() => {
            this.teleport?.go(this.rightHand.con)
        }).bind(this))
        this.inputs.addListener('right', 'bPressed', this.toggleGui.bind(this))


        this.leftHand = {}
        this.rightHand = {}

        const webXRConf = {
            xr,
            leftHandlers: this.inputs.leftConEventHandlers,
            rightHandlers: this.inputs.rightConEventHandlers,
            player: cameraGroup,
            onInputsConnected,
            controllerModels,
        }
        if (hands) {
            webXRConf.hands = hands
        }
        const { leftCon, rightCon, leftGrip, rightGrip } = WebXR.init(webXRConf)
        this.leftHand.con = leftCon
        this.rightHand.con = rightCon
        this.leftHand.grip = leftGrip
        this.rightHand.grip = rightGrip

        this.scene = scene

        this.player = cameraGroup

        this.positionBuffer = new THREE.Vector3()

        if (MODE === 'dev') {
            const statsMesh = new HTMLMesh(stats.dom);
            statsMesh.scale.setScalar(2.5);
            statsMesh.visible = false
            scene.add(statsMesh);

            this.statsMesh = statsMesh
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

            this.statsMesh.material.map.update()
        }
    }
}
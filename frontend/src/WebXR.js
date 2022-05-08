import * as THREE from 'three'

import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js'

import Physics from './Physics'

const buildController = (data) => {
    let geometry, material;

    switch (data.targetRayMode) {

        case 'tracked-pointer':

            geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, - 1], 3));
            geometry.setAttribute('color', new THREE.Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3));

            material = new THREE.LineBasicMaterial({ vertexColors: true, blending: THREE.AdditiveBlending });

            return new THREE.Line(geometry, material);

        case 'gaze':

            geometry = new THREE.RingGeometry(0.02, 0.04, 32).translate(0, 0, - 1);
            material = new THREE.MeshBasicMaterial({ opacity: 0.5, transparent: true });
            return new THREE.Mesh(geometry, material);

    }
}

const init = (renderer, scene, mesh) => {
    renderer.xr.enabled = true
    document.body.appendChild(VRButton.createButton(renderer))

    // Controls
    function onSelectStart() {
        this.userData.isSelecting = true
        Physics.resetBall()
    }

    function onSelectEnd() {
        this.userData.isSelecting = false
    }

    function onSqueezeStart() {
        this.userData.isSqueezing = true
        Physics.doCatch(this, mesh)
    }

    function onSqueezeEnd() {
        this.userData.isSqueezing = false
        if (this.userData.isHolding) {
            Physics.doThrow(this)
        }

        mesh.material.color.setHex(0x04f679)
        this.userData.isHolding = false
    }

    const controller1 = renderer.xr.getController(0)
    const controller2 = renderer.xr.getController(1)

    const cons = [controller1, controller2]
    cons.forEach((con) => {
        con.userData.prevPositions = Array(5).fill(Array(3).fill(0))
        con.addEventListener('selectstart', onSelectStart)
        con.addEventListener('selectend', onSelectEnd)
        con.addEventListener('squeezestart', onSqueezeStart)
        con.addEventListener('squeezeend', onSqueezeEnd)
        con.addEventListener('connected', function (event) {
            this.add(buildController(event.data))
        })
        con.addEventListener('disconnected', function () {
            this.remove(this.children[0])
        })
        scene.add(con)
    })

    const controllerModelFactory = new XRControllerModelFactory()
    const controllerGrip1 = renderer.xr.getControllerGrip(0)
    const controllerGrip2 = renderer.xr.getControllerGrip(1)

    const grips = [controllerGrip1, controllerGrip2]
    grips.forEach((grip) => {
        grip.add(controllerModelFactory.createControllerModel(grip))
        scene.add(grip)
    })

    return { controller1, controller2 }
}

const handleController = (controller) => {
    controller.userData.prevPositions = controller.userData.prevPositions.slice(1)
    controller.userData.prevPositions.push(controller.position.toArray())
}

const handleInputs = (renderer) => {
    const inputs = renderer.xr.getSession()?.inputSources;
    if (inputs) {
        for (const source of inputs) {
            // console.log(source.handedness)
            // console.log(source.gamepad.axes)
            // for (const button of source.gamepad.buttons) {
            //     console.log(button)
            // }
        }
    }
}

export default { init, handleController, handleInputs }

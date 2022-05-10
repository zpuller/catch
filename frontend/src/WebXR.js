import * as THREE from 'three'

import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js'


const buildController = (data) => {
    let geometry, material
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

const buildNewPlayer = (renderer) => {
    const group = new THREE.Group()

    const controllerModelFactory = new XRControllerModelFactory()

    const leftGrip = controllerModelFactory.createControllerModel(renderer.xr.getControllerGrip(0))
    leftGrip.position.set(-.5, 1.5, -1.5)
    group.add(leftGrip)

    const rightGrip = controllerModelFactory.createControllerModel(renderer.xr.getControllerGrip(1))
    rightGrip.position.set(.5, 1.5, -1.5)
    group.add(rightGrip)

    group.position.set(0, 0, -3)
    group.rotateY(Math.PI)

    return group
}

const init = (renderer, handlers, player) => {
    renderer.xr.enabled = true
    document.body.appendChild(VRButton.createButton(renderer))

    const controller1 = renderer.xr.getController(0)
    const controller2 = renderer.xr.getController(1)

    const cons = [controller1, controller2]
    cons.forEach(con => {
        player.add(con)
        con.userData.prevPositions = Array(5).fill(Array(3).fill(0))

        con.addEventListener('selectstart', handlers.onSelectStart)
        con.addEventListener('selectend', handlers.onSelectEnd)
        con.addEventListener('squeezestart', handlers.onSqueezeStart)
        con.addEventListener('squeezeend', handlers.onSqueezeEnd)

        con.addEventListener('connected', function (event) {
            this.add(buildController(event.data))
        })
        con.addEventListener('disconnected', function () {
            this.remove(this.children[0])
        })
    })

    const controllerModelFactory = new XRControllerModelFactory()
    const grips = [renderer.xr.getControllerGrip(0), renderer.xr.getControllerGrip(1)]
    grips.forEach(grip => {
        grip.add(controllerModelFactory.createControllerModel(grip))
        player.add(grip)
    })

    return { controller1, controller2 }
}

export default { init, buildNewPlayer }

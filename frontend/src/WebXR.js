import * as THREE from 'three'

import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js'

const buildController = (data) => {
    switch (data.targetRayMode) {

        case 'tracked-pointer':
            const pointGeometry = new THREE.BufferGeometry();
            pointGeometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, .1, 0, 0, - .4], 3));
            pointGeometry.setAttribute('color', new THREE.Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3));
            const pointMaterial = new THREE.LineBasicMaterial({ vertexColors: true, blending: THREE.AdditiveBlending, transparent: true, opacity: 0 });
            return new THREE.Line(pointGeometry, pointMaterial);

        case 'gaze':
            const gazeGeometry = new THREE.RingGeometry(0.02, 0.04, 32).translate(0, 0, - 1);
            const gazeMaterial = new THREE.MeshBasicMaterial({ opacity: 0.5, transparent: true });
            return new THREE.Mesh(gazeGeometry, gazeMaterial);
    }
}

let numInputs = 0

const init = (conf) => {
    const { xr, leftHandlers, rightHandlers, player, hands, onInputsConnected, controllerModels } = conf
    xr.enabled = true

    const leftCon = xr.getController(0)
    const rightCon = xr.getController(1)

    const cons = [leftCon, rightCon]
    cons.forEach(con => {
        player.add(con)
        con.userData.prevPositions = Array(10).fill(Array(3).fill(0))

        con.addEventListener('connected', function (event) {
            const c = buildController(event.data)
            c.position.set(0, 0, -.1)
            this.add(c)
            if (++numInputs == 2) {
                onInputsConnected()
            }
        })

        con.addEventListener('disconnected', function () {
            this.remove(this.children[0])
        })
    })

    leftCon.addEventListener('selectstart', leftHandlers.onSelectStart)
    leftCon.addEventListener('selectend', leftHandlers.onSelectEnd)
    leftCon.addEventListener('squeezestart', leftHandlers.onSqueezeStart)
    leftCon.addEventListener('squeezeend', leftHandlers.onSqueezeEnd)

    rightCon.addEventListener('selectstart', rightHandlers.onSelectStart)
    rightCon.addEventListener('selectend', rightHandlers.onSelectEnd)
    rightCon.addEventListener('squeezestart', rightHandlers.onSqueezeStart)
    rightCon.addEventListener('squeezeend', rightHandlers.onSqueezeEnd)

    // TODO fix
    const controllerModelFactory = new XRControllerModelFactory()
    const [leftGrip, rightGrip] = [xr.getControllerGrip(0), xr.getControllerGrip(1)]
    if (controllerModels) {
        leftGrip.add(controllerModelFactory.createControllerModel(leftGrip))
        rightGrip.add(controllerModelFactory.createControllerModel(rightGrip))
    }
    console.log(hands)
    if (hands) {
        hands.left(leftGrip)
        hands.right(rightGrip)
    }
    player.add(leftGrip)
    player.add(rightGrip)

    return { leftCon, rightCon, leftGrip, rightGrip }
}

export default { init }

import * as THREE from 'three'

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

const init = (xr, handlers, player, objects) => {
    xr.enabled = true

    const leftCon = xr.getController(0)
    const rightCon = xr.getController(1)

    rightCon.addEventListener('connected', function (event) {
        this.add(buildController(event.data))
    })

    const cons = [leftCon, rightCon]
    cons.forEach(con => {
        player.add(con)
        con.userData.prevPositions = Array(5).fill(Array(3).fill(0))

        con.addEventListener('selectstart', handlers.onSelectStart)
        con.addEventListener('selectend', handlers.onSelectEnd)
        con.addEventListener('squeezestart', handlers.onSqueezeStart)
        con.addEventListener('squeezeend', handlers.onSqueezeEnd)

        con.addEventListener('disconnected', function () {
            this.remove(this.children[0])
        })
    })

    const controllerModelFactory = new XRControllerModelFactory()
    const [leftGrip, rightGrip] = [xr.getControllerGrip(0), xr.getControllerGrip(1)]
    rightGrip.add(controllerModelFactory.createControllerModel(rightGrip))
    player.add(leftGrip)
    player.add(rightGrip)

    return { leftCon, rightCon, leftGrip, rightGrip }
}

export default { init }

import * as THREE from 'three'

import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js'

const buildController = (data) => {
    switch (data.targetRayMode) {

        case 'tracked-pointer':
            const pointGeometry = new THREE.BufferGeometry();
            pointGeometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, .1, 0, 0, - .4], 3));
            pointGeometry.setAttribute('color', new THREE.Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3));
            const pointMaterial = new THREE.LineBasicMaterial({ vertexColors: true, blending: THREE.AdditiveBlending });
            return new THREE.Line(pointGeometry, pointMaterial);

        case 'gaze':
            const gazeGeometry = new THREE.RingGeometry(0.02, 0.04, 32).translate(0, 0, - 1);
            const gazeMaterial = new THREE.MeshBasicMaterial({ opacity: 0.5, transparent: true });
            return new THREE.Mesh(gazeGeometry, gazeMaterial);
    }
}

const init = (xr, handlers, player, objects) => {
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
        })

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
    leftGrip.add(controllerModelFactory.createControllerModel(rightGrip))
    rightGrip.add(controllerModelFactory.createControllerModel(rightGrip))
    player.add(leftGrip)
    player.add(rightGrip)

    return { leftCon, rightCon, leftGrip, rightGrip }
}

export default { init }

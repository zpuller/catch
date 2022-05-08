import * as math from 'mathjs'
import * as THREE from 'three'

import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js'

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

const init = (renderer, scene, mesh, timeframes, velocity) => {
    renderer.xr.enabled = true
    document.body.appendChild(VRButton.createButton(renderer))

    // Controls
    function onSelectStart() {
        this.userData.isSelecting = true
        mesh.position.fromArray([0, 1.6, -0.5])
        velocity.fromArray([0, 0, 0])
    }

    function onSelectEnd() {
        this.userData.isSelecting = false
    }

    function onSqueezeStart() {
        this.userData.isSqueezing = true
        let distance = this.position.distanceTo(mesh.position)
        if (distance < 0.2) {
            this.userData.isHolding = true
            mesh.material.color.setHex(0xffffff)
        }
    }

    function onSqueezeEnd() {
        this.userData.isSqueezing = false
        if (this.userData.isHolding) {
            function linearRegressionQuadratic(positions, frametimes) {
                const X = frametimes.map((t) => [1, t, t * t]);
                const Xt = math.transpose(X);
                const theta = math.multiply(math.multiply(math.inv(math.multiply(Xt, X)), Xt), positions);
                return theta;
            }

            const frametimes = Array(5).fill(0)
            frametimes[0] = timeframes[0]
            let ks = [...frametimes.keys()]
            ks.slice(1).forEach((i) => {
                frametimes[i] = frametimes[i - 1] + timeframes[i]
            })
            const theta = linearRegressionQuadratic(this.userData.prevPositions, frametimes)

            velocity.fromArray(theta[1])
            velocity.multiplyScalar(0.01)
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

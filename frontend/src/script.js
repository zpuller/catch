import './style.css'
import * as THREE from 'three'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Client from './Client/Client'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js'

let renderer, scene, camera
let controller1, controller2
let controllerGrip1, controllerGrip2

const init = () => {
    Client.init()

    /**
     * Base
     */
    // Canvas
    const canvas = document.querySelector('canvas.webgl')

    // Scene
    scene = new THREE.Scene()

    // Lights
    scene.add(new THREE.HemisphereLight(0x606060, 0x404040));

    const light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);

    /**
     * Object
     */
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.y = 1.6
    mesh.position.z = -2
    scene.add(mesh)

    /**
     * Sizes
     */
    const sizes = {
        width: window.innerWidth,
        height: window.innerHeight
    }

    window.addEventListener('resize', () => {
        // Update sizes
        sizes.width = window.innerWidth
        sizes.height = window.innerHeight

        // Update camera
        camera.aspect = sizes.width / sizes.height
        camera.updateProjectionMatrix()

        // Update renderer
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    })

    /**
     * Fullscreen
     */
    window.addEventListener('dblclick', () => {
        const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement

        if (!fullscreenElement) {
            if (canvas.requestFullscreen) {
                canvas.requestFullscreen()
            }
            else if (canvas.webkitRequestFullscreen) {
                canvas.webkitRequestFullscreen()
            }
        }
        else {
            if (document.exitFullscreen) {
                document.exitFullscreen()
            }
            else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen()
            }
        }
    })

    /**
     * Camera
     */
    // Base camera
    camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
    camera.position.y = 1.60
    scene.add(camera)

    // Controls
    // const controls = new OrbitControls(camera, canvas)
    // controls.enableDamping = true

    /**
     * Renderer
     */
    renderer = new THREE.WebGLRenderer({
        canvas: canvas
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    /**
     * VR
     */
    renderer.xr.enabled = true
    document.body.appendChild(VRButton.createButton(renderer))

    function onSelectStart() {
        this.userData.isSelecting = true
    }

    function onSelectEnd() {
        this.userData.isSelecting = false
    }

    function onSqueezeStart() {
        this.userData.isSqueezing = true
    }

    function onSqueezeEnd() {
        this.userData.isSqueezing = false
    }

    controller1 = renderer.xr.getController(0)
    controller2 = renderer.xr.getController(1)

    const cons = [controller1, controller2]
    cons.forEach((con) => {
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
    controllerGrip1 = renderer.xr.getControllerGrip(0)
    controllerGrip2 = renderer.xr.getControllerGrip(1)

    const grips = [controllerGrip1, controllerGrip2]
    grips.forEach((grip) => {
        grip.add(controllerModelFactory.createControllerModel(grip))
        scene.add(grip)
    })
}

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

const handleController = (controller) => {
    if (controller.userData.isSelecting) {
        console.log('selecting')
        console.log(controller)
    }

    if (controller.userData.isSqueezing) {
        console.log('squeezing')
        console.log(controller)
    }
}

const animate = () => {
    /**
     * Animate
     */
    const clock = new THREE.Clock()

    renderer.setAnimationLoop(() => {
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
        handleController(controller1)
        handleController(controller2)

        const elapsedTime = clock.getElapsedTime()

        // Update controls
        // controls.update()

        // Render
        renderer.render(scene, camera)
    })
}

init()
animate()
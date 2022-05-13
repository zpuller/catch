import './style.css'

import * as THREE from 'three'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import Client from './Client'

import Camera from './Assets/Camera'
import Lights from './Assets/Lights'
import Renderer from './Assets/Renderer'
import Windowing from './Assets/Window'

import Game from './Game'

let cameraGroup
let renderer, scene, lights, camera
let game
let client

let controls

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const init = () => {
    const canvas = document.querySelector('canvas.webgl')

    renderer = new Renderer(canvas, sizes)

    lights = new Lights()
    camera = new Camera(sizes)

    cameraGroup = new THREE.Group()
    cameraGroup.add(camera)

    controls = new OrbitControls(camera, canvas)
    controls.target.set(0, 0.75, 0)
    controls.enableDamping = true

    scene = new THREE.Scene()
    scene.add(lights.get())
    scene.add(cameraGroup)

    Windowing.init(camera, renderer, canvas, sizes)

    client = new Client()
    setTimeout(waitForClientLogin, 100)
}

const waitForClientLogin = () => {
    if (client.id === undefined) {
        setTimeout(waitForClientLogin, 100)
    } else {
        game = new Game(renderer.xr, scene, cameraGroup, client)
        document.body.appendChild(VRButton.createButton(renderer))
        animate()
    }
}

const animate = () => {
    renderer.setAnimationLoop(() => {
        const inputs = renderer.xr.getSession()?.inputSources;
        controls.update()
        game.update(inputs)
        renderer.render(scene, camera)
    })
}

init()

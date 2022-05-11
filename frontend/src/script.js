import './style.css'

import * as THREE from 'three'

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

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const init = () => {
    const canvas = document.querySelector('canvas.webgl')

    scene = new THREE.Scene()

    lights = new Lights(scene)
    camera = new Camera(scene, sizes)
    renderer = new Renderer(canvas, sizes)

    cameraGroup = new THREE.Group()
    cameraGroup.add(camera)
    scene.add(cameraGroup)

    Windowing.init(camera, renderer, canvas, sizes)

    client = new Client()
    setTimeout(waitForClientLogin, 100)
}

const waitForClientLogin = () => {
    if (client.id === undefined) {
        setTimeout(waitForClientLogin, 100)
    } else {
        game = new Game(renderer, scene, cameraGroup, client)
        animate()
    }
}

const animate = () => {
    renderer.setAnimationLoop(() => {
        const inputs = renderer.xr.getSession()?.inputSources;
        game.update(inputs)
        renderer.render(scene, camera)
    })
}

init()

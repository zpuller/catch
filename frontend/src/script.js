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

    game = new Game(renderer, scene, cameraGroup)
}

const animate = () => {
    renderer.setAnimationLoop(() => {
        const inputs = renderer.xr.getSession()?.inputSources;
        game.update(inputs)
        renderer.render(scene, camera)
    })
}

init()
animate()

const form = document.getElementById('nameinput')
let client
form.onsubmit = (e) => {
    e.preventDefault()
    const data = new FormData(form)
    const username = data.get('username')

    client = new Client(username)
}
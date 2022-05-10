import './style.css'

import * as THREE from 'three'

import Client from './Client'

import Camera from './Assets/Camera'
import Lights from './Assets/Lights'
import Renderer from './Assets/Renderer'
import Windowing from './Assets/Window'

import Game from './Game'

let cameraGroup
let renderer, scene, camera

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const init = () => {
    const canvas = document.querySelector('canvas.webgl')

    scene = new THREE.Scene()

    Lights.init(scene)
    camera = Camera.init(scene, sizes)
    renderer = Renderer.init(canvas, sizes)

    cameraGroup = new THREE.Group()
    cameraGroup.add(camera)
    scene.add(cameraGroup)

    Windowing.init(camera, renderer, canvas, sizes)

    Game.init(renderer, scene, cameraGroup)
}

const animate = () => {
    renderer.setAnimationLoop(() => {
        const inputs = renderer.xr.getSession()?.inputSources;
        Game.update(inputs)
        renderer.render(scene, camera)
    })
}

init()
animate()

const form = document.getElementById('nameinput')
form.onsubmit = (e) => {
    e.preventDefault()
    const data = new FormData(form)
    const username = data.get('username')

    Client.init(username)
}
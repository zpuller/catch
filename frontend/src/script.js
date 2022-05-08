import './style.css'

import * as THREE from 'three'

import Client from './Client'

import Camera from './Assets/Camera'
import Lights from './Assets/Lights'
import Objects from './Assets/Objects'
import Renderer from './Assets/Renderer'
import Windowing from './Assets/Window'

import Game from './Game'

let renderer, scene, camera, mesh

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const init = () => {
    Client.init()

    const canvas = document.querySelector('canvas.webgl')

    scene = new THREE.Scene()

    Lights.init(scene)
    mesh = Objects.init(scene)
    camera = Camera.init(scene, sizes)
    renderer = Renderer.init(canvas, sizes)

    Windowing.init(camera, renderer, canvas, sizes)

    Game.init(renderer, scene, mesh)

}

const animate = () => {

    renderer.setAnimationLoop(() => {
        Game.update(renderer)
        renderer.render(scene, camera)
    })
}

init()
animate()
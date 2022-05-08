import './style.css'

import * as THREE from 'three'

import Client from './Client'

import Camera from './Assets/Camera'
import Lights from './Assets/Lights'
import Objects from './Assets/Objects'
import Renderer from './Assets/Renderer'
import Windowing from './Assets/Window'

import WebXR from './WebXR'


let renderer, scene, camera, mesh

let controller1, controller2

let timeframes = Array(5).fill(1)
let velocity = new THREE.Vector3()

const gravity = 0

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

    let res = WebXR.init(renderer, scene, mesh, timeframes, velocity)
    controller1 = res.controller1
    controller2 = res.controller2
}

const animate = () => {
    const clock = new THREE.Clock()
    let elapsedTime = clock.getElapsedTime()

    renderer.setAnimationLoop(() => {
        const prevTime = elapsedTime
        elapsedTime = clock.getElapsedTime()
        const dt = elapsedTime - prevTime
        let ks = [...timeframes.keys()].slice(1)
        ks.forEach((i) => {
            timeframes[i - 1] = timeframes[i]
        })
        timeframes[timeframes.length - 1] = dt

        velocity.y -= gravity
        mesh.position.add(velocity)

        WebXR.handleInputs(renderer)
        WebXR.handleController(controller1)
        WebXR.handleController(controller2)

        renderer.render(scene, camera)
    })
}

init()
animate()
import './style.css'

import * as THREE from 'three'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import gsap from 'gsap'

import {
    GLTFLoader
} from 'three/examples/jsm/loaders/GLTFLoader'
import {
    DRACOLoader
} from 'three/examples/jsm/loaders/DRACOLoader'

import Client from './Client'

import Camera from './Assets/Camera'
import GameLights from './Assets/BallGame/Lights'
import Renderer from './Assets/Renderer'
import Windowing from './Assets/Window'

import Apartment from './Game/Apartment/Game'

import Stats from 'three/examples/jsm/libs/stats.module'
import ApartmentObjects from './Assets/Apartment/Objects'
import Hands from './Assets/Entities/Hands'
import GameAudio from './Assets/GameAudio'
import BaseballObjects from './Assets/BallGame/BaseballObjects'
import BowlingObjects from './Assets/BallGame/BowlingObjects'
import BaseballGame from './Game/BallGame/Baseball'
import Bowling from './Game/BallGame/Bowling'

let stats

if (MODE === 'dev') {
    stats = Stats()
    document.body.appendChild(stats.dom)
}

const shaderMaterial = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
        uAlpha: { value: 1.0 },
    },
    vertexShader: `
            void main() {
                gl_Position = vec4(position, 1.0);
            }
        `,
    fragmentShader: `
            uniform float uAlpha;

            void main() {
                gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
            }
        `
})
const plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), shaderMaterial)

const waitForClientLogin = () => {
    if (client.id === undefined) {
        setTimeout(waitForClientLogin, 100)
    } else {
        document.body.appendChild(VRButton.createButton(renderer))
    }
}

let gameChoice = -1

let objects
const onLoad = () => {
    switch (gameChoice) {
        case 0:
            game = new Apartment(objects, renderer.xr, scene, cameraGroup, animateXR, stats)
            break

        case 1:
            game = new BaseballGame(objects, renderer.xr, scene, cameraGroup, client, animateXR, stats, hands, sounds)
            waitForClientLogin()
            break

        case 2:
            game = new Bowling(objects, renderer.xr, scene, cameraGroup, client, animateXR, stats, hands, sounds)
            waitForClientLogin()
            break
    }

    gsap.delayedCall(0.5, () => {
        const delay = 3
        gsap.to(shaderMaterial.uniforms.uAlpha, { duration: delay, value: 0.0 })
        gsap.delayedCall(delay, () => {
            scene.remove(plane)
        })
        loadingBarElement.classList.add('ended')
        loadingBarElement.style.transform = ''
    })
}

const loadingBarElement = document.querySelector('.loading-bar')
const onProgress = (url, loaded, total) => {
    loadingBarElement.style.transform = `scaleX(${loaded / total})`
}

const loadingManager = new THREE.LoadingManager(onLoad, onProgress)

const dracoLoader = new DRACOLoader()
const gltfLoader = new GLTFLoader(loadingManager)
dracoLoader.setDecoderPath('/draco/')
gltfLoader.setDRACOLoader(dracoLoader)

const textureLoader = new THREE.TextureLoader(loadingManager)
const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager)

let cameraGroup
let renderer, scene, lights, camera
let game
let client

let controls

let sounds

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const mode = MODE
console.log(`running in ${mode} mode`)

const init = () => {
    const canvas = document.getElementById('webgl')

    renderer = new Renderer(canvas, sizes)
    renderer.outputEncoding = THREE.sRGBEncoding

    camera = new Camera(sizes)

    cameraGroup = new THREE.Group()
    cameraGroup.add(camera)

    controls = new OrbitControls(camera, canvas)
    controls.target.set(0, 1.6, -1)
    controls.enableDamping = true

    scene = new THREE.Scene()
    scene.add(cameraGroup)

    Windowing.init(camera, renderer, canvas, sizes)

    const overlay = document.getElementById('overlay')
    overlay.width = sizes.width
    overlay.height = sizes.height
    const ctx = overlay.getContext('2d')
    ctx.strokeStyle = 'black'
    ctx.font = '18px Arial'
    const buttonSizes = {
        width: 128,
        height: 64,
    }
    const dim = 128
    const xBuf = 0.5
    const yBuf = 0.3

    const drawButton = (r, s) => {
        ctx.fillStyle = '#1fa3ef'
        ctx.fillRect(dim, r * dim, buttonSizes.width, buttonSizes.height)
        ctx.strokeRect(dim, r * dim, buttonSizes.width, buttonSizes.height)
        const w = ctx.measureText(s).width
        ctx.fillStyle = '#000000'
        ctx.fillText(s, (1 + xBuf) * dim - 0.5 * w, (r + yBuf) * dim)
    }
    drawButton(1, 'Apartment')
    drawButton(2, 'Baseball')
    drawButton(3, 'Bowling')

    const inBounds = (r, x, y) => x >= dim && x < 2 * dim && y >= r * dim && y < (r + 0.5) * dim

    const clearOverlay = () => {
        ctx.clearRect(0, 0, sizes.width, sizes.height)
        overlay.width = 0
    }

    overlay.addEventListener('click', e => {
        const x = e.clientX
        const y = e.clientY
        if (inBounds(1, x, y)) {
            clearOverlay()
            launchApartment()
        }
        if (inBounds(2, x, y)) {
            clearOverlay()
            launchBaseball()
        }
        if (inBounds(3, x, y)) {
            clearOverlay()
            launchBowling()
        }
    })

    plane.position.copy(camera)

    scene.add(plane)

    animate()
}

let hands
const launchBallGame = () => {
    client = new Client()
    sounds = new GameAudio(camera, loadingManager)
    hands = new Hands(gltfLoader)

    lights = new GameLights()
    scene.add(lights.get())
}

const launchBaseball = () => {
    gameChoice = 1
    objects = new BaseballObjects(gltfLoader, scene)
    launchBallGame()
}

const launchBowling = () => {
    gameChoice = 2
    objects = new BowlingObjects(gltfLoader, scene)
    launchBallGame()
}

const launchApartment = () => {
    gameChoice = 0
    objects = new ApartmentObjects(gltfLoader, scene, textureLoader, cubeTextureLoader)
    document.body.appendChild(VRButton.createButton(renderer))
}

const animate = () => {
    renderer.setAnimationLoop(() => {
        controls.update()
        renderer.render(scene, camera)
        // console.log(renderer.info.render.calls)

        if (MODE === 'dev') {
            stats.update()
        }
    })
}

const animateXR = () => {
    game.startXRSession(renderer.xr)
    // console.log(renderer.info)
    const inputs = renderer.xr.getSession().inputSources;
    renderer.setAnimationLoop(() => {
        game.update(inputs)
        renderer.render(scene, camera)
        if (MODE === 'dev') {
            stats.update()
        }
    })
}

init()

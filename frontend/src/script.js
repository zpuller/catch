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
import BallGame from './Game/BallGame/Game'

import Stats from 'three/examples/jsm/libs/stats.module'
import ApartmentObjects from './Assets/Apartment/Objects'
import BallGameObjects from './Assets/BallGame/Objects'
import Hands from './Assets/Entities/Hands'
import GameAudio from './Assets/GameAudio'

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

const waitForClientLogin = () => {
    if (client.id === undefined) {
        setTimeout(waitForClientLogin, 100)
    } else {
        game = new BallGame(objects, gltfLoader, renderer.xr, scene, cameraGroup, client, camera, animateXR, stats, hands, sounds)
        document.body.appendChild(VRButton.createButton(renderer))
    }
}

let gameChoice = -1

let objects
const onLoad = () => {
    switch (gameChoice) {
        case 0:
            game = new Apartment(objects, gltfLoader, renderer.xr, scene, cameraGroup, camera, animateXR, stats)
            break

        case 1:
            waitForClientLogin()
            break
    }

    gsap.delayedCall(0.5, () => {
        gsap.to(shaderMaterial.uniforms.uAlpha, { duration: 3, value: 0.0 })
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
    drawButton(2, 'Ball Game')

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
            launchBallGame()
        }
    })

    const plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), shaderMaterial)
    plane.position.copy(camera)

    scene.add(plane)

    animate()
}

let hands
const launchBallGame = () => {
    gameChoice = 1
    client = new Client()
    objects = new BallGameObjects(gltfLoader)
    objects.buildRoom(scene)
    sounds = new GameAudio(camera, loadingManager)
    hands = new Hands(gltfLoader)

    lights = new GameLights()
    scene.add(lights.get())
}

const launchApartment = () => {
    gameChoice = 0
    objects = new ApartmentObjects(gltfLoader, textureLoader, cubeTextureLoader)
    objects.buildRoom(scene)
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

import * as THREE from 'three'
import * as CANNON from 'cannon-es'

import { ShapeType, threeToCannon } from 'three-to-cannon'
import Utils from '../Utils'

const cubeTextureLoader = new THREE.CubeTextureLoader()

const video = document.getElementById("vid")
video.play()
const videoTexture = new THREE.VideoTexture(video)
const videoMeshMaterial = new THREE.MeshBasicMaterial({ map: videoTexture })

const gripGeometry = new THREE.SphereGeometry(0.025, 16, 16)
const gripMaterial = new THREE.MeshBasicMaterial({ color: '#ffffff' })

const ballGeometry = new THREE.SphereGeometry(0.04, 16, 16)
const ballMaterial = new THREE.MeshBasicMaterial({ wireframe: true })

// const envNum = '1'
const environmentMap = cubeTextureLoader.load([
    'https://res.cloudinary.com/hack-reactor888/image/upload/v1653629023/zachGame/envMaps/px_vgn0hu.jpg',
    'https://res.cloudinary.com/hack-reactor888/image/upload/v1653629023/zachGame/envMaps/nx_domm6q.jpg',
    'https://res.cloudinary.com/hack-reactor888/image/upload/v1653629023/zachGame/envMaps/py_dgjjzf.jpg',
    'https://res.cloudinary.com/hack-reactor888/image/upload/v1653629023/zachGame/envMaps/ny_s7bcwa.jpg',
    'https://res.cloudinary.com/hack-reactor888/image/upload/v1653629023/zachGame/envMaps/pz_w4b9lw.jpg',
    'https://res.cloudinary.com/hack-reactor888/image/upload/v1653629023/zachGame/envMaps/nz_uxnx3c.jpg',
    // '/textures/environmentMaps/' + envNum + '/px.jpg',
    // '/textures/environmentMaps/' + envNum + '/nx.jpg',
    // '/textures/environmentMaps/' + envNum + '/py.jpg',
    // '/textures/environmentMaps/' + envNum + '/ny.jpg',
    // '/textures/environmentMaps/' + envNum + '/pz.jpg',
    // '/textures/environmentMaps/' + envNum + '/nz.jpg'
])

environmentMap.encoding = THREE.sRGBEncoding

const createBody = (o, physics, handler) => {
    const body = new CANNON.Body({
        type: CANNON.Body.STATIC,
    })
    const p = o.getWorldPosition(new THREE.Vector3())
    body.position.copy(p)
    body.quaternion.copy(o.quaternion)

    const { shape } = threeToCannon(o, { type: ShapeType.BOX })
    body.addShape(shape)
    if (handler) {
        body.addEventListener('collide', handler)
    }
    // physics.world.addBody(body)
}

const onLoad = (scene, physics, handler) => gltf => {
    // gltf.scene.matrixAutoUpdate = false
    scene.add(gltf.scene)
    gltf.scene.traverse(o => {
        if (o.type === 'Mesh') {
            createBody(o, physics, handler)
        }
    })
}

const textureLoader = new THREE.TextureLoader()

const loadTextureMaterial = path => {
    const tex = textureLoader.load(path)
    const mat = new THREE.MeshBasicMaterial()
    mat.map = tex
    tex.encoding = THREE.sRGBEncoding
    tex.flipY = false

    return mat
}

const floorMat = loadTextureMaterial('textures/baked.jpg')
const roomMat1 = loadTextureMaterial('textures/baked1.jpg')
const roomMat2 = loadTextureMaterial('textures/baked2.jpg')
const roomMat3 = loadTextureMaterial('textures/baked3.jpg')
const roomMat4 = loadTextureMaterial('textures/baked4.jpg')
const roomMat5 = loadTextureMaterial('textures/baked5.jpg')
const roomMat6 = loadTextureMaterial('textures/baked6.jpg')
const roomMat7 = loadTextureMaterial('textures/baked7.jpg')

// global local/uploaded option
export default class Objects {
    constructor(gltfLoader, physics) {
        this.gltfLoader = gltfLoader
        this.physics = physics
        this.video = video
    }

    // TODO move to sep. classes
    buildRoom(scene, tvSound, handlers) {
        scene.background = environmentMap
        // scene.environment = environmentMap

        this.gltfLoader.load('models/floor.glb', gltf => {
            onLoad(scene, this.physics)(gltf)
            this.floor = gltf.scene.children.find(o => o.name === 'floor')
            this.floor.material.dispose()
            this.floor.material = floorMat
        })

        const loadRoomComponent = (path, meshName, mat) => {
            this.gltfLoader.load(path, gltf => {
                onLoad(scene, this.physics)(gltf)
                const mesh = gltf.scene.children.find(o => o.name === meshName)
                mesh.material.dispose()
                mesh.material = mat
            })
        }

        loadRoomComponent('models/room.glb', 'baked', floorMat)
        loadRoomComponent('models/room1.glb', 'baked1', roomMat1)
        loadRoomComponent('models/room2.glb', 'baked2', roomMat2)
        loadRoomComponent('models/room3.glb', 'baked3', roomMat3)
        loadRoomComponent('models/room4.glb', 'baked4', roomMat4)
        loadRoomComponent('models/room5.glb', 'baked5', roomMat5)
        loadRoomComponent('models/room6.glb', 'baked6', roomMat6)
        loadRoomComponent('models/room7.glb', 'baked7', roomMat7)

        this.gltfLoader.load('models/doors.glb', gltf => {
            onLoad(scene, this.physics)(gltf)
        })
        this.gltfLoader.load('models/screen.glb', (gltf) => {
            onLoad(scene, this.physics, handlers.tv)(gltf)
            const screen = gltf.scene.children[0]
            screen.material.dispose()
            screen.material = videoMeshMaterial
            this.screen = gltf.scene
            // this.screen.sound = tvSound
            // this.screen.add(tvSound)

            this.screen.visible = true
        })
        this.gltfLoader.load('models/screen_broken.glb', gltf => {
            this.screenBroken = gltf.scene
        })
    }

    buildBall(ball, scene, sound) {
        ball.mesh = new THREE.Mesh(ballGeometry, ballMaterial)
        scene.add(ball.mesh)

        this.gltfLoader.load(
            // 'https://res.cloudinary.com/hack-reactor888/image/upload/v1652594431/zachGame/baseball.glb',
            'models/baseball.glb',
            (gltf) => {
                scene.remove(ball.mesh)
                ball.mesh = gltf.scene
                ball.mesh.position.y = 10
                ball.mesh.traverse(o => {
                    if (o.type === 'Mesh') {
                        const oldMaterial = o.material
                        o.material = Utils.swapToLambertMat(oldMaterial)
                    }
                })
                scene.add(ball.mesh)
                // ball.mesh.add(sound)
                // ball.sound = sound
            }
        )
    }

    buildGlove(group) {
        this.gltfLoader.load(
            'https://res.cloudinary.com/hack-reactor888/image/upload/v1652647643/zachGame/glove.glb',
            (gltf) => {
                gltf.scene.scale.set(0.05, 0.05, 0.05)
                gltf.scene.rotateX(Math.PI * -0.5)
                gltf.scene.rotateY(Math.PI * 0.5)
                gltf.scene.rotateX(Math.PI * 0.2)
                gltf.scene.rotateY(Math.PI * -0.2)
                group.add(gltf.scene)
            }
        )
    }

    buildNewPlayer() {
        const group = new THREE.Group()

        const leftGrip = new THREE.Mesh(gripGeometry, gripMaterial)
        const rightGrip = new THREE.Mesh(gripGeometry, gripMaterial)
        group.add(leftGrip)
        group.add(rightGrip)

        return group
    }
}
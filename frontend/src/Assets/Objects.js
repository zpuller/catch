import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { Float32BufferAttribute, Vector2 } from 'three'

import * as dat from 'lil-gui'
import { ShapeType, threeToCannon } from 'three-to-cannon'

const gui = new dat.GUI()

const cubeTextureLoader = new THREE.CubeTextureLoader()

const video = document.getElementById("vid")
video.play()
const videoTexture = new THREE.VideoTexture(video)
const videoMesh = new THREE.MeshBasicMaterial({ map: videoTexture })

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
    body.position.copy(o.position)
    body.quaternion.copy(o.quaternion)

    const { shape } = threeToCannon(o, { type: ShapeType.BOX })
    body.addShape(shape)
    if (handler) {
        console.log(handler)
        body.addEventListener('collide', handler)
    }
    physics.world.addBody(body)
}

const onLoad = (scene, physics, handler) => gltf => {
    gltf.scene.matrixAutoUpdate = false
    scene.add(gltf.scene)
    gltf.scene.children.forEach(o => {
        createBody(o, physics, handler)
    })
}

export default class Objects {
    constructor(gltfLoader, physics) {
        this.gltfLoader = gltfLoader
        this.physics = physics
        this.video = video
    }

    // TODO move to sep. classes
    buildRoom(scene, tvSound, handlers) {
        scene.background = environmentMap
        scene.environment = environmentMap

        // this.gltfLoader.load('https://res.cloudinary.com/hack-reactor888/image/upload/v1654396923/zachGame/room_xctn0b.glb', (gltf) => {
        this.gltfLoader.load('models/room.glb', (gltf) => {
            onLoad(scene, this.physics)(gltf)
            this.floor = gltf.scene.children.find(o => o.name === 'Plane')
            const s = 10
            this.floor.material.normalScale = new Vector2(s, -s)
            this.floor.material.needsUpdate = true
            const debugObj = { scale: 14.0 }
            gui.add(debugObj, 'scale').min(0.0).max(20.0).step(.1).onChange(() => {
                const s = debugObj.scale
                this.floor.material.normalScale = new Vector2(s, -s)
                this.floor.material.needsUpdate = true
            })
        })
        // this.gltfLoader.load('https://res.cloudinary.com/hack-reactor888/image/upload/v1654396991/zachGame/furniture_go3x2t.glb', onLoad(scene))
        this.gltfLoader.load('models/furniture.glb', gltf => {
            onLoad(scene, this.physics)(gltf)
            gltf.scene.traverse(o => {
                if (o.name === 'Cube001') {
                    o.material.roughness = 10
                }
            })
        })
        this.gltfLoader.load('https://res.cloudinary.com/hack-reactor888/image/upload/v1654396861/zachGame/plant_tfepom.glb', onLoad(scene, this.physics))
        this.gltfLoader.load('models/picture.glb', onLoad(scene, this.physics))
        this.gltfLoader.load('https://res.cloudinary.com/hack-reactor888/image/upload/v1654403415/zachGame/building_yfebqa.glb', onLoad(scene, this.physics))
        this.gltfLoader.load('models/screen.glb', (gltf) => {
            onLoad(scene, this.physics, handlers.tv)(gltf)
            gltf.scene.children[0].material = videoMesh
            this.screen = gltf.scene
            this.screen.sound = tvSound
            this.screen.add(tvSound)

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
            'https://res.cloudinary.com/hack-reactor888/image/upload/v1652594431/zachGame/baseball.glb',
            (gltf) => {
                scene.remove(ball.mesh)
                ball.mesh = gltf.scene
                ball.mesh.position.y = 10
                scene.add(ball.mesh)
                ball.mesh.add(sound)
                ball.sound = sound
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
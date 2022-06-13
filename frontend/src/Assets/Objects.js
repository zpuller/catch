import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { Float32BufferAttribute, Vector2 } from 'three'

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
    physics.world.addBody(body)
}

const onLoad = (scene, physics, handler) => gltf => {
    gltf.scene.matrixAutoUpdate = false
    scene.add(gltf.scene)
    gltf.scene.traverse(o => {
        if (o.type === 'Mesh') {
            createBody(o, physics, handler)
        }
    })
}

const swapObjectMat = (gltf, name, matType) => {
    const obj = gltf.scene.children.find(c => c.name === name)
    const isMesh = obj.type === 'Mesh'
    const oldMaterial = isMesh ? obj.material : obj.children[0].material
    let newMat
    switch (matType) {
        case 'lambert':
            newMat = Utils.swapToLambertMat(oldMaterial)
            break

        case 'phong':
            newMat = Utils.swapToPhongMat(oldMaterial)
            break

        case 'basic':
            newMat = Utils.swapToBasicMat(oldMaterial)
            break

        default:
            console.error('mat type not found!')
    }
    if (isMesh) {
        obj.material = newMat
    } else {
        obj.children.forEach(c => c.material = newMat)
    }
}

// global local/uploaded option
export default class Objects {
    constructor(gltfLoader, physics) {
        this.gltfLoader = gltfLoader
        this.physics = physics
        this.video = video
    }

    // TODO move to sep. classes
    buildRoom(scene, tvSound, handlers) {
        // draws: ~4
        scene.background = environmentMap
        // frames: 20
        // scene.environment = environmentMap

        // draws: 22
        // this.gltfLoader.load('https://res.cloudinary.com/hack-reactor888/image/upload/v1655006749/zachGame/room_xoxpqr.glb', (gltf) => {
        this.gltfLoader.load('models/room.glb', (gltf) => {
            onLoad(scene, this.physics)(gltf)
            this.floor = gltf.scene.children.find(o => o.name === 'Plane')
            console.log(this.floor)
            // this.floor.receiveShadow = true
            console.log(THREE.sRGBEncoding)
            swapObjectMat(gltf, 'Plane', 'basic')
            const s = 10
            this.floor.material.normalScale = new Vector2(s, -s)
            this.floor.material.needsUpdate = true
        })
        this.gltfLoader.load('models/furniture.glb', gltf => {
            onLoad(scene, this.physics)(gltf)
            swapObjectMat(gltf, 'couch', 'lambert')
            swapObjectMat(gltf, 'fan_light', 'basic')
            swapObjectMat(gltf, 'bench', 'lambert')
            swapObjectMat(gltf, 'bench_legs', 'lambert')
            swapObjectMat(gltf, 'tv', 'lambert')
            swapObjectMat(gltf, 'tv_legs', 'lambert')
            swapObjectMat(gltf, 'tv_stand_cabinet', 'lambert')
            swapObjectMat(gltf, 'tv_stand_legs', 'lambert')
        })
        // this.gltfLoader.load('https://res.cloudinary.com/hack-reactor888/image/upload/v1654396861/zachGame/plant_tfepom.glb', onLoad(scene, this.physics))
        // this.gltfLoader.load('https://res.cloudinary.com/hack-reactor888/image/upload/v1655006748/zachGame/picture_ox10d0.glb', onLoad(scene, this.physics))
        // this.gltfLoader.load('https://res.cloudinary.com/hack-reactor888/image/upload/v1654403415/zachGame/building_yfebqa.glb', onLoad(scene, this.physics))
        // this.gltfLoader.load('https://res.cloudinary.com/hack-reactor888/image/upload/v1655006748/zachGame/screen_mbbm8z.glb', (gltf) => {
        this.gltfLoader.load('models/screen.glb', (gltf) => {
            onLoad(scene, this.physics, handlers.tv)(gltf)
            const screen = gltf.scene.children[0]
            screen.material.dispose()
            screen.material = videoMeshMaterial
            this.screen = gltf.scene
            this.screen.sound = tvSound
            this.screen.add(tvSound)

            this.screen.visible = true
        })
        // this.gltfLoader.load('https://res.cloudinary.com/hack-reactor888/image/upload/v1655006748/zachGame/screen_broken_o2sbwa.glb', gltf => {
        this.gltfLoader.load('models/screen_broken.glb', gltf => {
            this.screenBroken = gltf.scene
        })
    }

    // 4 draw calls, 20 fps
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
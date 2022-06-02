import * as THREE from 'three'

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

export default class Objects {
    constructor(gltfLoader) {
        this.gltfLoader = gltfLoader
        this.video = video
    }

    // move to sep. classes
    buildRoom(scene, tvSound) {
        scene.background = environmentMap
        scene.environment = environmentMap

        this.gltfLoader.load('https://res.cloudinary.com/hack-reactor888/image/upload/v1653634116/zachGame/room_avs9ju.glb', (gltf) => {
            gltf.scene.matrixAutoUpdate = false
            scene.add(gltf.scene)
            gltf.scene.traverse(o => {
                if (o.name === "Plane") {
                    this.floor = o
                }
            })
        })
        this.gltfLoader.load('https://res.cloudinary.com/hack-reactor888/image/upload/v1653634116/zachGame/picture_byydt0.glb', (gltf) => {
            gltf.scene.matrixAutoUpdate = false
            scene.add(gltf.scene)
        })
        this.gltfLoader.load('https://res.cloudinary.com/hack-reactor888/image/upload/v1653634116/zachGame/screen_khzwhi.glb', (gltf) => {
            gltf.scene.matrixAutoUpdate = false
            gltf.scene.children[0].material = videoMesh
            this.screen = gltf.scene
            this.screen.sound = tvSound
            this.screen.add(tvSound)
            scene.add(gltf.scene)
        })
        this.gltfLoader.load('https://res.cloudinary.com/hack-reactor888/image/upload/v1654148966/zachGame/screen_broken_byifr2.glb', gltf => {
            this.screenBroken = gltf.scene
        })
        this.gltfLoader.load('https://res.cloudinary.com/hack-reactor888/image/upload/v1653634116/zachGame/furniture_y26s1v.glb', (gltf) => {
            gltf.scene.matrixAutoUpdate = false
            scene.add(gltf.scene)
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
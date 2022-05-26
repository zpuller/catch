import * as THREE from 'three'

const cubeTextureLoader = new THREE.CubeTextureLoader()

const envNum = '1'
const environmentMap = cubeTextureLoader.load([
    '/textures/environmentMaps/' + envNum + '/px.jpg',
    '/textures/environmentMaps/' + envNum + '/nx.jpg',
    '/textures/environmentMaps/' + envNum + '/py.jpg',
    '/textures/environmentMaps/' + envNum + '/ny.jpg',
    '/textures/environmentMaps/' + envNum + '/pz.jpg',
    '/textures/environmentMaps/' + envNum + '/nz.jpg'
])

environmentMap.encoding = THREE.sRGBEncoding

// TODO real hands (incl. multiplayer)
export default class Objects {
    constructor(gltfLoader) {
        this.gltfLoader = gltfLoader
    }

    buildRoom(scene) {
        scene.background = environmentMap
        // scene.environment = environmentMap

        this.gltfLoader.load(
            'models/room.glb',
            (gltf) => {
                scene.add(gltf.scene)
            }
        )
    }

    buildBall(ball, scene) {
        const geometry = new THREE.SphereGeometry(0.04, 16, 16)
        // TODO consolidate materials
        const material = new THREE.MeshBasicMaterial({ wireframe: true })
        ball.mesh = new THREE.Mesh(geometry, material)
        scene.add(ball.mesh)

        this.gltfLoader.load(
            'https://res.cloudinary.com/hack-reactor888/image/upload/v1652594431/myUploads/baseball.glb',
            (gltf) => {
                scene.remove(ball.mesh)
                ball.mesh = gltf.scene
                scene.add(ball.mesh)
            }
        )
    }

    buildGlove(group) {
        this.gltfLoader.load(
            'https://res.cloudinary.com/hack-reactor888/image/upload/v1652647643/myUploads/glove.glb',
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

        const geometry = new THREE.SphereGeometry(0.025, 16, 16)
        const material = new THREE.MeshBasicMaterial({ color: '#ffffff' })

        const leftGrip = new THREE.Mesh(geometry, material)
        group.add(leftGrip)

        const rightGrip = new THREE.Mesh(geometry, material)
        group.add(rightGrip)

        return group
    }
}
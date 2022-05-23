import * as THREE from 'three'
import * as CANNON from 'cannon-es'

// TODO consolidate
import {
    GLTFLoader
} from 'three/examples/jsm/loaders/GLTFLoader'
const gltfLoader = new GLTFLoader()

export default class Couch {
    constructor(position, scene) {
        const geometry = new THREE.BoxGeometry(1, 1, 1)
        const material = new THREE.MeshBasicMaterial({ wireframe: true })
        this.mesh = new THREE.Mesh(geometry, material)

        const sleepSpeed = 1.0
        const sleepTime = 1.0

        this.bodies = [
            new CANNON.Body({
                mass: 1000,
                shape: new CANNON.Box(new CANNON.Vec3(1.6, .5, .5)),
                position: new CANNON.Vec3(position.x, position.y, position.z - .5),
                sleepSpeedLimit: sleepSpeed,
                sleepTimeLimit: sleepTime,
            }),
            new CANNON.Body({
                mass: 1000,
                shape: new CANNON.Box(new CANNON.Vec3(.5, .5, .5)),
                position: new CANNON.Vec3(position.x + 1, position.y, position.z + .7),
                sleepSpeedLimit: sleepSpeed,
                sleepTimeLimit: sleepTime,
            }),
            new CANNON.Body({
                mass: 1000,
                shape: new CANNON.Box(new CANNON.Vec3(.5, .25, .5)),
                position: new CANNON.Vec3(position.x - 1.1, position.y, position.z + 1.1),
                sleepSpeedLimit: sleepSpeed,
                sleepTimeLimit: sleepTime,
            }),
        ]
        this.constraints = []

        gltfLoader.load(
            'models/couch.glb',
            (gltf) => {
                const scale = 1.0
                gltf.scene.scale.set(scale, scale, scale)
                scene.remove(this.mesh)
                this.mesh = gltf.scene
                scene.add(this.mesh)
            }
        )
    }
}
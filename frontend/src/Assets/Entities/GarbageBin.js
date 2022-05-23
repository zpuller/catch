import * as THREE from 'three'
import * as CANNON from 'cannon-es'

// TODO consolidate
import {
    GLTFLoader
} from 'three/examples/jsm/loaders/GLTFLoader'
const gltfLoader = new GLTFLoader()

export default class GarbageBin {
    constructor(position, scene) {
        const geometry = new THREE.BoxGeometry(1, 1, 1)
        const material = new THREE.MeshBasicMaterial({ wireframe: true })
        this.mesh = new THREE.Mesh(geometry, material)

        // Note: these are all half extents
        const w = .2
        const h = .25
        const t = .01 // thickness

        const m = 5

        const sleepSpeed = 1.0
        const sleepTime = 1.0

        this.bodies = [
            new CANNON.Body({
                mass: m,
                shape: new CANNON.Box(new CANNON.Vec3(w, t, w)),
                position: new CANNON.Vec3(position.x, position.y, position.z),
                sleepSpeedLimit: sleepSpeed,
                sleepTimeLimit: sleepTime,
            }),
            new CANNON.Body({
                mass: m,
                shape: new CANNON.Box(new CANNON.Vec3(w, h, t)),
                position: new CANNON.Vec3(position.x, position.y + h, position.z - w),
                sleepSpeedLimit: sleepSpeed,
                sleepTimeLimit: sleepTime,
            }),
            new CANNON.Body({
                mass: m,
                shape: new CANNON.Box(new CANNON.Vec3(w, h, t)),
                position: new CANNON.Vec3(position.x, position.y + h, position.z + w),
                sleepSpeedLimit: sleepSpeed,
                sleepTimeLimit: sleepTime,
            }),
            new CANNON.Body({
                mass: m,
                shape: new CANNON.Box(new CANNON.Vec3(t, h, w)),
                position: new CANNON.Vec3(position.x - w, position.y + h, position.z),
                sleepSpeedLimit: sleepSpeed,
                sleepTimeLimit: sleepTime,
            }),
            new CANNON.Body({
                mass: m,
                shape: new CANNON.Box(new CANNON.Vec3(t, h, w)),
                position: new CANNON.Vec3(position.x + w, position.y + h, position.z),
                sleepSpeedLimit: sleepSpeed,
                sleepTimeLimit: sleepTime,
            }),
        ]
        this.bodies.forEach(b => b.addEventListener("wakeup", e => { this.bodies.forEach(b => b.wakeUp()) }))

        const ixs = [...Array(4).keys()]
        this.constraints = ixs.map(i => new CANNON.LockConstraint(this.bodies[i], this.bodies[i + 1]))

        gltfLoader.load(
            'models/garbage_bin.glb',
            (gltf) => {
                const scale = 0.2
                gltf.scene.scale.set(scale, scale, scale)
                scene.remove(this.mesh)
                this.mesh = gltf.scene
                scene.add(this.mesh)
            }
        )
    }
}
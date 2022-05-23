import * as THREE from 'three'
import * as CANNON from 'cannon-es'

export default class GarbageBin {
    constructor(position, scene, gltfLoader) {
        const geometry = new THREE.BoxGeometry(1, 1, 1)
        const material = new THREE.MeshBasicMaterial({ wireframe: true })
        this.mesh = new THREE.Mesh(geometry, material)

        // Note: these are all half extents
        const w = .16
        const h = .25
        const t = .015 // thickness

        const spread = 1.1 * w
        const quatAngle = .0261769
        const quatW = 0.9996573

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
                position: new CANNON.Vec3(position.x, position.y + h, position.z - spread),
                quaternion: new CANNON.Quaternion(-1 * quatAngle, 0, 0, quatW),
                sleepSpeedLimit: sleepSpeed,
                sleepTimeLimit: sleepTime,
            }),
            new CANNON.Body({
                mass: m,
                shape: new CANNON.Box(new CANNON.Vec3(w, h, t)),
                position: new CANNON.Vec3(position.x, position.y + h, position.z + spread),
                quaternion: new CANNON.Quaternion(quatAngle, 0, 0, quatW),
                sleepSpeedLimit: sleepSpeed,
                sleepTimeLimit: sleepTime,
            }),
            new CANNON.Body({
                mass: m,
                shape: new CANNON.Box(new CANNON.Vec3(t, h, w)),
                position: new CANNON.Vec3(position.x - spread, position.y + h, position.z),
                quaternion: new CANNON.Quaternion(0, 0, quatAngle, quatW),
                sleepSpeedLimit: sleepSpeed,
                sleepTimeLimit: sleepTime,
            }),
            new CANNON.Body({
                mass: m,
                shape: new CANNON.Box(new CANNON.Vec3(t, h, w)),
                position: new CANNON.Vec3(position.x + spread, position.y + h, position.z),
                quaternion: new CANNON.Quaternion(0, 0, -1 * quatAngle, quatW),
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
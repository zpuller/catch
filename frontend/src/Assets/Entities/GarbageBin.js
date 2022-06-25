import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import Utils from '../../Utils'

const createBody = conf => {

    const m = 5
    const sleepSpeed = 1.0
    const sleepTime = 1.0

    const { s, p, q } = conf
    return new CANNON.Body({
        mass: m,
        shape: new CANNON.Box(new CANNON.Vec3(s.w, s.h, s.d)),
        position: new CANNON.Vec3(p.x, p.y, p.z),
        quaternion: new CANNON.Quaternion(q?.x || 0, q?.y || 0, q?.z || 0, q?.w || 1),
        sleepSpeedLimit: sleepSpeed,
        sleepTimeLimit: sleepTime,
    })
}

const createBodies = conf => conf.map(createBody)

export default class GarbageBin {
    constructor(p, scene, mesh) {
        const geometry = new THREE.BoxGeometry(1, 1, 1)
        const material = new THREE.MeshBasicMaterial({ wireframe: true })
        this.mesh = new THREE.Mesh(geometry, material)

        // Note: these are all half extents
        const w = .16
        const h = .24
        const t = .015 // thickness

        const spread = 1.1 * w
        const quatAngle = .0261769
        const quatW = 0.9996573

        this.bodies = createBodies([
            { s: { w, h: t, d: w }, p: p },
            { s: { w, h, d: t }, p: { x: p.x, y: p.y + h, z: p.z - spread }, q: { x: -1 * quatAngle, y: 0, z: 0, w: quatW } },
            { s: { w, h, d: t }, p: { x: p.x, y: p.y + h, z: p.z + spread }, q: { x: quatAngle, y: 0, z: 0, w: quatW } },
            { s: { w: t, h, d: w }, p: { x: p.x - spread, y: p.y + h, z: p.z }, q: { x: 0, y: 0, z: quatAngle, w: quatW } },
            { s: { w: t, h, d: w }, p: { x: p.x + spread, y: p.y + h, z: p.z }, q: { x: 0, y: 0, z: -1 * quatAngle, w: quatW } },
        ])
        this.bodies.forEach(b => b.addEventListener("wakeup", e => { this.bodies.forEach(b => b.wakeUp()) }))

        const ixs = [...Array(4).keys()]
        this.constraints = ixs.map(i => new CANNON.LockConstraint(this.bodies[i], this.bodies[i + 1]))

        const oldMat = mesh.material
        mesh.material = Utils.swapToLambertMat(oldMat)

        this.mesh = mesh
        this.mesh.position.copy(p)
        scene.add(this.mesh)
    }
}
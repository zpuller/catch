import * as CANNON from 'cannon-es'

const createBody = (conf) => {
    const { s, p, q } = conf
    return new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Box(new CANNON.Vec3(s.w, s.h, s.d)),
        position: new CANNON.Vec3(p.x, p.y, p.z),
        quaternion: new CANNON.Quaternion(q?.x || 0, q?.y || 0, q?.z || 0, q?.w || 1)
    })
}

const createBodies = (conf) => {
    return conf.map(createBody)
}

export default class StaticEntities {
    constructor(handlers) {
        this.bodies = createBodies([
            // Floor
            // { s: { 'w': 8, 'h': 1, 'd': 8 }, p: { 'x': 0, 'y': -1, 'z': 0 } },
        ])

        // const tv = createBody({ s: { 'w': 0.5, 'h': 0.35, 'd': 0.2 }, p: { 'x': 2.62, 'y': 1.06, 'z': 1.37 }, q: { 'x': 0, 'y': -0.976296, 'z': 0, 'w': 0.2164396 } })
        // tv.addEventListener('collide', handlers.tv)

        // this.bodies.push(tv)
    }
}
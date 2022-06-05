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
            { s: { 'w': 8, 'h': 1, 'd': 8 }, p: { 'x': 0, 'y': -1, 'z': 0 } },
            // Couch
            { s: { 'w': 1.605, 'h': 0.275, 'd': 0.525 }, p: { 'x': 2.79, 'y': 0.25, 'z': -2.95 } },
            { s: { 'w': 1.605, 'h': 0.235, 'd': 0.22 }, p: { 'x': 2.79, 'y': 0.76, 'z': -3.33 } },
            { s: { 'w': 0.53, 'h': 0.235, 'd': 1.08 }, p: { 'x': 3.83, 'y': 0.27, 'z': -2.43 } },
            { s: { 'w': 0.215, 'h': 0.53, 'd': 1.08 }, p: { 'x': 4.16, 'y': 0.48, 'z': -2.43 } },
            { s: { 'w': 0.075, 'h': 0.375, 'd': 0.5 }, p: { 'x': 1.22, 'y': 0.45, 'z': -2.94 } },
            { s: { 'w': 0.5, 'h': 0.375, 'd': 0.075 }, p: { 'x': 3.82, 'y': 0.45, 'z': -1.34 } },
            { s: { 'w': 0.5, 'h': 0.25, 'd': 0.5 }, p: { 'x': 1.6, 'y': 0.25, 'z': -1.3 } },
            // TV Stand
            { s: { 'w': 0.5, 'h': 0.425, 'd': 0.35 }, p: { 'x': 2.63, 'y': 0.35, 'z': 1.39 }, q: { 'x': -0.15304601192474365, 'y': 0.6903454661369324, 'z': -0.6903455853462219, 'w': -0.15304598212242126 } },
            // Fan
            { s: { 'w': 0.8, 'h': 0.25, 'd': 0.8 }, p: { 'x': 3, 'y': 3.7, 'z': -2 } },
            // Plant
            { s: { 'w': 0.3, 'h': 0.25, 'd': 0.3 }, p: { 'x': -4.25, 'y': 0.25, 'z': -4.25 } },
        ])

        const tv = createBody({ s: { 'w': 0.5, 'h': 0.35, 'd': 0.2 }, p: { 'x': 2.62, 'y': 1.06, 'z': 1.37 }, q: { 'x': 0, 'y': -0.976296, 'z': 0, 'w': 0.2164396 } })
        tv.addEventListener('collide', handlers.tv)

        this.bodies.push(tv)
    }
}
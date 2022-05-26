import * as CANNON from 'cannon-es'

export default class StaticEntities {
    constructor() {
        this.bodies = [
            // Floor
            this.floor = new CANNON.Body({
                type: CANNON.Body.STATIC,
                shape: new CANNON.Box(new CANNON.Vec3(8, 1, 8)),
                position: new CANNON.Vec3(0, -1, 0)
            }),
            // Couch
            new CANNON.Body({
                type: CANNON.Body.STATIC,
                shape: new CANNON.Box(new CANNON.Vec3(1.605, 0.275, 0.525)),
                position: new CANNON.Vec3(2.79, 0.25, -2.95),
                quaternion: new CANNON.Quaternion(0.0, 0.0, -0.0, 1.0)
            }),
            new CANNON.Body({
                type: CANNON.Body.STATIC,
                shape: new CANNON.Box(new CANNON.Vec3(1.605, 0.235, 0.22)),
                position: new CANNON.Vec3(2.79, 0.76, -3.33),
                quaternion: new CANNON.Quaternion(0.0, 0.0, -0.0, 1.0)
            }),
            new CANNON.Body({
                type: CANNON.Body.STATIC,
                shape: new CANNON.Box(new CANNON.Vec3(0.53, 0.235, 1.08)),
                position: new CANNON.Vec3(3.83, 0.27, -2.43),
                quaternion: new CANNON.Quaternion(0.0, 0.0, -0.0, 1.0)
            }),
            new CANNON.Body({
                type: CANNON.Body.STATIC,
                shape: new CANNON.Box(new CANNON.Vec3(0.215, 0.53, 1.08)),
                position: new CANNON.Vec3(4.16, 0.48, -2.43),
                quaternion: new CANNON.Quaternion(0.0, 0.0, -0.0, 1.0)
            }),
            new CANNON.Body({
                type: CANNON.Body.STATIC,
                shape: new CANNON.Box(new CANNON.Vec3(0.075, 0.375, 0.5)),
                position: new CANNON.Vec3(1.22, 0.45, -2.94),
                quaternion: new CANNON.Quaternion(0.0, 0.0, -0.0, 1.0)
            }),
            new CANNON.Body({
                type: CANNON.Body.STATIC,
                shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.375, 0.075)),
                position: new CANNON.Vec3(3.82, 0.45, -1.34),
                quaternion: new CANNON.Quaternion(0.0, 0.0, -0.0, 1.0)
            }),
            new CANNON.Body({
                type: CANNON.Body.STATIC,
                shape: new CANNON.Box(new CANNON.Vec3(.5, .25, .5)),
                position: new CANNON.Vec3(1.6, .25, -1.3),
            }),
            // TV
            new CANNON.Body({
                type: CANNON.Body.STATIC,
                shape: new CANNON.Box(new CANNON.Vec3(.5, .35, .2)),
                position: new CANNON.Vec3(2.62, 1.06, 1.37),
                quaternion: new CANNON.Quaternion(0, -0.976296, 0, 0.2164396)
            }),
            new CANNON.Body({
                type: CANNON.Body.STATIC,
                shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.425, 0.35)),
                position: new CANNON.Vec3(2.63, 0.35, 1.39),
                quaternion: new CANNON.Quaternion(-0.15304601192474365, 0.6903454661369324, -0.6903455853462219, -0.15304598212242126)
            }),
            // Fan
            new CANNON.Body({
                type: CANNON.Body.STATIC,
                shape: new CANNON.Box(new CANNON.Vec3(0.8, 0.25, 0.8)),
                position: new CANNON.Vec3(3, 3.7, -2),
            }),
        ]
    }
}
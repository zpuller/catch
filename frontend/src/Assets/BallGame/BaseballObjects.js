import Utils from '../../Utils'
import Objects from './Objects'

const localMode = true

const localFloorPath = 'models/ballgame/floor.glb'
const remoteFloorPath = 'https://res.cloudinary.com/hack-reactor888/image/upload/v1655685470/zachGame/models/ballgame/floor_x69ubr.glb'
const floorPath = localMode ? localFloorPath : remoteFloorPath

const localBallPath = 'models/ballgame/baseball.glb'
const remoteBallPath = 'https://res.cloudinary.com/hack-reactor888/image/upload/v1655685470/zachGame/models/ballgame/baseball_rwilbc.glb'
const ballPath = localMode ? localBallPath : remoteBallPath

const pinPath = 'models/ballgame/pin.glb'

const localGarbageBinPath = 'models/ballgame/garbage_bin.glb'
const remoteGarbageBinPath = 'https://res.cloudinary.com/hack-reactor888/image/upload/v1655685470/zachGame/models/ballgame/garbage_bin_zjm9cb.glb'
const garbageBinPath = localMode ? localGarbageBinPath : remoteGarbageBinPath

export default class BaseballObjects extends Objects {
    buildRoom(scene) {
        this.gltfLoader.load(floorPath, gltf => {
            this.onFloorLoaded(gltf)
            scene.add(this.floor)
        })

        this.gltfLoader.load(garbageBinPath, gltf => { this.garbageBinGltf = gltf })

        this.gltfLoader.load(
            ballPath,
            gltf => {
                gltf.scene.traverse(o => {
                    if (o.type === 'Mesh') {
                        const oldMaterial = o.material
                        o.material = Utils.swapToLambertMat(oldMaterial)
                    }
                })
                this.ballGltf = gltf.scene.children[0]
            }
        )
    }

    buildBall() {
        return this.ballGltf
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
}
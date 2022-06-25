import Utils from '../../Utils'
import Objects from './Objects'

const localMode = true

const localFloorPath = 'models/ballgame/baseball.glb'
const remoteFloorPath = 'https://res.cloudinary.com/hack-reactor888/image/upload/v1655685470/zachGame/models/ballgame/floor_x69ubr.glb'
const floorPath = localMode ? localFloorPath : remoteFloorPath

export default class BaseballObjects extends Objects {
    constructor(gltfLoader, scene) {
        super(gltfLoader)
        this.gltfLoader.load(floorPath, gltf => {
            this.onFloorLoaded(gltf)
            scene.add(this.floor)

            this.ball = gltf.scene.children.find(c => c.name === 'baseball')
            this.ball.children.forEach(c => {
                const oldMaterial = c.material
                c.material.dispose()
                c.material = Utils.swapToLambertMat(oldMaterial)
            })

            this.garbageBinGltf = gltf.scene.children.find(c => c.name === 'garbage')
            console.log(this.garbageBinGltf)
        })
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
import * as THREE from 'three'

import Objects from './Objects'

const ballGeometry = new THREE.SphereGeometry(0.12, 16, 16)
const ballMaterial = new THREE.MeshToonMaterial({ color: 0x118ad0 })

const localMode = true

const localFloorPath = 'models/ballgame/floor.glb'
const remoteFloorPath = 'https://res.cloudinary.com/hack-reactor888/image/upload/v1655685470/zachGame/models/ballgame/floor_x69ubr.glb'
const floorPath = localMode ? localFloorPath : remoteFloorPath

const pinPath = 'models/ballgame/pin.glb'

export default class BaseballObjects extends Objects {
    buildRoom(scene) {
        this.gltfLoader.load(floorPath, gltf => {
            this.onFloorLoaded(gltf)

            const lane = gltf.scene.children.find(o => o.name === 'lane')
            lane.material.dispose()
            lane.material = this.floor.material
            this.lane = lane

            scene.add(lane)
            {
                const lane = gltf.scene.children.find(o => o.name === 'lane001')
                lane.material.dispose()
                lane.material = this.floor.material

                scene.add(lane)

                this.lane1 = lane
            }
        })

        this.gltfLoader.load(pinPath, gltf => {
            this.pinsGltf = gltf
        })
    }

    buildBall(ball) {
        return new THREE.Mesh(ballGeometry, ballMaterial)

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
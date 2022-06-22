import * as THREE from 'three'

import Utils from '../../Utils'

const gripGeometry = new THREE.SphereGeometry(0.025, 16, 16)
const gripMaterial = new THREE.MeshBasicMaterial({ color: '#ffffff' })

const ballGeometry = new THREE.SphereGeometry(0.04, 16, 16)
// const ballGeometry = new THREE.SphereGeometry(0.12, 16, 16)
const ballMaterial = new THREE.MeshToonMaterial({ color: 0x118ad0 })

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

export default class Objects {
    constructor(gltfLoader) {
        this.gltfLoader = gltfLoader
    }

    buildRoom(scene) {
        this.gltfLoader.load(floorPath, gltf => {
            this.floor = gltf.scene.children.find(o => o.name === 'floor')
            this.floor.material = Utils.swapToToonMaterial(this.floor.material)
            this.floor.material.color = new THREE.Color(0x888888)

            scene.add(this.floor)

            // const lane = gltf.scene.children.find(o => o.name === 'lane')
            // lane.material.dispose()
            // lane.material = this.floor.material
            // this.lane = lane

            // scene.add(lane)
            // {
            //     const lane = gltf.scene.children.find(o => o.name === 'lane001')
            //     lane.material.dispose()
            //     lane.material = this.floor.material

            //     scene.add(lane)

            //     this.lane1 = lane
            // }
        })

        this.gltfLoader.load(garbageBinPath, gltf => { this.garbageBinGltf = gltf })

        // this.gltfLoader.load(pinPath, gltf => {
        //     this.pinsGltf = gltf
        // })

        this.gltfLoader.load(
            ballPath,
            gltf => {
                console.log(gltf)
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

    buildBall(ball) {
        return this.ballGltf
        // return new THREE.Mesh(ballGeometry, ballMaterial)

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

    buildNewPlayer() {
        const group = new THREE.Group()

        const leftGrip = new THREE.Mesh(gripGeometry, gripMaterial)
        const rightGrip = new THREE.Mesh(gripGeometry, gripMaterial)
        group.add(leftGrip)
        group.add(rightGrip)

        return group
    }
}
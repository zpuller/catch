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
        this.gltfLoader.load('models/ballgame/bowling.glb', gltf => {
            scene.add(gltf.scene)
            this.onFloorLoaded(gltf)

            gltf.scene.traverse(c => {
                if (c.type === 'Mesh') {
                    c.material.dispose()
                    c.material = this.floor.material
                }
            })

            this.lanes = gltf.scene.children.filter(c => /lane.*/.test(c.name))

            const getNamedChild = name => gltf.scene.children.find(c => c.name === name)

            this.pins = getNamedChild('pins').children
            this.ball = getNamedChild('ball')
            this.bar = getNamedChild('bar')
            this.belt = getNamedChild('belt')

            this.mixer = new THREE.AnimationMixer(gltf.scene)

            const initAction = name => {
                const a = this.mixer.clipAction(gltf.animations.find(c => c.name === name))
                a.setLoop(THREE.LoopOnce)
                a.clampWhenFinished = true
                a.time = a.getClip().duration
                a.play()

                return a
            }

            this.ballAction = initAction('BallAction')
            this.barAction = initAction('BarAction')
            this.pinsAction = initAction('PinsAction')
            this.mixer.update()
        })
    }
}
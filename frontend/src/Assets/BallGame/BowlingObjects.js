import * as THREE from 'three'

import Objects from './Objects'

const localMode = true

const localModelPath = 'models/ballgame/bowling.glb'
const remoteModelPath = 'https://res.cloudinary.com/hack-reactor888/image/upload/v1655685470/zachGame/models/ballgame/floor_x69ubr.glb'
const modelPath = localMode ? localModelPath : remoteModelPath

export default class BaseballObjects extends Objects {
    constructor(gltfLoader, scene) {
        super(gltfLoader)
        this.gltfLoader.load(modelPath, gltf => {
            scene.add(gltf.scene)
            this.onFloorLoaded(gltf)

            this.filterTraverse(gltf, c => c.type === 'Mesh', c => {
                c.material.dispose()
                c.material = this.floor.material
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
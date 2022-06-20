import * as THREE from 'three'
import * as CANNON from 'cannon-es'

import { ShapeType, threeToCannon } from 'three-to-cannon'
import Utils from '../../Utils'

const gripGeometry = new THREE.SphereGeometry(0.025, 16, 16)
const gripMaterial = new THREE.MeshBasicMaterial({ color: '#ffffff' })

const ballGeometry = new THREE.SphereGeometry(0.04, 16, 16)
const ballMaterial = new THREE.MeshBasicMaterial({ wireframe: true })

const createBody = (o, physics, handler) => {
    const body = new CANNON.Body({
        type: CANNON.Body.STATIC,
    })
    const p = o.getWorldPosition(new THREE.Vector3())
    body.position.copy(p)
    body.quaternion.copy(o.quaternion)

    const { shape } = threeToCannon(o, { type: ShapeType.BOX })
    body.addShape(shape)
    if (handler) {
        body.addEventListener('collide', handler)
    }
    physics.world.addBody(body)
}

const onLoad = (scene, physics, handler) => gltf => {
    gltf.scene.matrixAutoUpdate = false
    scene.add(gltf.scene)
    gltf.scene.traverse(o => {
        if (o.type === 'Mesh') {
            createBody(o, physics, handler)
        }
    })
}

const localMode = false

const localFloorPath = 'models/ballgame/floor.glb'
const remoteFloorPath = 'https://res.cloudinary.com/hack-reactor888/image/upload/v1655685470/zachGame/models/ballgame/floor_x69ubr.glb'
const floorPath = localMode ? localFloorPath : remoteFloorPath

const localBallPath = 'models/ballgame/baseball.glb'
const remoteBallPath = 'https://res.cloudinary.com/hack-reactor888/image/upload/v1655685470/zachGame/models/ballgame/baseball_rwilbc.glb'
const ballPath = localMode ? localBallPath : remoteBallPath


// global local/uploaded option
export default class Objects {
    constructor(gltfLoader, physics) {
        this.gltfLoader = gltfLoader
        this.physics = physics
    }

    // TODO move to sep. classes
    buildRoom(scene) {
        this.gltfLoader.load(floorPath, gltf => {
            onLoad(scene, this.physics)(gltf)
            this.floor = gltf.scene.children.find(o => o.name === 'floor')
            this.floor.material = Utils.swapToToonMaterial(this.floor.material)
        })
    }

    buildBall(ball, scene, sound) {
        ball.mesh = new THREE.Mesh(ballGeometry, ballMaterial)
        scene.add(ball.mesh)

        this.gltfLoader.load(
            ballPath,
            (gltf) => {
                scene.remove(ball.mesh)
                ball.mesh = gltf.scene
                ball.mesh.position.y = 10
                ball.mesh.traverse(o => {
                    if (o.type === 'Mesh') {
                        const oldMaterial = o.material
                        o.material = Utils.swapToLambertMat(oldMaterial)
                    }
                })
                scene.add(ball.mesh)
                ball.mesh.add(sound)
                ball.sound = sound
            }
        )
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
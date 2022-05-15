import * as THREE from 'three'

import {
    GLTFLoader
} from 'three/examples/jsm/loaders/GLTFLoader'
import {
    DRACOLoader
} from 'three/examples/jsm/loaders/DRACOLoader'

const dracoLoader = new DRACOLoader()
const gltfLoader = new GLTFLoader()
dracoLoader.setDecoderPath('/draco/')
gltfLoader.setDRACOLoader(dracoLoader)

// let mixer = null

export default class Objects {
    constructor() {
        // TODO env vars
        // TODO physics in worker
        // TODO constraints when caught
        this.realRoom = false
    }
    buildRoom(scene) {
        if (this.realRoom) {
            gltfLoader.load(
                '/models/room/scene.gltf',
                (gltf) => {
                    scene.add(gltf.scene)
                }
            )
        } else {
            const geometry = new THREE.BoxGeometry(32, 16, 32)
            const material = new THREE.MeshPhysicalMaterial({
                color: '#4287f5',
                side: THREE.BackSide
            })
            const mesh = new THREE.Mesh(geometry, material)
            mesh.position.set(0, 8, 0)

            scene.add(mesh)
        }
    }

    buildBall(ball, scene) {
        const geometry = new THREE.SphereGeometry(0.04, 16, 16)
        const material = new THREE.MeshPhysicalMaterial({
            color: '#04f679',
            wireframe: true
        })
        ball.mesh = new THREE.Mesh(geometry, material)
        scene.add(ball.mesh)

        if (this.realRoom) {
            gltfLoader.load(
                'https://res.cloudinary.com/hack-reactor888/image/upload/v1652594431/myUploads/scene_glnhyg.glb',
                (gltf) => {
                    scene.remove(ball.mesh)
                    ball.mesh = gltf.scene
                    scene.add(ball.mesh)
                }
            )
        }
    }

    buildWall(scene, wall) {
        const geometry = new THREE.BoxGeometry(1, 1, 0.2)
        const material = new THREE.MeshPhysicalMaterial({
            color: '#32a852'
        })
        const mesh = new THREE.Mesh(geometry, material)

        wall.mesh = mesh
        scene.add(mesh)
    }

    buildGlove(group, scene) {
        gltfLoader.load(
            '/models/glove/scene.gltf',
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

        const geometry = new THREE.SphereGeometry(0.025, 16, 16)
        const material = new THREE.MeshPhysicalMaterial({
            color: '#ffffff'
        })

        const leftGrip = new THREE.Mesh(geometry, material)
        group.add(leftGrip)

        const rightGrip = new THREE.Mesh(geometry, material)
        group.add(rightGrip)

        return group
    }
}
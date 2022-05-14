import * as THREE from 'three'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

const dracoLoader = new DRACOLoader()
const gltfLoader = new GLTFLoader()
dracoLoader.setDecoderPath('/draco/')
gltfLoader.setDRACOLoader(dracoLoader)

// let mixer = null

export default class Objects {
    buildRoom(scene) {
        gltfLoader.load(
            '/models/room/scene.gltf',
            (gltf) => {
                // mixer = new THREE.AnimationMixer(gltf.scene)
                // const action = mixer.clipAction(gltf.animations[0])
                // action.play()

                scene.add(gltf.scene)
            }
        )
    }

    buildBall(ball, scene) {
        const geometry = new THREE.SphereGeometry(0.1, 16, 16)
        const material = new THREE.MeshPhysicalMaterial({ color: '#04f679' })
        ball.mesh = new THREE.Mesh(geometry, material)
        scene.add(ball.mesh)

        gltfLoader.load(
            '/models/baseball/scene.gltf',
            (gltf) => {
                scene.remove(ball.mesh)
                ball.mesh = gltf.scene
                scene.add(ball.mesh)
            }
        )
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
        const material = new THREE.MeshPhysicalMaterial({ color: '#ffffff' })

        const leftGrip = new THREE.Mesh(geometry, material)
        group.add(leftGrip)

        const rightGrip = new THREE.Mesh(geometry, material)
        group.add(rightGrip)

        return group
    }
}

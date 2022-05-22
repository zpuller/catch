import * as THREE from 'three'

import {
    GLTFLoader
} from 'three/examples/jsm/loaders/GLTFLoader'
import {
    DRACOLoader
} from 'three/examples/jsm/loaders/DRACOLoader'

const dracoLoader = new DRACOLoader()
// TODO consolidate
const gltfLoader = new GLTFLoader()
dracoLoader.setDecoderPath('/draco/')
gltfLoader.setDRACOLoader(dracoLoader)

// TODO real hands (incl. multiplayer)
export default class Objects {
    buildRoom(scene) {
        const geometry = new THREE.BoxGeometry(16, 8, 16)
        const material = new THREE.MeshPhysicalMaterial({
            color: '#7d7ba4',
            side: THREE.BackSide
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(0, 4, 0)

        scene.add(mesh)
    }

    buildBall(ball, scene) {
        const geometry = new THREE.SphereGeometry(0.04, 16, 16)
        const material = new THREE.MeshPhysicalMaterial({
            color: '#04f679',
            wireframe: true
        })
        ball.mesh = new THREE.Mesh(geometry, material)
        scene.add(ball.mesh)

        gltfLoader.load(
            'https://res.cloudinary.com/hack-reactor888/image/upload/v1652594431/myUploads/baseball.glb',
            (gltf) => {
                scene.remove(ball.mesh)
                ball.mesh = gltf.scene
                scene.add(ball.mesh)
            }
        )
    }

    buildGlove(group) {
        gltfLoader.load(
            'https://res.cloudinary.com/hack-reactor888/image/upload/v1652647643/myUploads/glove.glb',
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
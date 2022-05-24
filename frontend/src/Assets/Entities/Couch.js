import * as THREE from 'three'
import * as CANNON from 'cannon-es'

export default class Couch {
    constructor(position, scene, gltfLoader) {
        const geometry = new THREE.BoxGeometry(1, 1, 1)
        const material = new THREE.MeshBasicMaterial({ wireframe: true })
        this.mesh = new THREE.Mesh(geometry, material)

        this.bodies = [
            new CANNON.Body({
                type: CANNON.Body.STATIC,
                shape: new CANNON.Box(new CANNON.Vec3(1.6, .5, .5)),
                position: new CANNON.Vec3(position.x, position.y, position.z - .5),
            }),
            new CANNON.Body({
                type: CANNON.Body.STATIC,
                shape: new CANNON.Box(new CANNON.Vec3(.5, .5, .5)),
                position: new CANNON.Vec3(position.x + 1, position.y, position.z + .7),
            }),
            new CANNON.Body({
                type: CANNON.Body.STATIC,
                shape: new CANNON.Box(new CANNON.Vec3(.5, .25, .5)),
                position: new CANNON.Vec3(position.x - 1.1, position.y - .25, position.z + 1.1),
            }),
        ]
        this.constraints = []

        gltfLoader.load(
            'https://res.cloudinary.com/hack-reactor888/image/upload/v1653337467/myUploads/couch.glb',
            (gltf) => {
                const scale = 1.0
                gltf.scene.scale.set(scale, scale, scale)
                scene.remove(this.mesh)
                this.mesh = gltf.scene
                scene.add(this.mesh)
            }
        )
    }
}
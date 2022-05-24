import * as THREE from 'three'
import * as CANNON from 'cannon-es'

export default class Couch {
    // TODO consolidate shared geometries/materials
    // TODO optimizing render performance
    constructor(position, scene, gltfLoader) {
        const geometry = new THREE.BoxGeometry(1, 1, 1)
        const material = new THREE.MeshBasicMaterial({ wireframe: true })
        this.mesh = new THREE.Mesh(geometry, material)

        const w = 0.8
        const h = 0.25

        this.bodies = [
            new CANNON.Body({
                type: CANNON.Body.STATIC,
                shape: new CANNON.Box(new CANNON.Vec3(w, h, w)),
                position: new CANNON.Vec3(position.x, position.y, position.z),
            }),
        ]
        this.constraints = []

        // TODO might be possible to conslidate this logic
        gltfLoader.load(
            'models/fan.glb',
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
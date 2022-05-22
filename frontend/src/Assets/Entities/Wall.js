import * as THREE from 'three'
import * as CANNON from 'cannon-es'

const geometry = new THREE.BoxGeometry(1, 1, 0.2)
const material = new THREE.MeshPhysicalMaterial({
    color: '#32a852'
})

export default class Wall {
    constructor(position) {
        this.mesh = new THREE.Mesh(geometry, material)
        this.body = new CANNON.Body({
            mass: 1,
            shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.1)),
        })

        this.body.position.copy(position)
    }
}
import * as THREE from 'three'
import * as CANNON from 'cannon-es'

const geometry = new THREE.BoxGeometry(1, 1, 0.2)
const material = new THREE.MeshPhysicalMaterial({
    color: '#32a852'
})

export default class Wall {
    constructor(position) {
        this.mesh = new THREE.Mesh(geometry, material)
        this.bodies = [
            new CANNON.Body({
                mass: 3,
                shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.1)),
                position: new CANNON.Vec3(position.x, position.y, position.z)
            }),
        ]
        this.constraints = [
            // new CANNON.LockConstraint(this.bodies[0], this.bodies[1])
        ]
    }
}
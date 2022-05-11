import * as THREE from 'three'

export default class Objects {
    constructor(scene) {
        {
            const geometry = new THREE.BoxGeometry(32, 16, 32)
            const material = new THREE.MeshPhysicalMaterial({ color: '#eb9048', side: THREE.BackSide })
            const mesh = new THREE.Mesh(geometry, material)
            mesh.position.set(0, 8, 0)
            scene.add(mesh)
        }

        const geometry = new THREE.SphereGeometry(0.1, 16, 16)
        const material = new THREE.MeshPhysicalMaterial({ color: '#04f679' })
        const mesh = new THREE.Mesh(geometry, material)
        scene.add(mesh)

        this.ball = mesh
    }

    buildNewPlayer() {
        const group = new THREE.Group()

        const geometry = new THREE.SphereGeometry(0.1, 16, 16)
        const material = new THREE.MeshPhysicalMaterial({ color: '#04f679' })

        const leftGrip = new THREE.Mesh(geometry, material)
        group.add(leftGrip)

        const rightGrip = new THREE.Mesh(geometry, material)
        group.add(rightGrip)

        return group
    }
}

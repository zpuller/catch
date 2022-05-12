import * as THREE from 'three'

export default class Objects {
    buildRoom() {
        const geometry = new THREE.BoxGeometry(32, 16, 32)
        const material = new THREE.MeshPhysicalMaterial({ color: '#eb9048', side: THREE.BackSide })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(0, 8, 0)

        return mesh
    }

    buildBall() {
        const geometry = new THREE.SphereGeometry(0.1, 16, 16)
        const material = new THREE.MeshPhysicalMaterial({ color: '#04f679' })
        return new THREE.Mesh(geometry, material)
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

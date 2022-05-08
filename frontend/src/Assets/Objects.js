import * as THREE from 'three'



const init = (scene) => {
    {
        const geometry = new THREE.BoxGeometry(32, 16, 32)
        const material = new THREE.MeshPhysicalMaterial({ color: '#eb9048', side: THREE.BackSide })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.fromArray([0, 8, 0])
        scene.add(mesh)
    }

    const geometry = new THREE.SphereGeometry(0.1, 16, 16)
    const material = new THREE.MeshPhysicalMaterial({ color: '#04f679' })
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    return mesh
}

export default { init }
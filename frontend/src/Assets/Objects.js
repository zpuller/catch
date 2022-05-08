import * as THREE from 'three'

const init = (scene) => {
    const geometry = new THREE.SphereGeometry(0.2, 16, 16)
    const material = new THREE.MeshPhysicalMaterial({ color: '#04f679' })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.y = 1.6
    mesh.position.z = -1
    scene.add(mesh)

    return mesh
}

export default { init }
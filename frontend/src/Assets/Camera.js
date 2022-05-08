import * as THREE from 'three'

const init = (scene, sizes) => {
    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
    camera.position.y = 1.60
    scene.add(camera)

    return camera
}

export default { init }

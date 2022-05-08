import * as THREE from 'three'

const init = (canvas, sizes) => {
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    return renderer
}

export default { init }

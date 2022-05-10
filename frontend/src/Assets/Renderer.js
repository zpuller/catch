import * as THREE from 'three'

export default class Renderer {
    constructor(canvas, sizes) {
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas
        })
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

        return renderer
    }
}

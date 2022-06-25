import * as THREE from 'three'

import Utils from '../../Utils'

const gripGeometry = new THREE.SphereGeometry(0.025, 16, 16)
const gripMaterial = new THREE.MeshBasicMaterial({ color: '#ffffff' })

export default class Objects {
    constructor(gltfLoader) {
        this.gltfLoader = gltfLoader
    }

    filterTraverse(gltf, c, f) {
        gltf.scene.traverse(e => {
            if (c(e)) { f(e) }
        })
    }

    onFloorLoaded(gltf) {
        this.floor = gltf.scene.children.find(o => o.name === 'floor')
        this.floor.material = Utils.swapToToonMaterial(this.floor.material)
        this.floor.material.color = new THREE.Color(0x888888)
    }

    buildNewPlayer() {
        const group = new THREE.Group()

        const leftGrip = new THREE.Mesh(gripGeometry, gripMaterial)
        const rightGrip = new THREE.Mesh(gripGeometry, gripMaterial)
        group.add(leftGrip)
        group.add(rightGrip)

        return group
    }
}

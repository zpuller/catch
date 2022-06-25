import * as THREE from 'three'

import Utils from '../../Utils'

const gripGeometry = new THREE.SphereGeometry(0.025, 16, 16)
const gripMaterial = new THREE.MeshBasicMaterial({ color: '#ffffff' })

const localMode = true

const localFloorPath = 'models/ballgame/floor.glb'
const remoteFloorPath = 'https://res.cloudinary.com/hack-reactor888/image/upload/v1655685470/zachGame/models/ballgame/floor_x69ubr.glb'
const floorPath = localMode ? localFloorPath : remoteFloorPath

// TODO don't add to scene, just store the models
export default class Objects {
    constructor(gltfLoader, scene) {
        this.gltfLoader = gltfLoader
        this.scene = scene
    }

    onFloorLoaded(gltf) {
        this.floor = gltf.scene.children.find(o => o.name === 'floor')
        this.floor.material = Utils.swapToToonMaterial(this.floor.material)
        this.floor.material.color = new THREE.Color(0x888888)
    }

    buildRoom(scene) {
        this.gltfLoader.load(floorPath, this.onFloorLoaded.bind(this))
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

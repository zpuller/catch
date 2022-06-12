import * as THREE from 'three'

const material = new THREE.MeshToonMaterial({ color: 0xb38e7a })

const clench = (x, boneGroups) => {
    const start = 0.2
    x = start + (1 - start) * x

    const thumbStart = 0.5

    boneGroups.digits.forEach(b => {
        b.rotation.x = 2 * Math.PI * x * .25
    })
    boneGroups.rings.forEach(b => {
        b.rotation.x = 2 * Math.PI * x * .28
    })
    boneGroups.ring_bases.forEach(b => {
        b.rotation.z = 2 * Math.PI * x * .025 - .1
    })
    boneGroups.thumb.forEach(b => {
        b.rotation.z = 2 * Math.PI * (thumbStart + (1 - thumbStart) * x) * .2
    })
}

const makeBoneGroups = () => {
    const groups = {
        digits: [],
        thumb: [],
        rings: [],
        ring_bases: [],
    }

    return groups
}

const onLoad = (group, boneGroups) => (gltf) => {
    const bones = gltf.scene.children[0].children[0]
    const mesh = gltf.scene.children[0].children[1]
    mesh.material.dispose()
    mesh.material = material

    bones.traverse(b => {
        if (/^(index|middle|pinky)/.test(b.name)) {
            // console.log(b.name)
            boneGroups.digits.push(b)
        }
        if (/^ring/.test(b.name)) {
            // console.log(b.name)
            boneGroups.rings.push(b)
        }
        if (/^ring_base/.test(b.name)) {
            // console.log(b.name)
            boneGroups.ring_bases.push(b)
        }
        if (/^(thumb)/.test(b.name)) {
            // console.log('thumb')
            boneGroups.thumb.push(b)
        }
    })

    gltf.scene.rotateX(Math.PI * -0.3)
    const scale = 0.16
    gltf.scene.scale.set(scale, scale, scale)
    group.add(gltf.scene)
}

export default class Hands {
    constructor(gltfLoader) {
        this.gltfLoader = gltfLoader

        this.leftGroups = makeBoneGroups()
        this.rightGroups = makeBoneGroups()
    }

    left(group) {
        // this.gltfLoader.load('https://res.cloudinary.com/hack-reactor888/image/upload/v1654183534/zachGame/left_hand_kbzjgf.glb', onLoad(group, this.leftGroups))
        this.gltfLoader.load('models/left_hand_lp.glb', onLoad(group, this.leftGroups))
    }

    right(group) {
        // this.gltfLoader.load('https://res.cloudinary.com/hack-reactor888/image/upload/v1654183534/zachGame/right_hand_dmld80.glb', onLoad(group, this.rightGroups))
        this.gltfLoader.load('models/right_hand_lp.glb', onLoad(group, this.rightGroups))
    }

    clenchLeft(x) {
        clench(x, this.leftGroups)
    }

    clenchRight(x) {
        clench(x, this.rightGroups)
    }

    clenchLeftIndex(x) {
        clenchIndex(x, this.leftGroups)
    }

    clenchRightIndex(x) {
        clenchIndex(x, this.rightGroups)
    }
}

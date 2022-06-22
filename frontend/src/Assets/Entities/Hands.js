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

const bindHand = (group, boneGroups, gltf) => {
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

const localMode = false

const localLHPath = 'models/ballgame/left_hand_lp.glb'
const remoteLHPath = 'https://res.cloudinary.com/hack-reactor888/image/upload/v1655685470/zachGame/models/ballgame/left_hand_lp_bdzboq.glb'
const lHPath = localMode ? localLHPath : remoteLHPath

const localRHPath = 'models/ballgame/right_hand_lp.glb'
const remoteRHPath = 'https://res.cloudinary.com/hack-reactor888/image/upload/v1655685470/zachGame/models/ballgame/right_hand_lp_jnat6n.glb'
const rHPath = localMode ? localRHPath : remoteRHPath

export default class Hands {
    constructor(gltfLoader) {
        this.gltfLoader = gltfLoader

        this.leftGroups = makeBoneGroups()
        this.rightGroups = makeBoneGroups()

        this.gltfLoader.load(lHPath, gltf => this.lhGltf = gltf)
        this.gltfLoader.load(rHPath, gltf => this.rhGltf = gltf)
    }

    left(group) {
        bindHand(group, this.leftGroups, this.lhGltf)
    }

    right(group) {
        bindHand(group, this.rightGroups, this.rhGltf)
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

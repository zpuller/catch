const makeBoneGroups = () => {
    const groups = Array(6)
    const keys = [...groups.keys()]
    keys.forEach(i => groups[i] = [])

    return groups
}

const onLoad = (group, boneGroups) => (gltf) => {
    gltf.scene.children[0].traverse(b => {
        if (/INDEX_[A-Z]+_joint_\w+/.test(b.name)) {
            boneGroups[0].push(b.rotation)
        }
        else if (/MIDDLE_F_TOP_joint_\w+/.test(b.name)) {
            boneGroups[1].push(b.rotation)
        }
        else if (/(MIDDLE_F|RING|PINK)_(MID|TOP)_joint_\w+/.test(b.name)) {
            boneGroups[2].push(b.rotation)
        }
        else if (/(MIDDLE_F|RING|PINK)_BASE_joint_\w+/.test(b.name)) {
            boneGroups[3].push(b.rotation)
        }
        else if (/THUMB_(BASE|MID)_joint_\w+/.test(b.name)) {
            boneGroups[4].push(b.rotation)
        }
        else if (/THUMB_TOP_joint_\w+/.test(b.name)) {
            boneGroups[5].push(b.rotation)
        }
    })

    gltf.scene.rotateX(Math.PI * -0.3)
    const scale = 0.16
    gltf.scene.scale.set(scale, scale, scale)
    group.add(gltf.scene)
}

const clenchIndex = (x, groups) => {
    // groups[0].forEach(r => r.z = Math.PI * (1.5 + 0.5 * (1 - x)))
}

const clench = (x, groups) => {
    groups[0].forEach(r => r.z = Math.PI * (1.5 + 0.5 * (1 - x)))
    groups[1].forEach(r => r.z = Math.PI * (0.5 + 0.5 * (1 - x)))
    groups[2].forEach(r => r.z = Math.PI * (0.5 * x))
    groups[3].forEach(r => r.z = Math.PI * (1 + .5 * x))
    // extra thumb joints
    // groups[4].forEach(r => r.z = Math.PI * (1.7 + 0.3 * x))
    groups[5].forEach(r => r.x = Math.PI * (1 + 0.5 * x))
}

export default class Hands {
    constructor(gltfLoader) {
        this.gltfLoader = gltfLoader

        this.leftGroups = makeBoneGroups()
        this.rightGroups = makeBoneGroups()
    }

    left(group) {
        this.gltfLoader.load('https://res.cloudinary.com/hack-reactor888/image/upload/v1654183534/zachGame/left_hand_kbzjgf.glb', onLoad(group, this.leftGroups))
    }

    right(group) {
        this.gltfLoader.load('https://res.cloudinary.com/hack-reactor888/image/upload/v1654183534/zachGame/right_hand_dmld80.glb', onLoad(group, this.rightGroups))
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

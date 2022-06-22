import * as THREE from 'three'

const video = document.getElementById("vid")
video.play()
const videoTexture = new THREE.VideoTexture(video)
const videoMeshMaterial = new THREE.MeshBasicMaterial({ map: videoTexture })


const onLoad = (scene) => gltf => {
    gltf.scene.matrixAutoUpdate = false
    scene.add(gltf.scene)
}

const localMode = true

const localTexturePaths = [
    'textures/baked.jpg',
    'textures/baked1.jpg',
    'textures/baked2.jpg',
    'textures/baked3.jpg',
    'textures/baked4.jpg',
    'textures/baked5.jpg',
    'textures/baked6.jpg',
    'textures/baked7.jpg',
]

const remoteTexturePaths = [
    'https://res.cloudinary.com/hack-reactor888/image/upload/v1655685510/zachGame/textures/baked_tazjl4.jpg',
    'https://res.cloudinary.com/hack-reactor888/image/upload/v1655685510/zachGame/textures/baked1_l38p9o.jpg',
    'https://res.cloudinary.com/hack-reactor888/image/upload/v1655685511/zachGame/textures/baked2_os5hpw.jpg',
    'https://res.cloudinary.com/hack-reactor888/image/upload/v1655685510/zachGame/textures/baked3_hncb48.jpg',
    'https://res.cloudinary.com/hack-reactor888/image/upload/v1655685510/zachGame/textures/baked4_zhew9k.jpg',
    'https://res.cloudinary.com/hack-reactor888/image/upload/v1655685510/zachGame/textures/baked5_rrbdp2.jpg',
    'https://res.cloudinary.com/hack-reactor888/image/upload/v1655685510/zachGame/textures/baked6_u15nu0.jpg',
    'https://res.cloudinary.com/hack-reactor888/image/upload/v1655685510/zachGame/textures/baked7_wbzyun.jpg',
]

const texturePaths = localMode ? localTexturePaths : remoteTexturePaths

const localModelPaths = [
    'models/apartment/room.glb',
    'models/apartment/room1.glb',
    'models/apartment/room2.glb',
    'models/apartment/room3.glb',
    'models/apartment/room4.glb',
    'models/apartment/room5.glb',
    'models/apartment/room6.glb',
    'models/apartment/room7.glb',
]

const remoteModelPaths = [
    'https://res.cloudinary.com/hack-reactor888/image/upload/v1655685444/zachGame/models/apartment/room_my7wj1.glb',
    'https://res.cloudinary.com/hack-reactor888/image/upload/v1655685444/zachGame/models/apartment/room1_rdqtuy.glb',
    'https://res.cloudinary.com/hack-reactor888/image/upload/v1655685444/zachGame/models/apartment/room2_btfu21.glb',
    'https://res.cloudinary.com/hack-reactor888/image/upload/v1655685444/zachGame/models/apartment/room3_bo0tjy.glb',
    'https://res.cloudinary.com/hack-reactor888/image/upload/v1655685445/zachGame/models/apartment/room4_se18ou.glb',
    'https://res.cloudinary.com/hack-reactor888/image/upload/v1655685445/zachGame/models/apartment/room5_lmsuqp.glb',
    'https://res.cloudinary.com/hack-reactor888/image/upload/v1655685446/zachGame/models/apartment/room6_sodsv9.glb',
    'https://res.cloudinary.com/hack-reactor888/image/upload/v1655685447/zachGame/models/apartment/room7_z07nh5.glb',
]

const modelPaths = localMode ? localModelPaths : remoteModelPaths

const localFloorModelPath = 'models/apartment/floor.glb'
const remoteFloorModelPath = 'https://res.cloudinary.com/hack-reactor888/image/upload/v1655685444/zachGame/models/apartment/floor_mdqtzx.glb'
const floorModelPath = localMode ? localFloorModelPath : remoteFloorModelPath

const localDoorsModelPath = 'models/apartment/doors.glb'
const remoteDoorsModelPath = 'https://res.cloudinary.com/hack-reactor888/image/upload/v1655685444/zachGame/models/apartment/doors_phg9vl.glb'
const doorsModelPath = localMode ? localDoorsModelPath : remoteDoorsModelPath

const localScreenModelPath = 'models/apartment/screen.glb'
const remoteScreenModelPath = 'https://res.cloudinary.com/hack-reactor888/image/upload/v1655685447/zachGame/models/apartment/screen_te6lzq.glb'
const screenModelPath = localMode ? localScreenModelPath : remoteScreenModelPath

// global local/uploaded option
export default class Objects {
    constructor(gltfLoader, textureLoader, cubeTextureLoader) {
        this.gltfLoader = gltfLoader
        this.video = video

        this.textureLoader = textureLoader
        this.cubeTextureLoader = cubeTextureLoader

        this.floorMat = this.loadTextureMaterial(texturePaths[0])
        this.roomMat1 = this.loadTextureMaterial(texturePaths[1])
        this.roomMat2 = this.loadTextureMaterial(texturePaths[2])
        this.roomMat3 = this.loadTextureMaterial(texturePaths[3])
        this.roomMat4 = this.loadTextureMaterial(texturePaths[4])
        this.roomMat5 = this.loadTextureMaterial(texturePaths[5])
        this.roomMat6 = this.loadTextureMaterial(texturePaths[6])
        this.roomMat7 = this.loadTextureMaterial(texturePaths[7])


        // const envNum = '1'
        this.environmentMap = cubeTextureLoader.load([
            'https://res.cloudinary.com/hack-reactor888/image/upload/v1653629023/zachGame/envMaps/px_vgn0hu.jpg',
            'https://res.cloudinary.com/hack-reactor888/image/upload/v1653629023/zachGame/envMaps/nx_domm6q.jpg',
            'https://res.cloudinary.com/hack-reactor888/image/upload/v1653629023/zachGame/envMaps/py_dgjjzf.jpg',
            'https://res.cloudinary.com/hack-reactor888/image/upload/v1653629023/zachGame/envMaps/ny_s7bcwa.jpg',
            'https://res.cloudinary.com/hack-reactor888/image/upload/v1653629023/zachGame/envMaps/pz_w4b9lw.jpg',
            'https://res.cloudinary.com/hack-reactor888/image/upload/v1653629023/zachGame/envMaps/nz_uxnx3c.jpg',
            // '/textures/environmentMaps/' + envNum + '/px.jpg',
            // '/textures/environmentMaps/' + envNum + '/nx.jpg',
            // '/textures/environmentMaps/' + envNum + '/py.jpg',
            // '/textures/environmentMaps/' + envNum + '/ny.jpg',
            // '/textures/environmentMaps/' + envNum + '/pz.jpg',
            // '/textures/environmentMaps/' + envNum + '/nz.jpg'
        ])

        this.environmentMap.encoding = THREE.sRGBEncoding
    }

    loadTextureMaterial(path) {
        const tex = this.textureLoader.load(path)
        const mat = new THREE.MeshBasicMaterial()
        mat.map = tex
        tex.encoding = THREE.sRGBEncoding
        tex.flipY = false

        return mat
    }

    // TODO move to sep. classes
    buildRoom(scene, handlers) {
        scene.background = this.environmentMap
        // scene.environment = this.environmentMap

        this.gltfLoader.load(floorModelPath, gltf => {
            onLoad(scene)(gltf)
            this.floor = gltf.scene.children.find(o => o.name === 'floor')
            this.floor.material.dispose()
            this.floor.material = this.floorMat
        })

        const loadRoomComponent = (path, meshName, mat) => {
            this.gltfLoader.load(path, gltf => {
                onLoad(scene)(gltf)
                const mesh = gltf.scene.children.find(o => o.name === meshName)
                mesh.material.dispose()
                mesh.material = mat
            })
        }

        loadRoomComponent(modelPaths[0], 'baked', this.floorMat)
        loadRoomComponent(modelPaths[1], 'baked1', this.roomMat1)
        loadRoomComponent(modelPaths[2], 'baked2', this.roomMat2)
        loadRoomComponent(modelPaths[3], 'baked3', this.roomMat3)
        loadRoomComponent(modelPaths[4], 'baked4', this.roomMat4)
        loadRoomComponent(modelPaths[5], 'baked5', this.roomMat5)
        loadRoomComponent(modelPaths[6], 'baked6', this.roomMat6)
        loadRoomComponent(modelPaths[7], 'baked7', this.roomMat7)

        this.gltfLoader.load(doorsModelPath, gltf => {
            onLoad(scene)(gltf)
        })
        this.gltfLoader.load(screenModelPath, (gltf) => {
            onLoad(scene)(gltf)
            const screen = gltf.scene.children[0]
            screen.material.dispose()
            screen.material = videoMeshMaterial
            this.screen = gltf.scene
            // this.screen.sound = tvSound
            // this.screen.add(tvSound)

            this.screen.visible = true
        })
        // this.gltfLoader.load('models/apartment/screen_broken.glb', gltf => {
        //     this.screenBroken = gltf.scene
        // })
    }
}
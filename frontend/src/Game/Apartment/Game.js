import Game from '../Game'

export default class Apartment extends Game {
    constructor(objects, gltfLoader, xr, scene, cameraGroup, camera, onInputsConnected, stats) {
        super(objects, gltfLoader, xr, scene, cameraGroup, camera, onInputsConnected, stats, true)
    }

    update(inputs) {
        super.update(inputs)
    }
}
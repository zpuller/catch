import Game from '../Game'

export default class Apartment extends Game {
    constructor(objects, xr, scene, cameraGroup, onInputsConnected, stats) {
        super(objects, xr, scene, cameraGroup, onInputsConnected, stats, true)
    }

    update(inputs) {
        super.update(inputs)
    }
}
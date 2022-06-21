import Objects from '../../Assets/Apartment/Objects'
import Game from '../Game'
import Teleport from '../Teleport'

export default class Apartment extends Game {
    constructor(gltfLoader, xr, scene, cameraGroup, camera, onInputsConnected, stats) {
        super(gltfLoader, xr, scene, cameraGroup, camera, onInputsConnected, stats, true)

        this.objects = new Objects(gltfLoader)
        this.objects.buildRoom(this.scene)

        // TODO refactor on waiting for everything to load
        this.teleport = new Teleport(scene, this.rightHand.con, this.objects, this.player)
    }

    update(inputs) {
        super.update(inputs)
    }
}
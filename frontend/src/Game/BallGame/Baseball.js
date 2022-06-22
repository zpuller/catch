import BallGame from "./Game";

import GarbageBin from '../../Assets/Entities/GarbageBin'

export default class BaseballGame extends BallGame {
    constructor(objects, xr, scene, cameraGroup, client, onInputsConnected, stats, hands, sounds) {
        super(objects, xr, scene, cameraGroup, client, onInputsConnected, stats, hands, sounds)

        this.ball.body = this.physics.createBall(0.04, 5)
        this.ball.body.linearDamping = .5
        this.ball.body.angularDamping = .5
        this.ball.body.addEventListener('collide', this.ballHandler)
        this.ball.mesh = this.objects.buildBall()
        this.ball.sound = sounds.ball

        this.dynamicEntities = []

        this.physics.createStaticBox(this.objects.floor, this.physics.groundMaterial)

        this.addDynamicEntity(new GarbageBin({ x: 0.7, y: 0.0, z: -3 }, this.scene, this.objects.garbageBinGltf))
    }
}

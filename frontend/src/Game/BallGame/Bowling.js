import BallGame from "./Game"
import Utils from '../../Utils'

export default class Bowling extends BallGame {
    constructor(objects, xr, scene, cameraGroup, client, onInputsConnected, stats, hands, sounds) {
        super(objects, xr, scene, cameraGroup, client, onInputsConnected, stats, hands, sounds)

        this.ball.body = this.physics.createBall(0.12, 10)
        this.ball.body.addEventListener('collide', this.ballHandler)
        this.ball.mesh = this.objects.buildBall()
        this.ball.sound = sounds.ball

        this.dynamicEntities = []

        this.physics.enableSlippery()
        this.physics.createStaticBox(this.objects.floor, this.physics.groundMaterial)
        this.physics.createStaticBox(this.objects.lane)
        this.physics.createStaticBox(this.objects.lane1)

        const entities = []
        this.objects.pinsGltf.scene.traverse(c => {
            if (c.type === 'Mesh') {
                c.material = Utils.swapToToonMaterial(c.material)
                const e = {
                    mesh: c,
                    bodies: [],
                    constraints: [],
                }
                e.bodies.push(this.physics.createDynamicBox(c))
                entities.push(e)
            }
        })
        entities.forEach(this.addDynamicEntity.bind(this))

        this.player.position.z += 3
    }
}
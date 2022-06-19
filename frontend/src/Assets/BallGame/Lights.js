import * as THREE from 'three'

export default class GameLights {
    get() {
        const group = new THREE.Group()
        group.add(new THREE.HemisphereLight(0x606060, 0x404040, 0.5));

        // const plight = new THREE.PointLight(0xffffff, 0.5, 5, 0.9)
        // plight.position.set(3, 3.6, -2)
        // group.add(plight)

        // const dlight = new THREE.DirectionalLight(0xffffff, 0.1)
        // dlight.castShadow = true
        // dlight.position.set(-4, 4, 1)
        // group.add(dlight)
        // group.add(dlight.target)
        // dlight.target.position.z = -4
        // dlight.target.updateMatrixWorld()

        // const helper = new THREE.DirectionalLightHelper(dlight)
        // group.add(helper)
        // helper.updateMatrixWorld()
        // helper.update()

        return group
    }
}
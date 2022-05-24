import * as THREE from 'three'

export default class Lights {
    get() {
        const group = new THREE.Group()
        group.add(new THREE.HemisphereLight(0x606060, 0x404040));

        const light = new THREE.DirectionalLight(0xffffff);
        light.position.set(-2, 2, -1)

        const plight = new THREE.PointLight(0xffffff, 0.5, 5, .9)
        plight.position.set(2, 2.5, -2)
        group.add(plight)

        group.add(light)

        return group
    }
}
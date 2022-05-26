import * as THREE from 'three'

export default class Lights {
    get() {
        const group = new THREE.Group()
        group.add(new THREE.HemisphereLight(0x606060, 0x404040));

        const plight = new THREE.PointLight(0xffffff, 0.8, 5, .9)
        plight.position.set(3, 3.6, -2)
        group.add(plight)

        return group
    }
}
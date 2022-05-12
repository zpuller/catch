import * as THREE from 'three'

export default class Lights {
    get() {
        const group = new THREE.Group()
        group.add(new THREE.HemisphereLight(0x606060, 0x404040));

        const light = new THREE.DirectionalLight(0xffffff);
        light.position.set(1, 1, 1).normalize();
        group.add(light);

        return group
    }
}
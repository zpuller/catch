import * as THREE from 'three'

export default class Lights {
    constructor(scene) {
        scene.add(new THREE.HemisphereLight(0x606060, 0x404040));

        const light = new THREE.DirectionalLight(0xffffff);
        light.position.set(1, 1, 1).normalize();
        scene.add(light);
    }
}
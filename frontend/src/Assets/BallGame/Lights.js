import * as THREE from 'three'

export default class GameLights {
    get() {
        const group = new THREE.Group()
        group.add(new THREE.HemisphereLight(0xffffff, 0x404040));

        return group
    }
}
import * as THREE from 'three'

export default class GameAudio {
    constructor(camera, loadingManager) {
        this.audioLoader = new THREE.AudioLoader(loadingManager)

        this.camera = camera
        this.listener = new THREE.AudioListener();
        this.camera.add(this.listener);
        return {
            ball: this.loadSound('https://res.cloudinary.com/hack-reactor888/video/upload/v1654148888/zachGame/sounds/ball_x7ujly.m4a'),
            tv: this.loadSound('https://res.cloudinary.com/hack-reactor888/video/upload/v1654148888/zachGame/sounds/tv_break_kximoa.m4a'),
        }
    }

    loadSound(file) {
        const sound = new THREE.PositionalAudio(this.listener)

        this.audioLoader.load(file, function (buffer) {
            sound.setBuffer(buffer);
            sound.setRefDistance(0.5);
        });

        return sound
    }
}
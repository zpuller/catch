import * as THREE from 'three'

export default class GameAudio {
    constructor(camera) {
        this.camera = camera
        this.listener = new THREE.AudioListener();
        this.camera.add(this.listener);
        return {
            ball: this.loadBallSound(),
            tv: this.loadTvSound(),
        }
    }

    loadBallSound() {
        const sound = new THREE.PositionalAudio(this.listener);

        const audioLoader = new THREE.AudioLoader();
        audioLoader.load('sounds/ball.m4a', function (buffer) {
            sound.setBuffer(buffer);
            sound.setRefDistance(0.5);
        });

        return sound
    }

    // TODO DRY
    loadTvSound() {
        const sound = new THREE.PositionalAudio(this.listener);

        const audioLoader = new THREE.AudioLoader();
        audioLoader.load('sounds/tv_break.m4a', function (buffer) {
            sound.setBuffer(buffer);
            sound.setRefDistance(0.5);
        });

        window.addEventListener('keypress', () => {
            if (sound?.isPlaying) {
                sound.stop()
            }
            sound.play()
        })

        return sound
    }

    audioTest() {
        // create an AudioListener and add it to the camera
        const listener = new THREE.AudioListener();
        this.camera.add(listener);

        // create a global audio source
        const sound = new THREE.Audio(listener);

        // load a sound and set it as the Audio object's buffer
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load('sounds/ball.m4a', function (buffer) {
            sound.setBuffer(buffer);
            sound.setVolume(1.0);
            console.log('loaded')
        });

        window.addEventListener('keypress', () => {
            if (sound?.isPlaying) {
                sound.stop()
            }
            sound.play()
        })
    }
}
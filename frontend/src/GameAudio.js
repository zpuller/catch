import * as THREE from 'three'

// import { PositionalAudioHelper } from 'three/examples/jsm/helpers/PositionalAudioHelper'

export default class GameAudio {
    constructor(camera) {
        this.camera = camera

        // create an AudioListener and add it to the camera
        const listener = new THREE.AudioListener();
        camera.add(listener);

        // create the PositionalAudio object (passing in the listener)
        const sound = new THREE.PositionalAudio(listener);

        // load a sound and set it as the PositionalAudio object's buffer
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load('sounds/ball.m4a', function (buffer) {
            sound.setBuffer(buffer);
            sound.setRefDistance(0.5);
        });

        window.addEventListener('keypress', () => {
            if (sound?.isPlaying) {
                sound.stop()
            }
            sound.play()
        })

        // const helper = new PositionalAudioHelper(sound)
        // sound.add(helper)

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
    }
}
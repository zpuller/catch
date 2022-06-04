import * as THREE from 'three'

export default class ControllerRaycaster {
    constructor(near, far) {
        this.raycaster = new THREE.Raycaster()
        if (near !== undefined) {
            this.raycaster.near = near
        }
        if (far !== undefined) {
            this.raycaster.far = far
        }

        this.origin = new THREE.Vector3()
        this.dest = new THREE.Vector3()
        this.direction = new THREE.Vector3()
    }

    intersects(con, target) {
        const origin = con.getWorldPosition(this.origin)
        const dest = con.children[0].getWorldPosition(this.dest)
        this.raycaster.set(origin, this.direction.subVectors(dest, origin).normalize())
        const i = this.raycaster.intersectObject(target)
        return i.length ? i[0] : false
    }
}
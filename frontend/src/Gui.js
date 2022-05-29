import * as THREE from 'three'

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

export default class Gui extends THREE.Group {
    constructor() {
        super()

        const c = document.getElementById('gui')
        let ctx = c.getContext("2d")
        c.width = 512
        c.height = 512
        ctx.font = "30px Arial"
        ctx.fillStyle = 'white'
        ctx.strokeStyle = 'white'
        ctx.fillText("Hello World", 10, 50)
        ctx.strokeRect(1, 1, 510, 510)

        this.baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x1fa3ef,
            transparent: true,
            opacity: 0.5,
            emissive: 0xffffff,
            emissiveMap: new THREE.CanvasTexture(c),
        })
        this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.baseMaterial)
        this.position.set(0, 1, -2)
        this.add(this.mesh)

        this.raycaster = new THREE.Raycaster()
        this.raycaster.near = 0.1
        this.raycaster.far = 0.5
        this.rayOrigin = new THREE.Vector3()
        this.rayDest = new THREE.Vector3()
        this.rayDirection = new THREE.Vector3()
    }

    update(c) {
        const cv = document.getElementById('gui')
        let ctx = cv.getContext("2d")
        ctx.moveTo(0, 512)
        ctx.lineTo(512, 0)
        ctx.stroke()

        const mt = ctx.measureText('Hello World')
        ctx.fillStyle = 'black'
        ctx.fillRect(10, 51, mt.width, -40)
        ctx.fillStyle = 'white'
        ctx.fillText("new text", 10, 50)

        if (c.children.length === 0) {
            return
        }
        const origin = c.getWorldPosition(this.rayOrigin)
        const dest = c.children[0].getWorldPosition(this.rayDest)
        this.raycaster.set(origin, this.rayDirection.subVectors(dest, origin).normalize())
        const i = this.raycaster.intersectObject(this.mesh)
        if (i.length > 0) {
            // console.log(i[0].uv)
        }
    }
}
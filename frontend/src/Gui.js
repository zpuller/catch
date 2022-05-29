import * as THREE from 'three'

const clamp = (num, min, max) => Math.min(Math.max(num, min), max)

const round2 = (num) => String(Math.round(num * 100) / 100)

export default class Gui extends THREE.Group {
    constructor() {
        super()

        const c = document.getElementById('gui')
        c.width = 512
        c.height = 512

        this.ctx = c.getContext("2d")
        this.ctx.strokeStyle = 'white'
        this.ctx.fillStyle = 'white'
        this.ctx.strokeRect(1, 1, c.width - 2, c.height - 2)
        this.ctx.font = "30px Arial"

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

    drawText(s) {
        this.ctx.fillStyle = 'black'
        this.ctx.fillRect(10, 56, 492, -40)
        this.ctx.fillStyle = 'white'
        this.ctx.fillText(s, 10, 50)
        this.baseMaterial.emissiveMap.needsUpdate = true
    }

    update(c) {
        if (c.children.length === 0) {
            return
        }
        const origin = c.getWorldPosition(this.rayOrigin)
        const dest = c.children[0].getWorldPosition(this.rayDest)
        this.raycaster.set(origin, this.rayDirection.subVectors(dest, origin).normalize())
        const i = this.raycaster.intersectObject(this.mesh)
        if (i.length > 0) {
            const uv = i[0].uv
            this.drawText(`${round2(uv.x)}, ${round2(uv.y)}`)
        }
    }
}
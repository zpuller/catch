import * as THREE from 'three'

const clamp = (num, min, max) => Math.min(Math.max(num, min), max)

const round2 = (num) => String(Math.round(num * 100) / 100)

export default class Gui extends THREE.Group {
    constructor() {
        super()

        this.c = document.getElementById('gui')
        this.c.width = 512
        this.c.height = 1024

        this.ctx = this.c.getContext("2d")
        this.ctx.strokeStyle = 'white'
        this.ctx.fillStyle = 'white'
        this.ctx.strokeRect(1, 1, this.c.width - 2, this.c.height - 2)
        this.ctx.font = "30px Arial"

        this.drawRect()

        this.baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x1fa3ef,
            transparent: true,
            opacity: 0.5,
            emissive: 0xffffff,
            emissiveMap: new THREE.CanvasTexture(this.c),
        })
        this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(.25, .25), this.baseMaterial)
        console.log(this.mesh.geometry.attributes)
        this.position.set(0, 1.6, -0.5)
        // this.position.set(.1, .1, .1)
        // this.rotateY(Math.PI * .25)
        // this.rotateZ(Math.PI * .25)
        this.add(this.mesh)


        this.raycaster = new THREE.Raycaster()
        this.raycaster.near = 0.1
        this.raycaster.far = 0.5
        this.rayOrigin = new THREE.Vector3()
        this.rayDest = new THREE.Vector3()
        this.rayDirection = new THREE.Vector3()

        this.scroll(0)
    }

    scroll(x) {
        const uv = this.mesh.geometry.attributes.uv
        // this is top half
        uv.array[5] = 0.5 * (1 - x)
        uv.array[7] = 0.5 * (1 - x)

        // this is bottom half
        uv.array[1] = 1 - (0.5 * x)
        uv.array[3] = 1 - (0.5 * x)
        uv.needsUpdate = true
    }

    drawRect() {
        this.ctx.fillStyle = 'white'
        this.ctx.fillRect(10, 64 + 10, this.c.width - 20, 64 - 20)
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
            this.scroll(clamp(1.5 * uv.x - 0.25, 0, 1))
        }
    }
}
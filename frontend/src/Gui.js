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

        this.baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x1fa3ef,
            transparent: true,
            opacity: 0.5,
            emissive: 0xffffff,
            emissiveMap: new THREE.CanvasTexture(this.c),
        })
        this.scrollMaterial = new THREE.MeshStandardMaterial({
            color: 0x1fa3ef,
            transparent: true,
            opacity: 0.5,
        })
        this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(.25, .25), this.baseMaterial)
        this.scrollBar = new THREE.Mesh(new THREE.PlaneGeometry(.03, .25), this.scrollMaterial)
        this.scrollBar.position.x = 0.15

        this.add(this.mesh)
        this.add(this.scrollBar)

        this.position.set(0, 1.6, -0.5)
        this.position.set(.1, .1, .1)
        this.rotateY(Math.PI * .25)
        this.rotateZ(Math.PI * -.25)

        this.raycaster = new THREE.Raycaster()
        this.raycaster.near = 0.1
        this.raycaster.far = 0.5
        this.rayOrigin = new THREE.Vector3()
        this.rayDest = new THREE.Vector3()
        this.rayDirection = new THREE.Vector3()

        this.scroll(0)
        this.addSlider(0)
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

    clearRect() {
        this.ctx.fillStyle = 'black'
        this.ctx.fillRect(10, 128 + 64, this.c.width - 20, 64)
        this.ctx.fillStyle = 'white'
    }

    addSlider(x) {
        this.clearRect()
        this.ctx.fillRect(20, 128 + 64 + 31, this.c.width - 40, 2)
        this.ctx.beginPath()
        this.ctx.arc(20 + x * (this.c.width - 40), 128 + 64 + 31, 10, 0, 2 * Math.PI)
        this.ctx.fill()
    }

    drawText(s) {
        this.ctx.fillStyle = 'black'
        this.ctx.fillRect(10, 56, 492, -40)
        this.ctx.fillStyle = 'white'
        this.ctx.fillText(s, 10, 50)
        this.baseMaterial.emissiveMap.needsUpdate = true
    }

    updateMenu(c) {
        const origin = c.getWorldPosition(this.rayOrigin)
        const dest = c.children[0].getWorldPosition(this.rayDest)
        this.raycaster.set(origin, this.rayDirection.subVectors(dest, origin).normalize())
        const i = this.raycaster.intersectObject(this.mesh)
        if (i.length > 0) {
            const uv = i[0].uv
            this.drawText(`${round2(uv.x)}, ${round2(uv.y)}`)
            this.addSlider(uv.x)
        }
    }

    updateScrollbar(c) {
        const origin = c.getWorldPosition(this.rayOrigin)
        const dest = c.children[0].getWorldPosition(this.rayDest)
        this.raycaster.set(origin, this.rayDirection.subVectors(dest, origin).normalize())
        const i = this.raycaster.intersectObject(this.scrollBar)
        if (i.length > 0) {
            const uv = i[0].uv
            this.scroll(clamp(1.5 * (1 - uv.y) - 0.25, 0, 1))
        }
    }

    update(c) {
        if (c.children.length === 0) {
            return
        }
        this.updateMenu(c)
        // this.updateScrollbar(c)
    }
}
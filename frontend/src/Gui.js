import * as THREE from 'three'

const clamp = (num, min, max) => Math.min(Math.max(num, min), max)

const round = (num, places = 2) => String(Math.round(num * Math.pow(10, places)) / Math.pow(10, places))

export default class Gui extends THREE.Group {
    constructor() {
        super()

        this.c = document.getElementById('gui')
        this.numPages = 1
        this.c.width = 512
        this.c.height = this.c.width * this.numPages

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

        this.borderWidth = 20
        this.rowHeight = 128

        this.sliders = []
    }

    addSlider(obj, prop, min = 0, max = 1, step = null) {
        this.sliders.push({ obj, prop, min, max, step })
        this.sliders.forEach((s, i) => {
            this.drawSlider(i, 0)
            this.drawText(i, `${s.prop}: ${round(s.min, 4)}`)
        })
    }

    // TODO add some visual to scroll bar
    scroll(x) {
        const uv = this.mesh.geometry.attributes.uv
        const invPage = 1 - (1 / this.numPages)
        // this is top half
        uv.array[5] = invPage * (1 - x)
        uv.array[7] = invPage * (1 - x)

        // this is bottom half
        uv.array[1] = 1 - (invPage * x)
        uv.array[3] = 1 - (invPage * x)
        uv.needsUpdate = true
    }

    clearRect(rowNum) {
        this.ctx.fillStyle = 'black'
        this.ctx.fillRect(10, this.rowHeight * (rowNum + 0.5), this.c.width - this.borderWidth, this.rowHeight * 0.5)
        this.ctx.fillStyle = 'white'
    }

    drawCircle(x, y, r) {
        this.ctx.arc(x, y, r, 0, 2 * Math.PI)
        this.ctx.fill()
    }

    drawSlider(rowNum, x) {
        this.clearRect(rowNum)
        this.ctx.fillRect(this.borderWidth, this.rowHeight * (rowNum + 0.5 + 0.25) - 1, this.c.width - 2 * this.borderWidth, 2)
        this.ctx.beginPath()
        this.drawCircle(this.borderWidth + x * (this.c.width - 2 * this.borderWidth), (rowNum + 0.5 + 0.25) * this.rowHeight - 1, 10)
    }

    drawText(rowNum, s) {
        this.ctx.fillStyle = 'black'
        this.ctx.fillRect(10, rowNum * this.rowHeight + 10, this.c.width - this.borderWidth, this.rowHeight * 0.5 - 10)
        this.ctx.fillStyle = 'white'
        this.ctx.fillText(s, 10, (rowNum * this.rowHeight) + 50)
        this.baseMaterial.emissiveMap.needsUpdate = true
    }

    updateMenu(c) {
        const origin = c.getWorldPosition(this.rayOrigin)
        const dest = c.children[0].getWorldPosition(this.rayDest)
        this.raycaster.set(origin, this.rayDirection.subVectors(dest, origin).normalize())
        const i = this.raycaster.intersectObject(this.mesh)
        if (i.length > 0) {
            const uv = i[0].uv
            const y = (1 - uv.y) * this.c.height
            const rowNum = Math.trunc(y / this.rowHeight)
            if (rowNum < this.sliders.length && y > this.rowHeight * (rowNum + 0.5) && y < this.rowHeight * (rowNum + 1)) {
                const s = this.sliders[rowNum]

                let x = uv.x
                x = s.min + x * (s.max - s.min)
                x = s.step ? s.step * Math.trunc(x / s.step) : x

                s.obj[s.prop] = x
                this.drawSlider(rowNum, (x - s.min) / (s.max - s.min))
                this.drawText(rowNum, `${s.prop}: ${round(x, 4)}`)

                console.log(s.obj)
            }
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
        this.updateScrollbar(c)
    }
}
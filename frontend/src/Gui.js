import * as THREE from 'three'

const clamp = (num, min, max) => Math.min(Math.max(num, min), max)

const round = (num, places = 2) => String(Math.round(num * Math.pow(10, places)) / Math.pow(10, places))

export default class Gui extends THREE.Group {
    constructor() {
        super()

        this.numPages = 2

        this.mainScreenCanvas = document.getElementById('gui')
        this.mainScreenCanvas.width = 512
        this.mainScreenCanvas.height = this.mainScreenCanvas.width * this.numPages

        this.ctx = this.mainScreenCanvas.getContext('2d')
        this.ctx.strokeStyle = 'white'
        this.ctx.fillStyle = 'white'
        this.ctx.strokeRect(1, 1, this.mainScreenCanvas.width - 2, this.mainScreenCanvas.height - 2)
        this.ctx.font = '30px Arial'

        const scrollWidthFraction = .12

        // TODO DRY
        this.scrollCanvas = document.getElementById('scroll')
        this.scrollCanvas.width = this.mainScreenCanvas.width * scrollWidthFraction
        this.scrollCanvas.height = this.mainScreenCanvas.width
        this.scrollCtx = this.scrollCanvas.getContext('2d')
        this.scrollCtx.strokeStyle = 'white'
        this.scrollCtx.fillStyle = 'white'
        this.scrollCtx.strokeRect(1, 1, this.scrollCanvas.width - 2, this.scrollCanvas.height - 2)
        this.scrollCtx.fillRect(0, 0, this.scrollCanvas.width, this.scrollCanvas.width)

        this.baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x1fa3ef,
            transparent: true,
            opacity: 0.5,
            emissive: 0xffffff,
            emissiveMap: new THREE.CanvasTexture(this.mainScreenCanvas),
        })
        this.scrollMaterial = new THREE.MeshStandardMaterial({
            color: 0x1fa3ef,
            transparent: true,
            opacity: 0.5,
            emissive: 0xffffff,
            emissiveMap: new THREE.CanvasTexture(this.scrollCanvas),
        })
        const dim = 0.25
        this.mainScreen = new THREE.Mesh(new THREE.PlaneGeometry(dim, dim), this.baseMaterial)
        this.scrollBar = new THREE.Mesh(new THREE.PlaneGeometry(dim * scrollWidthFraction, dim), this.scrollMaterial)
        this.scrollBar.position.x = 0.15

        this.add(this.mainScreen)
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

    scroll(x) {
        const uv = this.mainScreen.geometry.attributes.uv
        const invPage = 1 - (1 / this.numPages)
        // this is top half
        uv.array[5] = invPage * (1 - x)
        uv.array[7] = invPage * (1 - x)

        // this is bottom half
        uv.array[1] = 1 - (invPage * x)
        uv.array[3] = 1 - (invPage * x)
        uv.needsUpdate = true

        this.drawScroll(x)
    }

    drawScroll(x) {
        this.scrollCtx.fillStyle = 'black'
        this.scrollCtx.fillRect(0, 0, this.scrollCanvas.width, this.scrollCanvas.height)
        this.scrollCtx.fillStyle = 'white'
        this.scrollCtx.strokeRect(1, 1, this.scrollCanvas.width - 2, this.scrollCanvas.height - 2)

        this.scrollCtx.fillRect(0, (this.scrollCanvas.height - this.scrollCanvas.width) * x, this.scrollCanvas.width, this.scrollCanvas.width)
    }

    clearRect(rowNum) {
        this.ctx.fillStyle = 'black'
        this.ctx.fillRect(10, this.rowHeight * (rowNum + 0.5), this.mainScreenCanvas.width - this.borderWidth, this.rowHeight * 0.5)
        this.ctx.fillStyle = 'white'
    }

    drawCircle(x, y, r) {
        this.ctx.arc(x, y, r, 0, 2 * Math.PI)
        this.ctx.fill()
    }

    drawSlider(rowNum, x) {
        this.clearRect(rowNum)
        this.ctx.fillRect(this.borderWidth, this.rowHeight * (rowNum + 0.5 + 0.25) - 1, this.mainScreenCanvas.width - 2 * this.borderWidth, 2)
        this.ctx.beginPath()
        this.drawCircle(this.borderWidth + x * (this.mainScreenCanvas.width - 2 * this.borderWidth), (rowNum + 0.5 + 0.25) * this.rowHeight - 1, 10)
    }

    drawText(rowNum, s) {
        this.ctx.fillStyle = 'black'
        this.ctx.fillRect(10, rowNum * this.rowHeight + 10, this.mainScreenCanvas.width - this.borderWidth, this.rowHeight * 0.5 - 10)
        this.ctx.fillStyle = 'white'
        this.ctx.fillText(s, 10, (rowNum * this.rowHeight) + 50)
    }

    updateMenu(c) {
        const origin = c.getWorldPosition(this.rayOrigin)
        const dest = c.children[0].getWorldPosition(this.rayDest)
        this.raycaster.set(origin, this.rayDirection.subVectors(dest, origin).normalize())
        const i = this.raycaster.intersectObject(this.mainScreen)
        if (i.length > 0) {
            const uv = i[0].uv
            const y = (1 - uv.y) * this.mainScreenCanvas.height
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
        this.baseMaterial.emissiveMap.needsUpdate = true
        this.scrollMaterial.emissiveMap.needsUpdate = true
    }
}
import * as THREE from 'three'
import ControllerRaycaster from './ControllerRaycaster'
import Utils from '../Utils'

const round = (num, places = 2) => String(Math.round(num * Math.pow(10, places)) / Math.pow(10, places))

const canvasMaterial = canvas => new THREE.MeshStandardMaterial({
    color: 0x1fa3ef,
    transparent: true,
    opacity: 0.5,
    emissive: 0xffffff,
    emissiveMap: new THREE.CanvasTexture(canvas),
})

const initCanvas = conf => {
    const { id, w, h } = conf
    const canvas = document.getElementById(id)
    canvas.width = w
    canvas.height = h

    return canvas
}

const initCtx = canvas => {
    const ctx = canvas.getContext('2d')
    ctx.strokeStyle = 'white'
    ctx.fillStyle = 'white'
    ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2)

    return ctx
}

export default class Gui extends THREE.Group {
    constructor() {
        super()

        this.numPages = 2
        this.borderWidth = 20
        this.rowHeight = 128

        const cdim = 512
        {
            const w = cdim
            const h = w * this.numPages

            this.mainScreenCanvas = initCanvas({ id: 'gui', w, h })
            this.ctx = initCtx(this.mainScreenCanvas)
            this.ctx.font = '30px Arial'
        }

        const scrollWidthFraction = .12
        {
            const w = cdim * scrollWidthFraction
            const h = cdim

            this.scrollCanvas = initCanvas({ id: 'scroll', w, h })
            this.scrollCtx = initCtx(this.scrollCanvas)
            this.scrollCtx.fillRect(0, 0, this.scrollCanvas.width, this.scrollCanvas.width)
        }

        this.baseMaterial = canvasMaterial(this.mainScreenCanvas)
        this.scrollMaterial = canvasMaterial(this.scrollCanvas)

        const gdim = 0.25
        this.mainScreen = new THREE.Mesh(new THREE.PlaneGeometry(gdim, gdim), this.baseMaterial)
        this.scrollBar = new THREE.Mesh(new THREE.PlaneGeometry(gdim * scrollWidthFraction, gdim), this.scrollMaterial)
        this.scrollBar.position.x = 0.15

        this.add(this.mainScreen)
        this.add(this.scrollBar)

        this.position.set(0, 1.5, -0.5)
        // this.rotateY(Math.PI * .25)
        // this.rotateZ(Math.PI * -.25)

        this.raycaster = new ControllerRaycaster(0, 0.1)

        this.scroll(0)

        this.sliders = []

        this.visible = false

        this.wasPressed = false

        this.update = () => { }
    }

    toggle() {
        this.visible = !this.visible
        this.update = this.visible ? this.updateImpl : () => { }
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

    updateMenu(con, source) {
        const i = this.raycaster.intersects(con, this.mainScreen)
        if (i) {
            this.vibrateOnce(source)
            const uv = i.uv
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
            }
        }
        return i
    }

    updateScrollbar(con, source) {
        const i = this.raycaster.intersects(con, this.scrollBar)
        if (i) {
            this.vibrateOnce(source)
            const uv = i.uv
            this.scroll(Utils.clamp(1.5 * (1 - uv.y) - 0.25))
        }
        return i
    }

    vibrateOnce(source) {
        if (!this.wasPressed) {
            const h = source.gamepad.hapticActuators
            if (h) {
                h[0].pulse(1.0, 50)
            }
        }
    }

    updateImpl(con, source) {
        this.wasPressed = this.updateMenu(con, source) || this.updateScrollbar(con, source)
        this.baseMaterial.emissiveMap.needsUpdate = true
        this.scrollMaterial.emissiveMap.needsUpdate = true
    }
}
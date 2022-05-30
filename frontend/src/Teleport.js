import * as THREE from 'three'
import ControllerRaycaster from './ControllerRaycaster'

export default class Teleport {
    constructor(scene, con, objects, player) {
        this.scene = scene
        this.objects = objects
        this.player = player

        this.raycaster = new ControllerRaycaster()
        this.origin = new THREE.Vector3()
        const opacity = 0.6
        this.intersectionMesh = new THREE.Mesh(new THREE.SphereGeometry(0.025), new THREE.MeshBasicMaterial({ transparent: true, opacity: opacity }))
        this.curveMat = new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: opacity })
        this.curveVertices = 64
        this.curveGeo = new THREE.BufferGeometry()
        this.curveGeo.setAttribute('position', new THREE.Float32BufferAttribute(Array(this.curveVertices * 3).fill(0), 3))
        this.curveGeo.setDrawRange(0, this.curveVertices)
        this.curve = new THREE.Line(this.curveGeo, this.curveMat)
        this.curve.visible = false
        this.target = con.children[0]

        this.controlPoint = { x: 0, y: 0.33 }
    }

    startPoint(con) {
        this.pointingTeleport = true
        this.scene.add(this.intersectionMesh)
        con.add(this.curve)
        this.curve.visible = true
        con.children[0].visible = false
    }

    go(con) {
        this.player.position.copy(this.intersectionMesh.position)
        this.pointingTeleport = false
        this.scene.remove(this.intersectionMesh)
        con.children[0].visible = true
        this.curve.visible = false
    }

    update(con) {
        if (!this.pointingTeleport) {
            return
        }

        if (con.children.length === 0) {
            return
        }
        // TODO maybe combine some logic here with Gui
        const i = this.raycaster.intersects(con, this.objects.floor)
        if (i) {
            const p = i.point
            this.intersectionMesh.position.copy(p)

            const origin = con.getWorldPosition(this.origin)
            const distance = origin.distanceTo(p)
            const path = new THREE.Path()
            path.quadraticCurveTo(this.controlPoint.x * distance, this.controlPoint.y * distance, distance, 0)
            const points = path.getPoints(this.curveVertices - 1)
            const positions = this.curveGeo.attributes.position.array
            for (let i = 0; i < this.curveVertices; ++i) {
                positions[3 * i] = 0
                positions[3 * i + 1] = points[i].y
                positions[3 * i + 2] = -points[i].x
            }
            this.curveGeo.attributes.position.needsUpdate = true
            this.curve.visible = true
        } else {
            this.curve.visible = false
        }
    }
}
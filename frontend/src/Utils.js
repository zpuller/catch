import * as THREE from 'three'

const clamp = (n, min = 0, max = 1) => Math.min(Math.max(n, min), max)

const swapToMat = (oldMaterial, newMat) => {
    const { map, color } = oldMaterial
    newMat.setValues({ map, color })
    oldMaterial.dispose()

    return newMat
}

const swapToLambertMat = (oldMaterial) => {
    const newMat = new THREE.MeshLambertMaterial()
    return swapToMat(oldMaterial, newMat)
}

const swapToPhongMat = (oldMaterial) => {
    const newMat = new THREE.MeshPhongMaterial()
    return swapToMat(oldMaterial, newMat)
}

const swapToBasicMat = (oldMaterial) => {
    const newMat = new THREE.MeshBasicMaterial()
    return swapToMat(oldMaterial, newMat)
}

export default {
    clamp,
    swapToLambertMat,
    swapToPhongMat,
    swapToBasicMat,
}
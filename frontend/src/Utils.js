const clamp = (n, min = 0, max = 1) => Math.min(Math.max(n, min), max)

export default {
    clamp,
}
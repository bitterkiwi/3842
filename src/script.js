import * as THREE from 'three'

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Floor (White)
 */
const floorMaterial = new THREE.MeshBasicMaterial({ color: "white" })
const floor = new THREE.Mesh(new THREE.PlaneGeometry(50, 500,), floorMaterial)
floor.rotation.x = -Math.PI / 2 // Make the plane horizontal
scene.add(floor)


const middleMaterial = new THREE.MeshBasicMaterial({ color: "blue" })
const middle = new THREE.Mesh(new THREE.SphereGeometry(6, 16 , 36 ), middleMaterial)
middle.rotation.x = -Math.PI / 2 // Make the plane horizontal
middle.position.y = 6
scene.add(middle)


/**
 * Walls (Left and Right)
 */
const wallMaterial = new THREE.MeshBasicMaterial({ color: "red" })

// Left Wall
const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(500, 10), wallMaterial)
leftWall.rotation.y = Math.PI / 2
leftWall.position.set(-25, 5, 0)
scene.add(leftWall)

// Right Wall
const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(500, 10), wallMaterial)
rightWall.rotation.y = -Math.PI / 2
rightWall.position.set(25, 5, 0)
scene.add(rightWall)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 10, 20) // Position the camera above and away from the scene
//camera.lookAt(0, 0, 0) // Make the camera look at the center of the floor
scene.add(camera)

camera.position.z = 40

/**
 * Movement Controls
 */
const keys = { w: false, a: false, s: false, d: false }
const cameraSpeed = 0.3 // Movement speed

// Keydown event listener for movement
window.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'w') keys.w = true
    if (event.key.toLowerCase() === 'a') keys.a = true
    if (event.key.toLowerCase() === 's') keys.s = true
    if (event.key.toLowerCase() === 'd') keys.d = true
})

// Keyup event listener for stopping movement
window.addEventListener('keyup', (event) => {
    if (event.key.toLowerCase() === 'w') keys.w = false
    if (event.key.toLowerCase() === 'a') keys.a = false
    if (event.key.toLowerCase() === 's') keys.s = false
    if (event.key.toLowerCase() === 'd') keys.d = false
})

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Handle Resize
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Animate
 */
const tick = () => {
    // Move camera based on key presses
    if (keys.w) camera.position.z -= cameraSpeed
    if (keys.s) camera.position.z += cameraSpeed
    if (keys.a) camera.position.x -= cameraSpeed
    if (keys.d) camera.position.x += cameraSpeed

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

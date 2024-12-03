import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'; //delflower

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x4caf50, roughness: 0.8 });
const stemGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 32);
const stem = new THREE.Mesh(stemGeometry, stemMaterial);
stem.position.set(0, 1, 0);
stem.castShadow = true;
scene.add(stem);

// Petals
const petalMaterial = new THREE.MeshStandardMaterial({
  color: 0xff3366, // Vibrant pink-red tulip color
  roughness: 0.6,
  side: THREE.DoubleSide,
});

const petalGeometry = new THREE.ShapeGeometry(new THREE.Shape([
  new THREE.Vector2(0, 0),
  new THREE.Vector2(0.2, 1),
  new THREE.Vector2(0, 2),
  new THREE.Vector2(-0.2, 1),
]));

const petals = [];
const petalCount = 6;

for (let i = 0; i < petalCount; i++) {
  const petal = new THREE.Mesh(petalGeometry, petalMaterial);
  petal.position.y = 2; // Place petals at the top of the stem
  petal.rotation.y = (i / petalCount) * Math.PI * 2; // Distribute around the center
  petal.rotation.z = Math.PI / 8; // Slight tilt for realism
  scene.add(petal);
  petals.push(petal);
}

// Leaves
const leafMaterial = new THREE.MeshStandardMaterial({
  color: 0x2e8b57, // Dark green for leaves
  roughness: 0.8,
  side: THREE.DoubleSide,
});

const leafGeometry = new THREE.ShapeGeometry(new THREE.Shape([
  new THREE.Vector2(0, 0),
  new THREE.Vector2(0.3, 0.7),
  new THREE.Vector2(0, 1.5),
  new THREE.Vector2(-0.3, 0.7),
]));

const leaves = [];
const leafCount = 2;

for (let i = 0; i < leafCount; i++) {
  const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
  leaf.position.y = 0.5; // Position leaves near the base
  leaf.rotation.z = Math.PI / 6; // Slight tilt
  leaf.rotation.y = (i / leafCount) * Math.PI; // Spread on opposite sides
  scene.add(leaf);
  leaves.push(leaf);
}




/**
 * Checkerboard Texture for Floor
 */
const textureSize = 8; // Number of tiles per side
const checkerboardTexture = new THREE.DataTexture(
  new Uint8Array(textureSize * textureSize * 4), 
  textureSize, 
  textureSize
);

const data = checkerboardTexture.image.data;

// Fill the texture data with black and white colors (checkerboard pattern)
for (let i = 0; i < textureSize; i++) {
  for (let j = 0; j < textureSize; j++) {
    const offset = (i * textureSize + j) * 4;
    const isBlack = (i + j) % 2 === 0;

    // Set RGBA values (black or white)
    data[offset] = isBlack ? 0 : 255;   // R
    data[offset + 1] = isBlack ? 0 : 255; // G
    data[offset + 2] = isBlack ? 0 : 255; // B
    data[offset + 3] = 255;  // A (Alpha)
  }
}

checkerboardTexture.needsUpdate = true;  // Mark texture as needing update

checkerboardTexture.wrapS = THREE.RepeatWrapping;  // Repeat horizontally
checkerboardTexture.wrapT = THREE.RepeatWrapping;  // Repeat vertically
checkerboardTexture.repeat.set(textureSize, textureSize); // Adjust how many tiles

const floorMaterial = new THREE.MeshStandardMaterial({
  map: checkerboardTexture, // Use the checkerboard texture
  side: THREE.DoubleSide // Ensure the floor is visible from both sides
})

// Make the floor geometry square (50 by 50 instead of 50 by 500)
const floor = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), floorMaterial)
floor.rotation.x = -Math.PI / 2 // Make the plane horizontal
floor.position.y = 0 // Floor at y = 0
floor.receiveShadow = true // The floor will receive shadows
scene.add(floor)

/**
 * Ball (Middle)
 */
const ballMaterial = new THREE.MeshStandardMaterial({ color: "blue" }) // Use StandardMaterial for shadows
const ball = new THREE.Mesh(new THREE.SphereGeometry(2, 16, 16), ballMaterial)
ball.position.set(0, 20, 0) // Initial position of the ball
ball.castShadow = true // The ball will cast a shadow
scene.add(ball)

/**
 * Gradient Wall Material (Left and Right)
 */
const wallMaterial = new THREE.ShaderMaterial({
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    void main() {
      vec3 color = mix(vec3(0.8, 0.8, 0.8), vec3(1.0, 0.0, 0.0), vUv.x); // Horizontal gradient
      gl_FragColor = vec4(color, 1.0);
    }
  `
})

// Left Wall
const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(200, 10), wallMaterial)
leftWall.rotation.y = Math.PI / 2
leftWall.position.set(-25, 5, 0)
//scene.add(leftWall)

// Right Wall
const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(200, 10), wallMaterial)
rightWall.rotation.y = -Math.PI / 2
rightWall.position.set(25, 5, 0)
//scene.add(rightWall)

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
scene.add(camera)

/**
 * Movement Controls
 */
const keys = { w: false, a: false, s: false, d: false }
const cameraSpeed = 1 // Movement speed

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
 * Ball Bouncing Logic
 */
let velocity = 0
let gravity = -0.05 // Gravity pulling the ball down    -0.05
let bounceFactor = 1 // The factor that determines how much energy is conserved after bouncing
let minVelocity = 0.0004 // Minimum velocity before the ball stops bouncing

const updateBall = () => {
  // Update ball position and velocity based on gravity
  velocity += gravity
  ball.position.y += velocity

  // If ball hits the floor, reverse velocity (bounce)
  if (ball.position.y <= 2) { // Ball radius is 2, so it hits the floor at y=2
    ball.position.y = 2 // Reset position to avoid ball "falling through"
    velocity = -velocity * bounceFactor // Reverse and reduce velocity
  }

  // Stop the ball when the velocity is below the minimum threshold
  if (Math.abs(velocity) < minVelocity) {
    velocity = 0
  }
}

/**
 * Lighting (for shadows)
 */
const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
directionalLight.position.set(10, 20, 10)
directionalLight.castShadow = true
directionalLight.shadow.camera.near = 1 // Near plane for shadow camera
directionalLight.shadow.camera.far = 500 // Far plane for shadow camera
directionalLight.shadow.camera.left = -500 // Set left boundary for shadow
directionalLight.shadow.camera.right = 500 // Set right boundary for shadow
directionalLight.shadow.camera.top = 500 // Set top boundary for shadow
directionalLight.shadow.camera.bottom = -500 // Set bottom boundary for shadow
directionalLight.shadow.mapSize.width = 2048 // High resolution shadow map
directionalLight.shadow.mapSize.height = 2048 // High resolution shadow map
scene.add(directionalLight)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true // Enable shadow mapping
renderer.shadowMap.type = THREE.PCFSoftShadowMap // Set the shadow map type for softer shadows

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
  // Move the ball based on key presses (WASD)
  if (keys.w) ball.position.z -= cameraSpeed
  if (keys.s) ball.position.z += cameraSpeed
  if (keys.a) ball.position.x -= cameraSpeed
  if (keys.d) ball.position.x += cameraSpeed

  // Update ball position based on gravity and bouncing
  updateBall()
  console.log(ball.position)
  /*Camera follows the ball
  camera.position.x = ball.position.x
  camera.position.y = ball.position.y + 10 // Keep the camera slightly above the ball
  camera.position.z = ball.position.z + 40 // Keep the camera at a distance from the ball
  camera.lookAt(ball.position) // Make the camera look at the ball
  */

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()



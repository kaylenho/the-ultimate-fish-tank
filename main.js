import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040); // Soft ambient light
scene.add(ambientLight);

// Create Fish Group
const fish = new THREE.Group();

// Fish Head
const headRadius = 1.5; // Increased for better proportion
const headGeometry = new THREE.SphereGeometry(headRadius, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
const material = new THREE.MeshPhongMaterial({ color: 0x80FFFF, shininess: 40 });
const fishHead = new THREE.Mesh(headGeometry, material);
fishHead.rotation.x = Math.PI / 2;
fishHead.position.set(0, 0, 3.75); // Adjusted for better alignment
fish.add(fishHead);

// Fish Body (Box)
const bodyWidth = headRadius * 2;
const bodyHeight = 2.5;
const bodyLength = 5;
const bodyGeometry = new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyLength);
const fishBody = new THREE.Mesh(bodyGeometry, material);
fishBody.position.set(0, 0, 1); // Slightly forward for smooth connection
fish.add(fishBody);

// Fish Tail (Cone)
const tailRadius = 1.5; // Matching the body width
const tailHeight = 2.5; // Shortened to fit proportionally
const tailGeometry = new THREE.ConeGeometry(tailRadius, tailHeight, 6);
const fishTail = new THREE.Mesh(tailGeometry, material);
fishTail.rotation.x = Math.PI / 2;
fishTail.position.set(0, 0, -3.25); // Adjusted for smooth transition from body
fish.add(fishTail);

// Add Fish to Scene
scene.add(fish);

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();


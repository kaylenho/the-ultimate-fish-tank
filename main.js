

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

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Create Fish Group
const fish = new THREE.Group();
scene.add(fish);

// Material
const material = new THREE.MeshPhongMaterial({ color: 0x80FFFF, shininess: 40 });

// Fish Head - More Rounded and Fish-Like
const headGeometry = new THREE.SphereGeometry(1.2, 20, 16, 0, Math.PI * 2, 0, Math.PI/2); // 3/4 sphere for smooth transition
headGeometry.scale(.75, 3,1.5); // Make it slightly oval
const fishHead = new THREE.Mesh(headGeometry, material);
fishHead.rotation.x = Math.PI / 2;
fishHead.position.set(0, 0, 2.5); // Pushed slightly into the body
fish.add(fishHead);

// Fish Body - Ellipsoid Shape (With Clipped Front)
const bodyGeometry = new THREE.SphereGeometry(1.2, 20, 16, 0, Math.PI * 2, 0, Math.PI/2); // Half-sphere
bodyGeometry.scale(.75, 5,1.5); // Make it slightly oval
const fishBody = new THREE.Mesh(bodyGeometry, material);
fishBody.rotation.x = Math.PI / 2;
fishBody.rotation.z = Math.PI;
fishBody.position.set(0, 0, 2.5); // Shifted slightly to avoid overlap
fish.add(fishBody);

// Fish Tail - Fan-Like Shape
const tailRadius = 1.2;
const tailHeight = 2.5;
const tailGeometry = new THREE.ConeGeometry(tailRadius, tailHeight, 6);
const fishTail = new THREE.Mesh(tailGeometry, material);
fishTail.rotation.x = Math.PI / 2;
fishTail.position.set(0, 0, -4);
fish.add(fishTail);


const aquariumWidth = 60;
const aquariumHeight = 36;
const aquariumDepth = 48;

// Create the Aquarium
const aquariumGeometry = new THREE.BoxGeometry(aquariumWidth, aquariumHeight, aquariumDepth);
const aquariumMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x88ccff, // Light blue, like glass
    transparent: true,
    opacity: 0.3, // Adjust transparency
    roughness: 0.1, // Slightly smooth surface
    metalness: 0, // No metallic effect
    side: THREE.BackSide, // Ensures we see inside the box
});

const aquarium = new THREE.Mesh(aquariumGeometry, aquariumMaterial);
scene.add(aquarium);
const edgesGeometry = new THREE.EdgesGeometry(aquariumGeometry);
const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 }); // Black edges
const aquariumEdges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
scene.add(aquariumEdges);

// Desk Geometry
const deskGeometry = new THREE.BoxGeometry(90, 1, 60); // Wide and flat surface
const deskMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown color (wood-like)
const desk = new THREE.Mesh(deskGeometry, deskMaterial);

// Position the desk slightly below the aquarium
desk.position.set(0, -18.52, 0); // Adjust based on your aquarium's position

// Add desk to the scene
scene.add(desk);


// Position the Fish inside
fish.position.set(0, -1, 0); 


// Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    controls.update();

    const time = clock.getElapsedTime();
    const radius = 10;
    const dt = 0.01; // time for the look-ahead

    
    const verticalAmplitude = 2; // How high/low the fish moves
    const verticalSpeed = 2; // Speed of up and down movement

    // Update fish position along a circular path, moves up and down in Z sinusodal
    fish.position.x = Math.sin(time) * radius;
    fish.position.z = Math.cos(time) * radius;
    fish.position.y = Math.sin(time * verticalSpeed) * verticalAmplitude;

    const nextX = Math.sin(time + dt) * radius;
    const nextZ = Math.cos(time + dt) * radius;
    const nextY = Math.sin((time + dt) * verticalSpeed) * verticalAmplitude;
    const nextPos = new THREE.Vector3(nextX, nextY, nextZ);

    // Rotate the fish so its head faces the direction of movement
    fish.lookAt(nextPos);

    renderer.render(scene, camera);
}

animate();


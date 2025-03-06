

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

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
const light = new THREE.DirectionalLight(0xffffff, 5);
light.position.set(5, 10, 5);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040, 10);
scene.add(ambientLight);

// Create Fish Group
const fish = new THREE.Group();
scene.add(fish);

// Material
const material = new THREE.MeshPhongMaterial({ color: 0xFF8C00, shininess: 40 }); //orange

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

const legGeometry = new THREE.BoxGeometry(2, 20, 2); // Thin, tall cuboid for legs
const legMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Same brown color as desk

// Create four legs
const leg1 = new THREE.Mesh(legGeometry, legMaterial);
const leg2 = new THREE.Mesh(legGeometry, legMaterial);
const leg3 = new THREE.Mesh(legGeometry, legMaterial);
const leg4 = new THREE.Mesh(legGeometry, legMaterial);

// Position legs at corners
const deskHeight = -18.52 - 10; // Desk position - half the leg height
const deskWidth = 90 / 2 - 1; // Half desk width - half leg width
const deskDepth = 60 / 2 - 1; // Half desk depth - half leg depth

leg1.position.set(deskWidth, deskHeight, deskDepth);
leg2.position.set(-deskWidth, deskHeight, deskDepth);
leg3.position.set(deskWidth, deskHeight, -deskDepth);
leg4.position.set(-deskWidth, deskHeight, -deskDepth);

// Add legs to the scene
scene.add(leg1, leg2, leg3, leg4);

const loader = new GLTFLoader();
let selectedObject = null;
const mouse = new THREE.Vector2(); // Declare the mouse vector

// Load the coral model
loader.load('/coral.glb', function (gltf) {
    const coral = gltf.scene;
    coral.scale.set(1, 1, 1); // Adjust scale if needed
    coral.position.set(-16, -18, 0); // Adjust position inside the aquarium

    // Ensure all child meshes are draggable
    coral.traverse((child) => {
        if (child.isMesh) {
            child.userData.draggable = true;
        }
    });

    scene.add(coral);
});

// Raycaster setup
const raycaster = new THREE.Raycaster();
const clickMouse = new THREE.Vector2();
const moveMouse = new THREE.Vector2();

window.addEventListener('mousedown', onMouseDown);
window.addEventListener('mousemove', onMouseMove);
window.addEventListener('mouseup', onMouseUp);
function onMouseDown(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const object = intersects[0].object;

        if (object.userData.draggable) {
            selectedObject = object;
            controls.enabled = false;

            // Calculate and store the local offset of the coral relative to the click
            const intersectionPoint = intersects[0].point;
            selectedObject.userData.offset = {
                x: intersectionPoint.x - selectedObject.position.x,
                z: intersectionPoint.z - selectedObject.position.z,
            };

            selectedObject.userData.offsetY = selectedObject.position.y; // Maintain original height
        }
    }
}


function onMouseMove(event) {
    if (!selectedObject) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -selectedObject.userData.offsetY);
   // const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), selectedObject.userData.offsetY);

    const intersection = new THREE.Vector3();

    if (raycaster.ray.intersectPlane(plane, intersection)) {
        selectedObject.position.set(
            intersection.x - selectedObject.userData.offset.x,
            selectedObject.userData.offsetY, 
            intersection.z - selectedObject.userData.offset.z
        );
    }
}




function onMouseUp() {
    selectedObject = null;
    controls.enabled = true; // Re-enable orbit controls
}

// const loader = new GLTFLoader();

// // Load the coral model
//  loader.load('/coral.glb', function (gltf){
//         const coral = gltf.scene;
//         coral.scale.set(1, 1, 1); // Adjust scale if needed
//         coral.position.set(-16, -18, 0); // Adjust position inside the aquarium
//         coral.userData.draggable = true; 
//         scene.add(coral);
//     }
// );


//   const raycaster = new THREE.Raycaster(); // create once
//   const clickMouse = new THREE.Vector2();  // create once
//   const moveMouse = new THREE.Vector2();   // create once
//   //var draggable: THREE.Object3D;

// window.addEventListener('mousedown', onMouseDown);
// window.addEventListener('mousemove', onMouseMove);
// window.addEventListener('mouseup', onMouseUp);
// function onMouseDown(event) {
//     // Convert mouse position to normalized device coordinates (-1 to +1)
//     mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//     mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

//     raycaster.setFromCamera(mouse, camera);
//     const intersects = raycaster.intersectObjects(scene.children, true);

//     if (intersects.length > 0) {
//         const object = intersects[0].object;
//         if (object.userData.draggable) {
//             selectedObject = object;
//             controls.enabled = false; // Disable orbit controls while dragging
//         }
//     }
// }

// function onMouseMove(event) {
//     if (!selectedObject) return;

//     // Convert mouse position to normalized device coordinates
//     mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//     mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

//     // Update raycaster and find intersection with ground plane (Y = -10)
//     raycaster.setFromCamera(mouse, camera);
//     const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -10); // Plane at y = -10
//     const intersection = new THREE.Vector3();
    
//     if (raycaster.ray.intersectPlane(plane, intersection)) {
//         selectedObject.position.set(intersection.x, -10, intersection.z);
//     }
// }

// function onMouseUp() {
//     selectedObject = null;
//     controls.enabled = true; // Re-enable orbit controls
// }

// // Load the coral model
//  loader.load('/coral.glb', function (gltf){
// // loader.load(
// //     '/Users/neha/Downloads/CS174A/GroupProject/the-ultimate-fish-tank/coral.glb', // <-- Replace with the actual path to your downloaded GLB file
// //     function (gltf) {
//         const coral = gltf.scene;
//         coral.scale.set(1, 1, 1); // Adjust scale if needed
//         coral.position.set(-16, -18, 0); // Adjust position inside the aquarium
//         scene.add(coral);
//     }
// );



//   const raycaster = new THREE.Raycaster(); // create once
//   const clickMouse = new THREE.Vector2();  // create once
//   const moveMouse = new THREE.Vector2();   // create once
//   var draggable: THREE.Object3D;
  
//   function intersect(pos: THREE.Vector2) {
//     raycaster.setFromCamera(pos, camera);
//     return raycaster.intersectObjects(scene.children);
//   }
  
//   window.addEventListener('click', event => {
//     if (draggable != null) {
//       console.log(`dropping draggable ${draggable.userData.name}`)
//       draggable = null as any
//       return;
//     }
  
//     // THREE RAYCASTER
//     clickMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//     clickMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
//     const found = intersect(clickMouse);
//     if (found.length > 0) {
//       if (found[0].object.userData.draggable) {
//         draggable = found[0].object
//         console.log(`found draggable ${draggable.userData.name}`)
//       }
//     }
//   })
  
//   window.addEventListener('mousemove', event => {
//     moveMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//     moveMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
//   });
  
//   function dragObject() {
//     if (draggable != null) {
//       const found = intersect(moveMouse);
//       if (found.length > 0) {
//         for (let i = 0; i < found.length; i++) {
//           if (!found[i].object.userData.ground)
//             continue
          
//           let target = found[i].point;
//           draggable.position.x = target.x
//           draggable.position.z = target.z
//         }
//       }
//     }
//   }
  
// const floorGeometry = new THREE.BoxGeometry(150, 2, 100); // Large flat surface
// const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 }); // Dark brown for wooden floor

// const floor = new THREE.Mesh(floorGeometry, floorMaterial);

// // Position it slightly below the desk legs
// const floorHeight = -18.52 - 20 - 1; // Below the desk legs
// floor.position.set(0, floorHeight, 0);

// scene.add(floor);
const textureLoader = new THREE.TextureLoader();
const tileTexture = textureLoader.load('https://threejs.org/examples/textures/brick_diffuse.jpg'); // Example tile texture

tileTexture.wrapS = THREE.RepeatWrapping;
tileTexture.wrapT = THREE.RepeatWrapping;
tileTexture.repeat.set(10, 10); // Repeats the texture for a tiled look

const tileMaterial = new THREE.MeshStandardMaterial({
    map: tileTexture,
    roughness: 0.8, // Make it slightly glossy like tiles
});

const floorGeometry = new THREE.BoxGeometry(300, 2, 200); // Bigger floor
const floor = new THREE.Mesh(floorGeometry, tileMaterial);

// Position the floor below the desk
const floorHeight = -18.52 - 20 - 1;
floor.position.set(0, floorHeight, 0);

scene.add(floor);
// Position the Fish inside
fish.position.set(0, -1, 0); 


function createRock(x, y, z, scale = 1) {
    const geometry = new THREE.DodecahedronGeometry(2, 0);
    const posAttr = geometry.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
        const vertex = new THREE.Vector3();
        vertex.fromBufferAttribute(posAttr, i);
        vertex.x += (Math.random() - 0.5) * 0.5;
        vertex.y += (Math.random() - 0.5) * 0.5;
        vertex.z += (Math.random() - 0.5) * 0.5;
        posAttr.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    geometry.computeVertexNormals();
    const material = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.9 });
    const rock = new THREE.Mesh(geometry, material);
    rock.position.set(x, y, z);
    rock.scale.set(scale, scale, scale);
    return rock;
}

// Animated seaweed: static base + dynamic top
function createAnimatedSeaweed(x, z, totalHeight = 8, baseHeight = 2) {
    const seaweedGroup = new THREE.Group();
    const seaweedMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    
    // Base (static part)
    const baseGeometry = new THREE.CylinderGeometry(0.2, 0.2, baseHeight, 8, 1);
    const baseMesh = new THREE.Mesh(baseGeometry, seaweedMaterial);
    baseMesh.position.set(0, -18 + baseHeight / 2, 0);
    seaweedGroup.add(baseMesh);
    
    // Top (dynamic part)
    const topHeight = totalHeight - baseHeight;
    const topGeometry = new THREE.CylinderGeometry(0.2, 0.2, topHeight, 8, 1);
    const topMesh = new THREE.Mesh(topGeometry, seaweedMaterial);
    // Position the top mesh so its base is at the pivot origin
    topMesh.position.set(0, topHeight / 2, 0);
    
    // Pivot for animating the top part
    const pivot = new THREE.Group();
    pivot.position.set(0, -18 + baseHeight, 0); // at the top of the base
    pivot.add(topMesh);
    seaweedGroup.add(pivot);
    
    // Offset for individual sway animation
    seaweedGroup.userData.pivot = pivot;
    seaweedGroup.userData.offset = Math.random() * Math.PI * 2;
    
    // Set horizontal position
    seaweedGroup.position.x = x;
    seaweedGroup.position.z = z;
    return seaweedGroup;
}

// Create a cluster of animated seaweed pieces
function createSeaweedCluster(num, centerX, centerZ, spread = 3) {
    const cluster = new THREE.Group();
    for (let i = 0; i < num; i++) {
        const x = centerX + (Math.random() - 0.5) * spread;
        const z = centerZ + (Math.random() - 0.5) * spread;
        const totalHeight = 5 + Math.random() * 5; // between 5 and 10
        const seaweed = createAnimatedSeaweed(x, z, totalHeight, 2);
        cluster.add(seaweed);
    }
    return cluster;
}

// Shell creation (flattened sphere)
function createShell(x, z, scale = 1) {
    const geometry = new THREE.SphereGeometry(0.5, 16, 16);
    geometry.scale(1, 0.5, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0xFFCC66, roughness: 0.8 });
    const shell = new THREE.Mesh(geometry, material);
    shell.position.set(x, -18 + 0.25 * scale, z);
    shell.scale.set(scale, scale, scale);
    return shell;
}




// Rocks
const rocks = [];
rocks.push(createRock(5, -17, -3, 1));
rocks.push(createRock(-10, -16.5, 8, 1.2));
rocks.push(createRock(12, -17.5, -6, 0.8));
rocks.forEach(rock => scene.add(rock));

// Seaweed clusters
const seaweedCluster1 = createSeaweedCluster(5, 10, 4);
const seaweedCluster2 = createSeaweedCluster(7, -8, -5);
const seaweedCluster3 = createSeaweedCluster(6, 0, 12);
scene.add(seaweedCluster1, seaweedCluster2, seaweedCluster3);

// Shells
const shells = [];
shells.push(createShell(-5, 2, 1));
shells.push(createShell(8, -10, 0.8));
shells.push(createShell(-12, 6, 1.1));
shells.forEach(shell => scene.add(shell));

// add stuff near the edges 
const edgeRocks = [];
edgeRocks.push(createRock(24, -17, 20, 1));
edgeRocks.push(createRock(-26, -16.5, -18, 1.2));
edgeRocks.push(createRock(20, -17.5, -22, 0.8));
edgeRocks.forEach(rock => scene.add(rock));




const edgeShells = [];
edgeShells.push(createShell(27, 0, 1));
edgeShells.push(createShell(-25, 5, 0.8));
edgeShells.forEach(shell => scene.add(shell));


const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    controls.update();

    const time = clock.getElapsedTime();
    const radius = 15;
    const dt = 0.01; // time for the look-ahead

    
    const verticalAmplitude = 3; // How high/low the fish moves
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

    [seaweedCluster1, seaweedCluster2, seaweedCluster3].forEach(cluster => {
        cluster.children.forEach(seaweed => {
            if (seaweed.userData.pivot) {
                seaweed.userData.pivot.rotation.z = 0.2 * Math.sin(time * 2 + seaweed.userData.offset);
            }
        });
    });

    renderer.render(scene, camera);
}

animate();


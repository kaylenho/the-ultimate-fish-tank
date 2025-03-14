import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clamp } from 'three/src/math/MathUtils.js';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
//camera.position.set(0, 5, 15);
camera.position.set(0, 0, 150);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//responsive screen size
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

//background image
const bTextureLoader = new THREE.TextureLoader();
 const texture = bTextureLoader.load('./assets/room1.jpeg');
const Bgeometry = new THREE.SphereGeometry(150, 60, 40); // Large radius to cover the camera
const Bmaterial = new THREE.MeshBasicMaterial({
    map: texture,        // The panorama texture
    side: THREE.BackSide // Invert the sphere's normals to make the texture inside
});

// Create a mesh with the geometry and material
const sphere = new THREE.Mesh(Bgeometry, Bmaterial);
sphere.position.set(0,15,0);
// Add the sphere to the scene (background)
scene.add(sphere);

const light = new THREE.DirectionalLight(0xffffff,1);
light.position.set(20,40,10);
// light.target.position.set(0,-32,0);
light.castShadow = true;
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
light.shadow.camera.left = -70;
light.shadow.camera.bottom = -70;
light.shadow.camera.right = 70;
light.shadow.camera.top = 70;
//const lightHelper = new THREE.DirectionalLightHelper(light,3);
scene.add(light);

//const shadowHelper = new THREE.CameraHelper(light.shadow.camera);
// scene.add(shadowHelper);

// function createPointLight(x,y,z,color,intensity){
//     const pointLight = new THREE.PointLight(color,intensity,100);
//     pointLight.position.set(x,y,z);
//     const pointLightHelper = new THREE.PointLightHelper(pointLight);
//     pointLight.add(pointLightHelper);
//     return pointLight;
// }

// const pointLights = [];
// pointLights.push(createPointLight(0,8,5,0xFF2F94,100));
// pointLights.forEach(pointLight => scene.add(pointLight));

function createLEDLight(x, y, z, color, intensity) {
    const light = new THREE.PointLight(color, intensity, 50, 2); // Add decay
    light.position.set(x, y, z);
    light.castShadow = true;
    //const helper = new THREE.PointLightHelper(light);
    scene.add(light);
    return light;
}

// Add multiple LED-style lights
const ledLights = [
    createLEDLight(0, 10, 0, 0x00ffcc, 150), // Cyan
    createLEDLight(25, 10, -15, 0x00ffcc, 130), // Pink
    createLEDLight(-25, 10, -15, 0x00ffcc, 130), // Blue
    createLEDLight(25, 10, 15, 0x00ffcc, 130),
    createLEDLight(-25, 10, 15, 0x00ffcc, 130),
];
const ambientLight = new THREE.AmbientLight(0xefc070,0.15);
scene.add(ambientLight);

// Create Fish Group
const fish = new THREE.Group();
scene.add(fish);

// Material for fish
const material = new THREE.MeshPhongMaterial({ color: 0xFF8C00, shininess: 40 }); //orange
const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, shininess: 40 }); //orange
const blackMaterial = new THREE.MeshPhongMaterial({ color: 0x000000, shininess: 40 }); //orange

// Fish Head - More Rounded and Fish-Like
const headGeometry = new THREE.SphereGeometry(1.2, 20, 16, 0, Math.PI * 2, 0, Math.PI/2); // 3/4 sphere for smooth transition
headGeometry.scale(.75, 3,1.5); // Make it slightly oval
const fishHead = new THREE.Mesh(headGeometry, material);
fishHead.rotation.x = Math.PI / 2;
fishHead.position.set(0, 0, 2.5); // Pushed slightly into the body
fishHead.castShadow = true;
fishHead.receiveShadow = true;
fish.add(fishHead);

//fish eye
const eyeShape = new THREE.CylinderGeometry(0.5,0.5,1.8,8);
const fishEye = new THREE.Mesh(eyeShape, eyeMaterial);
fishEye.rotation.x = Math.PI / 2;
fishEye.rotation.z = Math.PI / 2;
fishHead.add(fishEye);
fishEye.position.set(0,2,0);

const pupilShape = new THREE.CylinderGeometry(0.3,0.3,1.9,8);
const fishPupil = new THREE.Mesh(pupilShape, blackMaterial);
fishPupil.rotation.x = Math.PI / 2;
fishPupil.rotation.z = Math.PI / 2;
fishHead.add(fishPupil);
fishPupil.position.set(0,2.1,0);

// Fish Body - Ellipsoid Shape (With Clipped Front)
const bodyGeometry = new THREE.SphereGeometry(1.2, 20, 16, 0, Math.PI * 2, 0, Math.PI/2); // Half-sphere
bodyGeometry.scale(.75, 5,1.5); // Make it slightly oval
const fishBody = new THREE.Mesh(bodyGeometry, material);
fishBody.rotation.x = Math.PI / 2;
fishBody.rotation.z = Math.PI;
fishBody.position.set(0, 0, 2.5); // Shifted slightly to avoid overlap
fishBody.castShadow = true;
fishBody.receiveShadow = true;
fish.add(fishBody);

// Fish Tail - Fan-Like Shape
const tailShape = new THREE.Shape();
tailShape.moveTo(0, 0);
tailShape.lineTo(3, -1.5); // Right side
tailShape.lineTo(4, 0); // Top center
tailShape.lineTo(3, 1.5); // Left side
tailShape.lineTo(0, 0); // Back to start

const extrudeSettings = {
  depth: 0.2, // Makes it slightly 3D
  bevelEnabled: false, // Keep it sharp-edged
};

const tailGeometry = new THREE.ExtrudeGeometry(tailShape, extrudeSettings);
const fishTail = new THREE.Mesh(tailGeometry, material);
fishTail.rotation.y = Math.PI / 2; // Face the right direction
fishTail.position.set(0,0,-3); // Attach it to the fish
fishTail.castShadow = true;
fishTail.receiveShadow = true;

fish.add(fishTail);

//fish fins

const finLeft = new THREE.Mesh(tailGeometry, material);
finLeft.rotation.x = Math.PI / 2;
finLeft.rotation.y = 2 * Math.PI / 3;
finLeft.rotation.z = Math.PI/4;
finLeft.position.set(-1,0,0);
finLeft.castShadow = true;
finLeft.receiveShadow = true;
fishBody.add(finLeft);

const finRight = new THREE.Mesh(tailGeometry, material);
finRight.rotation.x = Math.PI / 2;
finRight.rotation.y = -2 * Math.PI / 3;
finRight.rotation.z = -Math.PI/4;
finRight.position.set(1,0,0);
finRight.scale.x = -1; //flip to right side
finRight.castShadow = true;
finRight.receiveShadow = true;
fishBody.add(finRight);

//top fin of fish
const finShape = new THREE.Shape();
finShape.moveTo(1, 0.8);
finShape.lineTo(5, 0); // Right side
finShape.lineTo(4.5, 1.5); // Top center
finShape.lineTo(3.5, 2); // Left side
finShape.lineTo(1, 0.8); // Back to start

const finGeometry = new THREE.ExtrudeGeometry(finShape, extrudeSettings);
const fishFin = new THREE.Mesh(finGeometry, material);
fishFin.rotation.y = Math.PI / 2; // Face the right direction
fishFin.position.set(0,1,2.5); // Attach it to the fish

fish.add(fishFin);

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
aquarium.position.set(0,-2,0);
const edgesGeometry = new THREE.EdgesGeometry(aquariumGeometry);
const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 }); // Black edges
const aquariumEdges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
aquariumEdges.position.set(0,-2,0);
scene.add(aquariumEdges);

////////////////////// aquarium boundary

const aquariumBoundaryGeometry = new THREE.PlaneGeometry(aquariumWidth-15, aquariumDepth-15); // Adjust size
const aquariumBoundaryMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x000000, 
    transparent: true, 
    opacity: 0 // Fully invisible 
});
const aquariumBoundary = new THREE.Mesh(aquariumBoundaryGeometry, aquariumBoundaryMaterial);
scene.add(aquariumBoundary);
aquariumBoundary.position.set(0, -20.51, 0);
aquariumBoundary.rotation.x = (-Math.PI/2);
aquariumBoundary.userData.ground = true;

//////////////////////////

// Load the displacement map
const displacementMap = new THREE.TextureLoader().load('./assets/sand.jpg');

const sandFloorGeometry = new THREE.BoxGeometry(aquariumWidth,2, aquariumDepth,100,10,100);
const sandFloorMaterial = new THREE.MeshStandardMaterial({
    color:0xd2b48c,
});
const sandFloor = new THREE.Mesh(sandFloorGeometry,sandFloorMaterial);
sandFloor.position.set(0,-19,0);
scene.add(sandFloor);
sandFloor.castShadow = true;
sandFloor.receiveShadow = true;

const sandGeometry = new THREE.PlaneGeometry(aquariumWidth, aquariumDepth,500,500);
sandGeometry.rotateX(Math.PI);
const sandMaterial = new THREE.MeshPhongMaterial({
    color:0xCEAA7A,
    displacementMap: displacementMap,
    displacementScale: 1,
    displacementBias: 0,
    //roughness: 0.3,
})

const sand = new THREE.Mesh(sandGeometry,sandMaterial);
sand.rotation.x = Math.PI/2;
sand.position.set(0,-18.8,0);
scene.add(sand);
sand.castShadow = true;
sand.receiveShadow = true;

//fish food

const fishFoodTexture = bTextureLoader.load('./assets/fishfood.png'); 

fishFoodTexture.wrapS = THREE.RepeatWrapping;
fishFoodTexture.wrapT = THREE.RepeatWrapping;
fishFoodTexture.repeat.set(3, 1); 

const fishFoodMaterial = new THREE.MeshStandardMaterial({
    map: fishFoodTexture 
});

const fishFoodGeometry = new THREE.CylinderGeometry(4, 4, 8, 32, 8);
const fishFood = new THREE.Mesh(fishFoodGeometry, fishFoodMaterial);
fishFood.position.set(35, -16, 0);
fishFood.castShadow = true;
fishFood.receiveShadow = true;

scene.add(fishFood);



// Desk Geometry
const deskGeometry = new THREE.BoxGeometry(90, 1, 60); // Wide and flat surface
const deskMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown color (wood-like)
const desk = new THREE.Mesh(deskGeometry, deskMaterial);

// Position the desk slightly below the aquarium
desk.position.set(0, -20.52, 0); // Adjust based on your aquarium's position

// Add desk to the scene
desk.castShadow = true;
desk.receiveShadow = true;
scene.add(desk);

const legGeometry = new THREE.BoxGeometry(2, 20, 2); // Thin, tall cuboid for legs
const legMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Same brown color as desk

// Create four legs
const leg1 = new THREE.Mesh(legGeometry, legMaterial);
leg1.castShadow = true;
leg1.receiveShadow = true;
const leg2 = new THREE.Mesh(legGeometry, legMaterial);
leg2.castShadow = true;
leg2.receiveShadow = true;
const leg3 = new THREE.Mesh(legGeometry, legMaterial);
leg3.castShadow = true;
leg3.receiveShadow = true;
const leg4 = new THREE.Mesh(legGeometry, legMaterial);
leg4.castShadow = true;
leg4.receiveShadow = true;

// Position legs at corners
const deskHeight = -20.52 - 10; // Desk position - half the leg height
const deskWidth = 90 / 2 - 1; // Half desk width - half leg width
const deskDepth = 60 / 2 - 1; // Half desk depth - half leg depth

leg1.position.set(deskWidth, deskHeight, deskDepth);
leg2.position.set(-deskWidth, deskHeight, deskDepth);
leg3.position.set(deskWidth, deskHeight, -deskDepth);
leg4.position.set(-deskWidth, deskHeight, -deskDepth);

// Add legs to the scene
scene.add(leg1, leg2, leg3, leg4);

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

const floorGeometry = new THREE.BoxGeometry(500, 2, 500); // Bigger floor
const floor = new THREE.Mesh(floorGeometry, tileMaterial);
floor.receiveShadow = true;

// Position the floor below the desk
const floorHeight = -20.52 - 20 - 1;
floor.position.set(0, floorHeight, 0);
floor.receiveShadow = true;
scene.add(floor);

// Position the Fish inside
fish.position.set(0, -1, 0); 


//Adding tank decorations
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
    rock.castShadow = true;
    rock.receiveShadow = true;
    rock.userData.draggable = true;

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
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    seaweedGroup.add(baseMesh);
    
    // Top (dynamic part)
    const topHeight = totalHeight - baseHeight;
    const topGeometry = new THREE.CylinderGeometry(0.2, 0.2, topHeight, 8, 1);
    const topMesh = new THREE.Mesh(topGeometry, seaweedMaterial);
    // Position the top mesh so its base is at the pivot origin
    topMesh.position.set(0, topHeight / 2, 0);
    topMesh.castShadow = true;  // Enable shadow casting for the top
    topMesh.receiveShadow = true; // Enable receiving shadows for the top

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
    shell.castShadow = true;
    shell.receiveShadow = true;
    shell.userData.draggable = true;

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



const obstacles = [...rocks, ...shells, ...edgeRocks, ...edgeShells];

// ------------------- Collision Detection ---------------
// Helper function to compute a new lookAt target when near a wall



let segmentStartTime = 0;
let segmentStartPosition = fish.position.clone();
let fishDirection = new THREE.Vector3(1, -0.1, 0).normalize();

let targetDirection = fishDirection.clone();
let turning = false;
let turnStartTime = 0;
const turnDuration = 1.0; // seconds for a smooth turn
let oldDirection = fishDirection.clone();
function computeCollisionTarget() {
    const fishBox = new THREE.Box3().setFromObject(fish);
    const fishSize = new THREE.Vector3();
    fishBox.getSize(fishSize);
    const halfWidth = aquariumWidth / 2;
    const halfDepth = aquariumDepth / 2;
    
    const aquariumTop = -2 + aquariumHeight / 2;
    const sandLevel = sand.position.y; // use the sand's y-position as the floor
    
    let correction = new THREE.Vector3(0, 0, 0);
    
    if (fish.position.x + fishSize.x / 2 > halfWidth) {
        correction.x = -1;
    } else if (fish.position.x - fishSize.x / 2 < -halfWidth) {
        correction.x = 1;
    }
    if (fish.position.z + fishSize.z / 2 > halfDepth) {
        correction.z = -1;
    } else if (fish.position.z - fishSize.z / 2 < -halfDepth) {
        correction.z = 1;
    }
    // For vertical collisions:
    if (fish.position.y + fishSize.y / 2 > aquariumTop) {
        // Top collision – need a slight downward pitch.
        correction.y = -1;
    } else if (fish.position.y - fishSize.y / 2 < sandLevel) {
        // Bottom collision – treat the sand as the floor.
        correction.y = 1;
    }
    
    if (correction.lengthSq() > 0) {
      const sideCollision = (Math.abs(correction.x) > 0.001 || Math.abs(correction.z) > 0.001);
      const verticalCollision = (Math.abs(correction.y) > 0.001);
      
      if (sideCollision) {
        let horizontalDir = new THREE.Vector3(fishDirection.x, 0, fishDirection.z).normalize();
        let randomAngle = THREE.MathUtils.degToRad(THREE.MathUtils.randFloat(60, 120));
        let quat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), randomAngle);
        let newHorizontalDir = horizontalDir.clone().applyQuaternion(quat).normalize();
        
        let verticalDelta = THREE.MathUtils.degToRad(THREE.MathUtils.randFloatSpread(5));
        newHorizontalDir.y = fishDirection.y + verticalDelta;
        newHorizontalDir.normalize();
        return fish.position.clone().add(newHorizontalDir);
      } else if (verticalCollision) {
        const currentDir = new THREE.Vector3();
        fish.getWorldDirection(currentDir);
        let randomAngle = THREE.MathUtils.degToRad(THREE.MathUtils.randFloat(-15, 15));
        const rotationAxis = new THREE.Vector3().crossVectors(currentDir, new THREE.Vector3(0, correction.y, 0)).normalize();
        const quat = new THREE.Quaternion().setFromAxisAngle(rotationAxis, randomAngle);
        let newDir = currentDir.clone().applyQuaternion(quat).normalize();
        return fish.position.clone().add(newDir);
      }
    }
    return null;
  }
  
  function detectCollision() {
    const fishBox = new THREE.Box3().setFromObject(fish);
    const fishSize = new THREE.Vector3();
    fishBox.getSize(fishSize);
    const halfWidth = aquariumWidth / 2;
    const halfDepth = aquariumDepth / 2;
    const aquariumTop = -2 + aquariumHeight / 2;
    const sandLevel = sand.position.y; // using the sand as the bottom
  
    let collision = false;
    if (
      fish.position.x + fishSize.x / 2 > halfWidth ||
      fish.position.x - fishSize.x / 2 < -halfWidth ||
      fish.position.z + fishSize.z / 2 > halfDepth ||
      fish.position.z - fishSize.z / 2 < -halfDepth ||
      fish.position.y + fishSize.y / 2 > aquariumTop ||
      fish.position.y - fishSize.y / 2 < sandLevel
    ) {
      collision = true;
    }
  
    if (collision) {
      const newTarget = computeCollisionTarget();
      if (newTarget) {
        targetDirection = newTarget.sub(fish.position).normalize();
        // Force slight pitch adjustments:
        if (fish.position.y + fishSize.y / 2 > aquariumTop) {
          targetDirection.y = -0.05;
          targetDirection.normalize();
        } else if (fish.position.y - fishSize.y / 2 < sandLevel) {
          targetDirection.y = 0.05;
          targetDirection.normalize();
        }
      }
      oldDirection = fishDirection.clone();
      turnStartTime = clock.getElapsedTime();
      turning = true;
      segmentStartTime = clock.getElapsedTime();
      segmentStartPosition = fish.position.clone();
    }
  }
function getCandidateHeadPosition(candidateFishPos) {

    const localHeadPos = fishHead.position.clone();

    localHeadPos.applyQuaternion(fish.quaternion);

    return candidateFishPos.clone().add(localHeadPos);
  }
  
 
  function isCandidateColliding(candidateHeadPos) {
    let colliding = false;
    obstacles.forEach(obstacle => {
      const obsBox = new THREE.Box3().setFromObject(obstacle);
      if (obsBox.containsPoint(candidateHeadPos)) {
        colliding = true;
      }
    });
    return colliding;
  }
  
  function reflectDirection(candidateHeadPos) {
    for (let i = 0; i < obstacles.length; i++) {
      const obsBox = new THREE.Box3().setFromObject(obstacles[i]);
      if (obsBox.containsPoint(candidateHeadPos)) {
        const obsCenter = new THREE.Vector3();
        obsBox.getCenter(obsCenter);
  
        let awayVector = fish.position.clone().sub(obsCenter);
        
        awayVector.y = 0;
        awayVector.normalize();
        

        const randomAngle = THREE.MathUtils.degToRad(THREE.MathUtils.randFloat(-15, 15));
        const quat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), randomAngle);
        awayVector.applyQuaternion(quat).normalize();
        
        
        targetDirection = new THREE.Vector3(awayVector.x, fishDirection.y, awayVector.z).normalize();
  
   
        oldDirection = fishDirection.clone();
        turnStartTime = clock.getElapsedTime();
        turning = true;
        segmentStartTime = clock.getElapsedTime();
        segmentStartPosition = fish.position.clone();
        return;
      }
    }
  }
const loader = new GLTFLoader();
let selectedObject = null;
const mouse = new THREE.Vector2(); // Declare the mouse vector

// Load the coral model
loader.load('./assets/coral.glb', function (gltf) {
    console.log(gltf.scene); // Check if the model is loaded
    const coral = gltf.scene;
    coral.scale.set(1, 1, 1); // Adjust scale if needed
    coral.position.set(-16, -18, 0); // Adjust position inside the aquarium

    // Ensure all child meshes are draggable
    coral.traverse((child) => {
        if (child.isMesh) {
            child.userData.draggable = true;
            child.userData.name = "coral";
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    scene.add(coral);
    obstacles.push(coral);
});

// Load the coral model
const yellowLoader = new GLTFLoader();

yellowLoader.load('./assets/coral_yellow.glb', function (gltf) {
    const yellowCoral = gltf.scene;
    yellowCoral.scale.set(50, 50, 50); // Adjust scale if needed
    yellowCoral.position.set(20, -18, 0); // Adjust position inside the aquarium

    // Ensure all child meshes are draggable
    yellowCoral.traverse((child) => {
        if (child.isMesh) {
            child.userData.draggable = true;
            child.userData.name = "coral_yellow";
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    scene.add(yellowCoral);
    obstacles.push(yellowCoral);
});


//Drag Drop Functionality

const raycaster = new THREE.Raycaster();
const clickMouse = new THREE.Vector2();
const moveMouse = new THREE.Vector2();
var draggable;

window.addEventListener('click', event =>{

    if(draggable){
        console.log(`dropping draggable ${draggable.userData.name}`)
        draggable = null;
        return;
    }

    clickMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    clickMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(clickMouse, camera);
    raycaster.intersectObjects(scene.children);
    const found = raycaster.intersectObjects(scene.children, true);

    if(found.length > 0 && found[0].object.userData.draggable){
        draggable = found[0].object;
        console.log(`found draggable object ${draggable.userData.name}`);

        //store offset
        draggable.userData.offset = {
            x: found[0].point.x - draggable.position.x,
            z: found[0].point.z - draggable.position.z
        };
    }
})

window.addEventListener('mousemove', event =>{
    moveMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    moveMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
})

function dragObject(){
    if(draggable != null){
        raycaster.setFromCamera(moveMouse, camera);
        const found = raycaster.intersectObjects(scene.children);
        if(found.length > 0){
            for(let o of found){
                if(!o.object.userData.ground)
                    continue;

                draggable.position.x = o.point.x - draggable.userData.offset.x;
                draggable.position.z = o.point.z - draggable.userData.offset.z;
            }
        }
    }
}

// Define the boundary radius inside the sphere
const boundaryRadius = 250; // Slightly less than sphere's radius to prevent clipping

controls.addEventListener('change', () => {
    const cameraPosition = camera.position.clone();
    const distanceFromCenter = cameraPosition.length();

    // If the camera is beyond the boundary, push it back
    if (distanceFromCenter > boundaryRadius) {
        cameraPosition.setLength(boundaryRadius);
        
    }
    if (cameraPosition.y < -40) {
        cameraPosition.y = -40;
    }
    camera.position.copy(cameraPosition);
});


//Alternative method, click and hold to move objects
// // Raycaster setup
// const raycaster = new THREE.Raycaster();
// const clickMouse = new THREE.Vector2();
// const moveMouse = new THREE.Vector2();

// window.addEventListener('mousedown', onMouseDown);
// window.addEventListener('mousemove', onMouseMove);
// window.addEventListener('mouseup', onMouseUp);

// function onMouseDown(event) {
//     mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//     mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

//     raycaster.setFromCamera(mouse, camera);
//     const intersects = raycaster.intersectObjects(scene.children, true);

//     if (intersects.length > 0) {
//         const object = intersects[0].object;

//         if (object.userData.draggable) {
//             selectedObject = object;
//             controls.enabled = false;

//             // Calculate and store the local offset of the coral relative to the click
//             const intersectionPoint = intersects[0].point;
//             selectedObject.userData.offset = {
//                 x: intersectionPoint.x - selectedObject.position.x,
//                 z: intersectionPoint.z - selectedObject.position.z,
//             };

//             selectedObject.userData.offsetY = selectedObject.position.y; // Maintain original height
//         }
//     }
// }

// function onMouseMove(event) {
//     if (!selectedObject) return;

//     mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//     mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

//     raycaster.setFromCamera(mouse, camera);
//     const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -selectedObject.userData.offsetY);
//    // const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), selectedObject.userData.offsetY);

//     const intersection = new THREE.Vector3();

//     if (raycaster.ray.intersectPlane(plane, intersection)) {
//         selectedObject.position.set(
//             intersection.x - selectedObject.userData.offset.x,
//             selectedObject.userData.offsetY, 
//             intersection.z - selectedObject.userData.offset.z
//         );
//     }
// }

// function onMouseUp() {
//     selectedObject = null;
//     controls.enabled = true; // Re-enable orbit controls
// }

/////////////////////////
//fish food animation (on click)

const fishFoodStartPos = fishFood.position.clone();
const fishFoodState = {
    active: false,
    timer: 0,
    pelletsDropped: false
}
const pellets = [];

function createPellet(){
    const pelletGeometry = new THREE.SphereGeometry(0.5,8,8);
    const pellet = new THREE.Mesh(pelletGeometry,material);
    let randomX = (Math.random() - 0.5) * 2; // Generates a random value between -0.5 and 0.5
    let randomY = (Math.random() - 0.5) * 2; // Generates a random value between -0.5 and 0.5

    pellet.position.set(fishFood.position.x - 5 + randomX, fishFood.position.y + 1 + randomY, fishFood.position.z);
    //pellet.position.set(fishFood.position.x - 5, fishFood.position.y + 1, fishFood.position.z);
    scene.add(pellet);
    pellet.castShadow = true;
    pellet.receiveShadow = true;
    pellets.push({mesh:pellet, dropped: false});
}

function feedFish(){
    if(fishFoodState.active) return; //prevent multiple clicks
    fishFoodState.active = true;
    fishFoodState.timer = clock.getElapsedTime();
    fishFoodState.pelletsDropped = false;

        // Ensure fish food always starts from the same position
        fishFood.position.copy(fishFoodStartPos);
        fishFood.rotation.z = 0;
    
    console.log("fish is being fed");
}

function dropPellets(){
    if(!fishFoodState.pelletsDropped){
        fishFoodState.pelletsDropped = true;
        console.log("pellets are dropping");
        createPellet();
        createPellet();
        createPellet();
    }
}

//use raycasting to detect mouse click on food

const clickMouseFood = new THREE.Vector2();

window.addEventListener("click", function(event){
    clickMouseFood.x = (event.clientX / window.innerWidth) * 2 - 1;
    clickMouseFood.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(clickMouseFood, camera);

    const intersects = raycaster.intersectObject(fishFood, true);

    if(intersects.length > 0){
        console.log("can is clicked");
        feedFish();
    }
});


/////////////////////////

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    dragObject(); //drag drop functionality

    const time = clock.getElapsedTime();
    const speed = 7; // Adjust this value as needed
    const initialX = 0; // or wherever you want it to start

    const segmentTime = time - segmentStartTime;

    if (turning) {
        const turnElapsed = time - turnStartTime;
        const t = Math.min(turnElapsed / turnDuration, 1);
        fishDirection = oldDirection.clone().lerp(targetDirection, t).normalize();
        if (t >= 1) {
            turning = false;
        }
    }

    // Update the fish's position based on the current direction
    // fish.position.copy(segmentStartPosition.clone().add(fishDirection.clone().multiplyScalar(speed * segmentTime)));

    const candidatePos = segmentStartPosition.clone().add(fishDirection.clone().multiplyScalar(speed * segmentTime));
    // Compute the candidate head position.
    const candidateHeadPos = getCandidateHeadPosition(candidatePos);
  

    if (isCandidateColliding(candidateHeadPos)) {
 
      reflectDirection(candidateHeadPos);
 
      candidatePos.copy(fish.position);

      segmentStartPosition.copy(fish.position);
      segmentStartTime = clock.getElapsedTime();
    }
  
    // Update the fish's position with the candidate position.
    fish.position.copy(candidatePos)
    


    const fishBox = new THREE.Box3().setFromObject(fish);
    const fishSize = new THREE.Vector3();
    fishBox.getSize(fishSize);
    const halfWidth = aquariumWidth / 2;
    const halfDepth = aquariumDepth / 2;
    const aquariumTop = -2 + aquariumHeight / 2;
    const aquariumBottom = sand.position.y; 

    fish.position.x = THREE.MathUtils.clamp(fish.position.x, -halfWidth + fishSize.x / 2, halfWidth - fishSize.x / 2);
    fish.position.z = THREE.MathUtils.clamp(fish.position.z, -halfDepth + fishSize.z / 2, halfDepth - fishSize.z / 2);
    fish.position.y = THREE.MathUtils.clamp(fish.position.y, aquariumBottom + fishSize.y / 2, aquariumTop - fishSize.y / 2);


    // Update fish orientation to face in the direction of movement
    fish.lookAt(fish.position.clone().add(fishDirection));

    // fish.position.x = initialX + speed * time;

    
    // fish.position.z = 0;  

    // // Compute the next position for the fish's head orientation
    // const nextPos = fish.position.clone().add(new THREE.Vector3(speed * time, 0, 0));
    // fish.lookAt(nextPos);
    //animate the tail
    fishTail.rotation.z = Math.sin(time * 2) * 0.5;

    //animate the head
    fishHead.rotation.z = Math.sin(time * 4) * 0.3; 

    //animate the body
    //fishBody.rotation.z = Math.sin(time * 4) * 0.3; 

    [seaweedCluster1, seaweedCluster2, seaweedCluster3].forEach(cluster => {
        cluster.children.forEach(seaweed => {
            if (seaweed.userData.pivot) {
                seaweed.userData.pivot.rotation.z = 0.2 * Math.sin(time * 2 + seaweed.userData.offset);
            }
        });
    });
    detectCollision();
    // clampObstacleCollisions();

    //animate fish food
    const fishFoodTime = clock.getElapsedTime() - fishFoodState.timer;

    if (fishFoodState.active) {
        if (fishFoodTime < 0.5) {
            let t = (fishFoodTime) / 0.5;
            fishFood.position.y = fishFoodStartPos.y + 42 * t;
            // Move up
        } else if (fishFoodTime < 1.5) {
            // Move left
            let t = (fishFoodTime - 0.5) / 1; // Normalize from [0.5, 1.5] → [0, 1]
            fishFood.position.x = fishFoodStartPos.x - 20 * t; // Move left
        } else if (fishFoodTime < 2) {
            // Gradually rotate to 45 degrees
            console.log(fishFood.position.x);
            let t = (fishFoodTime - 1.5) / 0.5; // Normalize time between 1.5 and 2
            fishFood.rotation.z = t * (Math.PI / 4); // Linearly interpolate from 0 to 45 degrees
        } else if (fishFoodTime < 2.5) {
            // Gradually rotate back to 0 degrees
            if (!fishFoodState.pelletsDropped) {
                dropPellets(); 
            }
            let t = (fishFoodTime - 2) / 0.5; // Normalize time between 2 and 2.5
            fishFood.rotation.z = (1 - t) * (Math.PI / 4); // Linearly interpolate from 45 degrees back to 0
        } else if (fishFoodTime < 3.5) {
            // Move right
            fishFood.rotation.z = 0;
            let t = (fishFoodTime - 2.5) / 1;
            fishFood.position.x = fishFoodStartPos.x - 20 * (1-t);
        } else if (fishFoodTime < 4) {
            // Move down
            let t = (fishFoodTime - 3.5) / 0.5;
            fishFood.position.y = fishFoodStartPos.y + 42 * (1-t);
        } else {
            // Reset
            fishFood.position.copy(fishFoodStartPos);
            fishFood.rotation.z = 0;
            fishFoodState.active = false;
            fishFoodState.pelletsDropped = false;
        }
    }

    pellets.forEach((pellet,index)=>{
        pellet.mesh.position.y -= 1;
        if(pellet.mesh.position.y < -16){
            scene.remove(pellet.mesh);
            pellets.splice(index,1);
        }
    })

    renderer.render(scene, camera);
}

animate();

// document.getElementsByTagName("button")[0].addEventListener('click',test);
// function test(){
//     console.log("button is clicked");
// }
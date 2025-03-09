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

// Shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

// Load the 360-degree panorama image
const bTextureLoader = new THREE.TextureLoader();
const texture = bTextureLoader.load('./assets/bedroom.jpg');  // Path to your panoramic image

// Create a sphere geometry and apply the texture to it
const Bgeometry = new THREE.SphereGeometry(100, 60, 40); // Large radius to cover the camera
const Bmaterial = new THREE.MeshBasicMaterial({
    map: texture,        // The panorama texture
    side: THREE.BackSide // Invert the sphere's normals to make the texture inside
});

// Create a mesh with the geometry and material
const sphere = new THREE.Mesh(Bgeometry, Bmaterial);

// Add the sphere to the scene (background)
scene.add(sphere);

// backgroundTextureLoader.load(
//     './assets/bedroom.jpg',  // Path to your image in the assets folder
//     function (texture) {
//         // Set the texture as the scene's background
//         scene.background = texture;
//     }
// );
// scene.background = new THREE.Color(0x000000);

const light = new THREE.DirectionalLight(0xffffff,1);
light.position.set(2,10,1);
// light.target.position.set(0,-32,0);
light.castShadow = true;
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
light.shadow.camera.left = -70;
light.shadow.camera.bottom = -70;
light.shadow.camera.right = 70;
light.shadow.camera.top = 70;
const lightHelper = new THREE.DirectionalLightHelper(light,3);
scene.add(light,lightHelper);

const shadowHelper = new THREE.CameraHelper(light.shadow.camera);
scene.add(shadowHelper);

function createPointLight(x,y,z,color,intensity){
    const pointLight = new THREE.PointLight(color,intensity,100);
    pointLight.position.set(x,y,z);
    const pointLightHelper = new THREE.PointLightHelper(pointLight);
    pointLight.add(pointLightHelper);
    return pointLight;
}

const pointLights = [];
pointLights.push(createPointLight(0,8,5,0x0096FF,100));
pointLights.forEach(pointLight => scene.add(pointLight));


const ambientLight = new THREE.AmbientLight(0x780C96,0.1);
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
fishHead.castShadow = true;
fishHead.receiveShadow = true;
fish.add(fishHead);

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
const tailRadius = 1.2;
const tailHeight = 2.5;
const tailGeometry = new THREE.ConeGeometry(tailRadius, tailHeight, 6);
const fishTail = new THREE.Mesh(tailGeometry, material);
fishTail.rotation.x = Math.PI / 2;
fishTail.position.set(0, 0, -4);
fishTail.castShadow = true;
fishTail.receiveShadow = true;
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
const fishFoodGeometry = new THREE.CylinderGeometry(4,4,8,32,8);
const fishFoodMaterial = new THREE.MeshPhongMaterial({color: 0xffffff});
const fishFood = new THREE.Mesh(fishFoodGeometry,fishFoodMaterial);
fishFood.position.set(35,-16,0);
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

const floorGeometry = new THREE.BoxGeometry(300, 2, 200); // Bigger floor
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

//////////////////////// raycasting

const loader = new GLTFLoader();
let selectedObject = null;
const mouse = new THREE.Vector2(); // Declare the mouse vector

// Load the coral model
loader.load('./assets/coral.glb', function (gltf) {
    const coral = gltf.scene;
    coral.scale.set(1, 1, 1); // Adjust scale if needed
    coral.position.set(-16, -18, 0); // Adjust position inside the aquarium

    // Ensure all child meshes are draggable
    coral.traverse((child) => {
        if (child.isMesh) {
            child.userData.draggable = true;
            child.userData.name = "coral";
            child.castShadow = true;
        }
    });
    scene.add(coral);
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

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    dragObject(); //drag drop functionality

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


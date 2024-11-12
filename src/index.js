// Import necessary Three.js components
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
// Declare variables for scene, camera, renderer, and an array of Piegoblin objects
let scene;
let camera;
let renderer;
let piegoblins = []; // Array to hold Piegoblin data
// Initialize the Three.js scene
function init() {
    // Set up scene
    scene = new THREE.Scene();
    // Configure camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30; // Move camera back to provide more depth range
    // Configure renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    // Set up lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 1).normalize();
    scene.add(directionalLight);
    // Load Piegoblin model with FBXLoader
    const fbxLoader = new FBXLoader();
    fbxLoader.load('/assets/Pie_Goblin_1110143250.fbx', (object) => {
        for (let i = 0; i < 10; i++) {
            const piegoblin = object.clone();
            // Change color of the mesh to 0xc4a160
            piegoblin.traverse((child) => {
                if (child.isMesh) {
                    const mesh = child;
                    // Remove existing material if necessary
                    mesh.material.dispose();
                    // Assign a new material with the specified color
                    const material = new THREE.MeshStandardMaterial({ color: 0xc4a160 });
                    mesh.material = material;
                }
            });
            // Initialize position randomly at a higher start point and varying depth
            resetPiegoblinPosition(piegoblin);
            piegoblin.scale.set(0.05, 0.05, 0.05); // Scale down model
            // Generate random rotation speeds and fall speed
            const rotationSpeed = {
                x: Math.random() * 0.02 - 0.01,
                y: Math.random() * 0.02 - 0.01,
                z: Math.random() * 0.02 - 0.01
            };
            const fallSpeed = Math.random() * 0.03 + 0.02; // Increase range of fall speed
            // Add the piegoblin and its properties to the array
            piegoblins.push({ mesh: piegoblin, rotationSpeed, fallSpeed });
            scene.add(piegoblin);
        }
    });
    animate();
}
// Function to animate Piegoblin objects
function animate() {
    requestAnimationFrame(animate);
    piegoblins.forEach((piegoblinData, index) => {
        // Apply falling animation with varying speeds
        piegoblinData.mesh.position.y -= piegoblinData.fallSpeed;
        // Apply unique rotation speeds
        piegoblinData.mesh.rotation.x += piegoblinData.rotationSpeed.x;
        piegoblinData.mesh.rotation.y += piegoblinData.rotationSpeed.y;
        piegoblinData.mesh.rotation.z += piegoblinData.rotationSpeed.z;
        // Basic collision avoidance by adjusting positions if too close
        piegoblins.forEach((otherPiegoblin, otherIndex) => {
            if (index !== otherIndex) {
                const distance = piegoblinData.mesh.position.distanceTo(otherPiegoblin.mesh.position);
                if (distance < 1) { // Adjust this threshold as needed
                    piegoblinData.mesh.position.x += (piegoblinData.mesh.position.x - otherPiegoblin.mesh.position.x) * 0.01;
                    piegoblinData.mesh.position.z += (piegoblinData.mesh.position.z - otherPiegoblin.mesh.position.z) * 0.01;
                }
            }
        });
        // Reset position if out of view (optimization)
        if (piegoblinData.mesh.position.y < -30) { // Drop objects further out of view
            resetPiegoblinPosition(piegoblinData.mesh);
        }
    });
    renderer.render(scene, camera);
}
// Reset position to make the Piegoblin reappear at random locations above view
function resetPiegoblinPosition(piegoblin) {
    piegoblin.position.set(Math.random() * 40 - 20, // Random X position, spaced out horizontally
    25 + Math.random() * 10, // Random Y position, spaced out vertically above view
    Math.random() * 50 - 25 // Random Z position, allowing greater depth range
    );
}
// Function to create "COMING SOON" text with mask effect
function createTextMask() {
    // Set up an SVG mask with the "COMING SOON" text in two lines
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";
    svg.style.zIndex = "10"; // Place it above the canvas
    // Define the clipping path
    const clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
    clipPath.setAttribute("id", "textClip");
    // Dynamically adjust font size based on viewport dimensions
    const fontSize = Math.min(window.innerWidth, window.innerHeight) * 0.35; // Increased multiplier for larger text
    // Create "COMING" text element
    const textLine1 = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textLine1.setAttribute("x", "50%");
    textLine1.setAttribute("y", "35%"); // Position slightly higher for first line
    textLine1.setAttribute("dominant-baseline", "middle");
    textLine1.setAttribute("text-anchor", "middle");
    textLine1.setAttribute("font-size", `${fontSize}px`);
    textLine1.setAttribute("font-family", "Rubik Mono One");
    textLine1.setAttribute("font-weight", "bold");
    textLine1.textContent = "COMING";
    // Create "SOON" text element
    const textLine2 = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textLine2.setAttribute("x", "50%");
    textLine2.setAttribute("y", "65%"); // Position slightly lower for second line
    textLine2.setAttribute("dominant-baseline", "middle");
    textLine2.setAttribute("text-anchor", "middle");
    textLine2.setAttribute("font-size", `${fontSize}px`);
    textLine2.setAttribute("font-family", "Rubik Mono One");
    textLine2.setAttribute("font-weight", "bold");
    textLine2.textContent = "SOON";
    // Append both lines of text to the clipPath
    clipPath.appendChild(textLine1);
    clipPath.appendChild(textLine2);
    svg.appendChild(clipPath);
    document.body.appendChild(svg);
    // Configure the Three.js canvas to use the SVG text as a clipping path
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.width = "100vw";
    renderer.domElement.style.height = "100vh";
    renderer.domElement.style.clipPath = "url(#textClip)"; // Apply the SVG clip path
    renderer.domElement.style.webkitClipPath = "url(#textClip)"; // For Safari support
    // Set the document body background to white to achieve a white background outside the text
    document.body.style.backgroundColor = "white";
    // Set the Three.js renderer background to black
    renderer.setClearColor(0x000000, 1); // Black background
}
// Initialize scene and create the "COMING SOON" text mask
init();
createTextMask();

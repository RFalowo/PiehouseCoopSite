// Import necessary Three.js components
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { SMAAEffect, SMAAImageLoader, SMAAPreset, EdgeDetectionMode, BlendFunction, TextureEffect, EffectPass, EffectComposer, RenderPass } from 'postprocessing';

// Function to dynamically load Google Fonts
function loadGoogleFonts(): void {
    const link1 = document.createElement('link');
    link1.rel = 'preconnect';
    link1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(link1);

    const link2 = document.createElement('link');
    link2.rel = 'preconnect';
    link2.href = 'https://fonts.gstatic.com';
    link2.crossOrigin = 'anonymous';
    document.head.appendChild(link2);

    const link3 = document.createElement('link');
    link3.href = 'https://fonts.googleapis.com/css2?family=Frijole&family=Rubik+Beastly&family=Rubik+Mono+One&display=swap';
    link3.rel = 'stylesheet';
    document.head.appendChild(link3);
}

// Call the function to load Google Fonts
loadGoogleFonts();
// Declare types for Piegoblin data
interface PiegoblinData {
    mesh: THREE.Object3D;
    rotationSpeed: { x: number; y: number; z: number };
    fallSpeed: number;
}

// Declare variables for scene, camera, renderer, and an array of Piegoblin objects
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let piegoblins: PiegoblinData[] = []; // Array to hold Piegoblin data
let composer: EffectComposer; // Ensure you have a compatible effect composer, such as from postprocessing library
let smaaEffect: SMAAEffect;
let edgesTextureEffect: TextureEffect;
let effectPass: EffectPass;

// Initialize the Three.js scene
async function init(): Promise<void> {    // Set up scene
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

    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(0, 1, 1).normalize();
    scene.add(directionalLight);

    // Load Piegoblin model with FBXLoader
    const fbxLoader = new FBXLoader();
    fbxLoader.load('Pie_Goblin_1110143250.fbx', (object: THREE.Object3D) => {
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('texture-pie-18701720.webp'); 
        for (let i = 0; i < 10; i++) {
            const piegoblin = object.clone();

            // Change color of the mesh to 0xc4a160
            piegoblin.traverse((child: THREE.Object3D) => {
                if ((child as THREE.Mesh).isMesh) {
                    const mesh = child as THREE.Mesh;
                    // Remove existing material if necessary
                    if (Array.isArray(mesh.material)) {
                        mesh.material.forEach(material => material.dispose());
                    } else {
                        mesh.material.dispose();
                    }
                    // Assign a new material with the loaded texture
                    const material = new THREE.MeshStandardMaterial({ map: texture });
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

    // Set up EffectComposer and SMAA
    composer = new EffectComposer(renderer);
    
    // Create render pass and add it to composer
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    // Load SMAA images

    
    // Create and configure SMAA effect
    smaaEffect = new SMAAEffect({
        preset: SMAAPreset.HIGH,
        edgeDetectionMode: EdgeDetectionMode.COLOR
    });
    
    // Configure edge detection settings as requested
    smaaEffect.edgeDetectionMaterial.setEdgeDetectionThreshold(0.005);
    smaaEffect.edgeDetectionMaterial.setLocalContrastAdaptationFactor(2.3);
    
    // Create texture effect for SMAA edges visualization
    edgesTextureEffect = new TextureEffect({
        blendFunction: BlendFunction.NORMAL,
        texture: (smaaEffect as any).renderTargetEdges.texture
    });
    
    // Create effect pass with both effects
    effectPass = new EffectPass(
        camera,
        smaaEffect,
        edgesTextureEffect
    );
    effectPass.encodeOutput = false;
    
    // Add effect pass to composer
    composer.addPass(effectPass);

    animate(); 
}

// Function to animate Piegoblin objects
function animate(): void {
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

    composer.render();
}

// Reset position to make the Piegoblin reappear at random locations above view
function resetPiegoblinPosition(piegoblin: THREE.Object3D): void {
    piegoblin.position.set(
        Math.random() * 40 - 20, // Random X position, spaced out horizontally
        25 + Math.random() * 10, // Random Y position, spaced out vertically above view
        Math.random() * 50 - 25 // Random Z position, allowing greater depth range
    );
}

// Function to create "COMING SOON" text with mask effect
function createTextMask(): void {
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
    const fontSize = Math.min(window.innerWidth, window.innerHeight) *  (window.innerWidth < 768 ? 0.15 : 0.3); // Increased multiplier for larger text and disciminate between mobile and desktop

    // Create "COMING" text element
    const textLine1 = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textLine1.setAttribute("x", "50%");
    textLine1.setAttribute("y", "35%"); // Position slightly higher for first line
    textLine1.setAttribute("dominant-baseline", "middle");
    textLine1.setAttribute("text-anchor", "middle");
    textLine1.setAttribute("font-size", `${fontSize}px`);
    textLine1.setAttribute("font-family", "Frijole");
    textLine1.setAttribute("font-weight", "bold");
    textLine1.setAttribute("letter-spacing", "-0.15em"); // Adjust letter spacing for overlap
    textLine1.textContent = "COMING";

    // Create "SOON" text element
    const textLine2 = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textLine2.setAttribute("x", "50%");
    textLine2.setAttribute("y", "65%"); // Position slightly lower for second line
    textLine2.setAttribute("dominant-baseline", "middle");
    textLine2.setAttribute("text-anchor", "middle");
    textLine2.setAttribute("font-size", `${fontSize}px`);
    textLine2.setAttribute("font-family", "Frijole");
    textLine2.setAttribute("font-weight", "bold");
    textLine2.setAttribute("letter-spacing", "-0.15em"); // Adjust letter spacing for overlap
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
    (renderer.domElement.style as any).webkitClipPath = "url(#textClip)"; // For Safari support

    // Set the document body background to white to achieve a white background outside the text
    document.body.style.backgroundColor = "#b2a7a4 ";

    // Set the Three.js renderer background to black
    renderer.setClearColor(0x000000, 1); // Black background
}

// Initialize scene and create the "COMING SOON" text mask
init();
createTextMask();
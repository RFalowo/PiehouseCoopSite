document.body.style.backgroundColor = 'black';


// Import necessary Three.js components
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
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

// Add CSS for the loading screen
const style = document.createElement('style');
style.innerHTML = `
  body {
    margin: 0;
    background-color: black; /* Set background color to black */
  }
  #loading-screen {
    position: fixed;
    width: 100vw;
    height: 100vh;
    background: black;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 4em;
    font-family: 'Rubik Beastly', sans-serif; /* Use Google Font */
    z-index: 1000;
  }
`;
document.head.appendChild(style);

// Add HTML for the loading screen
const loadingScreen = document.createElement('div');
loadingScreen.id = 'loading-screen';
loadingScreen.textContent = 'Loading...';
document.body.appendChild(loadingScreen);


// Declare types for Piegoblin data
interface PiegoblinData {
    mesh: THREE.Object3D;
    rotationSpeed: { x: number; y: number; z: number };
    fallSpeed: number;
}

// Declare types for Text data
interface TextData {
    mesh: THREE.Mesh;
    rotationSpeed: { x: number; y: number; z: number };
    fallSpeed: number;
}

// Declare variables for scene, camera, renderer, and an array of Piegoblin objects
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let piegoblins: PiegoblinData[] = []; // Array to hold Piegoblin data
let texts: TextData[] = []; // Array to hold Text data
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

    const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
    directionalLight.position.set(0, 1, 0).normalize();
    scene.add(directionalLight);

    // Load Piegoblin model with FBXLoader
    const fbxLoader = new FBXLoader();
    fbxLoader.load('Pie_Goblin_1110143250.fbx', (object: THREE.Object3D) => {
        for (let i = 0; i < 5; i++) {
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
                    
                }
            });

            // Initialize position randomly at a higher start point and varying depth
            resetPiegoblinPosition(piegoblin);
            piegoblin.scale.set(0.05, 0.05, 0.05); // Scale down model

            // Generate random rotation speeds and fall speed
            const rotationSpeed = {
                x: Math.random() * 0.025 - 0.01,
                y: Math.random() * 0.025 - 0.01,
                z: Math.random() * 0.025 - 0.01
            };
            const fallSpeed = Math.random() * 0.1 + 0.02; // Increase range of fall speed

            // Add the piegoblin and its properties to the array
            piegoblins.push({ mesh: piegoblin, rotationSpeed, fallSpeed });
            scene.add(piegoblin);
        }
    });

    // Load font and create text meshes
    const fontLoader = new FontLoader();
    fontLoader.load('Rubik_Beastly_Regular.json', (font) => {
        const textMaterial = new THREE.MeshStandardMaterial({ color: 0xc4a160 });

        for (let i = 0; i <3; i++) {
            const textGeometry1 = new TextGeometry('COMING', {
                font: font,
                size: 1.7,
                depth: 1,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.1,
                bevelSize: 0.2,
                bevelOffset: 0,
                bevelSegments: 5
            });
            const textMesh1 = new THREE.Mesh(textGeometry1, textMaterial);
            resetTextPosition(textMesh1);
            texts.push({ mesh: textMesh1, rotationSpeed: getRandomRotationSpeed(), fallSpeed: getRandomFallSpeed() });
            scene.add(textMesh1);

            const textGeometry2 = new TextGeometry('SOON', {
                font: font,
                size: 1.7,
                depth: 1,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.1,
                bevelSize: 0.2,
                bevelOffset: 0,
                bevelSegments: 5
            });
            const textMesh2 = new THREE.Mesh(textGeometry2, textMaterial);
            resetTextPosition(textMesh2);
            texts.push({ mesh: textMesh2, rotationSpeed: getRandomRotationSpeed(), fallSpeed: getRandomFallSpeed() });
            scene.add(textMesh2);

            const textGeometry3 = new TextGeometry('BACK', {
                font: font,
                size: 1,
                depth: 1,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 5
            });
            const textMesh3 = new THREE.Mesh(textGeometry3, textMaterial);
            resetTextPosition(textMesh3);
            texts.push({ mesh: textMesh3, rotationSpeed: getRandomRotationSpeed(), fallSpeed: getRandomFallSpeed() });
            scene.add(textMesh3);
    
            const textGeometry4 = new TextGeometry('COME', {
                font: font,
                size: 1,
                depth: 1,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 5
            });
            const textMesh4 = new THREE.Mesh(textGeometry4, textMaterial);
            resetTextPosition(textMesh4);
            texts.push({ mesh: textMesh4, rotationSpeed: getRandomRotationSpeed(), fallSpeed: getRandomFallSpeed() });
            scene.add(textMesh4);

            const textGeometry5 = new TextGeometry('SOON', {
                font: font,
                size: 1,
                depth: 1,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 5
            });
            const textMesh5 = new THREE.Mesh(textGeometry5, textMaterial);
            resetTextPosition(textMesh5);
            texts.push({ mesh: textMesh5, rotationSpeed: getRandomRotationSpeed(), fallSpeed: getRandomFallSpeed() });
        }
        loadingScreen.style.display = 'none';
        
        setTimeout(() => {
            window.location.href = 'https://www.crowdfunder.co.uk/p/the-piehouse-returns-help-us-open-the-doors'; // Replace with your desired URL
        }, 30000); // 30 seconds in milliseconds

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
                if (distance < 3) { // Adjust this threshold as needed
                    piegoblinData.mesh.position.x += (piegoblinData.mesh.position.x - otherPiegoblin.mesh.position.x) * 0.01;
                    piegoblinData.mesh.position.z += (piegoblinData.mesh.position.z - otherPiegoblin.mesh.position.z) * 0.01;
                }
            }
        });

        

        // Reset position if out of view (optimization)
        if (piegoblinData.mesh.position.y < -50) { // Drop objects further out of view
            resetPiegoblinPosition(piegoblinData.mesh);
        }
    });

    texts.forEach((textData, index) => {
        // Apply falling animation with varying speeds
        textData.mesh.position.y -= textData.fallSpeed;

        // Apply unique rotation speeds
        textData.mesh.rotation.x += textData.rotationSpeed.x;
        textData.mesh.rotation.y += textData.rotationSpeed.y;
        textData.mesh.rotation.z += textData.rotationSpeed.z;

        // Reset position if out of view (optimization)
        if (textData.mesh.position.y < -40) { // Drop objects further out of view
            resetTextPosition(textData.mesh);
        }
    });

    composer.render();
}

// Reset position to make the Piegoblin reappear at random locations above view
function resetPiegoblinPosition(piegoblin: THREE.Object3D): void {
    piegoblin.position.set(
        Math.random() * 15 - 7, // Random X position, spaced out horizontally
        30, // Random Y position, spaced out vertically above view
        Math.random() * 20  // Random Z position, allowing greater depth range
    );
}

// Function to reset position of text objects
function resetTextPosition(text: THREE.Object3D): void {
    text.position.set(
        Math.random() * 50 - 25, // Random X position, spaced out horizontally
        30, // Random Y position, spaced out vertically above view
        Math.random() * 20 - 10 // Random Z position, allowing greater depth range
    );
}

// Function to get random rotation speed
function getRandomRotationSpeed(): { x: number; y: number; z: number } {
    return {
        x: Math.random() * 0.025 - 0.01,
        y: Math.random() * 0.025 - 0.01,
        z: Math.random() * 0.025 - 0.01
    };
}

// Function to get random fall speed
function getRandomFallSpeed(): number {
    return Math.random() * 0.1 + 0.02; // Increase range of fall speed
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
    const fontSize = Math.min(window.innerWidth, window.innerHeight) *  (window.innerWidth < 768 ? 0.17 : 0.3); // Increased multiplier for larger text and disciminate between mobile and desktop
    const heightStretch = window.innerWidth < 768 ? 5 : 2; 


    // Create "COMING" text element
    const textLine1 = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textLine1.setAttribute("x", "50%");
    textLine1.setAttribute("y", window.innerWidth < 768 ? "6%" : "15%");
    textLine1.setAttribute("dominant-baseline", "middle");
    textLine1.setAttribute("text-anchor", "middle");
    textLine1.setAttribute("font-size", `${fontSize}px`);
    textLine1.setAttribute("font-family", "Frijole");
    textLine1.setAttribute("font-weight", "bold");
    textLine1.setAttribute("letter-spacing", window.innerWidth < 768 ? "-0.18em" : "-0.18em");
    textLine1.setAttribute("transform", `scale(1, ${heightStretch})`);

    textLine1.textContent = "COMING";

    // Create "SOON" text element
    const textLine2 = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textLine2.setAttribute("x", "50%");
    textLine2.setAttribute("y", window.innerWidth < 768 ? "12%" : "35%");
    textLine2.setAttribute("dominant-baseline", "middle");
    textLine2.setAttribute("text-anchor", "middle");
    textLine2.setAttribute("font-size", `${fontSize}px`);
    textLine2.setAttribute("font-family", "Frijole");
    textLine2.setAttribute("font-weight", "bold");
    textLine2.setAttribute("letter-spacing", window.innerWidth < 768 ? "-0.18em" : "-0.18em");
    textLine2.setAttribute("transform", `scale(1, ${heightStretch})`);

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
// Add event listener to redirect to another site when clicked anywhere
document.addEventListener('click', () => {
    window.location.href = 'https://www.crowdfunder.co.uk/p/the-piehouse-returns-help-us-open-the-doors'; // Replace with your desired URL
});


// Initialize scene and create the "COMING SOON" text mask
init();
//createTextMask();
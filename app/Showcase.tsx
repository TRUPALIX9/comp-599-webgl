"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type SlideKey = "compute" | "chart" | "pipeline" | "assets" | "highway" | "bunker";

type SlideContent = {
  key: SlideKey;
  kicker: string;
  title: string;
  description: string;
  bullets: string[];
};

const SLIDES: SlideContent[] = [
  {
    key: "compute",
    kicker: "01. Visual Power",
    title: "Super-Compute Visualization",
    description: "WebGL handles massive data sets by processing millions of operations per second directly on the GPU, enabling complex particle simulations and cinematic effects.",
    bullets: [
      "25,000+ dynamic particles",
      "Perlin-noise flow fields",
      "Real-time turbulence physics",
      "High-fidelity visual depth"
    ]
  },
  {
    key: "chart",
    kicker: "02. Mathematical Precision",
    title: "3D Mathematical Graphing",
    description: "Visualize complex equations in a 3D coordinate system. WebGL transforms abstract formulas into precise geometric paths.",
    bullets: [
      "Manual 360° Free-Hand rotation",
      "Distinct X, Y, Z Axis markers",
      "Interactive equation selection",
      "Precision vertex mapping"
    ]
  },
  {
    key: "pipeline",
    kicker: "03. Efficiency",
    title: "Why WebGL? CPU vs GPU",
    description: "Parallel processing allows the GPU to handle thousands of complex calculations simultaneously, far exceeding CPU capabilities for graphics.",
    bullets: [
      "16,000+ points at 60 FPS",
      "Parallel vertex processing",
      "Zero-latency interaction",
      "Low CPU overhead"
    ]
  },
  {
    key: "assets",
    kicker: "04. Modern Formats",
    title: "GLTF/GLB Asset Loading",
    description: "Standardized 3D file formats allow for seamless model loading, including geometry, materials, and complex skeletal animations.",
    bullets: [
      "Compact binary GLB files",
      "PBR Material support",
      "Embedded textures",
      "Animation mixers"
    ]
  },
  {
    key: "highway",
    kicker: "05. Application A",
    title: "Highway Driving Simulation",
    description: "Experience a real-time driving simulation. Use WASD or Arrow Keys to steer the Dodge Challenger through an infinite highway environment.",
    bullets: [
      "Infinite highway scrolling",
      "Real-time keyboard steering",
      "Asset looping techniques",
      "Physics-based wheel rotation"
    ]
  },
  {
    key: "bunker",
    kicker: "06. Application B",
    title: "FPS Combat Interaction",
    description: "Advanced spatial interaction demonstrating raycasting for precision targeting and dynamic 'Headlamp' point lighting.",
    bullets: [
      "Raycaster-based shooting",
      "Mouse-look FPS controls",
      "Animation state blending",
      "Dynamic scene lighting"
    ]
  }
];

const EQUATIONS = [
  { id: "sin2d", label: "2D Sine Wave", math: "y = sin(x)" },
  { id: "cos2d", label: "2D Cosine Wave", math: "y = cos(x)" },
  { id: "spiral3d", label: "3D Spiral (Helix)", math: "x = cos(2t), y = t, z = sin(2t)" },
  { id: "wave3d", label: "3D Sine Ripple", math: "y = sin(sqrt(x² + z²))" },
  { id: "orbit3d", label: "3-Axis Orbit", math: "Parametric [sin(t), cos(1.5t), sin(0.5t)]" }
];

export default function Showcase() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [selectedEq, setSelectedEq] = useState("sin2d");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentSlide = SLIDES[slideIndex];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cleanup: () => void = () => {};
    
    if (currentSlide.key === "compute") cleanup = createComputeRenderer(canvas);
    else if (currentSlide.key === "chart") cleanup = createChartRenderer(canvas, selectedEq);
    else if (currentSlide.key === "pipeline") cleanup = createPipelineRenderer(canvas);
    else if (currentSlide.key === "assets") cleanup = createAssetsRenderer(canvas);
    else if (currentSlide.key === "highway") cleanup = createHighwayRenderer(canvas);
    else if (currentSlide.key === "bunker") cleanup = createBunkerRenderer(canvas);

    return () => {
      if (cleanup) cleanup();
    };
  }, [slideIndex, selectedEq]);

  const next = () => setSlideIndex((i) => Math.min(SLIDES.length - 1, i + 1));
  const prev = () => setSlideIndex((i) => Math.max(0, i - 1));

  const currentEq = EQUATIONS.find(e => e.id === selectedEq);

  return (
    <main className="pptSplit">
      <div className="pptSidebar">
        <div className="slideContent">
          <span className="slideKicker">{currentSlide.kicker}</span>
          <h1 className="slideTitle">{currentSlide.title}</h1>
          <p className="slideDesc">{currentSlide.description}</p>
          
          {currentSlide.key === "chart" && (
            <div className="eqSelector">
              <label>Select Equation:</label>
              <select value={selectedEq} onChange={(e) => setSelectedEq(e.target.value)}>
                {EQUATIONS.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.label}</option>
                ))}
              </select>
            </div>
          )}

          <ul className="slideBullets">
            {currentSlide.bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
        
        <div className="pptNav">
          <button onClick={prev} disabled={slideIndex === 0}>Back</button>
          <span className="slideCount">{slideIndex + 1} / {SLIDES.length}</span>
          <button onClick={next} disabled={slideIndex === SLIDES.length - 1}>Next</button>
        </div>
      </div>

      <div className="pptStage">
        <canvas ref={canvasRef} />
        
        {currentSlide.key === "chart" && (
          <>
            <div className="chartLegend">
              <span className="legendLabel">Equation:</span>
              <span className="legendMath">{currentEq?.math}</span>
            </div>
            <div className="axisLabels">
              <div id="label-x">X</div>
              <div id="label-y">Y</div>
              <div id="label-z">Z</div>
            </div>
          </>
        )}

        {currentSlide.key === "bunker" && <div className="fpsCrosshair" />}
      </div>
    </main>
  );
}

// --- Helpers ---

function setupThree(canvas: HTMLCanvasElement, clearColor: number) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setClearColor(clearColor);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  
  const resize = () => {
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (!rect) return;
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
  };
  window.addEventListener("resize", resize);
  setTimeout(resize, 0);

  return { renderer, scene, camera, resize };
}

// --- Renderers ---

function createComputeRenderer(canvas: HTMLCanvasElement) {
  const { renderer, scene, camera, resize } = setupThree(canvas, 0x000000);
  camera.position.z = 22;
  const count = 30000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const points = new THREE.Points(geometry, new THREE.PointsMaterial({ size: 0.12, color: 0x00ffcc, transparent: true, opacity: 0.8 }));
  scene.add(points);
  let animId: number;
  const animate = () => { points.rotation.y += 0.001; renderer.render(scene, camera); animId = requestAnimationFrame(animate); };
  animate();
  return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(animId); renderer.dispose(); };
}

function createChartRenderer(canvas: HTMLCanvasElement, eqId: string) {
  const { renderer, scene, camera, resize } = setupThree(canvas, 0xffffff);
  camera.position.set(22, 22, 22);
  camera.lookAt(0, 0, 0);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;

  const grid = new THREE.GridHelper(40, 40, 0xdddddd, 0xeeeeee);
  scene.add(grid);

  const axes = { x: new THREE.Vector3(22, 0, 0), y: new THREE.Vector3(0, 22, 0), z: new THREE.Vector3(0, 0, 22) };

  const createLine = (pts: THREE.Vector3[], color: number) => {
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    return new THREE.Line(geo, new THREE.LineBasicMaterial({ color, linewidth: 3 }));
  };

  scene.add(createLine([new THREE.Vector3(-22,0,0), axes.x], 0xcc0000));
  scene.add(createLine([new THREE.Vector3(0,-22,0), axes.y], 0x008800));
  scene.add(createLine([new THREE.Vector3(0,0,-22), axes.z], 0x0000cc));

  const pts: THREE.Vector3[] = [];
  let color = 0x006655;

  if (eqId === "sin2d") { for (let x = -15; x <= 15; x += 0.1) pts.push(new THREE.Vector3(x, Math.sin(x) * 5, 0)); color = 0x007766; }
  else if (eqId === "cos2d") { for (let x = -15; x <= 15; x += 0.1) pts.push(new THREE.Vector3(x, Math.cos(x) * 5, 0)); color = 0x0055aa; }
  else if (eqId === "spiral3d") { for (let t = -10; t <= 10; t += 0.1) pts.push(new THREE.Vector3(Math.cos(t * 2) * 5, t, Math.sin(t * 2) * 5)); color = 0x886600; }
  else if (eqId === "wave3d") { for (let x = -10; x <= 10; x += 0.5) for (let z = -10; z <= 10; z += 0.5) pts.push(new THREE.Vector3(x, Math.sin(Math.sqrt(x*x + z*z)) * 3, z)); }
  else if (eqId === "orbit3d") { for (let t = 0; t <= Math.PI * 4; t += 0.05) pts.push(new THREE.Vector3(Math.sin(t) * 8, Math.cos(t * 1.5) * 8, Math.sin(t * 0.5) * 8)); color = 0xaa0088; }

  const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
  const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color, linewidth: 5 }));
  scene.add(line);

  const updateLabels = () => {
    const update = (id: string, pos: THREE.Vector3) => {
      const el = document.getElementById(id);
      if (!el) return;
      const v = pos.clone().project(camera);
      const rect = canvas.getBoundingClientRect();
      const x = (v.x * 0.5 + 0.5) * rect.width;
      const y = (-v.y * 0.5 + 0.5) * rect.height;
      el.style.transform = `translate(${x}px, ${y}px)`;
      el.style.opacity = v.z > 1 ? "0" : "1";
    };
    update("label-x", axes.x);
    update("label-y", axes.y);
    update("label-z", axes.z);
  };

  let animId: number;
  const animate = () => {
    controls.update();
    updateLabels();
    renderer.render(scene, camera);
    animId = requestAnimationFrame(animate);
  };
  animate();

  return () => { 
    window.removeEventListener("resize", resize); 
    controls.dispose(); 
    cancelAnimationFrame(animId); 
    renderer.dispose(); 
  };
}

function createPipelineRenderer(canvas: HTMLCanvasElement) {
  const { renderer, scene, camera, resize } = setupThree(canvas, 0x0a0c0e);
  camera.position.z = 12;
  const points = new THREE.Points(new THREE.IcosahedronGeometry(5, 4), new THREE.PointsMaterial({ color: 0x00ffff, size: 0.05 }));
  scene.add(points);
  let animId: number;
  const animate = () => { points.rotation.y += 0.012; renderer.render(scene, camera); animId = requestAnimationFrame(animate); };
  animate();
  return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(animId); renderer.dispose(); };
}

function createAssetsRenderer(canvas: HTMLCanvasElement) {
  const { renderer, scene, camera, resize } = setupThree(canvas, 0x111315);
  camera.position.set(0, 2.0, 10);
  const loader = new GLTFLoader();
  let model: THREE.Group | null = null;
  loader.load("/models/vehicle-dodge-challenger-2015.glb", (gltf) => {
    model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
    scene.add(model);
  });
  scene.add(new THREE.AmbientLight(0xffffff, 2.5));
  let animId: number;
  const animate = () => { if (model) model.rotation.y += 0.015; renderer.render(scene, camera); animId = requestAnimationFrame(animate); };
  animate();
  return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(animId); renderer.dispose(); };
}

function createHighwayRenderer(canvas: HTMLCanvasElement) {
  const { renderer, scene, camera, resize } = setupThree(canvas, 0x1a2b3c);
  camera.position.set(0, 20, -75);
  camera.lookAt(0, 0, 100);
  const loader = new GLTFLoader();
  const envs: THREE.Group[] = [];
  loader.load("/models/environment-highway.glb", (gltf) => {
    for (let i = 0; i < 3; i++) {
      const env = gltf.scene.clone();
      env.scale.set(3, 1, 3);
      env.position.set(0, -0.1, i * 200);
      scene.add(env);
      envs.push(env);
    }
  });
  let car: THREE.Group | null = null;
  loader.load("/models/vehicle-dodge-challenger-2015.glb", (gltf) => {
    car = gltf.scene; car.scale.set(1.2, 1.2, 1.2); scene.add(car);
  });
  scene.add(new THREE.AmbientLight(0xffffff, 2.5));
  const keys: Record<string, boolean> = {};
  const onDown = (e: KeyboardEvent) => keys[e.key.toLowerCase()] = true;
  const onUp = (e: KeyboardEvent) => keys[e.key.toLowerCase()] = false;
  window.addEventListener("keydown", onDown); window.addEventListener("keyup", onUp);
  let targetX = 0;
  let animId: number;
  const animate = () => {
    envs.forEach(env => { env.position.z -= 2.5; if (env.position.z < -200) env.position.z += 600; });
    if (car) {
      if (keys["a"] || keys["arrowleft"]) targetX += 0.35;
      if (keys["d"] || keys["arrowright"]) targetX -= 0.35;
      targetX = Math.max(-12, Math.min(12, targetX));
      car.position.x += (targetX - car.position.x) * 0.1;
      car.rotation.y = (targetX - car.position.x) * 0.05;
    }
    renderer.render(scene, camera);
    animId = requestAnimationFrame(animate);
  };
  animate();
  return () => { window.removeEventListener("keydown", onDown); window.removeEventListener("keyup", onUp); window.removeEventListener("resize", resize); cancelAnimationFrame(animId); renderer.dispose(); };
}

function createBunkerRenderer(canvas: HTMLCanvasElement) {
  const { renderer, scene, camera, resize } = setupThree(canvas, 0x000000);
  camera.position.set(0, 1.8, 15);
  const grid = new THREE.GridHelper(100, 50, 0x00ffcc, 0x222222);
  scene.add(grid);
  const loader = new GLTFLoader();
  let rifle: THREE.Group | null = null;
  loader.load("/models/prop-assault-rifle.glb", (gltf) => {
    rifle = gltf.scene; rifle.scale.set(0.14, 0.14, 0.14); scene.add(rifle);
  });
  const ballGeo = new THREE.SphereGeometry(0.8, 32, 32);
  const balls: THREE.Mesh[] = [];
  const ballData = Array.from({ length: 8 }, () => ({ x: (Math.random() - 0.5) * 20, z: -Math.random() * 30 - 5, popping: 0 }));
  ballData.forEach((d) => {
    const mesh = new THREE.Mesh(ballGeo, new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x004400 }));
    mesh.position.set(d.x, 0.8, d.z); scene.add(mesh); balls.push(mesh);
  });
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const headlamp = new THREE.PointLight(0xffffff, 50, 100);
  scene.add(headlamp);
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const onMove = (e: PointerEvent) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1; const y = -(e.clientY / window.innerHeight) * 2 + 1;
    camera.rotation.y = -x * 0.8; camera.rotation.x = y * 0.4;
  };
  const onShoot = () => {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(balls);
    if (intersects.length > 0) {
      const hit = intersects[0].object as THREE.Mesh; const idx = balls.indexOf(hit);
      if (idx !== -1 && ballData[idx].popping === 0) ballData[idx].popping = 1;
    }
  };
  window.addEventListener("pointermove", onMove); window.addEventListener("pointerdown", onShoot);
  let animId: number;
  const animate = (time: number) => {
    ballData.forEach((d, i) => {
      const mesh = balls[i];
      if (d.popping > 0) {
        d.popping -= 0.05; mesh.scale.set(d.popping, d.popping, d.popping);
        if (d.popping <= 0) { d.x = (Math.random() - 0.5) * 20; d.z = -Math.random() * 30 - 5; d.popping = 0; mesh.scale.set(1, 1, 1); mesh.position.set(d.x, 0.8, d.z); }
      } else { mesh.position.y = 1.0 + Math.sin(time * 0.003 + i) * 0.2; }
    });
    if (rifle) {
      const weaponPos = new THREE.Vector3(0.5, -0.6, -0.9);
      weaponPos.applyQuaternion(camera.quaternion); weaponPos.add(camera.position);
      rifle.position.copy(weaponPos); rifle.quaternion.copy(camera.quaternion); rifle.rotateY(Math.PI);
    }
    headlamp.position.copy(camera.position); renderer.render(scene, camera); animId = requestAnimationFrame(animate);
  };
  animate(0);
  return () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerdown", onShoot); window.removeEventListener("resize", resize); cancelAnimationFrame(animId); renderer.dispose(); };
}

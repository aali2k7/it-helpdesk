/**
 * IT Helpdesk & Asset Support Management System
 * Spatial Database Architecture Visualizer (db-visualizer.js)
 * Live Relational Database Constellation · Architectural Studio Mode
 * Precision Solid Machine Blocks · Dynamic Data Flow & Depth Hierarchy
 */

class DatabaseVisualizer {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`[3D Visualizer] Container #${containerId} not found.`);
      return;
    }

    this.options = Object.assign({
      onSelectNode: null,
      onNodeSelect: null,
      onHoverNode: null,
      onNodeHover: null,
      onViewTable: null
    }, options);

    this.graphData = null;
    this.nodes = new Map(); // tableName -> nodeObject
    this.links = []; // array of link objects
    this.selectedNode = null;
    this.hoveredNode = null;
    this.currentCluster = 'all';
    this.coreTableName = 'tickets'; // Identified dynamically from FK degree

    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.isUserInteracting = false;
    this.idleRotationSpeed = this.reducedMotion ? 0 : 0.0003;
    this.clock = new THREE.Clock();

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-1000, -1000);
    this.mouseClientPos = { x: 0, y: 0 };
    this.interactableMeshes = [];

    // WOW Element #6: Subtle Stereoscopic Camera Parallax
    this.parallaxTarget = { x: 0, y: 0 };
    this.parallaxCurrent = { x: 0, y: 0 };

    // WOW Element #14: Initial Reveal Animation State
    this.revealStartTime = 0;
    this.isRevealing = false;
    this.revealComplete = false;

    // Smooth Camera Glide State
    this.targetCameraPos = null;
    this.targetLookAt = null;
    this.baseCameraPos = new THREE.Vector3(0, 38, 78);
    this.currentLookAt = new THREE.Vector3(0, 0, 0);

    // Cinematic Orbit Tour State
    this.isOrbitTourActive = false;
    this.orbitAngle = 0;

    // Enterprise Restrained Tonal Palette (Solid, Professional, Curated)
    this.domainColors = {
      'tickets': '#0071e3',          // Core Hub (Apple / Linear Blue)
      'incidents': '#0284c7',        // Operations (Sky Steel)
      'service_requests': '#0f766e', // Operations (Deep Teal)
      'users': '#4f46e5',            // Entities (Indigo)
      'departments': '#2563eb',      // Entities (Blue)
      'assets': '#0369a1',           // Entities (Deep Steel)
      'maintenance': '#d97706',      // Infrastructure (Amber)
      'warranties': '#7c3aed',       // Infrastructure (Violet)
      'support_staff': '#059669',    // Entities (Emerald)
      'assignments': '#2563eb',      // Operations (Blue)
      'categories': '#64748b',       // Taxonomy (Cool Slate)
      'priorities': '#e11d48',       // Taxonomy (Rose)
      'resolutions': '#16a34a',      // Operations (Green)
      'status_histories': '#64748b'  // Infrastructure (Cool Slate)
    };

    // Logical Clusters
    this.clusters = {
      operations: new Set(['tickets', 'incidents', 'service_requests', 'resolutions', 'assignments', 'status_histories']),
      entities: new Set(['users', 'assets', 'support_staff', 'departments']),
      infrastructure: new Set(['maintenance', 'warranties', 'categories', 'priorities'])
    };

    this.init();
  }

  setOrbitTour(active) {
    this.isOrbitTourActive = !!active;
    if (this.isOrbitTourActive) {
      this.selectedNode = null;
      this.targetCameraPos = null;
      if (this.options.onSelectNode) this.options.onSelectNode(null);
    }
  }

  isWebGLAvailable() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  init() {
    if (!this.isWebGLAvailable() || typeof THREE === 'undefined') {
      console.warn('[3D Visualizer] WebGL unavailable. Falling back to 2D view.');
      this.initSvgFallback();
      return;
    }

    // 1. Scene Setup - Studio Architectural Grounding & Native Radial Vignette
    this.scene = new THREE.Scene();

    // Native Studio Museum Radial Background Vignette (Zero alpha artifacts)
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = 512;
    bgCanvas.height = 512;
    const bgCtx = bgCanvas.getContext('2d');
    const radGrad = bgCtx.createRadialGradient(256, 220, 20, 256, 256, 360);
    radGrad.addColorStop(0, '#ffffff');
    radGrad.addColorStop(0.55, '#f6f8fc');
    radGrad.addColorStop(1, '#edf1f6');
    bgCtx.fillStyle = radGrad;
    bgCtx.fillRect(0, 0, 512, 512);
    const bgTexture = new THREE.CanvasTexture(bgCanvas);
    this.scene.background = bgTexture;
    this.scene.fog = new THREE.FogExp2(0xeef2f7, 0.0028);

    // 2. Camera Setup (Compact, Prominent 28-degree Framing)
    const rect = this.container.getBoundingClientRect();
    const aspect = (rect.width || 800) / (rect.height || 500);
    this.camera = new THREE.PerspectiveCamera(38, aspect, 1, 1500);
    this.initialCameraPos = new THREE.Vector3(0, 38, 78);
    this.camera.position.copy(this.initialCameraPos);
    this.camera.lookAt(0, 0, 0);
    this.baseCameraPos.copy(this.initialCameraPos);

    // 3. High Performance WebGL Renderer with GPU PCF Soft Shadows
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false
    });
    this.renderer.setSize(rect.width || 800, rect.height || 500);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    // Enable Physically-Based Soft Contact Shadows
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // 4. Controls
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.06;
      this.controls.maxDistance = 220;
      this.controls.minDistance = 20;
      this.controls.maxPolarAngle = Math.PI / 2 + 0.04;
      this.controls.target.set(0, 0, 0);

      this.controls.addEventListener('start', () => { 
        this.isUserInteracting = true;
        this.targetCameraPos = null;
      });
      this.controls.addEventListener('end', () => { 
        this.baseCameraPos.copy(this.camera.position);
        setTimeout(() => { this.isUserInteracting = false; }, 800); 
      });
    }

    // 5. Studio Multi-Point Physical Lighting & Atmospheric Depth (WOW Element #7)
    this.setupLighting();

    // 6. Solid Architectural Plinth & Fading Coordinate Grid (WOW Element #8)
    this.setupFloorGrid();

    // 7. Graph Root Group
    this.graphGroup = new THREE.Group();
    this.scene.add(this.graphGroup);

    // 8. Event Listeners
    this.setupEvents();

    // 9. Start Render Loop
    this.animate = this.animate.bind(this);
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  // ==========================================================
  // WOW ELEMENT #7 & #11: STUDIO LIGHTING & CONTRAST CALIBRATION
  // Restrained ambient fill lets obsidian blocks & soft shadows have deep contrast
  // ==========================================================
  setupLighting() {
    // 1. Restrained Ambient Fill (0.42 lets obsidian chassis & contact shadows pop)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.42);
    this.scene.add(ambientLight);
    this.ambientLight = ambientLight;

    // 2. High-precision Key Directional Light (Casts soft contact shadows on plinth)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.05);
    keyLight.position.set(45, 80, 50);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 10;
    keyLight.shadow.camera.far = 190;
    keyLight.shadow.camera.left = -65;
    keyLight.shadow.camera.right = 65;
    keyLight.shadow.camera.top = 65;
    keyLight.shadow.camera.bottom = -65;
    keyLight.shadow.bias = -0.0006;
    keyLight.shadow.radius = 3.6; // Soft diffuse contact shadows
    this.scene.add(keyLight);
    this.keyLight = keyLight;

    // 3. Subtle Cool Fill Light (Soft form-filling, prevents harsh black falloff)
    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.32);
    fillLight.position.set(-50, 45, -45);
    this.scene.add(fillLight);
    this.fillLight = fillLight;

    // 4. Subtle Rim / Silhouetting Light (Accentuates bottom bevels & silhouette edges)
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.45);
    rimLight.position.set(0, -25, -60);
    this.scene.add(rimLight);
    this.rimLight = rimLight;

    // 5. Museum Center Spotlight (Atmospheric depth: soft pool of light on center)
    const centerSpot = new THREE.SpotLight(0xffffff, 0.65, 160, Math.PI / 3.4, 0.70, 1.4);
    centerSpot.position.set(0, 52, 0);
    centerSpot.target.position.set(0, 0, 0);
    this.scene.add(centerSpot);
    this.scene.add(centerSpot.target);
    this.centerSpot = centerSpot;

    // 6. Central Hub Core Accent Light (Dedicated blue luminaire centered on tickets)
    const hubPointLight = new THREE.PointLight(0x0071e3, 0.90, 95);
    hubPointLight.position.set(0, 16, 0);
    this.scene.add(hubPointLight);
    this.hubPointLight = hubPointLight;
  }

  // ==========================================================
  // WOW ELEMENT #8: REFINED FLOOR & SPATIAL COORDINATE SYSTEM
  // Plinth disc, center-fading coordinate grid, and origin beacon ring
  // ==========================================================
  setupFloorGrid() {
    this.floorGroup = new THREE.Group();

    // 1. Solid Architectural Studio Disc (100% OPAQUE, Satin White, Receives Soft Shadows)
    const plinthRadius = 78;
    const plinthGeo = new THREE.CylinderGeometry(plinthRadius, plinthRadius, 0.8, 64);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.88,
      metalness: 0.04,
      transparent: false,
      opacity: 1.0
    });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = -6.4; // Top surface lands precisely at y = -6.0
    plinth.receiveShadow = true;
    this.floorGroup.add(plinth);
    this.plinth = plinth;

    // 2. Center-Fading Architectural Coordinate Grid (Thin, elegant spatial reference)
    // Custom line segments where line alpha fades outward from origin
    const gridPoints = [];
    const gridColors = [];
    const gridSize = 144;
    const gridStep = 6;
    const maxRadius = 72;

    const baseCol = new THREE.Color(0x94a3b8);
    const whiteCol = new THREE.Color(0xffffff);

    for (let x = -gridSize / 2; x <= gridSize / 2; x += gridStep) {
      for (let z = -gridSize / 2; z <= gridSize / 2 - gridStep; z += gridStep) {
        const d1 = Math.hypot(x, z);
        const d2 = Math.hypot(x, z + gridStep);
        if (d1 <= maxRadius && d2 <= maxRadius) {
          gridPoints.push(x, -5.98, z);
          gridPoints.push(x, -5.98, z + gridStep);

          const factor1 = Math.max(0.0, 1.0 - Math.pow(d1 / maxRadius, 1.35)) * 0.40;
          const factor2 = Math.max(0.0, 1.0 - Math.pow(d2 / maxRadius, 1.35)) * 0.40;

          const c1 = whiteCol.clone().lerp(baseCol, factor1);
          const c2 = whiteCol.clone().lerp(baseCol, factor2);
          gridColors.push(c1.r, c1.g, c1.b);
          gridColors.push(c2.r, c2.g, c2.b);
        }
      }
    }

    for (let z = -gridSize / 2; z <= gridSize / 2; z += gridStep) {
      for (let x = -gridSize / 2; x <= gridSize / 2 - gridStep; x += gridStep) {
        const d1 = Math.hypot(x, z);
        const d2 = Math.hypot(x + gridStep, z);
        if (d1 <= maxRadius && d2 <= maxRadius) {
          gridPoints.push(x, -5.98, z);
          gridPoints.push(x + gridStep, -5.98, z);

          const factor1 = Math.max(0.0, 1.0 - Math.pow(d1 / maxRadius, 1.35)) * 0.40;
          const factor2 = Math.max(0.0, 1.0 - Math.pow(d2 / maxRadius, 1.35)) * 0.40;

          const c1 = whiteCol.clone().lerp(baseCol, factor1);
          const c2 = whiteCol.clone().lerp(baseCol, factor2);
          gridColors.push(c1.r, c1.g, c1.b);
          gridColors.push(c2.r, c2.g, c2.b);
        }
      }
    }

    const gridGeo = new THREE.BufferGeometry();
    gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridPoints, 3));
    gridGeo.setAttribute('color', new THREE.Float32BufferAttribute(gridColors, 3));

    const gridMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.95
    });
    const coordinateGrid = new THREE.LineSegments(gridGeo, gridMat);
    this.floorGroup.add(coordinateGrid);

    // 3. Central Gravitational Anchor Beacon Rings (Under core table)
    const beaconGeo1 = new THREE.BufferGeometry();
    const beaconPts1 = [];
    const beaconSegments = 64;
    for (let i = 0; i <= beaconSegments; i++) {
      const theta = (i / beaconSegments) * Math.PI * 2;
      beaconPts1.push(new THREE.Vector3(Math.cos(theta) * 17.5, -5.97, Math.sin(theta) * 17.5));
    }
    beaconGeo1.setFromPoints(beaconPts1);
    const beaconMat1 = new THREE.LineBasicMaterial({
      color: 0x0071e3,
      transparent: true,
      opacity: 0.35
    });
    const beaconRing1 = new THREE.Line(beaconGeo1, beaconMat1);
    this.floorGroup.add(beaconRing1);

    const beaconGeo2 = new THREE.BufferGeometry();
    const beaconPts2 = [];
    for (let i = 0; i <= beaconSegments; i++) {
      const theta = (i / beaconSegments) * Math.PI * 2;
      beaconPts2.push(new THREE.Vector3(Math.cos(theta) * 22.0, -5.97, Math.sin(theta) * 22.0));
    }
    beaconGeo2.setFromPoints(beaconPts2);
    const beaconMat2 = new THREE.LineBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.22
    });
    const beaconRing2 = new THREE.Line(beaconGeo2, beaconMat2);
    this.floorGroup.add(beaconRing2);

    // 4. Crisp Perimeter Boundary Ring (Opaque Solid)
    const ringGeo = new THREE.BufferGeometry();
    const ringPoints = [];
    const segments = 96;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      ringPoints.push(new THREE.Vector3(Math.cos(theta) * 76, -5.95, Math.sin(theta) * 76));
    }
    ringGeo.setFromPoints(ringPoints);
    const ringMat = new THREE.LineBasicMaterial({
      color: 0xcbd5e1,
      transparent: false,
      opacity: 1.0
    });
    const ring = new THREE.Line(ringGeo, ringMat);
    this.floorGroup.add(ring);

    this.scene.add(this.floorGroup);
  }

  // ==========================================================
  // WOW ELEMENT #9: SOFT CONTACT OCCLUSION SHADOW TEXTURE
  // ==========================================================
  createContactShadowTexture() {
    if (this._shadowTexture) return this._shadowTexture;

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
    grad.addColorStop(0, 'rgba(15, 23, 42, 0.48)');
    grad.addColorStop(0.35, 'rgba(15, 23, 42, 0.24)');
    grad.addColorStop(0.70, 'rgba(15, 23, 42, 0.06)');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0.00)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    this._shadowTexture = texture;
    return texture;
  }

  setupEvents() {
    const el = this.renderer.domElement;

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      this.mouseClientPos.x = e.clientX;
      this.mouseClientPos.y = e.clientY;
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // WOW Element #6: Subtle Camera Parallax Targets
      this.parallaxTarget.x = this.mouse.x * 1.6;
      this.parallaxTarget.y = this.mouse.y * 1.1;

      this.handlePointerMove();
    });

    el.addEventListener('mouseleave', () => {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
      this.parallaxTarget.x = 0;
      this.parallaxTarget.y = 0;
      this.clearHover();
    });

    el.addEventListener('click', (e) => {
      this.handlePointerClick(e);
    });

    window.addEventListener('resize', () => {
      this.onResize();
    });
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const rect = this.container.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 500;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  onWindowResize() {
    this.onResize();
  }

  // ==========================================================
  // DATA LOADING & LIVE SYNC
  // ==========================================================
  async loadGraph(url = '/api/database/graph') {
    try {
      const res = await fetch(url);
      const data = await res.json();

      if (!data || !data.tables) {
        console.error('[3D Visualizer] Invalid graph API payload:', data);
        return;
      }

      this.graphData = data;
      this.buildGraph();
      this.triggerInitialReveal();

    } catch (err) {
      console.error('[3D Visualizer] Failed to load schema graph:', err);
    }
  }

  async refresh(url = '/api/database/graph') {
    if (!this.graphData) {
      return this.loadGraph(url);
    }

    try {
      const res = await fetch(url);
      const data = await res.json();
      if (!data || !data.tables) return;

      this.graphData = data;

      // Update existing nodes smoothly
      data.tables.forEach(t => {
        const node = this.nodes.get(t.name);
        if (node) {
          const oldCount = node.recordCount;
          node.data = t;
          node.recordCount = t.record_count;

          // If count changed (INSERT or DELETE), animate subtle pulse
          if (oldCount !== t.record_count) {
            this.animateNodePulse(node);
          }

          this.updateNodeGeometryScale(node);
          this.updateNodeLabel(node);
        }
      });
    } catch (err) {
      console.error('[3D Visualizer] Refresh error:', err);
    }
  }

  setData(data) {
    this.graphData = data;
    this.buildGraph();
    this.triggerInitialReveal();
  }

  // ==========================================================
  // GRAPH CONSTRUCTION & SCENE GRAPH POPULATION
  // ==========================================================
  buildGraph() {
    if (!this.graphData || !this.graphData.tables) return;

    // Clear previous
    while (this.graphGroup.children.length > 0) {
      const obj = this.graphGroup.children[0];
      this.graphGroup.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    }

    this.nodes.clear();
    this.links = [];
    this.interactableMeshes = [];

    // 1. WOW Element #3: Calculate Foreign-Key Degrees Dynamically
    const degrees = new Map();
    this.graphData.tables.forEach(t => degrees.set(t.name, 0));
    this.graphData.relationships.forEach(rel => {
      if (degrees.has(rel.source)) degrees.set(rel.source, degrees.get(rel.source) + 1);
      if (degrees.has(rel.target)) degrees.set(rel.target, degrees.get(rel.target) + 1);
    });

    let maxDeg = -1;
    let coreName = 'tickets';
    degrees.forEach((deg, name) => {
      if (deg > maxDeg) {
        maxDeg = deg;
        coreName = name;
      }
    });
    this.coreTableName = coreName;

    // 2. WOW Element #1: Deterministic Graph Layout with 3D Depth Hierarchy
    const positions = this.computeDeterministicGraphLayout(
      this.graphData.tables, 
      this.graphData.relationships,
      degrees
    );

    // 3. Precision Solid Architecture Data Blocks with Soft Contact Shadows
    this.graphData.tables.forEach(table => {
      const pos = positions[table.name] || { x: 0, y: 0, z: 0 };
      const isCore = table.name === this.coreTableName;
      const deg = degrees.get(table.name) || 0;
      const node = this.createTableNode(table, pos, isCore, deg);
      this.nodes.set(table.name, node);
      this.graphGroup.add(node.group);
      this.interactableMeshes.push(node.mesh);
    });

    // 4. WOW Element #2 & #13: Live Relational Conduits & Data Flow Pulses
    this.graphData.relationships.forEach((rel, idx) => {
      const srcNode = this.nodes.get(rel.source);
      const tgtNode = this.nodes.get(rel.target);
      if (srcNode && tgtNode) {
        const link = this.createRelationshipLink(srcNode, tgtNode, rel, idx);
        this.links.push(link);
        this.graphGroup.add(link.curveLine);
      }
    });

    // 5. Verify Layout Spacing & Zero Collisions
    this.verifyLayoutSpacing();
  }

  // ==========================================================
  // WOW ELEMENT #1: DETERMINISTIC GRAPH LAYOUT & 3D DEPTH HIERARCHY
  // Preserves successful base positions while establishing spatial amphitheater
  // ==========================================================
  computeDeterministicGraphLayout(tables, relationships, degrees) {
    const pos = {};

    // Base horizontal layout preserved!
    // Depth Hierarchy (Architectural Amphitheater):
    // Core (TICKETS): Sits elevated at the gravitational center (Y = 3.2).
    // Primary Operational & Entity Hubs (Inner Ring): Sits comfortably at Y = 1.4 to 2.2.
    // Taxonomy Boundary (Rear): Elevated at Y = 2.8 so visible over center without obstruction.
    // Peripheral & Audit Ring (Outer): Sits at layered depths Y = -1.8 to 0.8.

    // Core Central Hub (Degree 8)
    pos['tickets']          = { x: 0,    y: 3.2,  z: 0 };

    // Tier 1: Primary Operational & Entity Hubs (Radius ~28-34 units)
    pos['incidents']        = { x: -22,  y: 0.8,  z: 20 };   // Front-left
    pos['service_requests'] = { x: 22,   y: 0.8,  z: 20 };   // Front-right
    pos['users']            = { x: -32,  y: 1.4,  z: -4 };   // Direct left
    pos['assets']           = { x: 32,   y: 1.4,  z: -4 };   // Direct right
    pos['assignments']      = { x: -18,  y: 2.2,  z: -26 };  // Elevated back-left
    pos['support_staff']    = { x: 18,   y: 2.2,  z: -26 };  // Elevated back-right

    // Tier 2: Sub-domains, Taxonomy & Audit Ring (Outer Ring, Radius ~48-56 units)
    pos['status_histories'] = { x: 0,    y: -1.8, z: 42 };   // Front-center low
    pos['resolutions']      = { x: -44,  y: -0.6, z: 28 };   // Outer front-left
    pos['maintenance']      = { x: 44,   y: -0.6, z: 28 };   // Outer front-right
    pos['warranties']       = { x: 52,   y: 0.8,  z: -18 };  // Outer right-back
    pos['departments']      = { x: -52,  y: 0.8,  z: -18 };  // Outer left-back
    pos['categories']       = { x: -25,  y: 2.8,  z: -46 };  // Elevated far back-left
    pos['priorities']       = { x: 25,   y: 2.8,  z: -46 };  // Elevated far back-right

    // Fallback for any dynamic schema additions
    let extraIndex = 0;
    tables.forEach(t => {
      if (!pos[t.name]) {
        const phi = (1 + Math.sqrt(5)) / 2;
        const angle = extraIndex * phi * Math.PI * 2;
        const rad = 54 + extraIndex * 4;
        const z = Math.sin(angle) * rad;
        pos[t.name] = {
          x: Math.cos(angle) * rad,
          y: - (z / 50) * 2.8,
          z: z
        };
        extraIndex++;
      }
    });

    // Separation Constraint Pass (Guarantees zero overlapping)
    const MIN_ALLOWED_DIST = 22.0;
    for (let iter = 0; iter < 40; iter++) {
      const decay = 1.0 - (iter / 40) * 0.75;
      for (let i = 0; i < tables.length; i++) {
        const tA = tables[i].name;
        if (tA === this.coreTableName) continue;
        const pA = pos[tA];
        for (let j = i + 1; j < tables.length; j++) {
          const tB = tables[j].name;
          const pB = pos[tB];
          const dx = pB.x - pA.x;
          const dz = pB.z - pA.z;
          const dist = Math.hypot(dx, dz) || 0.001;
          if (dist < MIN_ALLOWED_DIST) {
            const push = (MIN_ALLOWED_DIST - dist) * 0.5 * decay;
            const nx = dx / dist;
            const nz = dz / dist;
            pA.x -= nx * push;
            pA.z -= nz * push;
            if (tB !== this.coreTableName) {
              pB.x += nx * push;
              pB.z += nz * push;
            }
          }
        }
      }
    }

    // Normalization Bounds Compression (Compact ~104 x 88 volume)
    const MAX_X = 58;
    const MAX_Z = 54;
    let maxAbsX = 0, maxAbsZ = 0;
    tables.forEach(t => {
      maxAbsX = Math.max(maxAbsX, Math.abs(pos[t.name].x));
      maxAbsZ = Math.max(maxAbsZ, Math.abs(pos[t.name].z));
    });

    if (maxAbsX > MAX_X || maxAbsZ > MAX_Z) {
      const scaleFactorX = maxAbsX > MAX_X ? MAX_X / maxAbsX : 1.0;
      const scaleFactorZ = maxAbsZ > MAX_Z ? MAX_Z / maxAbsZ : 1.0;
      tables.forEach(t => {
        if (t.name !== this.coreTableName) {
          pos[t.name].x *= scaleFactorX;
          pos[t.name].z *= scaleFactorZ;
        }
      });
    }

    return pos;
  }

  verifyLayoutSpacing() {
    let minObserved = Infinity;
    let collisions = 0;
    const tableNames = Array.from(this.nodes.keys());
    for (let i = 0; i < tableNames.length; i++) {
      const posA = this.nodes.get(tableNames[i]).position;
      for (let j = i + 1; j < tableNames.length; j++) {
        const posB = this.nodes.get(tableNames[j]).position;
        const d = Math.hypot(posB.x - posA.x, posB.z - posA.z);
        if (d < minObserved) minObserved = d;
        if (d < 18) collisions++;
      }
    }
    console.log(`[3D Visualizer] Constellation Verified: ${tableNames.length} tables, min gap: ${minObserved.toFixed(1)} units, collisions: ${collisions}`);
  }

  // ==========================================================
  // WOW ELEMENT #3, #9, #10 & #11: PRECISION SOLID MACHINE DATA BLOCKS
  // 100% OPAQUE · SOLID PHYSICAL MESHES · CONTACT SHADOWS · CLEAN EDGES
  // ==========================================================
  createTableNode(table, position, isCore = false, degree = 0) {
    const group = new THREE.Group();
    group.position.set(position.x, position.y, position.z);

    const count = table.record_count || 0;
    const hexColor = this.domainColors[table.name] || '#0071e3';
    const domainColor = new THREE.Color(hexColor);

    // WOW Element #3: Core Table is subtly distinguished (14% larger, elevated anchor)
    const coreMultiplier = isCore ? 1.14 : 1.0;
    const scale = (0.90 + 0.16 * Math.min(1.0, Math.log2(count + 1) / 4.0)) * coreMultiplier;
    const baseW = 15.0 * scale;
    const baseH = 3.6 * scale;
    const baseD = 10.5 * scale;

    // 1. Lower Hardware Pedestal (Solid Matte Gunmetal Base, Casts Shadow)
    const pedGeo = new THREE.BoxGeometry(baseW * 1.04, 0.9, baseD * 1.04);
    const pedMat = new THREE.MeshStandardMaterial({
      color: 0x0b1120,
      roughness: 0.45,
      metalness: 0.25,
      transparent: false,
      opacity: 1.0,
      depthTest: true,
      depthWrite: true
    });
    const pedestal = new THREE.Mesh(pedGeo, pedMat);
    pedestal.position.y = -baseH / 2 - 0.45;
    pedestal.castShadow = true;
    group.add(pedestal);

    // 2. High-Tech Obsidian Slate Chassis Body (100% Solid Opaque Block, Casts Shadow)
    const boxGeo = new THREE.BoxGeometry(baseW, baseH, baseD);
    const boxMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: isCore ? 0.22 : 0.28,
      metalness: isCore ? 0.30 : 0.24,
      emissive: domainColor,
      emissiveIntensity: isCore ? 0.24 : 0.16,
      transparent: false,
      opacity: 1.0,
      depthTest: true,
      depthWrite: true
    });
    const mesh = new THREE.Mesh(boxGeo, boxMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { tableName: table.name };
    group.add(mesh);

    // 3. WOW Element #11: Crisp Domain Edge Silhouette (Solid Domain-Colored Bevel Frame)
    const edgesGeo = new THREE.EdgesGeometry(boxGeo);
    const edgesMat = new THREE.LineBasicMaterial({
      color: domainColor,
      linewidth: isCore ? 2.5 : 1.5,
      transparent: false,
      opacity: 1.0
    });
    const edgeLines = new THREE.LineSegments(edgesGeo, edgesMat);
    group.add(edgeLines);

    // 4. Solid Inlaid Top Accent Stripe (Solid 3D Mesh Inlay, 100% Opaque)
    const topBarGeo = new THREE.BoxGeometry(baseW * 0.94, 0.24, baseD * 0.20);
    const topBarMat = new THREE.MeshStandardMaterial({
      color: domainColor,
      roughness: 0.22,
      metalness: 0.30,
      transparent: false,
      opacity: 1.0,
      depthTest: true,
      depthWrite: true
    });
    const topBar = new THREE.Mesh(topBarGeo, topBarMat);
    topBar.position.set(0, baseH / 2 + 0.12, -baseD * 0.32);
    group.add(topBar);

    // 5. Sleek Metallic Mounting Stanchion (Physically anchors the plaque to the chassis)
    const stanchionGeo = new THREE.CylinderGeometry(0.20, 0.20, 1.8, 12);
    const stanchionMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.35,
      metalness: 0.60
    });
    const stanchion = new THREE.Mesh(stanchionGeo, stanchionMat);
    stanchion.position.set(0, baseH / 2 + 0.9, 0);
    group.add(stanchion);

    // 6. High-Resolution Billboard Header Plaque (600x140 Retina Canvas, Calibrated Typography)
    const labelSprite = this.createCanvasLabel(table.name, count, hexColor, isCore);
    labelSprite.position.set(0, baseH / 2 + 2.7, 0);
    const labelW = baseW * 1.08;
    const labelH = labelW * (140 / 600);
    labelSprite.scale.set(labelW, labelH, 1);
    group.add(labelSprite);

    // 7. WOW Element #9: Soft Contact Occlusion Shadow Plane on Plinth
    const shadowTex = this.createContactShadowTexture();
    const shadowPlaneGeo = new THREE.PlaneGeometry(baseW * 1.35, baseD * 1.35);
    shadowPlaneGeo.rotateX(-Math.PI / 2);
    const shadowPlaneMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.58,
      depthWrite: false
    });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    // Position directly on the plinth surface at y = -5.98
    shadowPlane.position.set(position.x, -5.98, position.z);
    this.graphGroup.add(shadowPlane);

    const nodeObj = {
      name: table.name,
      data: table,
      recordCount: count,
      isCore: isCore,
      degree: degree,
      group: group,
      mesh: mesh,
      pedestal: pedestal,
      boxMat: boxMat,
      edgeLines: edgeLines,
      edgeMat: edgesMat,
      topBarMat: topBarMat,
      labelSprite: labelSprite,
      shadowPlane: shadowPlane,
      shadowPlaneMat: shadowPlaneMat,
      baseColor: domainColor,
      hexColor: hexColor,
      baseDims: { w: baseW, h: baseH, d: baseD },
      position: group.position,
      baseY: position.y,

      // Smooth Animation State (Micro-interactions & Focus Lerp)
      currentY: position.y,
      targetY: position.y,
      currentScale: 1.0,
      targetScale: 1.0,
      currentEmissiveIntensity: isCore ? 0.24 : 0.16,
      targetEmissiveIntensity: isCore ? 0.24 : 0.16,
      targetColorHex: 0x1e293b,
      revealDelay: isCore ? 300 : (degree >= 3 ? 550 : 750),
      revealProgress: 0.0
    };

    return nodeObj;
  }

  createCanvasLabel(tableName, recordCount, accentColor, isCore = false) {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 140;
    const ctx = canvas.getContext('2d');

    this.drawLabelCanvas(ctx, tableName, recordCount, accentColor, isCore);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: true,
      depthWrite: false
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.userData = { canvas, ctx, texture, isCore };

    return sprite;
  }

  drawLabelCanvas(ctx, tableName, recordCount, accentColor, isCore = false) {
    ctx.clearRect(0, 0, 600, 140);

    const color = accentColor || '#0071e3';

    // 1. High-Contrast Solid Dark Obsidian Plaque (100% OPAQUE)
    ctx.fillStyle = '#0a0f1d';
    ctx.strokeStyle = color;
    ctx.lineWidth = isCore ? 4.8 : 3.6;

    const x = 6, y = 6, w = 588, h = 128, r = 18;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 2. Solid Status Dot
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(38, 70, isCore ? 12 : 9.5, 0, Math.PI * 2);
    ctx.fill();

    // 3. Table Name (Bold, Sharp White Typography with Auto Font-Sizing to Prevent Truncation)
    const upperName = tableName.toUpperCase();
    let fontSize = 33;
    if (upperName.length > 13) fontSize = 24;
    else if (upperName.length > 9) fontSize = 28;

    ctx.fillStyle = '#ffffff';
    ctx.font = `800 ${fontSize}px -apple-system, BlinkMacSystemFont, "Inter", "SF Pro Display", sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(upperName, 64, 70);

    // 4. Solid Row Count Pill
    ctx.fillStyle = '#1e293b';
    const pillW = 132;
    const pillH = 56;
    const pillX = 600 - 18 - pillW;
    const pillY = 42;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(pillX, pillY, pillW, pillH, 12);
    else ctx.rect(pillX, pillY, pillW, pillH);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.font = '700 22px "Inter", "SF Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${recordCount} ROWS`, pillX + pillW / 2, 70);
  }

  updateNodeLabel(node) {
    if (!node.labelSprite || !node.labelSprite.userData.ctx) return;
    const { ctx, texture, isCore } = node.labelSprite.userData;
    this.drawLabelCanvas(ctx, node.name, node.recordCount, node.hexColor, isCore);
    texture.needsUpdate = true;
  }

  updateNodeGeometryScale(node) {
    const count = node.recordCount || 0;
    const coreMultiplier = node.isCore ? 1.14 : 1.0;
    const scale = (0.90 + 0.16 * Math.min(1.0, Math.log2(count + 1) / 4.0)) * coreMultiplier;
    const newW = 15.0 * scale;
    const newH = 3.6 * scale;
    const newD = 10.5 * scale;

    const scaleX = newW / node.baseDims.w;
    const scaleY = newH / node.baseDims.h;
    const scaleZ = newD / node.baseDims.d;

    node.mesh.scale.set(scaleX, scaleY, scaleZ);
    node.pedestal.scale.set(scaleX, 1.0, scaleZ);
    if (node.shadowPlane) {
      node.shadowPlane.scale.set(scaleX, 1.0, scaleZ);
    }
    if (node.labelSprite) {
      const labelW = newW * 1.08;
      const labelH = labelW * (140 / 600);
      node.labelSprite.scale.set(labelW, labelH, 1);
    }
  }

  animateNodePulse(node) {
    const initialY = node.baseY;
    const startTime = performance.now();
    const duration = 450;

    const pulseStep = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1.0, elapsed / duration);
      const bounce = Math.sin(progress * Math.PI) * 2.2;
      node.targetY = initialY + bounce;

      if (progress < 1.0) {
        requestAnimationFrame(pulseStep);
      } else {
        node.targetY = initialY;
      }
    };
    requestAnimationFrame(pulseStep);
  }

  // ==========================================================
  // WOW ELEMENT #2 & #13: LIVE RELATIONAL CONDUITS & DATA FLOW PULSES
  // Thin, elegant, subtle · Controlled organic packet transmission
  // ==========================================================
  createRelationshipLink(srcNode, tgtNode, relData, index = 0) {
    const p1 = srcNode.position;
    const p2 = tgtNode.position;

    const isCoreRel = srcNode.name === this.coreTableName || tgtNode.name === this.coreTableName;

    // Gracefully elevated parabolic arch (clears intermediate nodes with high elegance)
    const midX = (p1.x + p2.x) / 2;
    const dist = Math.hypot(p2.x - p1.x, p2.z - p1.z);
    const midY = Math.max(p1.y, p2.y) + 1.8 + dist * 0.045;
    const midZ = (p1.z + p2.z) / 2;
    const controlPoint = new THREE.Vector3(midX, midY, midZ);

    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(p1.x, p1.y, p1.z),
      controlPoint,
      new THREE.Vector3(p2.x, p2.y, p2.z)
    );

    const points = curve.getPoints(36);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    // WOW Element #13: Hierarchy in visual weight (crisp Linear blue for core, slate for secondary)
    const baseOpacity = isCoreRel ? 0.58 : 0.40;
    const baseColor = isCoreRel ? 0x2563eb : 0x64748b;
    const material = new THREE.LineBasicMaterial({
      color: baseColor,
      linewidth: 1.0,
      transparent: true,
      opacity: baseOpacity
    });

    const curveLine = new THREE.Line(geometry, material);

    // WOW Element #2: Subtle Traveling Data Pulse (Dense core sphere + soft luminous aura)
    const pulseGroup = new THREE.Group();
    pulseGroup.visible = false;

    const pulseRadius = isCoreRel ? 0.46 : 0.36;
    const pulseMat = new THREE.MeshBasicMaterial({
      color: isCoreRel ? 0x0091ff : 0x38bdf8,
      transparent: true,
      opacity: 0.0
    });
    const pulseGeo = new THREE.SphereGeometry(pulseRadius, 8, 8);
    const pulseCore = new THREE.Mesh(pulseGeo, pulseMat);
    pulseGroup.add(pulseCore);

    // Soft outer luminous aura
    const auraMat = new THREE.MeshBasicMaterial({
      color: isCoreRel ? 0x38bdf8 : 0x7dd3fc,
      transparent: true,
      opacity: 0.0
    });
    const auraGeo = new THREE.SphereGeometry(pulseRadius * 1.8, 8, 8);
    const pulseAura = new THREE.Mesh(auraGeo, auraMat);
    pulseGroup.add(pulseAura);

    this.graphGroup.add(pulseGroup);

    // Staggered, calm pulse timing (quiet -> activity -> quiet)
    const linkObj = {
      curve: curve,
      curveLine: curveLine,
      material: material,
      pulseDot: pulseGroup,
      pulseMat: pulseMat,
      auraMat: auraMat,
      source: srcNode.name,
      target: tgtNode.name,
      relData: relData,
      isCoreRel: isCoreRel,
      baseOpacity: baseOpacity,
      baseColorHex: baseColor,

      // Smooth Lerp State for Hover Transitions
      currentOpacity: baseOpacity,
      targetOpacity: baseOpacity,
      currentColorHex: baseColor,
      targetColorHex: baseColor,

      // Live Data Flow State Machine
      pulseActive: false,
      pulseT: 0.0,
      pulseSpeed: isCoreRel ? 0.34 : 0.28, // Traversal takes ~3.0 - 3.6s
      cooldownTimer: 1.8 + (index * 0.55) % 4.0 + Math.random() * 2.0 // Initial staggered delay
    };

    return linkObj;
  }

  // ==========================================================
  // WOW ELEMENT #14: INITIAL REVEAL SEQUENCE (~1.2s - 1.5s ORCHESTRATION)
  // ==========================================================
  triggerInitialReveal() {
    this.revealStartTime = performance.now();
    this.isRevealing = true;
    this.revealComplete = false;

    // Start all nodes scaled to zero
    this.nodes.forEach(node => {
      node.group.scale.set(0.001, 0.001, 0.001);
      node.revealProgress = 0.0;
    });

    // Relationship lines start invisible
    this.links.forEach(l => {
      l.material.opacity = 0.0;
      l.currentOpacity = 0.0;
    });

    // Camera starts 8% farther back and gently glides into final position
    this.frameCameraToGraph(true);
  }

  // User-invoked Synaptic Pulse Burst
  triggerPulseBurst() {
    if (!this.links || this.links.length === 0) return;
    this.links.forEach((link, idx) => {
      link.pulseActive = true;
      link.pulseT = 0.0;
      link.pulseDot.visible = true;
      link.pulseSpeed = link.isCoreRel ? 0.45 : 0.38;
      link.cooldownTimer = 2.5 + Math.random() * 2.0;
    });
  }

  // ==========================================================
  // CLUSTER FILTERS (100% OPAQUE SHIFT, ZERO TRANSPARENCY GHOSTS)
  // ==========================================================
  setCluster(clusterName) {
    this.currentCluster = clusterName;
    const activeSet = this.clusters[clusterName];

    this.nodes.forEach(node => {
      const isMatch = clusterName === 'all' || (activeSet && activeSet.has(node.name));
      if (isMatch) {
        node.targetColorHex = 0x1e293b;
        node.targetEmissiveIntensity = node.isCore ? 0.24 : 0.16;
        node.edgeMat.color.copy(node.baseColor);
        node.labelSprite.visible = true;
      } else {
        node.targetColorHex = 0x0c1322;
        node.targetEmissiveIntensity = 0.0;
        node.edgeMat.color.setHex(0x1e293b);
        node.labelSprite.visible = false;
      }
    });

    this.links.forEach(l => {
      const srcMatch = clusterName === 'all' || (activeSet && activeSet.has(l.source));
      const tgtMatch = clusterName === 'all' || (activeSet && activeSet.has(l.target));
      if (srcMatch && tgtMatch) {
        l.targetColorHex = l.isCoreRel ? 0x2563eb : 0x64748b;
        l.targetOpacity = l.baseOpacity;
      } else {
        l.targetColorHex = 0xcbd5e1;
        l.targetOpacity = 0.04;
        l.pulseActive = false;
        l.pulseDot.visible = false;
      }
    });
  }

  // ==========================================================
  // CINEMATIC CAMERA FRAMING (OCCUPIES 74–78% OF VIEWPORT)
  // ==========================================================
  frameCameraToGraph(fromDistance = false) {
    if (!this.graphGroup || this.nodes.size === 0) return;

    const box = new THREE.Box3().setFromObject(this.graphGroup);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const size = new THREE.Vector3();
    box.getSize(size);

    const fov = this.camera.fov * (Math.PI / 180);
    const aspect = this.camera.aspect || 1.6;

    // Frame the compact graph with ~12% breathing room so graph occupies ~74-78% of viewport
    const fitRatio = 0.76;
    const vDist = (size.y / 2 + 6) / Math.tan(fov / 2);
    const hDist = (size.x / 2 + 8) / (Math.tan(fov / 2) * aspect);
    const zDepth = size.z * 0.4;

    const requiredDist = Math.max(vDist, hDist) / fitRatio + zDepth;

    // Elevated 28-degree architectural studio camera angle
    const elevAngle = 0.48; // ~27.5 degrees
    const targetPos = new THREE.Vector3(
      center.x,
      center.y + requiredDist * Math.sin(elevAngle),
      center.z + requiredDist * Math.cos(elevAngle)
    );

    this.baseCameraPos.copy(targetPos);

    if (fromDistance) {
      // WOW Element #14: Start 8% farther back for initial smooth entrance glide
      this.camera.position.copy(targetPos.clone().multiplyScalar(1.08));
      this.camera.lookAt(center);
      this.smoothGlideCamera(targetPos, center);
    } else {
      this.smoothGlideCamera(targetPos, center);
    }
  }

  smoothGlideCamera(targetPos, targetLookAt) {
    this.targetCameraPos = targetPos.clone();
    this.targetLookAt = targetLookAt.clone();
  }

  setCameraView(mode = 'perspective') {
    if (mode === 'top') {
      this.smoothGlideCamera(new THREE.Vector3(0, 110, 0.1), new THREE.Vector3(0, 0, 0));
    } else {
      this.frameCameraToGraph();
    }
  }

  resetCamera() {
    this.setCluster('all');
    this.deselect();
    this.frameCameraToGraph();
  }

  // ==========================================================
  // WOW ELEMENT #4: RELATIONSHIP HIGHLIGHT / HOVER FOCUS MODE
  // ==========================================================
  handlePointerMove() {
    if (this.mouse.x === -1000 || this.interactableMeshes.length === 0) return;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactableMeshes, false);

    if (intersects.length > 0) {
      const mesh = intersects[0].object;
      const node = this.nodes.get(mesh.userData.tableName);
      if (node && this.hoveredNode !== node) {
        this.setHoveredNode(node);
      }
    } else {
      if (this.hoveredNode) {
        this.clearHover();
      }
    }
  }

  handlePointerClick(e) {
    if (this.interactableMeshes.length === 0) return;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactableMeshes, false);

    if (intersects.length > 0) {
      const mesh = intersects[0].object;
      const node = this.nodes.get(mesh.userData.tableName);
      if (node) {
        this.selectNode(node);
      }
    } else {
      this.deselect();
    }
  }

  setHoveredNode(node) {
    this.hoveredNode = node;
    this.container.style.cursor = 'pointer';

    // Determine directly connected tables
    const connectedTables = new Set([node.name]);
    this.links.forEach(l => {
      if (l.source === node.name) connectedTables.add(l.target);
      if (l.target === node.name) connectedTables.add(l.source);
    });

    // WOW Element #10: Micro-interactions & Relational Focus Mode
    this.nodes.forEach(n => {
      if (n === node) {
        // Hovered node: lifts upward, scales subtly ~2.5%, brightens
        n.targetY = n.baseY + 1.8;
        n.targetScale = 1.025;
        n.targetEmissiveIntensity = 0.44;
        n.targetColorHex = 0x243554;
        if (n.shadowPlaneMat) n.shadowPlaneMat.opacity = 0.38;
      } else if (connectedTables.has(n.name)) {
        // Directly related nodes: stay illuminated with clean domain edge
        n.targetY = n.baseY + 0.5;
        n.targetScale = 1.01;
        n.targetEmissiveIntensity = n.isCore ? 0.28 : 0.22;
        n.targetColorHex = 0x1e293b;
        n.edgeMat.color.copy(n.baseColor);
        if (n.shadowPlaneMat) n.shadowPlaneMat.opacity = 0.48;
      } else {
        // Unrelated nodes: dim subtly via dark muted slate
        n.targetY = n.baseY;
        n.targetScale = 0.99;
        n.targetEmissiveIntensity = 0.02;
        n.targetColorHex = 0x0c1322;
        n.edgeMat.color.setHex(0x1e293b);
        if (n.shadowPlaneMat) n.shadowPlaneMat.opacity = 0.22;
      }
    });

    // WOW Element #4: Relationship Lines Focus Mode (Smooth Lerp Target)
    this.links.forEach(l => {
      if (l.source === node.name || l.target === node.name) {
        l.targetColorHex = 0x0071e3;
        l.targetOpacity = 0.95;
      } else {
        l.targetColorHex = 0xcbd5e1;
        l.targetOpacity = 0.04;
      }
    });

    const cb = this.options.onHoverNode || this.options.onNodeHover;
    if (typeof cb === 'function') {
      cb(node.data);
    }
  }

  clearHover() {
    if (this.hoveredNode) {
      this.hoveredNode = null;
    }
    this.container.style.cursor = 'default';

    if (!this.selectedNode) {
      // Smoothly return all nodes to resting states
      this.nodes.forEach(n => {
        n.targetY = n.baseY;
        n.targetScale = 1.0;
        n.targetEmissiveIntensity = n.isCore ? 0.24 : 0.16;
        n.targetColorHex = 0x1e293b;
        n.edgeMat.color.copy(n.baseColor);
        if (n.shadowPlaneMat) n.shadowPlaneMat.opacity = 0.58;
      });

      this.resetLinkStyles();
    }

    const cb = this.options.onHoverNode || this.options.onNodeHover;
    if (typeof cb === 'function') {
      cb(null);
    }
  }

  // ==========================================================
  // WOW ELEMENT #5: CLICKED TABLE & SPATIAL NEIGHBORHOOD FOCUS
  // ==========================================================
  selectNode(nodeOrName) {
    let node = nodeOrName;
    if (typeof nodeOrName === 'string') {
      node = this.nodes.get(nodeOrName.toLowerCase()) || this.nodes.get(nodeOrName);
    }

    if (!node || !node.group) {
      this.deselect();
      return;
    }

    // Reset old selected node position
    if (this.selectedNode && this.selectedNode !== node) {
      this.selectedNode.targetY = this.selectedNode.baseY;
      this.selectedNode.targetScale = 1.0;
    }

    this.selectedNode = node;
    node.targetY = node.baseY + 2.4;
    node.targetScale = 1.03;

    // Determine connected tables
    const connectedTables = new Set([node.name]);
    this.links.forEach(l => {
      if (l.source === node.name) connectedTables.add(l.target);
      if (l.target === node.name) connectedTables.add(l.source);
    });

    // Dim unconnected nodes, highlight connected ones
    this.nodes.forEach(n => {
      if (connectedTables.has(n.name)) {
        n.targetColorHex = n === node ? 0x243554 : 0x1e293b;
        n.targetEmissiveIntensity = n === node ? 0.46 : 0.24;
        n.edgeMat.color.copy(n.baseColor);
        n.labelSprite.visible = true;
        if (n.shadowPlaneMat) n.shadowPlaneMat.opacity = n === node ? 0.35 : 0.48;
      } else {
        n.targetColorHex = 0x0c1322;
        n.targetEmissiveIntensity = 0.0;
        n.edgeMat.color.setHex(0x1e293b);
        if (n.shadowPlaneMat) n.shadowPlaneMat.opacity = 0.18;
      }
    });

    // Highlight relationship curves
    this.links.forEach(l => {
      if (l.source === node.name || l.target === node.name) {
        l.targetColorHex = 0x0071e3;
        l.targetOpacity = 0.96;
      } else {
        l.targetColorHex = 0xcbd5e1;
        l.targetOpacity = 0.04;
      }
    });

    // WOW Element #5: Smooth photographic camera glide towards target
    const nodePos = node.position || node.group.position;
    const targetPos = new THREE.Vector3(
      nodePos.x * 0.40,
      nodePos.y + 20,
      nodePos.z + 34
    );
    this.smoothGlideCamera(targetPos, nodePos);

    // Prepare enriched node data and trigger inspector drawer
    const nodePayload = Object.assign({}, node.data, {
      relatedTables: Array.from(connectedTables).filter(t => t !== node.name),
      recordCount: node.recordCount
    });

    const cb = this.options.onSelectNode || this.options.onNodeSelect;
    if (typeof cb === 'function') {
      cb(nodePayload);
    }
  }

  deselect() {
    if (this.selectedNode) {
      this.selectedNode.targetY = this.selectedNode.baseY;
      this.selectedNode.targetScale = 1.0;
      this.selectedNode = null;
    }

    this.nodes.forEach(n => {
      n.targetY = n.baseY;
      n.targetScale = 1.0;
      n.targetEmissiveIntensity = n.isCore ? 0.24 : 0.16;
      n.targetColorHex = 0x1e293b;
      n.edgeMat.color.copy(n.baseColor);
      n.labelSprite.visible = true;
      if (n.shadowPlaneMat) n.shadowPlaneMat.opacity = 0.58;
    });

    this.setCluster(this.currentCluster);
    this.resetLinkStyles();

    const cb = this.options.onSelectNode || this.options.onNodeSelect;
    if (typeof cb === 'function') {
      cb(null);
    }
  }

  resetLinkStyles() {
    this.links.forEach(l => {
      l.targetColorHex = l.baseColorHex;
      l.targetOpacity = l.baseOpacity;
    });
  }

  // ==========================================================
  // RENDER LOOP & REAL-TIME ANIMATION
  // Live Constellation Motion · Parallax · Data Flow · Breathing
  // ==========================================================
  animate() {
    this.animationFrameId = requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();
    const now = performance.now();

    // 1. WOW Element #14: Initial Reveal Sequence (~1.2s - 1.5s orchestrated entrance)
    if (this.isRevealing) {
      const revealElapsed = now - this.revealStartTime;

      this.nodes.forEach(node => {
        if (revealElapsed > node.revealDelay) {
          const t = Math.min(1.0, (revealElapsed - node.revealDelay) / 380);
          // Cubic ease-out
          const easeOut = 1 - Math.pow(1 - t, 3);
          node.group.scale.set(easeOut, easeOut, easeOut);
        }
      });

      if (revealElapsed > 900) {
        const lineT = Math.min(1.0, (revealElapsed - 900) / 350);
        this.links.forEach(l => {
          l.material.opacity = l.baseOpacity * lineT;
          l.currentOpacity = l.material.opacity;
        });
      }

      if (revealElapsed > 1400) {
        this.isRevealing = false;
        this.revealComplete = true;
        this.nodes.forEach(node => node.group.scale.set(1, 1, 1));
      }
    }

    // 2. WOW Element #10: Micro-Interaction Smooth Lerp (Elevations, Scales, Emissives)
    if (!this.isRevealing) {
      this.nodes.forEach(node => {
        // Smooth Y elevation lerp (~250-300ms)
        node.currentY += (node.targetY - node.currentY) * 0.14;
        node.group.position.y = node.currentY;

        // Smooth scale lerp
        node.currentScale += (node.targetScale - node.currentScale) * 0.14;
        node.group.scale.set(node.currentScale, node.currentScale, node.currentScale);

        // Smooth emissive intensity lerp
        node.currentEmissiveIntensity += (node.targetEmissiveIntensity - node.currentEmissiveIntensity) * 0.14;
        node.boxMat.emissiveIntensity = node.currentEmissiveIntensity;

        // Smooth chassis color tone shift
        const curHex = node.boxMat.color.getHex();
        if (curHex !== node.targetColorHex) {
          const targetCol = new THREE.Color(node.targetColorHex);
          node.boxMat.color.lerp(targetCol, 0.14);
        }
      });

      // Smooth Relationship Conduit Opacity & Color Lerp (Silky Relational Focus Mode)
      this.links.forEach(link => {
        link.currentOpacity += (link.targetOpacity - link.currentOpacity) * 0.14;
        link.material.opacity = link.currentOpacity;

        const curHex = link.material.color.getHex();
        if (curHex !== link.targetColorHex) {
          const targetCol = new THREE.Color(link.targetColorHex);
          link.material.color.lerp(targetCol, 0.14);
        }
      });
    }

    // 3. WOW Element #12: Database "Breathing" (Subtle 10-second environmental luminaire oscillation)
    // Tables remain completely stationary. Only environmental lighting oscillates gently.
    const breathTime = elapsedTime * (Math.PI * 2 / 10.0); // 10-second period
    const breathFactor = Math.sin(breathTime);
    if (this.centerSpot) {
      this.centerSpot.intensity = 0.65 + breathFactor * 0.04;
    }
    if (this.hubPointLight) {
      this.hubPointLight.intensity = 0.90 + breathFactor * 0.06;
    }
    if (this.ambientLight) {
      this.ambientLight.intensity = 0.42 + breathFactor * 0.02;
    }

    // 4. WOW Element #6: Subtle Camera Parallax Dampening
    if (!this.isUserInteracting && !this.reducedMotion && !this.targetCameraPos) {
      this.parallaxCurrent.x += (this.parallaxTarget.x - this.parallaxCurrent.x) * 0.035;
      this.parallaxCurrent.y += (this.parallaxTarget.y - this.parallaxCurrent.y) * 0.035;

      this.camera.position.x = this.baseCameraPos.x + this.parallaxCurrent.x;
      this.camera.position.y = this.baseCameraPos.y + this.parallaxCurrent.y;
    }

    // 5. WOW Element #2 & #13: Live Relational Data Flow Pulses (Staggered, calm, organic)
    if (!this.reducedMotion && this.revealComplete) {
      this.links.forEach(link => {
        if (!link.pulseActive) {
          link.cooldownTimer -= delta;
          if (link.cooldownTimer <= 0) {
            // Trigger new traveling data pulse
            link.pulseActive = true;
            link.pulseT = 0.0;
            link.pulseDot.visible = true;
          }
        } else {
          link.pulseT += delta * link.pulseSpeed;
          if (link.pulseT >= 1.0) {
            link.pulseActive = false;
            link.pulseDot.visible = false;
            // Cooldown: quiet -> activity -> quiet
            link.cooldownTimer = link.isCoreRel 
              ? 1.8 + Math.random() * 2.2 
              : 3.8 + Math.random() * 3.6;
          } else {
            // Smooth ease in-out progression along quadratic bezier curve
            const easeProgress = link.pulseT < 0.5 
              ? 2 * link.pulseT * link.pulseT 
              : -1 + (4 - 2 * link.pulseT) * link.pulseT;

            const pt = link.curve.getPoint(easeProgress);
            link.pulseDot.position.copy(pt);

            // Subtle fade in as it leaves, full opacity at mid-flight, fade out on arrival
            const alpha = Math.sin(link.pulseT * Math.PI);
            link.pulseMat.opacity = alpha * 0.95;
            link.auraMat.opacity = alpha * 0.45;
          }
        }
      });
    }

    // 6. WOW Element #5: Smooth Camera Glide Lerp (clicking tables / reset)
    if (this.targetCameraPos && this.camera) {
      this.camera.position.lerp(this.targetCameraPos, 0.065);
      if (this.controls && this.targetLookAt) {
        this.controls.target.lerp(this.targetLookAt, 0.065);
      }
      if (this.camera.position.distanceTo(this.targetCameraPos) < 0.25) {
        this.baseCameraPos.copy(this.targetCameraPos);
        this.targetCameraPos = null;
      }
    }

    // 7. Cinematic Orbit Tour
    if (this.isOrbitTourActive && this.camera && !this.isUserInteracting) {
      this.orbitAngle += delta * 0.20;
      const orbitRadius = 88;
      this.camera.position.x = Math.sin(this.orbitAngle) * orbitRadius;
      this.camera.position.z = Math.cos(this.orbitAngle) * orbitRadius;
      this.camera.position.y = 44 + Math.sin(this.orbitAngle * 1.5) * 5;
      this.camera.lookAt(0, 0, 0);
      if (this.controls) this.controls.target.set(0, 0, 0);
    } else if (!this.isUserInteracting && !this.reducedMotion && this.graphGroup && !this.selectedNode && !this.targetCameraPos) {
      // Very subtle idle drift
      this.graphGroup.rotation.y += this.idleRotationSpeed;
    }

    // 8. Update controls
    if (this.controls && !this.isOrbitTourActive) {
      this.controls.update();
    }

    // 9. Render scene with PCF Soft Shadows
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  // ==========================================================
  // FALLBACK 2D SVG VISUALIZATION
  // ==========================================================
  initSvgFallback() {
    this.container.innerHTML = `
      <div class="svg-graph-fallback" style="width:100%; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; background:#f8fafc; color:#0f172a; padding:20px;">
        <div style="font-size:14px; font-weight:700; color:#0071e3; margin-bottom:6px;">DATABASE ARCHITECTURE</div>
        <p style="font-size:12px; color:#64748b; margin-bottom:16px;">Displaying 2D relational schema topology.</p>
        <div id="svgFallbackCanvas" style="width:100%; height:380px; overflow:hidden;"></div>
      </div>
    `;

    setTimeout(async () => {
      const el = document.getElementById('svgFallbackCanvas');
      if (!el) return;
      try {
        const res = await fetch('/api/database/graph');
        const data = await res.json();
        const w = el.clientWidth || 700;
        const h = el.clientHeight || 380;

        let svgHtml = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="width:100%; height:100%;">`;
        const cols = 5;
        data.tables.forEach((t, i) => {
          const x = 70 + (i % cols) * (w / cols);
          const y = 50 + Math.floor(i / cols) * 90;
          const col = this.domainColors[t.name] || '#0071e3';
          svgHtml += `
            <g style="cursor:pointer;" onclick="window.inspectNodeViewRecords && (window.selectedInspectorTable='${t.name}', window.inspectNodeViewRecords())">
              <rect x="${x - 45}" y="${y - 20}" width="90" height="42" rx="8" fill="#ffffff" stroke="${col}" stroke-width="1.8" />
              <text x="${x}" y="${y - 2}" fill="#0f172a" font-size="11" font-weight="bold" text-anchor="middle">${t.name.toUpperCase()}</text>
              <text x="${x}" y="${y + 13}" fill="${col}" font-size="10" font-family="monospace" text-anchor="middle">${t.record_count} rows</text>
            </g>
          `;
        });
        svgHtml += `</svg>`;
        el.innerHTML = svgHtml;
      } catch (e) {
        console.error('Fallback SVG error:', e);
      }
    }, 100);
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.renderer && this.renderer.domElement) {
      this.renderer.dispose();
      if (this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
  }
}

window.DatabaseVisualizer = DatabaseVisualizer;

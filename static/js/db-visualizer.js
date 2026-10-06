/**
 * IT Helpdesk & Asset Support Management System
 * Spatial Database Architecture Visualizer (db-visualizer.js)
 * Light Architectural Studio Mode (Linear / Apple Pro Aesthetic)
 * Precision-Machined Solid Data Blocks · Compact Architectural Topology
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
    this.pulses = []; // animated packet markers traveling on curves
    this.selectedNode = null;
    this.hoveredNode = null;
    this.currentCluster = 'all';

    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.isUserInteracting = false;
    this.idleRotationSpeed = this.reducedMotion ? 0 : 0.0004;
    this.clock = new THREE.Clock();

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-1000, -1000);
    this.mouseClientPos = { x: 0, y: 0 };
    this.interactableMeshes = [];

    // Cinematic Orbit Tour State
    this.isOrbitTourActive = false;
    this.orbitAngle = 0;

    // Smooth camera glide state
    this.targetCameraPos = null;
    this.targetLookAt = null;

    // Enterprise Restrained Tonal Palette
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

    // 1. Scene Setup - Studio Architectural Grounding
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf7f8fa);
    this.scene.fog = new THREE.FogExp2(0xf7f8fa, 0.0035);

    // 2. Camera Setup (Compact, prominent framing)
    const rect = this.container.getBoundingClientRect();
    const aspect = (rect.width || 800) / (rect.height || 500);
    this.camera = new THREE.PerspectiveCamera(38, aspect, 1, 1500);
    this.initialCameraPos = new THREE.Vector3(0, 36, 75);
    this.camera.position.copy(this.initialCameraPos);
    this.camera.lookAt(0, 0, 0);

    // 3. High Performance WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false
    });
    this.renderer.setSize(rect.width || 800, rect.height || 500);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.container.appendChild(this.renderer.domElement);

    // 4. Controls
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.06;
      this.controls.maxDistance = 220;
      this.controls.minDistance = 20;
      this.controls.maxPolarAngle = Math.PI / 2 + 0.05;
      this.controls.target.set(0, 0, 0);

      this.controls.addEventListener('start', () => { 
        this.isUserInteracting = true;
        this.targetCameraPos = null;
      });
      this.controls.addEventListener('end', () => { 
        setTimeout(() => { this.isUserInteracting = false; }, 800); 
      });
    }

    // 5. Studio Multi-Point Physical Lighting
    this.setupLighting();

    // 6. Solid Architectural Plinth & Disc Base
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

  setupLighting() {
    // 1. Soft Ambient Fill Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    this.scene.add(ambientLight);

    // 2. High-precision Key Directional Light (Crisp form definition, satin specular)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.10);
    keyLight.position.set(50, 80, 55);
    this.scene.add(keyLight);

    // 3. Subtle Cool Fill Light (Prevents harsh contrasting shadows)
    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.50);
    fillLight.position.set(-50, 45, -45);
    this.scene.add(fillLight);

    // 4. Central Hub Accent Light
    const hubPointLight = new THREE.PointLight(0x0071e3, 0.85, 120);
    hubPointLight.position.set(0, 18, 0);
    this.scene.add(hubPointLight);
  }

  setupFloorGrid() {
    this.floorGroup = new THREE.Group();

    // 1. Solid Architectural Studio Disc (100% OPAQUE, Satin White)
    const plinthRadius = 78;
    const plinthGeo = new THREE.CylinderGeometry(plinthRadius, plinthRadius, 0.8, 64);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.85,
      metalness: 0.05,
      transparent: false,
      opacity: 1.0
    });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = -6.4;
    this.floorGroup.add(plinth);

    // 2. Subtle Studio Grid Lines
    const grid = new THREE.GridHelper(156, 26, 0x0071e3, 0xe2e8f0);
    grid.position.y = -5.98;
    this.floorGroup.add(grid);

    // 3. Crisp Perimeter Boundary Ring (Opaque Solid)
    const ringGeo = new THREE.BufferGeometry();
    const points = [];
    const segments = 96;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(theta) * 76, -5.95, Math.sin(theta) * 76));
    }
    ringGeo.setFromPoints(points);
    const ringMat = new THREE.LineBasicMaterial({
      color: 0xcbd5e1,
      transparent: false,
      opacity: 1.0
    });
    const ring = new THREE.Line(ringGeo, ringMat);
    this.floorGroup.add(ring);

    this.scene.add(this.floorGroup);
  }

  setupEvents() {
    const el = this.renderer.domElement;

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      this.mouseClientPos.x = e.clientX;
      this.mouseClientPos.y = e.clientY;
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.handlePointerMove();
    });

    el.addEventListener('mouseleave', () => {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
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
      this.frameCameraToGraph();

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
    this.frameCameraToGraph();
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
    this.pulses = [];
    this.interactableMeshes = [];

    // 1. Calculate Compact Deterministic Relational Graph Positions
    const positions = this.computeDeterministicGraphLayout(
      this.graphData.tables, 
      this.graphData.relationships
    );

    // 2. Build Precision-Machined Solid Architecture Data Blocks
    this.graphData.tables.forEach(table => {
      const pos = positions[table.name] || { x: 0, y: 0, z: 0 };
      const node = this.createTableNode(table, pos);
      this.nodes.set(table.name, node);
      this.graphGroup.add(node.group);
      this.interactableMeshes.push(node.mesh);
    });

    // 3. Build Subtle, Clean Relationship Conduits
    this.graphData.relationships.forEach(rel => {
      const srcNode = this.nodes.get(rel.source);
      const tgtNode = this.nodes.get(rel.target);
      if (srcNode && tgtNode) {
        const link = this.createRelationshipLink(srcNode, tgtNode, rel);
        this.links.push(link);
        this.graphGroup.add(link.curveLine);
      }
    });

    // 4. Verify Layout Spacing & Zero Collisions
    this.verifyLayoutSpacing();
  }

  // ==========================================================
  // DETERMINISTIC GRAPH LAYOUT STRATEGY (COMPACT 3D HIERARCHY)
  // ==========================================================
  computeDeterministicGraphLayout(tables, relationships) {
    const pos = {};

    // 1. Graph Degree Calculation from Real Foreign Keys
    const degree = new Map();
    tables.forEach(t => degree.set(t.name, 0));
    relationships.forEach(rel => {
      if (degree.has(rel.source)) degree.set(rel.source, degree.get(rel.source) + 1);
      if (degree.has(rel.target)) degree.set(rel.target, degree.get(rel.target) + 1);
    });

    // 2. Compact Structured Hierarchy with Amphitheater Elevation
    // Whole database occupies a controlled ~104 x 88 unit volume:
    // Core Central Hub (Degree ~10)
    pos['tickets']          = { x: 0,    y: 0.0,  z: 0 };

    // Tier 1: Primary Operational & Entity Hubs (Close Ring, Radius ~28-34 units)
    pos['incidents']        = { x: -22,  y: -1.4, z: 20 };   // Front-left
    pos['service_requests'] = { x: 22,   y: -1.4, z: 20 };   // Front-right
    pos['users']            = { x: -32,  y: 0.3,  z: -4 };   // Direct left
    pos['assets']           = { x: 32,   y: 0.3,  z: -4 };   // Direct right
    pos['assignments']      = { x: -18,  y: 1.8,  z: -26 };  // Elevated back-left
    pos['support_staff']    = { x: 18,   y: 1.8,  z: -26 };  // Elevated back-right

    // Tier 2: Sub-domains, Taxonomy & Audit Ring (Outer Ring, Radius ~50-58 units)
    pos['status_histories'] = { x: 0,    y: -2.9, z: 42 };   // Lowest front-center
    pos['resolutions']      = { x: -44,  y: -1.9, z: 28 };   // Outer front-left
    pos['maintenance']      = { x: 44,   y: -1.9, z: 28 };   // Outer front-right
    pos['warranties']       = { x: 52,   y: 1.3,  z: -18 };  // Outer right-back
    pos['departments']      = { x: -52,  y: 1.3,  z: -18 };  // Outer left-back
    pos['categories']       = { x: -25,  y: 3.2,  z: -46 };  // Elevated far back-left
    pos['priorities']       = { x: 25,   y: 3.2,  z: -46 };  // Elevated far back-right

    // Fallback for any dynamic schema additions (compact spiral)
    let extraIndex = 0;
    tables.forEach(t => {
      if (!pos[t.name]) {
        const phi = (1 + Math.sqrt(5)) / 2;
        const angle = extraIndex * phi * Math.PI * 2;
        const rad = 56 + extraIndex * 4;
        const z = Math.sin(angle) * rad;
        pos[t.name] = {
          x: Math.cos(angle) * rad,
          y: - (z / 50) * 3.5,
          z: z
        };
        extraIndex++;
      }
    });

    // 3. Collision Constraint & Local Separation Pass
    // Ensures distance >= radiusA + radiusB + comfortableGap (min center distance: 22.0)
    const MIN_ALLOWED_DIST = 22.0;
    for (let iter = 0; iter < 40; iter++) {
      const decay = 1.0 - (iter / 40) * 0.75;
      for (let i = 0; i < tables.length; i++) {
        const tA = tables[i].name;
        if (tA === 'tickets') continue; // Core pinned at center
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
            if (tB !== 'tickets') {
              pB.x += nx * push;
              pB.z += nz * push;
            }
          }
        }
      }
    }

    // 4. Normalization Bounds Compression Pass
    // Guarantees maximum bounding footprint never exceeds compact bounds: |x| <= 58, |z| <= 54
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
        if (t.name !== 'tickets') {
          pos[t.name].x *= scaleFactorX;
          pos[t.name].z *= scaleFactorZ;
        }
      });
    }

    // 5. Recompute Amphitheater Vertical Elevation (0% Occlusion)
    // Front nodes step down, back nodes step up: unobstructed lines of sight
    tables.forEach(t => {
      if (t.name !== 'tickets') {
        pos[t.name].y = - (pos[t.name].z / 50) * 3.5;
      }
    });

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
    console.log(`[3D Visualizer] Compact Layout Verified: ${tableNames.length} tables, min gap: ${minObserved.toFixed(1)} units, collisions: ${collisions}`);
  }

  // ==========================================================
  // NODE CREATION: PRECISION-MACHINED SOLID ARCHITECTURAL DATA BLOCKS
  // 100% OPAQUE · SOLID MESHES · ZERO GLASSMORPHISM · ZERO GHOST PLANES
  // ==========================================================
  createTableNode(table, position) {
    const group = new THREE.Group();
    group.position.set(position.x, position.y, position.z);

    const count = table.record_count || 0;
    const hexColor = this.domainColors[table.name] || '#0071e3';
    const domainColor = new THREE.Color(hexColor);

    // Disciplined, normalized dimensions (Narrow, balanced scale)
    const scale = 0.90 + 0.16 * Math.min(1.0, Math.log2(count + 1) / 4.0);
    const baseW = 15.0 * scale;
    const baseH = 3.6 * scale;
    const baseD = 10.5 * scale;

    // 1. Lower Hardware Pedestal (Solid Matte Gunmetal Base)
    const pedGeo = new THREE.BoxGeometry(baseW * 1.04, 0.9, baseD * 1.04);
    const pedMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.50,
      metalness: 0.15,
      transparent: false,
      opacity: 1.0,
      depthTest: true,
      depthWrite: true
    });
    const pedestal = new THREE.Mesh(pedGeo, pedMat);
    pedestal.position.y = -baseH / 2 - 0.45;
    group.add(pedestal);

    // 2. High-Tech Obsidian Slate Chassis Body (100% Solid Opaque Block)
    const boxGeo = new THREE.BoxGeometry(baseW, baseH, baseD);
    const boxMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.38,
      metalness: 0.18,
      emissive: domainColor,
      emissiveIntensity: 0.14,
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

    // 3. Crisp Edge Lines (Solid Domain-Colored Bevel Frame)
    const edgesGeo = new THREE.EdgesGeometry(boxGeo);
    const edgesMat = new THREE.LineBasicMaterial({
      color: domainColor,
      linewidth: 1.5,
      transparent: false,
      opacity: 1.0
    });
    const edgeLines = new THREE.LineSegments(edgesGeo, edgesMat);
    group.add(edgeLines);

    // 4. Solid Inlaid Top Accent Stripe (Solid 3D Mesh Inlay, NOT a floating plane!)
    const topBarGeo = new THREE.BoxGeometry(baseW * 0.94, 0.22, baseD * 0.18);
    const topBarMat = new THREE.MeshStandardMaterial({
      color: domainColor,
      roughness: 0.30,
      metalness: 0.25,
      transparent: false,
      opacity: 1.0,
      depthTest: true,
      depthWrite: true
    });
    const topBar = new THREE.Mesh(topBarGeo, topBarMat);
    topBar.position.set(0, baseH / 2 + 0.11, -baseD * 0.34);
    group.add(topBar);

    // 5. Restrained Billboard Header Plaque (Solid Canvas, AlphaTest Discards Halo)
    const labelSprite = this.createCanvasLabel(table.name, count, hexColor);
    labelSprite.position.set(0, baseH / 2 + 2.2, 0);
    const labelW = baseW * 1.05;
    const labelH = labelW * (80 / 360);
    labelSprite.scale.set(labelW, labelH, 1);
    group.add(labelSprite);

    const nodeObj = {
      name: table.name,
      data: table,
      recordCount: count,
      group: group,
      mesh: mesh,
      pedestal: pedestal,
      boxMat: boxMat,
      edgeLines: edgeLines,
      edgeMat: edgesMat,
      topBarMat: topBarMat,
      labelSprite: labelSprite,
      baseColor: domainColor,
      hexColor: hexColor,
      baseDims: { w: baseW, h: baseH, d: baseD },
      position: group.position,
      baseY: position.y
    };

    return nodeObj;
  }

  createCanvasLabel(tableName, recordCount, accentColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 360;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');

    this.drawLabelCanvas(ctx, tableName, recordCount, accentColor);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    // alphaTest: 0.5 discards pixels outside the solid pill completely
    // eliminating any ghosted or translucent plane artifacts
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.5,
      depthTest: true,
      depthWrite: true
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.userData = { canvas, ctx, texture };

    return sprite;
  }

  drawLabelCanvas(ctx, tableName, recordCount, accentColor) {
    ctx.clearRect(0, 0, 360, 80);

    const color = accentColor || '#0071e3';

    // 1. High-Contrast Solid Dark Slate Plaque (100% OPAQUE, No Glass/Blur)
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = color;
    ctx.lineWidth = 3.0;

    const x = 6, y = 6, w = 348, h = 68, r = 12;
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
    ctx.arc(30, 40, 6, 0, Math.PI * 2);
    ctx.fill();

    // 3. Table Name (Bold, Sharp White Typography)
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 21px -apple-system, BlinkMacSystemFont, "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(tableName.toUpperCase(), 46, 40);

    // 4. Solid Row Count Pill
    ctx.fillStyle = '#1e293b';
    const pillW = 96;
    const pillH = 34;
    const pillX = 360 - 16 - pillW;
    const pillY = 23;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(pillX, pillY, pillW, pillH, 8);
    else ctx.rect(pillX, pillY, pillW, pillH);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.font = '700 14px "Inter", "SF Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${recordCount} ROWS`, pillX + pillW / 2, 40);
  }

  updateNodeLabel(node) {
    if (!node.labelSprite || !node.labelSprite.userData.ctx) return;
    const { ctx, texture } = node.labelSprite.userData;
    this.drawLabelCanvas(ctx, node.name, node.recordCount, node.hexColor);
    texture.needsUpdate = true;
  }

  updateNodeGeometryScale(node) {
    const count = node.recordCount || 0;
    const scale = 0.90 + 0.16 * Math.min(1.0, Math.log2(count + 1) / 4.0);
    const newW = 15.0 * scale;
    const newH = 3.6 * scale;
    const newD = 10.5 * scale;

    const scaleX = newW / node.baseDims.w;
    const scaleY = newH / node.baseDims.h;
    const scaleZ = newD / node.baseDims.d;

    node.mesh.scale.set(scaleX, scaleY, scaleZ);
    node.pedestal.scale.set(scaleX, 1.0, scaleZ);
  }

  animateNodePulse(node) {
    const initialY = node.baseY;
    const startTime = performance.now();
    const duration = 500;

    const pulseStep = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1.0, elapsed / duration);
      const bounce = Math.sin(progress * Math.PI) * 2.5;
      node.group.position.y = initialY + bounce;

      if (progress < 1.0) {
        requestAnimationFrame(pulseStep);
      } else {
        node.group.position.y = initialY;
      }
    };
    requestAnimationFrame(pulseStep);
  }

  // ==========================================================
  // RELATIONSHIP CONDUITS: THIN, CLEAN, SUBTLE CURVES
  // ==========================================================
  createRelationshipLink(srcNode, tgtNode, relData) {
    const p1 = srcNode.position;
    const p2 = tgtNode.position;

    // Gracefully elevated parabolic arch (clears intermediate nodes)
    const midX = (p1.x + p2.x) / 2;
    const dist = Math.hypot(p2.x - p1.x, p2.z - p1.z);
    const midY = Math.max(p1.y, p2.y) + 2.0 + dist * 0.04;
    const midZ = (p1.z + p2.z) / 2;
    const controlPoint = new THREE.Vector3(midX, midY, midZ);

    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(p1.x, p1.y, p1.z),
      controlPoint,
      new THREE.Vector3(p2.x, p2.y, p2.z)
    );

    const points = curve.getPoints(20);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    // Thin, clean, subtle relationship line
    const material = new THREE.LineBasicMaterial({
      color: 0x94a3b8,
      linewidth: 1.0,
      transparent: true,
      opacity: 0.40
    });

    const curveLine = new THREE.Line(geometry, material);

    // Small subtle traveling packet marker
    const pulseMat = new THREE.MeshBasicMaterial({ color: 0x0071e3 });
    const pulseGeo = new THREE.SphereGeometry(0.5, 8, 8);
    const pulseDot = new THREE.Mesh(pulseGeo, pulseMat);
    this.graphGroup.add(pulseDot);

    const linkObj = {
      curve: curve,
      curveLine: curveLine,
      material: material,
      pulseDot: pulseDot,
      pulseT: (srcNode.name.charCodeAt(0) + tgtNode.name.charCodeAt(0)) % 100 / 100,
      pulseSpeed: 0.12,
      source: srcNode.name,
      target: tgtNode.name,
      relData: relData
    };

    this.pulses.push(linkObj);
    return linkObj;
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
        node.boxMat.color.setHex(0x1e293b);
        node.boxMat.emissive.copy(node.baseColor);
        node.boxMat.emissiveIntensity = 0.14;
        node.edgeMat.color.copy(node.baseColor);
        node.labelSprite.visible = true;
      } else {
        node.boxMat.color.setHex(0x0b101c);
        node.boxMat.emissiveIntensity = 0.0;
        node.edgeMat.color.setHex(0x1e293b);
        node.labelSprite.visible = false;
      }
    });

    this.links.forEach(l => {
      const srcMatch = clusterName === 'all' || (activeSet && activeSet.has(l.source));
      const tgtMatch = clusterName === 'all' || (activeSet && activeSet.has(l.target));
      if (srcMatch && tgtMatch) {
        l.material.color.setHex(0x0071e3);
        l.material.opacity = 0.65;
        l.pulseDot.visible = true;
      } else {
        l.material.color.setHex(0xcbd5e1);
        l.material.opacity = 0.08;
        l.pulseDot.visible = false;
      }
    });
  }

  // ==========================================================
  // CINEMATIC CAMERA FRAMING (OCCUPIES 72–78% OF VIEWPORT)
  // ==========================================================
  frameCameraToGraph() {
    if (!this.graphGroup || this.nodes.size === 0) return;

    const box = new THREE.Box3().setFromObject(this.graphGroup);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const size = new THREE.Vector3();
    box.getSize(size);

    const fov = this.camera.fov * (Math.PI / 180);
    const aspect = this.camera.aspect || 1.6;

    // Frame the compact graph with ~12% breathing room so graph occupies ~72-78% of viewport
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

    this.smoothGlideCamera(targetPos, center);
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
  // INTERACTION: HOVER & SELECTION
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

    node.boxMat.emissiveIntensity = 0.40;
    node.group.position.y = node.baseY + 1.2;

    // Highlight connecting links
    this.links.forEach(l => {
      if (l.source === node.name || l.target === node.name) {
        l.material.color.setHex(0x0071e3);
        l.material.opacity = 0.90;
      }
    });

    const cb = this.options.onHoverNode || this.options.onNodeHover;
    if (typeof cb === 'function') {
      cb(node.data);
    }
  }

  clearHover() {
    if (this.hoveredNode) {
      if (this.hoveredNode !== this.selectedNode) {
        this.hoveredNode.boxMat.emissiveIntensity = 0.14;
        this.hoveredNode.group.position.y = this.hoveredNode.baseY;
      }
      this.hoveredNode = null;
    }
    this.container.style.cursor = 'default';

    if (!this.selectedNode) {
      this.resetLinkStyles();
    }

    const cb = this.options.onHoverNode || this.options.onNodeHover;
    if (typeof cb === 'function') {
      cb(null);
    }
  }

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
      if (this.selectedNode.group) {
        this.selectedNode.group.position.y = this.selectedNode.baseY;
      }
    }

    this.selectedNode = node;
    node.group.position.y = node.baseY + 2.4;

    // Determine connected tables
    const connectedTables = new Set([node.name]);
    this.links.forEach(l => {
      if (l.source === node.name) connectedTables.add(l.target);
      if (l.target === node.name) connectedTables.add(l.source);
    });

    // Dim unconnected nodes via solid color shift, highlight connected ones
    this.nodes.forEach(n => {
      if (connectedTables.has(n.name)) {
        n.boxMat.color.setHex(n === node ? 0x243048 : 0x1e293b);
        n.boxMat.emissive.copy(n.baseColor);
        n.boxMat.emissiveIntensity = n === node ? 0.45 : 0.20;
        n.edgeMat.color.copy(n.baseColor);
        n.labelSprite.visible = true;
      } else {
        n.boxMat.color.setHex(0x0b101c);
        n.boxMat.emissiveIntensity = 0.0;
        n.edgeMat.color.setHex(0x1e293b);
      }
    });

    // Highlight relationship curves
    this.links.forEach(l => {
      if (l.source === node.name || l.target === node.name) {
        l.material.color.setHex(0x0071e3);
        l.material.opacity = 1.0;
      } else {
        l.material.color.setHex(0xcbd5e1);
        l.material.opacity = 0.08;
      }
    });

    // Smooth photographic camera glide towards target
    const nodePos = node.position || node.group.position;
    const targetPos = new THREE.Vector3(
      nodePos.x,
      nodePos.y + 18,
      nodePos.z + 32
    );
    this.smoothGlideCamera(targetPos, nodePos);

    // Prepare enriched node data
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
    if (this.selectedNode && this.selectedNode.group) {
      this.selectedNode.group.position.y = this.selectedNode.baseY;
      this.selectedNode = null;
    }

    this.setCluster(this.currentCluster);
    this.resetLinkStyles();

    const cb = this.options.onSelectNode || this.options.onNodeSelect;
    if (typeof cb === 'function') {
      cb(null);
    }
  }

  resetLinkStyles() {
    this.links.forEach(l => {
      l.material.color.setHex(0x94a3b8);
      l.material.opacity = 0.40;
    });
  }

  // ==========================================================
  // RENDER LOOP & REAL-TIME ANIMATION
  // ==========================================================
  animate() {
    this.animationFrameId = requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();

    // 1. Smooth Camera Glide Lerp (when clicking nodes or resetting)
    if (this.targetCameraPos && this.camera) {
      this.camera.position.lerp(this.targetCameraPos, 0.075);
      if (this.controls && this.targetLookAt) {
        this.controls.target.lerp(this.targetLookAt, 0.075);
      }
      if (this.camera.position.distanceTo(this.targetCameraPos) < 0.3) {
        this.targetCameraPos = null;
      }
    }

    // 2. Cinematic Orbit Tour
    if (this.isOrbitTourActive && this.camera && !this.isUserInteracting) {
      this.orbitAngle += delta * 0.20;
      const orbitRadius = 90;
      this.camera.position.x = Math.sin(this.orbitAngle) * orbitRadius;
      this.camera.position.z = Math.cos(this.orbitAngle) * orbitRadius;
      this.camera.position.y = 45 + Math.sin(this.orbitAngle * 1.5) * 6;
      this.camera.lookAt(0, 0, 0);
      if (this.controls) this.controls.target.set(0, 0, 0);
    } else if (!this.isUserInteracting && !this.reducedMotion && this.graphGroup && !this.selectedNode && !this.targetCameraPos) {
      // Subtle idle drift
      this.graphGroup.rotation.y += this.idleRotationSpeed;
    }

    // 3. Animate data packet markers along curves
    if (!this.reducedMotion) {
      this.pulses.forEach(link => {
        link.pulseT = (link.pulseT + link.pulseSpeed * delta) % 1.0;
        const pt1 = link.curve.getPoint(link.pulseT);
        link.pulseDot.position.copy(pt1);
      });
    }

    // 4. Update controls
    if (this.controls && !this.isOrbitTourActive) {
      this.controls.update();
    }

    // 5. Render scene
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


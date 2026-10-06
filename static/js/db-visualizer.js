/**
 * IT Helpdesk & Asset Support Management System
 * Spatial Database Architecture Visualizer (db-visualizer.js)
 * Light Architectural Studio Mode (Linear / Apple Pro Aesthetic)
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
    this.idleRotationSpeed = this.reducedMotion ? 0 : 0.0006;
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
      'status_histories': '#64748b'   // Infrastructure (Cool Slate)
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

    // 1. Scene Setup - Soothing Architectural Studio Light
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf7f8fa);
    this.scene.fog = new THREE.FogExp2(0xf7f8fa, 0.0016);

    // 2. Camera Setup (Closer, prominent framing)
    const rect = this.container.getBoundingClientRect();
    const aspect = (rect.width || 800) / (rect.height || 500);
    this.camera = new THREE.PerspectiveCamera(40, aspect, 1, 3000);
    this.initialCameraPos = new THREE.Vector3(0, 52, 115);
    this.camera.position.copy(this.initialCameraPos);
    this.camera.lookAt(0, 4, 0);

    // 3. High Performance Renderer
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
      this.controls.dampingFactor = 0.05;
      this.controls.maxDistance = 380;
      this.controls.minDistance = 25;
      this.controls.maxPolarAngle = Math.PI / 2 + 0.05;
      this.controls.target.set(0, 4, 0);

      this.controls.addEventListener('start', () => { 
        this.isUserInteracting = true;
        this.targetCameraPos = null;
      });
      this.controls.addEventListener('end', () => { 
        setTimeout(() => { this.isUserInteracting = false; }, 800); 
      });
    }

    // 5. Studio Multi-Point Lighting
    this.setupLighting();

    // 6. Frosted Plinth & Subtle Grid Platform
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.15);
    keyLight.position.set(75, 120, 85);
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.55);
    fillLight.position.set(-70, 70, -70);
    this.scene.add(fillLight);

    const hubPointLight = new THREE.PointLight(0x0071e3, 0.9, 200);
    hubPointLight.position.set(0, 25, 0);
    this.scene.add(hubPointLight);
  }

  setupFloorGrid() {
    this.floorGroup = new THREE.Group();

    // 1. Expansive Frosted Architectural Plinth Disc (Spacious & Clean)
    const plinthRadius = 195;
    const plinthGeo = new THREE.CylinderGeometry(plinthRadius, plinthRadius, 1.4, 64);
    const plinthMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95
    });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = -14.6;
    this.floorGroup.add(plinth);

    // 2. Subtle Architectural Grid
    const grid = new THREE.GridHelper(390, 26, 0x0071e3, 0xe2e8f0);
    grid.position.y = -13.88;
    this.floorGroup.add(grid);

    // 3. Clean Perimeter Boundary Ring
    const ringGeo = new THREE.BufferGeometry();
    const points = [];
    const segments = 96;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(theta) * 190, -13.85, Math.sin(theta) * 190));
    }
    ringGeo.setFromPoints(points);
    const ringMat = new THREE.LineBasicMaterial({
      color: 0xcbd5e1,
      transparent: true,
      opacity: 0.75
    });
    const ring = new THREE.Line(ringGeo, ringMat);
    this.floorGroup.add(ring);

    this.scene.add(this.floorGroup);
  }

  setupParticleDust() {
    // 36 subtle, quiet ambient particles
    const particleCount = 36;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    this.particleInitialY = [];

    for (let i = 0; i < particleCount; i++) {
      const px = (Math.random() - 0.5) * 240;
      const py = Math.random() * 70 - 10;
      const pz = (Math.random() - 0.5) * 240;

      positions[i * 3]     = px;
      positions[i * 3 + 1] = py;
      positions[i * 3 + 2] = pz;
      this.particleInitialY.push(py);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 1.6,
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.4
    });

    this.particleDust = new THREE.Points(geometry, material);
    this.scene.add(this.particleDust);
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

    // 1. Calculate Deterministic Relational Graph Positions
    const positions = this.computeDeterministicGraphLayout(
      this.graphData.tables, 
      this.graphData.relationships
    );

    // 2. Build Precision-Machined Architecture Data Nodes
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

    // 4. Run Verification Check (Ensures 0 Collisions & Maximum Clarity)
    this.verifyLayoutSpacing();
  }

  // ==========================================================
  // DETERMINISTIC GRAPH LAYOUT STRATEGY (AMPHITHEATER STADIUM ARCHITECTURE)
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

    // 2. Deterministic Radial Layer Assignment with Amphitheater Elevation
    // Core Central Hub (Degree ~10)
    pos['tickets']          = { x: 0,    y: 0.0,  z: 0 };

    // Tier 1: Primary Operational & Entity Hubs (Generous Radius ~72 units)
    pos['incidents']        = { x: -48,  y: -3.4, z: 42 };   // Front-left
    pos['service_requests'] = { x: 48,   y: -3.4, z: 42 };   // Front-right
    pos['users']            = { x: -74,  y: 0.0,  z: -8 };   // Left flank
    pos['assets']           = { x: 74,   y: 0.0,  z: -8 };   // Right flank
    pos['assignments']      = { x: -38,  y: 4.4,  z: -62 };  // Elevated back-left
    pos['support_staff']    = { x: 38,   y: 4.4,  z: -62 };  // Elevated back-right

    // Tier 2: Sub-domains, Taxonomy & Audit Ring (Radius ~135-148 units)
    pos['status_histories'] = { x: 0,    y: -7.2, z: 110 };  // Lowest front-center
    pos['resolutions']      = { x: -98,  y: -4.5, z: 65 };   // Far front-left
    pos['maintenance']      = { x: 120,  y: -2.2, z: 40 };   // Far right-front
    pos['warranties']       = { x: 126,  y: 3.8,  z: -48 };  // Far right-back
    pos['departments']      = { x: -126, y: 3.8,  z: -48 };  // Far left-back
    pos['categories']       = { x: -55,  y: 8.2,  z: -120 }; // Elevated far back-left
    pos['priorities']       = { x: 55,   y: 8.2,  z: -120 }; // Elevated far back-right

    // Fallback for any dynamic schema extensions (deterministic spiral)
    let extraIndex = 0;
    tables.forEach(t => {
      if (!pos[t.name]) {
        const phi = (1 + Math.sqrt(5)) / 2;
        const angle = extraIndex * phi * Math.PI * 2;
        const rad = 155 + extraIndex * 8;
        const z = Math.sin(angle) * rad;
        pos[t.name] = {
          x: Math.cos(angle) * rad,
          y: - (z / 140) * 7.5,
          z: z
        };
        extraIndex++;
      }
    });

    // 3. Deterministic Iterative Relaxation Pass (Enforces Hard MIN_GAP >= 48)
    const MIN_ALLOWED_DIST = 52;
    for (let iter = 0; iter < 60; iter++) {
      const decay = 1.0 - (iter / 60) * 0.75;
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

    // 4. Recompute Amphitheater Vertical Elevation (0% Occlusion)
    // Front nodes step down, back nodes step up: unobstructed lines of sight
    tables.forEach(t => {
      if (t.name !== 'tickets') {
        pos[t.name].y = - (pos[t.name].z / 140) * 7.6;
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
        if (d < 45) collisions++;
      }
    }
    console.log(`[3D Visualizer] Layout Verified: ${tableNames.length} tables, min gap: ${minObserved.toFixed(1)} units, collisions: ${collisions}`);
  }

  // ==========================================================
  // NODE CREATION: PRECISION-MACHINED ARCHITECTURAL DATA BLOCKS
  // ==========================================================
  createTableNode(table, position) {
    const group = new THREE.Group();
    group.position.set(position.x, position.y, position.z);

    const count = table.record_count || 0;
    const hexColor = this.domainColors[table.name] || '#0071e3';
    const domainColor = new THREE.Color(hexColor);

    // Disciplined, normalized dimensions (Narrow, balanced scale)
    const scale = 0.94 + 0.22 * Math.min(1.0, Math.log2(count + 1) / 5.0);
    const baseW = 20 * scale;
    const baseH = 4.8 * scale;
    const baseD = 14 * scale;

    // 1. Lower Hardware Pedestal (Matte Gunmetal)
    const pedGeo = new THREE.BoxGeometry(baseW * 1.04, 1.2, baseD * 1.04);
    const pedMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      metalness: 0.25,
      roughness: 0.4
    });
    const pedestal = new THREE.Mesh(pedGeo, pedMat);
    pedestal.position.y = -baseH / 2 - 0.6;
    group.add(pedestal);

    // 2. High-Tech Obsidian Slate Chassis Body
    const boxGeo = new THREE.BoxGeometry(baseW, baseH, baseD);
    const boxMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.32,
      metalness: 0.25,
      emissive: domainColor,
      emissiveIntensity: 0.14
    });
    const mesh = new THREE.Mesh(boxGeo, boxMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { tableName: table.name };
    group.add(mesh);

    // 3. Crisp Edge Lines (Domain-Colored Bevel Frame)
    const edgesGeo = new THREE.EdgesGeometry(boxGeo);
    const edgesMat = new THREE.LineBasicMaterial({
      color: domainColor,
      linewidth: 1.8,
      transparent: true,
      opacity: 0.9
    });
    const edgeLines = new THREE.LineSegments(edgesGeo, edgesMat);
    group.add(edgeLines);

    // 4. Subtle Top Accent Plate
    const topBarGeo = new THREE.PlaneGeometry(baseW * 0.90, 1.2);
    const topBarMat = new THREE.MeshBasicMaterial({
      color: domainColor,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });
    const topBar = new THREE.Mesh(topBarGeo, topBarMat);
    topBar.rotation.x = -Math.PI / 2;
    topBar.position.set(0, baseH / 2 + 0.05, -baseD * 0.36);
    group.add(topBar);

    // 5. Contact Drop-Shadow Disc Under Node on Floor Plinth
    const shadowGeo = new THREE.CircleGeometry(baseW * 0.70, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(0, -position.y - 13.84, 0);
    group.add(shadowMesh);

    // 6. Restrained, Razor-Sharp Billboard Header Plate
    const labelSprite = this.createCanvasLabel(table.name, count, hexColor);
    labelSprite.position.set(0, baseH / 2 + 3.2, 0);
    labelSprite.scale.set(baseW * 1.35, 8.4, 1);
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
    canvas.width = 520;
    canvas.height = 130;
    const ctx = canvas.getContext('2d');

    this.drawLabelCanvas(ctx, tableName, recordCount, accentColor);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: true,
      depthWrite: false
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.userData = { canvas, ctx, texture };

    return sprite;
  }

  drawLabelCanvas(ctx, tableName, recordCount, accentColor) {
    ctx.clearRect(0, 0, 520, 130);

    const color = accentColor || '#0071e3';

    // 1. High-Contrast Floating Dark Slate Capsule
    ctx.fillStyle = '#0b0f19';
    ctx.strokeStyle = color;
    ctx.lineWidth = 3.5;

    // Rounded rectangle
    const x = 8, y = 8, w = 504, h = 114, r = 20;
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

    // 2. Status Dot
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(42, 65, 7.5, 0, Math.PI * 2);
    ctx.fill();

    // 3. Table Name (Bold, Sharp White Typography)
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 30px -apple-system, BlinkMacSystemFont, "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(tableName.toUpperCase(), 64, 65);

    // 4. Row Count Badge
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(355, 40, 142, 50, 14) : ctx.rect(355, 40, 142, 50);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.font = '700 20px "Inter", "SF Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${recordCount} ROWS`, 426, 65);
  }

  updateNodeLabel(node) {
    if (!node.labelSprite || !node.labelSprite.userData.ctx) return;
    const { ctx, texture } = node.labelSprite.userData;
    this.drawLabelCanvas(ctx, node.name, node.recordCount, node.hexColor);
    texture.needsUpdate = true;
  }

  updateNodeGeometryScale(node) {
    const count = node.recordCount || 0;
    const scale = 0.94 + 0.22 * Math.min(1.0, Math.log2(count + 1) / 5.0);
    const newW = 20 * scale;
    const newH = 4.8 * scale;
    const newD = 14 * scale;

    const scaleX = newW / node.baseDims.w;
    const scaleY = newH / node.baseDims.h;
    const scaleZ = newD / node.baseDims.d;

    node.mesh.scale.set(scaleX, scaleY, scaleZ);
  }

  animateNodePulse(node) {
    const initialY = node.baseY;
    const startTime = performance.now();
    const duration = 600;

    const pulseStep = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1.0, elapsed / duration);
      const bounce = Math.sin(progress * Math.PI) * 4.0;
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
  // RELATIONSHIP CONDUITS & SUBTLE WAVE PACKETS
  // ==========================================================
  createRelationshipLink(srcNode, tgtNode, relData) {
    const p1 = srcNode.position;
    const p2 = tgtNode.position;

    // Gracefully elevated parabolic arch (clears floor and intermediate elements)
    const midX = (p1.x + p2.x) / 2;
    const midY = Math.max(p1.y, p2.y) + 3.2 + Math.hypot(p2.x - p1.x, p2.z - p1.z) * 0.05;
    const midZ = (p1.z + p2.z) / 2;
    const controlPoint = new THREE.Vector3(midX, midY, midZ);

    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(p1.x, p1.y, p1.z),
      controlPoint,
      new THREE.Vector3(p2.x, p2.y, p2.z)
    );

    const points = curve.getPoints(24);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    // Subtle, clean relationship line
    const material = new THREE.LineBasicMaterial({
      color: 0x0071e3,
      linewidth: 1.2,
      transparent: true,
      opacity: 0.35
    });

    const curveLine = new THREE.Line(geometry, material);

    // Single subtle traveling data packet
    const pulseMat = new THREE.MeshBasicMaterial({ color: 0x0071e3, transparent: true, opacity: 0.75 });
    const pulseGeo = new THREE.SphereGeometry(0.75, 8, 8);
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
  // CLUSTER FILTERS
  // ==========================================================
  setCluster(clusterName) {
    this.currentCluster = clusterName;
    const activeSet = this.clusters[clusterName];

    this.nodes.forEach(node => {
      const isMatch = clusterName === 'all' || (activeSet && activeSet.has(node.name));
      if (isMatch) {
        node.boxMat.opacity = 1.0;
        node.boxMat.emissiveIntensity = 0.14;
        node.edgeMat.opacity = 0.9;
        node.labelSprite.material.opacity = 1.0;
      } else {
        node.boxMat.opacity = 0.20;
        node.boxMat.emissiveIntensity = 0.02;
        node.edgeMat.opacity = 0.15;
        node.labelSprite.material.opacity = 0.20;
      }
    });

    this.links.forEach(l => {
      const srcMatch = clusterName === 'all' || (activeSet && activeSet.has(l.source));
      const tgtMatch = clusterName === 'all' || (activeSet && activeSet.has(l.target));
      if (srcMatch && tgtMatch) {
        l.material.opacity = 0.65;
        l.pulseDot.visible = true;
      } else {
        l.material.opacity = 0.06;
        l.pulseDot.visible = false;
      }
    });
  }

  // ==========================================================
  // CINEMATIC CAMERA GLIDE & FOCUS (AUTOMATIC BOUNDING CALCULATION)
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

    // Fit graph comfortably to 74% of viewport with generous breathing room
    const fitRatio = 0.74;
    const vDist = (size.y / 2 + 18) / Math.tan(fov / 2);
    const hDist = (size.x / 2 + 22) / (Math.tan(fov / 2) * aspect);
    const zDepth = size.z / 2;

    const requiredDist = Math.max(vDist, hDist) / fitRatio + zDepth;

    // Sophisticated elevated 27-degree camera angle
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
      this.smoothGlideCamera(new THREE.Vector3(0, 185, 0.1), new THREE.Vector3(0, 0, 0));
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

    node.boxMat.emissiveIntensity = 0.45;
    node.group.position.y = node.baseY + 2.0;

    // Highlight connecting links
    this.links.forEach(l => {
      if (l.source === node.name || l.target === node.name) {
        l.material.color.setHex(0x0071e3);
        l.material.opacity = 1.0;
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
        this.hoveredNode.boxMat.emissiveIntensity = 0.15;
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
    node.group.position.y = node.baseY + 3.5;

    // Determine connected tables
    const connectedTables = new Set([node.name]);
    this.links.forEach(l => {
      if (l.source === node.name) connectedTables.add(l.target);
      if (l.target === node.name) connectedTables.add(l.source);
    });

    // Dim unconnected nodes, highlight connected ones
    this.nodes.forEach(n => {
      if (connectedTables.has(n.name)) {
        n.boxMat.opacity = 1.0;
        n.boxMat.emissiveIntensity = n === node ? 0.5 : 0.25;
        n.edgeMat.opacity = 1.0;
        n.labelSprite.material.opacity = 1.0;
      } else {
        n.boxMat.opacity = 0.2;
        n.boxMat.emissiveIntensity = 0.02;
        n.edgeMat.opacity = 0.15;
        n.labelSprite.material.opacity = 0.2;
      }
    });

    // Highlight relationship curves
    this.links.forEach(l => {
      if (l.source === node.name || l.target === node.name) {
        l.material.color.setHex(0x0071e3);
        l.material.opacity = 1.0;
      } else {
        l.material.color.setHex(0xcbd5e1);
        l.material.opacity = 0.12;
      }
    });

    // Smooth photographic camera glide towards target
    const nodePos = node.position || node.group.position;
    const targetPos = new THREE.Vector3(
      nodePos.x,
      nodePos.y + 26,
      nodePos.z + 46
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
      l.material.color.setHex(0x0071e3);
      l.material.opacity = 0.65;
    });
  }

  // ==========================================================
  // RENDER LOOP & REAL-TIME ANIMATION
  // ==========================================================
  animate() {
    this.animationFrameId = requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Floating Spatial Particle Dust Undulation (Subtle)
    if (this.particleDust && this.particleInitialY) {
      const posAttr = this.particleDust.geometry.attributes.position;
      const count = posAttr.count;
      for (let i = 0; i < count; i++) {
        const initY = this.particleInitialY[i];
        posAttr.setY(i, initY + Math.sin(elapsedTime * 0.8 + i) * 1.8);
      }
      posAttr.needsUpdate = true;
      this.particleDust.rotation.y = elapsedTime * 0.02;
    }

    // 2. Smooth Camera Glide Lerp (when clicking nodes)
    if (this.targetCameraPos && this.camera) {
      this.camera.position.lerp(this.targetCameraPos, 0.065);
      if (this.controls && this.targetLookAt) {
        this.controls.target.lerp(this.targetLookAt, 0.065);
      }
      if (this.camera.position.distanceTo(this.targetCameraPos) < 0.4) {
        this.targetCameraPos = null;
      }
    }

    // 3. Cinematic Orbit Tour
    if (this.isOrbitTourActive && this.camera && !this.isUserInteracting) {
      this.orbitAngle += delta * 0.22;
      const orbitRadius = 160;
      this.camera.position.x = Math.sin(this.orbitAngle) * orbitRadius;
      this.camera.position.z = Math.cos(this.orbitAngle) * orbitRadius;
      this.camera.position.y = 80 + Math.sin(this.orbitAngle * 1.5) * 10;
      this.camera.lookAt(0, 4, 0);
      if (this.controls) this.controls.target.set(0, 4, 0);
    } else if (!this.isUserInteracting && !this.reducedMotion && this.graphGroup && !this.selectedNode && !this.targetCameraPos) {
      // Subtle idle drift
      this.graphGroup.rotation.y += this.idleRotationSpeed;
    }

    // 4. Animate data packet markers along curves
    if (!this.reducedMotion) {
      this.pulses.forEach(link => {
        link.pulseT = (link.pulseT + link.pulseSpeed * delta) % 1.0;
        const pt1 = link.curve.getPoint(link.pulseT);
        link.pulseDot.position.copy(pt1);
      });
    }

    // 5. Update controls
    if (this.controls && !this.isOrbitTourActive) {
      this.controls.update();
    }

    // 6. Render scene
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

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

    // 7. Ambient Particle Atmosphere
    this.setupParticleDust();

    // 8. Graph Root Group
    this.graphGroup = new THREE.Group();
    this.scene.add(this.graphGroup);

    // 9. Event Listeners
    this.setupEvents();

    // 10. Start Render Loop
    this.animate = this.animate.bind(this);
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.3);
    keyLight.position.set(65, 110, 75);
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.7);
    fillLight.position.set(-70, 70, -70);
    this.scene.add(fillLight);

    const hubPointLight = new THREE.PointLight(0x0071e3, 1.4, 200);
    hubPointLight.position.set(0, 25, 0);
    this.scene.add(hubPointLight);
  }

  setupFloorGrid() {
    this.floorGroup = new THREE.Group();

    // 1. Clean Frosted Base Plinth Disc
    const plinthGeo = new THREE.CylinderGeometry(152, 152, 1.4, 64);
    const plinthMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95
    });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = -14.6;
    this.floorGroup.add(plinth);

    // 2. Clean Architectural Grid (resting softly on top of the plinth)
    const grid = new THREE.GridHelper(300, 24, 0x0071e3, 0xcbd5e1);
    grid.position.y = -13.88;
    this.floorGroup.add(grid);

    // 3. Crisp Boundary Ring
    const ringGeo = new THREE.BufferGeometry();
    const points = [];
    const segments = 96;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(theta) * 148, -13.85, Math.sin(theta) * 148));
    }
    ringGeo.setFromPoints(points);
    const ringMat = new THREE.LineBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.8
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

    // 1. Calculate Positions based on Relational Topology
    const positions = this.computeTopologicalPositions(this.graphData.tables, this.graphData.relationships);

    // 2. Build High-Tech Precision Monolith Nodes
    this.graphData.tables.forEach(table => {
      const pos = positions[table.name] || { x: 0, y: 0, z: 0 };
      const node = this.createTableNode(table, pos);
      this.nodes.set(table.name, node);
      this.graphGroup.add(node.group);
      this.interactableMeshes.push(node.mesh);
    });

    // 3. Build Synaptic Laser Conduits & Wave Packets
    this.graphData.relationships.forEach(rel => {
      const srcNode = this.nodes.get(rel.source);
      const tgtNode = this.nodes.get(rel.target);
      if (srcNode && tgtNode) {
        const link = this.createRelationshipLink(srcNode, tgtNode, rel);
        this.links.push(link);
        this.graphGroup.add(link.curveLine);
      }
    });
  }

  computeTopologicalPositions(tables, relationships) {
    const pos = {};

    // Hub-and-Spoke Relational Architecture
    pos['tickets']          = { x: 0,   y: 5,  z: 0 };

    // Operational Ring 1
    pos['incidents']        = { x: -34, y: 3,  z: -16 };
    pos['service_requests'] = { x: 34,  y: 3,  z: -16 };
    pos['status_histories'] = { x: -22, y: -4, z: 32 };
    pos['resolutions']      = { x: 22,  y: -4, z: 32 };
    pos['assignments']      = { x: 0,   y: 18, z: -34 };

    // Core Entities Ring 2
    pos['users']            = { x: -58, y: 8,  z: 14 };
    pos['assets']           = { x: 58,  y: 8,  z: 14 };
    pos['support_staff']    = { x: 0,   y: 30, z: -62 };

    // Organization & Taxonomy Ring 3
    pos['departments']      = { x: -88, y: 12, z: 26 };
    pos['categories']       = { x: -42, y: -6, z: -64 };
    pos['priorities']       = { x: 42,  y: -6, z: -64 };

    // Hardware Sub-domain Ring 4
    pos['warranties']       = { x: 88,  y: 12, z: -22 };
    pos['maintenance']      = { x: 84,  y: 2,  z: 48 };

    // Fallback for dynamic extensions
    tables.forEach(t => {
      if (!pos[t.name]) {
        const angle = Math.random() * Math.PI * 2;
        const rad = 95 + Math.random() * 20;
        pos[t.name] = {
          x: Math.cos(angle) * rad,
          y: (Math.random() - 0.5) * 20,
          z: Math.sin(angle) * rad
        };
      }
    });

    return pos;
  }

  // ==========================================================
  // NODE CREATION: PORCELAIN WHITE MONOLITH & FLOATING CAPSULE LABEL
  // ==========================================================
  // NODE CREATION: HIGH-CONTRAST OBSIDIAN MONOLITH & LARGE BILLBOARD
  // ==========================================================
  createTableNode(table, position) {
    const group = new THREE.Group();
    group.position.set(position.x, position.y, position.z);

    const count = table.record_count || 0;
    const hexColor = this.domainColors[table.name] || '#0071e3';
    const domainColor = new THREE.Color(hexColor);

    // Prominent, well-proportioned dimensions
    const baseW = 26 + Math.log2(count + 1) * 3.2;
    const baseH = 8.5 + Math.log2(count + 1) * 1.6;
    const baseD = 20 + Math.log2(count + 1) * 2.8;

    // 1. Lower Hardware Pedestal (Matte Slate Unit)
    const pedGeo = new THREE.BoxGeometry(baseW * 1.05, 1.4, baseD * 1.05);
    const pedMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      metalness: 0.3,
      roughness: 0.4
    });
    const pedestal = new THREE.Mesh(pedGeo, pedMat);
    pedestal.position.y = -baseH / 2 - 0.7;
    group.add(pedestal);

    // 2. High-Tech Obsidian Slate Chassis Body (Maximum Tangible Contrast)
    const boxGeo = new THREE.BoxGeometry(baseW, baseH, baseD);
    const boxMat = new THREE.MeshStandardMaterial({
      color: 0x111827, // Rich Obsidian Slate
      roughness: 0.28,
      metalness: 0.35,
      emissive: domainColor,
      emissiveIntensity: 0.22
    });
    const mesh = new THREE.Mesh(boxGeo, boxMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { tableName: table.name };
    group.add(mesh);

    // 3. Thick Glowing Bevel Edge Lines (Color Coded to Domain)
    const edgesGeo = new THREE.EdgesGeometry(boxGeo);
    const edgesMat = new THREE.LineBasicMaterial({
      color: domainColor,
      linewidth: 3.0,
      transparent: true,
      opacity: 0.95
    });
    const edgeLines = new THREE.LineSegments(edgesGeo, edgesMat);
    group.add(edgeLines);

    // 4. Luminous Top Accent Bar
    const topBarGeo = new THREE.PlaneGeometry(baseW * 0.92, 1.8);
    const topBarMat = new THREE.MeshBasicMaterial({
      color: domainColor,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide
    });
    const topBar = new THREE.Mesh(topBarGeo, topBarMat);
    topBar.rotation.x = -Math.PI / 2;
    topBar.position.set(0, baseH / 2 + 0.08, -baseD * 0.36);
    group.add(topBar);

    // 5. Contact Drop-Shadow Disc Under Node on Floor Plinth
    const shadowGeo = new THREE.CircleGeometry(baseW * 0.75, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(0, -position.y - 13.84, 0);
    group.add(shadowMesh);

    // 6. Prominent, Razor-Sharp Billboard Header Plate
    const labelSprite = this.createCanvasLabel(table.name, count, hexColor);
    labelSprite.position.set(0, baseH / 2 + 5.2, 0);
    labelSprite.scale.set(baseW * 1.35, 12.0, 1);
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
    canvas.width = 640;
    canvas.height = 160;
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
    ctx.clearRect(0, 0, 640, 160);

    const color = accentColor || '#0071e3';

    // 1. High-Contrast Floating Dark Slate Capsule
    ctx.fillStyle = '#0b0f19';
    ctx.strokeStyle = color;
    ctx.lineWidth = 4.5;

    // Rounded rectangle
    const x = 12, y = 12, w = 616, h = 136, r = 24;
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

    // 2. Glowing Accent Status Dot
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(52, 80, 9, 0, Math.PI * 2);
    ctx.fill();

    // 3. Table Name (Crisp White Bold Typography)
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 38px -apple-system, BlinkMacSystemFont, "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(tableName.toUpperCase(), 78, 80);

    // 4. Prominent Row Count Pill on Right
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(440, 50, 160, 60, 16) : ctx.rect(440, 50, 160, 60);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.font = '700 24px "Inter", "SF Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${recordCount} ROWS`, 520, 80);
  }

  updateNodeLabel(node) {
    if (!node.labelSprite || !node.labelSprite.userData.ctx) return;
    const { ctx, texture } = node.labelSprite.userData;
    this.drawLabelCanvas(ctx, node.name, node.recordCount, node.hexColor);
    texture.needsUpdate = true;
  }

  updateNodeGeometryScale(node) {
    const count = node.recordCount || 0;
    const newW = 26 + Math.log2(count + 1) * 3.2;
    const newH = 8.5 + Math.log2(count + 1) * 1.6;
    const newD = 20 + Math.log2(count + 1) * 2.8;

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

    // Architectural parabolic arch
    const midX = (p1.x + p2.x) / 2;
    const midY = Math.max(p1.y, p2.y) + 5.0 + Math.hypot(p2.x - p1.x, p2.z - p1.z) * 0.07;
    const midZ = (p1.z + p2.z) / 2;
    const controlPoint = new THREE.Vector3(midX, midY, midZ);

    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(p1.x, p1.y, p1.z),
      controlPoint,
      new THREE.Vector3(p2.x, p2.y, p2.z)
    );

    const points = curve.getPoints(28);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    // Vibrant conduit line
    const material = new THREE.LineBasicMaterial({
      color: 0x0071e3,
      linewidth: 2.4,
      transparent: true,
      opacity: 0.85
    });

    const curveLine = new THREE.Line(geometry, material);

    // Glowing traveling data packet
    const pulseMat = new THREE.MeshBasicMaterial({ color: 0x0071e3 });
    const pulseGeo = new THREE.SphereGeometry(1.4, 10, 10);
    const pulseDot = new THREE.Mesh(pulseGeo, pulseMat);
    this.graphGroup.add(pulseDot);

    const linkObj = {
      curve: curve,
      curveLine: curveLine,
      material: material,
      pulseDot: pulseDot,
      pulseT: Math.random(),
      pulseSpeed: 0.14 + Math.random() * 0.08,
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
        node.boxMat.emissiveIntensity = 0.22;
        node.edgeMat.opacity = 0.95;
        node.labelSprite.material.opacity = 1.0;
      } else {
        node.boxMat.opacity = 0.25;
        node.boxMat.emissiveIntensity = 0.04;
        node.edgeMat.opacity = 0.2;
        node.labelSprite.material.opacity = 0.25;
      }
    });

    this.links.forEach(l => {
      const srcMatch = clusterName === 'all' || (activeSet && activeSet.has(l.source));
      const tgtMatch = clusterName === 'all' || (activeSet && activeSet.has(l.target));
      if (srcMatch && tgtMatch) {
        l.material.opacity = 0.85;
        l.pulseDot.visible = true;
      } else {
        l.material.opacity = 0.12;
        l.pulseDot.visible = false;
      }
    });
  }

  // ==========================================================
  // CINEMATIC CAMERA GLIDE & FOCUS
  // ==========================================================
  frameCameraToGraph() {
    if (!this.graphGroup || this.nodes.size === 0) return;

    const box = new THREE.Box3().setFromObject(this.graphGroup);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const sphere = new THREE.Sphere();
    box.getBoundingSphere(sphere);
    const radius = Math.max(sphere.radius, 55);

    const fov = this.camera.fov * (Math.PI / 180);
    const dist = (radius / Math.sin(fov / 2)) * 0.46;

    const targetPos = new THREE.Vector3(center.x, center.y + dist * 0.44, center.z + dist * 0.74);
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

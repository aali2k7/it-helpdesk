/**
 * IT Helpdesk & Asset Support Management System
 * Spatial Database Studio 3.0 (Next-Gen Cyber-Architectural Engine)
 * High-End 3D Visualizer: Luminous Studio Mode, Floating Crystals & Synaptic Conduits
 * Course: DBMS - Woxsen University | Md Aali Rahman (25WU0102156)
 */

class DatabaseVisualizer {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`[3D Studio] Container #${containerId} not found.`);
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
    this.idleRotationSpeed = this.reducedMotion ? 0 : 0.0007;
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

    // High-Voltage Apple Studio Color Palette (Ultra-Punchy for Projectors)
    this.domainColors = {
      'tickets': '#ff9f0a',          // Intense Solar Amber (Core Hub)
      'incidents': '#ff375f',        // Vivid Electric Coral
      'service_requests': '#00c7be', // Cyberpunk Neon Cyan
      'users': '#0071e3',            // Signature Apple Cobalt
      'departments': '#30d158',      // Vivid Emerald Mint
      'assets': '#0a84ff',           // High-Luminance Sky Blue
      'maintenance': '#ff6934',      // Radiant Warm Copper
      'warranties': '#bf5af2',       // Ultraviolet Amethyst
      'support_staff': '#34c759',    // Spring Jade
      'assignments': '#5e5ce6',      // Electric Indigo
      'categories': '#ffd60a',       // Radiant Neon Gold
      'priorities': '#ff2d55',       // Crimson Magenta
      'resolutions': '#28cd41',      // Pure Success Mint
      'status_histories': '#64748b'   // Precision Titanium Slate
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
      console.warn('[3D Studio] WebGL unavailable. Falling back to 2D view.');
      this.initSvgFallback();
      return;
    }

    // 1. Scene Setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf6f8fc);
    this.scene.fog = new THREE.FogExp2(0xf6f8fc, 0.0016);

    // 2. Camera Setup
    const rect = this.container.getBoundingClientRect();
    const aspect = (rect.width || 800) / (rect.height || 500);
    this.camera = new THREE.PerspectiveCamera(40, aspect, 1, 3000);
    this.initialCameraPos = new THREE.Vector3(0, 84, 145);
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
      this.controls.maxDistance = 400;
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

    // 5. Studio Multi-Point Illumination
    this.setupLighting();

    // 6. Holographic Radar Platform & Plinth
    this.setupFloorGrid();

    // 7. Ambient Particle Dust Cloud (Cinematic Spatial Volume)
    this.setupParticleDust();

    // 8. Graph Root Group
    this.graphGroup = new THREE.Group();
    this.scene.add(this.graphGroup);

    // 9. Event Listeners
    this.setupEvents();

    // 10. Start Render Loop
    this.animate = this.animate.bind(this);
    this.animationFrameId = requestAnimationFrame(this.animate);

    console.log('[3D Studio] Spatial Database Architecture Engine Active.');
  }

  setupLighting() {
    // Crisp studio key light setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.35);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.05);
    keyLight.position.set(70, 120, 85);
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.65);
    fillLight.position.set(-80, 80, -70);
    this.scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x0071e3, 0.35);
    rimLight.position.set(0, -70, 0);
    this.scene.add(rimLight);

    // Dynamic solar light above Tickets hub
    const hubPointLight = new THREE.PointLight(0xff9f0a, 1.3, 160);
    hubPointLight.position.set(0, 24, 0);
    this.scene.add(hubPointLight);
  }

  setupFloorGrid() {
    this.floorGroup = new THREE.Group();

    // 1. Holographic Precision Coordinate Grid (Studio Light Cyber Matrix)
    const grid = new THREE.GridHelper(320, 32, 0x0071e3, 0xdbeafe);
    grid.position.y = -14.7;
    this.floorGroup.add(grid);

    // 2. Frosted White Glass Base Plinth with Luminous Border
    const plinthGeo = new THREE.CylinderGeometry(152, 152, 1.4, 64);
    const plinthMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.88
    });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = -14.6;
    this.floorGroup.add(plinth);

    // 3. Multi-Tiered Concentric Holographic Range Rings (Energetic Projector Accents)
    const ringConfigs = [
      { radius: 32,  color: 0x00c7be, opacity: 0.85, width: 2.0 }, // Inner Core (Cyan)
      { radius: 68,  color: 0xff9f0a, opacity: 0.75, width: 1.8 }, // Operations Ring (Amber)
      { radius: 104, color: 0x0071e3, opacity: 0.80, width: 2.0 }, // Entities Ring (Cobalt)
      { radius: 142, color: 0xaf52de, opacity: 0.85, width: 2.2 }  // Outer Boundary (Ultraviolet)
    ];

    ringConfigs.forEach(cfg => {
      const ringGeo = new THREE.BufferGeometry();
      const points = [];
      const segments = 128;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * cfg.radius, -14.2, Math.sin(theta) * cfg.radius));
      }
      ringGeo.setFromPoints(points);
      const ringMat = new THREE.LineBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: cfg.opacity,
        linewidth: cfg.width
      });
      const ring = new THREE.Line(ringGeo, ringMat);
      this.floorGroup.add(ring);
    });

    // 4. Central Hub Light Column Ring
    const hubRingGeo = new THREE.RingGeometry(18, 19.5, 32);
    const hubRingMat = new THREE.MeshBasicMaterial({
      color: 0xff9f0a,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    });
    const hubRing = new THREE.Mesh(hubRingGeo, hubRingMat);
    hubRing.rotation.x = -Math.PI / 2;
    hubRing.position.y = -14.1;
    this.floorGroup.add(hubRing);

    // 5. Technical Coordinate Crosshair Axes with Cardinal Markers
    const crossMat = new THREE.LineBasicMaterial({ color: 0x0071e3, transparent: true, opacity: 0.45 });
    const crossGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-155, -14.1, 0), new THREE.Vector3(155, -14.1, 0),
      new THREE.Vector3(0, -14.1, -155), new THREE.Vector3(0, -14.1, 155)
    ]);
    const cross = new THREE.LineSegments(crossGeo, crossMat);
    this.floorGroup.add(cross);

    // 6. Rotating Holographic Radar Sweep Line & Beam Fan
    this.radarGroup = new THREE.Group();
    const radarGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -14.0, 0),
      new THREE.Vector3(142, -14.0, 0)
    ]);
    const radarMat = new THREE.LineBasicMaterial({
      color: 0x0071e3,
      transparent: true,
      opacity: 0.9,
      linewidth: 2.5
    });
    this.radarLine = new THREE.Line(radarGeo, radarMat);
    this.radarGroup.add(this.radarLine);

    // Trailing sector fan (holographic radar wedge)
    const fanShape = new THREE.Shape();
    fanShape.moveTo(0, 0);
    const fanAngle = Math.PI / 6; // 30 degrees
    for (let a = 0; a <= fanAngle; a += 0.05) {
      fanShape.lineTo(Math.cos(a) * 142, Math.sin(a) * 142);
    }
    fanShape.closePath();
    const fanGeo = new THREE.ShapeGeometry(fanShape);
    const fanMat = new THREE.MeshBasicMaterial({
      color: 0x0071e3,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide
    });
    const fanMesh = new THREE.Mesh(fanGeo, fanMat);
    fanMesh.rotation.x = -Math.PI / 2;
    fanMesh.position.y = -14.05;
    this.radarGroup.add(fanMesh);

    this.floorGroup.add(this.radarGroup);
    this.scene.add(this.floorGroup);
  }

  setupParticleDust() {
    // 220 floating spatial data dust particles
    const particleCount = 220;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const cCobalt = new THREE.Color(0x0071e3);
    const cAmber  = new THREE.Color(0xff9f0a);
    const cCyan   = new THREE.Color(0x00c7be);
    const cPurple = new THREE.Color(0xaf52de);

    this.particleInitialY = [];

    for (let i = 0; i < particleCount; i++) {
      const px = (Math.random() - 0.5) * 280;
      const py = Math.random() * 90 - 12;
      const pz = (Math.random() - 0.5) * 280;

      positions[i * 3]     = px;
      positions[i * 3 + 1] = py;
      positions[i * 3 + 2] = pz;
      this.particleInitialY.push(py);

      const r = Math.random();
      const c = r < 0.35 ? cCobalt : r < 0.65 ? cAmber : r < 0.85 ? cCyan : cPurple;
      colors[i * 3]     = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
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
      console.log(`[3D Studio] Ingesting relational architecture from ${url}...`);
      const res = await fetch(url);
      const data = await res.json();

      if (!data || !data.tables) {
        console.error('[3D Studio] Invalid graph API payload:', data);
        return;
      }

      console.log(`[3D Studio] Live graph loaded: ${data.tables.length} tables, ${data.relationships.length} foreign keys.`);
      this.graphData = data;
      this.buildGraph();
      this.frameCameraToGraph();

    } catch (err) {
      console.error('[3D Studio] Failed to load schema graph:', err);
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

          // If count changed (INSERT or DELETE), animate pulse burst!
          if (oldCount !== t.record_count) {
            console.log(`[3D Studio] Mutation detected on '${t.name}': ${oldCount} -> ${t.record_count}`);
            this.animateNodePulse(node);
          }

          this.updateNodeGeometryScale(node);
          this.updateNodeLabel(node);
        }
      });
    } catch (err) {
      console.error('[3D Studio] Refresh error:', err);
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

    console.log(`[3D Studio] Scene graph built: ${this.nodes.size} nodes created.`);
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
  // SICK NODE CREATION: PRECISION HARDWARE MONOLITH & CRYSTAL
  // ==========================================================
  createTableNode(table, position) {
    const group = new THREE.Group();
    group.position.set(position.x, position.y, position.z);

    const count = table.record_count || 0;
    const hexColor = this.domainColors[table.name] || '#0071e3';
    const domainColor = new THREE.Color(hexColor);

    // Dimensions
    const baseW = 20 + Math.log2(count + 1) * 3.4;
    const baseH = 7.0 + Math.log2(count + 1) * 1.8;
    const baseD = 17 + Math.log2(count + 1) * 2.8;

    // 1. Lower Hardware Pedestal (Matte Chamfered Unit)
    const pedGeo = new THREE.BoxGeometry(baseW * 1.08, 1.8, baseD * 1.08);
    const pedMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.25,
      roughness: 0.15,
      emissive: domainColor,
      emissiveIntensity: 0.22
    });
    const pedestal = new THREE.Mesh(pedGeo, pedMat);
    pedestal.position.y = -baseH / 2 - 0.9;
    group.add(pedestal);

    // 2. Translucent Levitating Crystal Chassis Body
    const boxGeo = new THREE.BoxGeometry(baseW, baseH, baseD);
    const boxMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.12,
      metalness: 0.1,
      emissive: domainColor,
      emissiveIntensity: 0.45,
      transparent: true,
      opacity: 0.94
    });
    const mesh = new THREE.Mesh(boxGeo, boxMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { tableName: table.name };
    group.add(mesh);

    // 3. Glowing Neon Wireframe Bevel Cage
    const edgesGeo = new THREE.EdgesGeometry(boxGeo);
    const edgesMat = new THREE.LineBasicMaterial({
      color: domainColor,
      linewidth: 3.0,
      transparent: false
    });
    const edgeLines = new THREE.LineSegments(edgesGeo, edgesMat);
    group.add(edgeLines);

    // 4. Luminous Cyber Surface Console Plate
    const topPlateGeo = new THREE.PlaneGeometry(baseW * 0.94, baseD * 0.94);
    const topPlateMat = new THREE.MeshBasicMaterial({
      color: domainColor,
      transparent: true,
      opacity: 0.90,
      side: THREE.DoubleSide
    });
    const topPlate = new THREE.Mesh(topPlateGeo, topPlateMat);
    topPlate.rotation.x = -Math.PI / 2;
    topPlate.position.y = baseH / 2 + 0.08;
    group.add(topPlate);

    // 5. Dual-Nested Floating Rotating Crystal Core
    const crystalGroup = new THREE.Group();
    crystalGroup.position.y = 0;

    // Outer wireframe crystal
    const outerGeo = new THREE.OctahedronGeometry(baseH * 0.52, 0);
    const outerMat = new THREE.MeshBasicMaterial({
      color: domainColor,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });
    const outerCrystal = new THREE.Mesh(outerGeo, outerMat);
    crystalGroup.add(outerCrystal);

    // Inner glowing solid crystal core
    const innerGeo = new THREE.OctahedronGeometry(baseH * 0.32, 0);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: domainColor,
      emissiveIntensity: 0.95,
      metalness: 0.3,
      roughness: 0.1
    });
    const innerCrystal = new THREE.Mesh(innerGeo, innerMat);
    crystalGroup.add(innerCrystal);

    group.add(crystalGroup);

    // 6. Floor Holographic Underglow Projection Ring
    const floorHaloGeo = new THREE.RingGeometry(baseW * 0.65, baseW * 0.78, 36);
    const floorHaloMat = new THREE.MeshBasicMaterial({
      color: domainColor,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide
    });
    const floorHalo = new THREE.Mesh(floorHaloGeo, floorHaloMat);
    floorHalo.rotation.x = -Math.PI / 2;
    floorHalo.position.y = -baseH / 2 - 1.7;
    group.add(floorHalo);

    // 7. Architectural Vertical Light Beacon
    const stemGeo = new THREE.CylinderGeometry(0.3, 0.3, 7.5, 8);
    const stemMat = new THREE.MeshBasicMaterial({ color: domainColor, transparent: true, opacity: 0.85 });
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.y = baseH / 2 + 3.75;
    group.add(stem);

    // 8. Floating Cyber-Tactile Billboard Label (Dark Glass with Neon Halo)
    const labelSprite = this.createCanvasLabel(table.name, count, hexColor);
    labelSprite.position.set(0, baseH / 2 + 9.2, 0);
    group.add(labelSprite);

    const nodeObj = {
      name: table.name,
      data: table,
      recordCount: count,
      group: group,
      mesh: mesh,
      pedestal: pedestal,
      crystal: crystalGroup,
      innerCrystal: innerCrystal,
      outerCrystal: outerCrystal,
      floorHalo: floorHalo,
      boxMat: boxMat,
      edgeLines: edgesMat,
      topPlateMat: topPlateMat,
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
    canvas.width = 540;
    canvas.height = 144;
    const ctx = canvas.getContext('2d');

    this.drawLabelCanvas(ctx, tableName, recordCount, accentColor);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(32, 8.5, 1);
    sprite.userData = { canvas, ctx, texture };

    return sprite;
  }

  drawLabelCanvas(ctx, tableName, recordCount, accentColor) {
    ctx.clearRect(0, 0, 540, 144);

    const color = accentColor || '#0071e3';

    // 1. High-Contrast Dark Holographic Glass Capsule
    ctx.fillStyle = '#0f172a'; // Deep slate navy for maximum projector contrast
    ctx.strokeStyle = color;
    ctx.lineWidth = 5.0;

    // Rounded rectangle
    const x = 10, y = 10, w = 520, h = 124, r = 24;
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

    // 2. Pulse Status Beacon (Outer ring + Solid core)
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(42, 72, 14, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(42, 72, 8, 0, Math.PI * 2);
    ctx.fill();

    // 3. Table Name (Razor Sharp Pure White)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(tableName.toUpperCase(), 68, 72);

    // 4. Live Row Count Badge Pill on Right
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(375, 46, 140, 52, 14) : ctx.rect(375, 46, 140, 52);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 23px "SF Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${recordCount} ROWS`, 445, 72);
  }

  updateNodeLabel(node) {
    if (!node.labelSprite || !node.labelSprite.userData.ctx) return;
    const { ctx, texture } = node.labelSprite.userData;
    this.drawLabelCanvas(ctx, node.name, node.recordCount, node.hexColor);
    texture.needsUpdate = true;
  }

  updateNodeGeometryScale(node) {
    const count = node.recordCount || 0;
    const newW = 19 + Math.log2(count + 1) * 3.2;
    const newH = 6.5 + Math.log2(count + 1) * 1.6;
    const newD = 16 + Math.log2(count + 1) * 2.6;

    const scaleX = newW / node.baseDims.w;
    const scaleY = newH / node.baseDims.h;
    const scaleZ = newD / node.baseDims.d;

    node.mesh.scale.set(scaleX, scaleY, scaleZ);
  }

  animateNodePulse(node) {
    const initialY = node.baseY;
    const startTime = performance.now();
    const duration = 700;

    const pulseStep = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1.0, elapsed / duration);
      const bounce = Math.sin(progress * Math.PI) * 6.0;
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
  // RELATIONSHIP CONDUITS & SYNAPTIC TRAVELING ENERGY
  // ==========================================================
  createRelationshipLink(srcNode, tgtNode, relData) {
    const p1 = srcNode.position;
    const p2 = tgtNode.position;

    // Architectural parabolic arch
    const midX = (p1.x + p2.x) / 2;
    const midY = Math.max(p1.y, p2.y) + 7.0 + Math.hypot(p2.x - p1.x, p2.z - p1.z) * 0.085;
    const midZ = (p1.z + p2.z) / 2;
    const controlPoint = new THREE.Vector3(midX, midY, midZ);

    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(p1.x, p1.y, p1.z),
      controlPoint,
      new THREE.Vector3(p2.x, p2.y, p2.z)
    );

    const points = curve.getPoints(32);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    // Visible dual-layer conduit line
    const material = new THREE.LineBasicMaterial({
      color: 0x0071e3,
      linewidth: 2.4,
      transparent: true,
      opacity: 0.65
    });

    const curveLine = new THREE.Line(geometry, material);

    // Glowing Traveling Data Packets (Dual Photons)
    const pulseMat1 = new THREE.MeshBasicMaterial({ color: 0x00c7be });
    const pulseGeo1 = new THREE.SphereGeometry(1.1, 12, 12);
    const pulseDot1 = new THREE.Mesh(pulseGeo1, pulseMat1);
    this.graphGroup.add(pulseDot1);

    const pulseMat2 = new THREE.MeshBasicMaterial({ color: 0xff9f0a });
    const pulseGeo2 = new THREE.SphereGeometry(0.85, 12, 12);
    const pulseDot2 = new THREE.Mesh(pulseGeo2, pulseMat2);
    this.graphGroup.add(pulseDot2);

    const linkObj = {
      curve: curve,
      curveLine: curveLine,
      material: material,
      pulseDot: pulseDot1,
      pulseDot2: pulseDot2,
      pulseT: Math.random(),
      pulseT2: (Math.random() + 0.5) % 1.0,
      pulseSpeed: 0.18 + Math.random() * 0.1,
      source: srcNode.name,
      target: tgtNode.name,
      relData: relData
    };

    this.pulses.push(linkObj);
    return linkObj;
  }

  // ==========================================================
  // SICK TRAFFIC PULSE BURST (Simulate Synaptic Storm)
  // ==========================================================
  triggerPulseBurst() {
    this.pulses.forEach(link => {
      link.pulseSpeed *= 3.8;
      link.pulseDot.scale.set(2.4, 2.4, 2.4);
      link.pulseDot.material.color.setHex(0xff3b30); // High-voltage red/coral
      if (link.pulseDot2) {
        link.pulseDot2.scale.set(2.0, 2.0, 2.0);
        link.pulseDot2.material.color.setHex(0xff9500); // Solar amber
      }
      link.material.color.setHex(0xff9500);
      link.material.opacity = 1.0;
    });

    // Make all internal crystals spin and surge vigorously
    this.nodes.forEach(node => {
      if (node.crystal) {
        node.crystal.scale.set(1.6, 1.6, 1.6);
      }
      if (node.innerCrystal) {
        node.innerCrystal.material.emissiveIntensity = 1.6;
      }
    });

    setTimeout(() => {
      this.pulses.forEach(link => {
        link.pulseSpeed /= 3.8;
        link.pulseDot.scale.set(1.0, 1.0, 1.0);
        link.pulseDot.material.color.setHex(0x00c7be);
        if (link.pulseDot2) {
          link.pulseDot2.scale.set(1.0, 1.0, 1.0);
          link.pulseDot2.material.color.setHex(0xff9f0a);
        }
        link.material.color.setHex(0x0071e3);
        link.material.opacity = 0.65;
      });
      this.nodes.forEach(node => {
        if (node.crystal) {
          node.crystal.scale.set(1.0, 1.0, 1.0);
        }
        if (node.innerCrystal) {
          node.innerCrystal.material.emissiveIntensity = 0.95;
        }
      });
    }, 1800);
  }

  // ==========================================================
  // CLUSTER SPOTLIGHT FILTERS
  // ==========================================================
  setCluster(clusterName) {
    this.currentCluster = clusterName;
    const activeSet = this.clusters[clusterName];

    this.nodes.forEach(node => {
      const isMatch = clusterName === 'all' || (activeSet && activeSet.has(node.name));
      if (isMatch) {
        node.boxMat.opacity = 0.92;
        node.boxMat.emissiveIntensity = 0.42;
        node.edgeLines.opacity = 1.0;
        node.labelSprite.material.opacity = 1.0;
        node.floorHalo.material.opacity = 0.45;
        node.crystal.visible = true;
      } else {
        node.boxMat.opacity = 0.16;
        node.boxMat.emissiveIntensity = 0.04;
        node.edgeLines.opacity = 0.12;
        node.labelSprite.material.opacity = 0.16;
        node.floorHalo.material.opacity = 0.05;
        node.crystal.visible = false;
      }
    });

    this.links.forEach(l => {
      const srcMatch = clusterName === 'all' || (activeSet && activeSet.has(l.source));
      const tgtMatch = clusterName === 'all' || (activeSet && activeSet.has(l.target));
      if (srcMatch && tgtMatch) {
        l.material.opacity = 0.85;
        l.pulseDot.visible = true;
      } else {
        l.material.opacity = 0.1;
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
    const dist = (radius / Math.sin(fov / 2)) * 0.62;

    const targetPos = new THREE.Vector3(center.x, center.y + dist * 0.52, center.z + dist * 0.82);
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

    node.boxMat.emissiveIntensity = 0.7;
    node.group.position.y = node.baseY + 3.0; // Levitation lift!

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
        this.hoveredNode.boxMat.emissiveIntensity = 0.42;
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

  selectNode(node) {
    if (!node) {
      this.deselect();
      return;
    }

    // Reset old selected node position
    if (this.selectedNode && this.selectedNode !== node) {
      this.selectedNode.group.position.y = this.selectedNode.baseY;
    }

    this.selectedNode = node;
    node.group.position.y = node.baseY + 4.5; // High levitation!

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
        n.boxMat.emissiveIntensity = n === node ? 0.85 : 0.5;
        n.edgeLines.opacity = 1.0;
        n.labelSprite.material.opacity = 1.0;
        n.crystal.visible = true;
      } else {
        n.boxMat.opacity = 0.2;
        n.boxMat.emissiveIntensity = 0.05;
        n.edgeLines.opacity = 0.15;
        n.labelSprite.material.opacity = 0.2;
        n.crystal.visible = false;
      }
    });

    // Highlight relationship curves
    this.links.forEach(l => {
      if (l.source === node.name || l.target === node.name) {
        l.material.color.setHex(0xff9f0a); // Radiant amber
        l.material.opacity = 1.0;
      } else {
        l.material.color.setHex(0xcbd5e1);
        l.material.opacity = 0.12;
      }
    });

    // Smooth photographic camera glide towards target
    const targetPos = new THREE.Vector3(
      node.position.x,
      node.position.y + 36,
      node.position.z + 58
    );
    this.smoothGlideCamera(targetPos, node.position);

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
    if (this.selectedNode) {
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
      l.material.opacity = 0.85;
    });
  }

  // ==========================================================
  // RENDER LOOP & REAL-TIME ANIMATION
  // ==========================================================
  animate() {
    this.animationFrameId = requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Rotate Radar Sweep Line & Group
    if (this.radarGroup) {
      this.radarGroup.rotation.y = elapsedTime * 0.55;
    } else if (this.radarLine) {
      this.radarLine.rotation.y = elapsedTime * 0.55;
    }

    // 2. Rotate Internal Crystals & Ambient Dust
    this.nodes.forEach(node => {
      if (node.crystal && node.crystal.visible) {
        if (node.outerCrystal) {
          node.outerCrystal.rotation.x += delta * 1.1;
          node.outerCrystal.rotation.y += delta * 1.4;
        }
        if (node.innerCrystal) {
          node.innerCrystal.rotation.x -= delta * 0.9;
          node.innerCrystal.rotation.z += delta * 1.2;
          // Breathing emissive light
          node.innerCrystal.material.emissiveIntensity = 0.8 + Math.sin(elapsedTime * 4.0) * 0.25;
        }
      }
    });

    // 3. Floating Spatial Particle Dust Undulation
    if (this.particleDust && this.particleInitialY) {
      const posAttr = this.particleDust.geometry.attributes.position;
      const count = posAttr.count;
      for (let i = 0; i < count; i++) {
        const initY = this.particleInitialY[i];
        posAttr.setY(i, initY + Math.sin(elapsedTime * 1.2 + i) * 3.5);
      }
      posAttr.needsUpdate = true;
      this.particleDust.rotation.y = elapsedTime * 0.04;
    }

    // 4. Smooth Camera Glide Lerp (when clicking nodes)
    if (this.targetCameraPos && this.camera) {
      this.camera.position.lerp(this.targetCameraPos, 0.065);
      if (this.controls && this.targetLookAt) {
        this.controls.target.lerp(this.targetLookAt, 0.065);
      }
      if (this.camera.position.distanceTo(this.targetCameraPos) < 0.4) {
        this.targetCameraPos = null;
      }
    }

    // 5. Cinematic Orbit Tour
    if (this.isOrbitTourActive && this.camera && !this.isUserInteracting) {
      this.orbitAngle += delta * 0.26;
      const orbitRadius = 165;
      this.camera.position.x = Math.sin(this.orbitAngle) * orbitRadius;
      this.camera.position.z = Math.cos(this.orbitAngle) * orbitRadius;
      this.camera.position.y = 82 + Math.sin(this.orbitAngle * 1.5) * 14;
      this.camera.lookAt(0, 4, 0);
      if (this.controls) this.controls.target.set(0, 4, 0);
    } else if (!this.isUserInteracting && !this.reducedMotion && this.graphGroup && !this.selectedNode && !this.targetCameraPos) {
      // Subtle idle drift
      this.graphGroup.rotation.y += this.idleRotationSpeed;
    }

    // 6. Animate dual-photon packet markers along curves
    if (!this.reducedMotion) {
      this.pulses.forEach(link => {
        link.pulseT = (link.pulseT + link.pulseSpeed * delta) % 1.0;
        const pt1 = link.curve.getPoint(link.pulseT);
        link.pulseDot.position.copy(pt1);

        if (link.pulseDot2) {
          link.pulseT2 = (link.pulseT2 + link.pulseSpeed * 0.85 * delta) % 1.0;
          const pt2 = link.curve.getPoint(link.pulseT2);
          link.pulseDot2.position.copy(pt2);
        }
      });
    }

    // 7. Update controls
    if (this.controls && !this.isOrbitTourActive) {
      this.controls.update();
    }

    // 8. Render scene
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  // ==========================================================
  // FALLBACK 2D SVG VISUALIZATION
  // ==========================================================
  initSvgFallback() {
    this.container.innerHTML = `
      <div class="svg-graph-fallback" style="width:100%; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; background:#f8fafc; color:#1d1d1f; padding:20px;">
        <div style="font-size:14px; font-weight:700; color:#0071e3; margin-bottom:6px;">DATABASE ARCHITECTURE // SPATIAL FALLBACK</div>
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
              <rect x="${x - 45}" y="${y - 20}" width="90" height="42" rx="10" fill="#ffffff" stroke="${col}" stroke-width="2.5" />
              <text x="${x}" y="${y - 2}" fill="#1d1d1f" font-size="11" font-weight="bold" text-anchor="middle">${t.name.toUpperCase()}</text>
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

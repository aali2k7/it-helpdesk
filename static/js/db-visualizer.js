/**
 * IT Helpdesk & Asset Support Management System
 * Spatial Database Architecture Visualizer (db-visualizer.js)
 * Clean B2B SaaS Enterprise Architecture Engine
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

    // Enterprise Restrained Color Palette
    this.domainColors = {
      'tickets': '#3b82f6',          // Core Hub (Linear Blue)
      'incidents': '#60a5fa',        // Operations (Steel Blue)
      'service_requests': '#38bdf8', // Operations (Sky Slate)
      'users': '#0284c7',            // Entities (Cobalt)
      'departments': '#0ea5e9',      // Entities (Cyan Slate)
      'assets': '#0369a1',           // Entities (Deep Slate Blue)
      'maintenance': '#64748b',      // Infrastructure (Cool Slate)
      'warranties': '#64748b',       // Infrastructure (Cool Slate)
      'support_staff': '#0284c7',    // Entities (Cobalt)
      'assignments': '#60a5fa',      // Operations (Steel Blue)
      'categories': '#94a3b8',       // Taxonomy (Muted Slate)
      'priorities': '#94a3b8',       // Taxonomy (Muted Slate)
      'resolutions': '#3b82f6',      // Operations (Blue)
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

    // 1. Scene Setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0e17);
    this.scene.fog = new THREE.FogExp2(0x0a0e17, 0.0016);

    // 2. Camera Setup
    const rect = this.container.getBoundingClientRect();
    const aspect = (rect.width || 800) / (rect.height || 500);
    this.camera = new THREE.PerspectiveCamera(40, aspect, 1, 3000);
    this.initialCameraPos = new THREE.Vector3(0, 80, 140);
    this.camera.position.copy(this.initialCameraPos);
    this.camera.lookAt(0, 4, 0);

    // 3. Renderer
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

    // 5. Lighting
    this.setupLighting();

    // 6. Minimal Floor & Grid
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

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.15);
    keyLight.position.set(60, 100, 70);
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x64748b, 0.45);
    fillLight.position.set(-60, 60, -60);
    this.scene.add(fillLight);

    const hubPointLight = new THREE.PointLight(0x3b82f6, 0.75, 140);
    hubPointLight.position.set(0, 20, 0);
    this.scene.add(hubPointLight);
  }

  setupFloorGrid() {
    this.floorGroup = new THREE.Group();

    // 1. Subtle Architectural Dark Grid
    const grid = new THREE.GridHelper(300, 24, 0x1e293b, 0x141d2e);
    grid.position.y = -14.7;
    this.floorGroup.add(grid);

    // 2. Base Dark Plinth
    const plinthGeo = new THREE.CylinderGeometry(148, 148, 1.2, 64);
    const plinthMat = new THREE.MeshBasicMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.85
    });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = -14.6;
    this.floorGroup.add(plinth);

    // 3. Single Minimal Boundary Ring
    const ringGeo = new THREE.BufferGeometry();
    const points = [];
    const segments = 96;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(theta) * 142, -14.2, Math.sin(theta) * 142));
    }
    ringGeo.setFromPoints(points);
    const ringMat = new THREE.LineBasicMaterial({
      color: 0x334155,
      transparent: true,
      opacity: 0.45
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
      size: 1.5,
      color: 0x475569,
      transparent: true,
      opacity: 0.35
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
  // NODE CREATION: DARK GRAPHITE MONOLITH & SATELLITE LABEL
  // ==========================================================
  createTableNode(table, position) {
    const group = new THREE.Group();
    group.position.set(position.x, position.y, position.z);

    const count = table.record_count || 0;
    const hexColor = this.domainColors[table.name] || '#3b82f6';
    const domainColor = new THREE.Color(hexColor);

    // Dimensions
    const baseW = 20 + Math.log2(count + 1) * 2.8;
    const baseH = 6.0 + Math.log2(count + 1) * 1.4;
    const baseD = 16 + Math.log2(count + 1) * 2.4;

    // 1. Lower Hardware Pedestal (Matte Chamfered Unit)
    const pedGeo = new THREE.BoxGeometry(baseW * 1.04, 1.2, baseD * 1.04);
    const pedMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      metalness: 0.3,
      roughness: 0.4
    });
    const pedestal = new THREE.Mesh(pedGeo, pedMat);
    pedestal.position.y = -baseH / 2 - 0.6;
    group.add(pedestal);

    // 2. High-Tech Dark Graphite Monolith Chassis Body
    const boxGeo = new THREE.BoxGeometry(baseW, baseH, baseD);
    const boxMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.35,
      metalness: 0.25,
      emissive: 0x0a0f1d,
      emissiveIntensity: 0.3
    });
    const mesh = new THREE.Mesh(boxGeo, boxMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { tableName: table.name };
    group.add(mesh);

    // 3. Crisp Edge Lines
    const edgesGeo = new THREE.EdgesGeometry(boxGeo);
    const edgesMat = new THREE.LineBasicMaterial({
      color: 0x334155,
      linewidth: 1.5,
      transparent: true,
      opacity: 0.7
    });
    const edgeLines = new THREE.LineSegments(edgesGeo, edgesMat);
    group.add(edgeLines);

    // 4. Subtle Top Accent Bar
    const topBarGeo = new THREE.PlaneGeometry(baseW * 0.92, 1.0);
    const topBarMat = new THREE.MeshBasicMaterial({
      color: domainColor,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide
    });
    const topBar = new THREE.Mesh(topBarGeo, topBarMat);
    topBar.rotation.x = -Math.PI / 2;
    topBar.position.set(0, baseH / 2 + 0.05, -baseD * 0.38);
    group.add(topBar);

    // 5. Billboard Label (Dark Graphite Capsule)
    const labelSprite = this.createCanvasLabel(table.name, count, hexColor);
    labelSprite.position.set(0, baseH / 2 + 6.8, 0);
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
    sprite.scale.set(30, 8.0, 1);
    sprite.userData = { canvas, ctx, texture };

    return sprite;
  }

  drawLabelCanvas(ctx, tableName, recordCount, accentColor) {
    ctx.clearRect(0, 0, 540, 144);

    const color = accentColor || '#3b82f6';

    // 1. High-Contrast Dark Slate Capsule
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3.0;

    // Rounded rectangle
    const x = 10, y = 10, w = 520, h = 124, r = 20;
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

    // 2. Subtle Accent Status Dot
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(44, 72, 7, 0, Math.PI * 2);
    ctx.fill();

    // 3. Table Name (Crisp White Bold Typography)
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 34px -apple-system, BlinkMacSystemFont, "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(tableName.toUpperCase(), 68, 72);

    // 4. Compact Row Count Pill on Right
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(380, 48, 134, 48, 12) : ctx.rect(380, 48, 134, 48);
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 21px "Inter", "SF Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${recordCount} rows`, 447, 72);
  }

  updateNodeLabel(node) {
    if (!node.labelSprite || !node.labelSprite.userData.ctx) return;
    const { ctx, texture } = node.labelSprite.userData;
    this.drawLabelCanvas(ctx, node.name, node.recordCount, node.hexColor);
    texture.needsUpdate = true;
  }

  updateNodeGeometryScale(node) {
    const count = node.recordCount || 0;
    const newW = 19 + Math.log2(count + 1) * 2.8;
    const newH = 6.0 + Math.log2(count + 1) * 1.4;
    const newD = 16 + Math.log2(count + 1) * 2.4;

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

    // Elegant thin link line
    const material = new THREE.LineBasicMaterial({
      color: 0x334155,
      linewidth: 1.5,
      transparent: true,
      opacity: 0.55
    });

    const curveLine = new THREE.Line(geometry, material);

    // Single subtle traveling data packet
    const pulseMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.75 });
    const pulseGeo = new THREE.SphereGeometry(0.85, 8, 8);
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
        node.boxMat.emissiveIntensity = 0.3;
        node.edgeMat.opacity = 0.7;
        node.labelSprite.material.opacity = 1.0;
      } else {
        node.boxMat.opacity = 0.2;
        node.boxMat.emissiveIntensity = 0.05;
        node.edgeMat.opacity = 0.15;
        node.labelSprite.material.opacity = 0.2;
      }
    });

    this.links.forEach(l => {
      const srcMatch = clusterName === 'all' || (activeSet && activeSet.has(l.source));
      const tgtMatch = clusterName === 'all' || (activeSet && activeSet.has(l.target));
      if (srcMatch && tgtMatch) {
        l.material.opacity = 0.55;
        l.pulseDot.visible = true;
      } else {
        l.material.opacity = 0.08;
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

    node.boxMat.emissiveIntensity = 0.6;
    node.edgeMat.color.setHex(0x3b82f6);
    node.group.position.y = node.baseY + 2.0;

    // Highlight connecting links
    this.links.forEach(l => {
      if (l.source === node.name || l.target === node.name) {
        l.material.color.setHex(0x3b82f6);
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
        this.hoveredNode.boxMat.emissiveIntensity = 0.3;
        this.hoveredNode.edgeMat.color.setHex(0x334155);
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
      this.selectedNode.edgeMat.color.setHex(0x334155);
    }

    this.selectedNode = node;
    node.group.position.y = node.baseY + 3.5;
    node.edgeMat.color.setHex(0x3b82f6);

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
        n.boxMat.emissiveIntensity = n === node ? 0.7 : 0.4;
        n.edgeMat.opacity = 1.0;
        n.labelSprite.material.opacity = 1.0;
      } else {
        n.boxMat.opacity = 0.2;
        n.boxMat.emissiveIntensity = 0.05;
        n.edgeMat.opacity = 0.15;
        n.labelSprite.material.opacity = 0.2;
      }
    });

    // Highlight relationship curves
    this.links.forEach(l => {
      if (l.source === node.name || l.target === node.name) {
        l.material.color.setHex(0x3b82f6);
        l.material.opacity = 1.0;
      } else {
        l.material.color.setHex(0x1e293b);
        l.material.opacity = 0.1;
      }
    });

    // Smooth photographic camera glide towards target
    const targetPos = new THREE.Vector3(
      node.position.x,
      node.position.y + 32,
      node.position.z + 54
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
      this.selectedNode.edgeMat.color.setHex(0x334155);
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
      l.material.color.setHex(0x334155);
      l.material.opacity = 0.55;
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
      <div class="svg-graph-fallback" style="width:100%; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; background:#0a0e17; color:#f8fafc; padding:20px;">
        <div style="font-size:14px; font-weight:700; color:#3b82f6; margin-bottom:6px;">DATABASE ARCHITECTURE</div>
        <p style="font-size:12px; color:#94a3b8; margin-bottom:16px;">Displaying 2D relational schema topology.</p>
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
          const col = this.domainColors[t.name] || '#3b82f6';
          svgHtml += `
            <g style="cursor:pointer;" onclick="window.inspectNodeViewRecords && (window.selectedInspectorTable='${t.name}', window.inspectNodeViewRecords())">
              <rect x="${x - 45}" y="${y - 20}" width="90" height="42" rx="8" fill="#111827" stroke="${col}" stroke-width="1.5" />
              <text x="${x}" y="${y - 2}" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">${t.name.toUpperCase()}</text>
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

/**
 * IT Helpdesk & Asset Support Management System
 * Apple Studio Spatial Database Architecture Visualizer
 * Three.js WebGL Engine - Projector-Optimized Light Theme & VisionOS Aesthetics
 * Course: DBMS - Woxsen University | Md Aali Rahman (25WU0102156)
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

    // Smooth camera glide target
    this.targetCameraPos = null;
    this.targetLookAt = null;

    // Apple-Curated High-Contrast Domain Colors (Projector Optimized)
    this.domainColors = {
      'tickets': '#f59e0b',          // Electric Amber (Core Hub)
      'incidents': '#ef4444',        // Apple Coral Red
      'service_requests': '#06b6d4', // Vibrant Cyan
      'users': '#3b82f6',            // Signature Apple Blue
      'departments': '#10b981',      // Apple Mint Emerald
      'assets': '#0284c7',           // Cobalt Steel
      'maintenance': '#f97316',      // Warm Copper
      'warranties': '#8b5cf6',       // Vivid Lavender
      'support_staff': '#059669',    // Deep Emerald
      'assignments': '#6366f1',      // Modern Indigo
      'categories': '#eab308',       // Pure Gold
      'priorities': '#ec4899',       // Deep Rose
      'resolutions': '#16a34a',      // Success Green
      'status_histories': '#64748b'   // Slate Graphite
    };

    // Logical Architectural Clusters
    this.clusters = {
      operations: new Set(['tickets', 'incidents', 'service_requests', 'resolutions', 'assignments', 'status_histories']),
      entities: new Set(['users', 'assets', 'support_staff', 'departments']),
      infrastructure: new Set(['maintenance', 'warranties', 'categories', 'priorities'])
    };

    this.init();
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
      console.warn('[3D Visualizer] WebGL or Three.js not available. Using 2D SVG fallback.');
      this.initSvgFallback();
      return;
    }

    // 1. Scene setup (Apple Studio Luminous Light Theme)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf5f7fc);
    this.scene.fog = new THREE.FogExp2(0xf5f7fc, 0.0018);

    // 2. Camera setup
    const rect = this.container.getBoundingClientRect();
    const aspect = (rect.width || 800) / (rect.height || 500);
    this.camera = new THREE.PerspectiveCamera(40, aspect, 1, 2500);
    this.initialCameraPos = new THREE.Vector3(0, 88, 140);
    this.camera.position.copy(this.initialCameraPos);
    this.camera.lookAt(0, 4, 0);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false
    });
    this.renderer.setSize(rect.width || 800, rect.height || 500);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.container.appendChild(this.renderer.domElement);

    // 4. Controls setup
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxDistance = 380;
      this.controls.minDistance = 30;
      this.controls.maxPolarAngle = Math.PI / 2 + 0.06;
      this.controls.target.set(0, 4, 0);

      this.controls.addEventListener('start', () => { 
        this.isUserInteracting = true;
        this.targetCameraPos = null; // stop automatic camera glide on user drag
      });
      this.controls.addEventListener('end', () => { 
        setTimeout(() => { this.isUserInteracting = false; }, 800); 
      });
    }

    // 5. Apple Studio 3-Point Studio Lighting
    this.setupLighting();

    // 6. Minimalist Architectural Floor Plinth & Rings
    this.setupFloorGrid();

    // 7. Graph Root Group
    this.graphGroup = new THREE.Group();
    this.scene.add(this.graphGroup);

    // 8. Event Listeners
    this.setupEvents();

    // 9. Start Render Loop
    this.animate = this.animate.bind(this);
    this.animationFrameId = requestAnimationFrame(this.animate);

    console.log('[3D Visualizer] Apple Studio Spatial Engine initialized.');
  }

  setupLighting() {
    // High-intensity white ambient light (perfect for projectors)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.25);
    this.scene.add(ambientLight);

    // Key studio light from top-front
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.95);
    keyLight.position.set(60, 110, 80);
    this.scene.add(keyLight);

    // Soft sky fill light
    const fillLight = new THREE.DirectionalLight(0xe0e7ff, 0.55);
    fillLight.position.set(-70, 70, -80);
    this.scene.add(fillLight);

    // Subtle blue rim from below
    const bounceLight = new THREE.DirectionalLight(0x0071e3, 0.2);
    bounceLight.position.set(0, -60, 0);
    this.scene.add(bounceLight);

    // Central point light over tickets
    const centerLight = new THREE.PointLight(0xf59e0b, 1.1, 140);
    centerLight.position.set(0, 20, 0);
    this.scene.add(centerLight);
  }

  setupFloorGrid() {
    const floorGroup = new THREE.Group();

    // Frosted acrylic circular base plinth
    const plinthGeo = new THREE.CylinderGeometry(145, 145, 1.0, 64);
    const plinthMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.65
    });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = -14.5;
    floorGroup.add(plinth);

    // Minimalist concentric hairline rings
    const ringMat = new THREE.LineBasicMaterial({
      color: 0xcbd5e1,
      transparent: true,
      opacity: 0.8
    });

    [35, 70, 105, 140].forEach(radius => {
      const ringGeo = new THREE.BufferGeometry();
      const points = [];
      const segments = 64;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * radius, -14, Math.sin(theta) * radius));
      }
      ringGeo.setFromPoints(points);
      const ring = new THREE.Line(ringGeo, ringMat);
      floorGroup.add(ring);
    });

    // Crosshair axes
    const crossMat = new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.6 });
    const crossGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-150, -14, 0), new THREE.Vector3(150, -14, 0),
      new THREE.Vector3(0, -14, -150), new THREE.Vector3(0, -14, 150)
    ]);
    const cross = new THREE.LineSegments(crossGeo, crossMat);
    floorGroup.add(cross);

    this.scene.add(floorGroup);
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
  // DATA LOADING & REFRESH
  // ==========================================================
  async loadGraph(url = '/api/database/graph') {
    try {
      console.log(`[3D Visualizer] Fetching database schema from ${url}...`);
      const res = await fetch(url);
      const data = await res.json();

      if (!data || !data.tables) {
        console.error('[3D Visualizer] Invalid graph API response:', data);
        return;
      }

      console.log(`[3D Visualizer] DATA RECEIVED: ${data.tables.length} tables, ${data.relationships.length} relationships.`);
      this.graphData = data;
      this.buildGraph();
      this.frameCameraToGraph();

    } catch (err) {
      console.error('[3D Visualizer] Failed to load graph data:', err);
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

          // If count changed (e.g. INSERT or DELETE), animate scale & billboard!
          if (oldCount !== t.record_count) {
            console.log(`[3D Visualizer] Live table record count change on '${t.name}': ${oldCount} -> ${t.record_count}`);
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
  // GRAPH CONSTRUCTION
  // ==========================================================
  buildGraph() {
    if (!this.graphData || !this.graphData.tables) return;

    // Clear previous objects
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

    // 2. Build Visible 3D Table Nodes (Apple Frosted Crystal Style)
    this.graphData.tables.forEach(table => {
      const pos = positions[table.name] || { x: 0, y: 0, z: 0 };
      const node = this.createTableNode(table, pos);
      this.nodes.set(table.name, node);
      this.graphGroup.add(node.group);
      this.interactableMeshes.push(node.mesh);
    });

    // 3. Build 3D Foreign Key Relationship Connectors
    this.graphData.relationships.forEach(rel => {
      const srcNode = this.nodes.get(rel.source);
      const tgtNode = this.nodes.get(rel.target);
      if (srcNode && tgtNode) {
        const link = this.createRelationshipLink(srcNode, tgtNode, rel);
        this.links.push(link);
        this.graphGroup.add(link.curveLine);
      }
    });

    console.log(`[3D Visualizer] SCENE GRAPH BUILT: ${this.nodes.size} nodes created.`);
  }

  computeTopologicalPositions(tables, relationships) {
    const pos = {};

    // Topological Layout: Tickets hub in center, surrounded by logical functional rings
    pos['tickets']          = { x: 0,   y: 4,  z: 0 };

    // Ring 1 (Immediate Operational Subtypes & Lifecycle)
    pos['incidents']        = { x: -32, y: 3,  z: -16 };
    pos['service_requests'] = { x: 32,  y: 3,  z: -16 };
    pos['status_histories'] = { x: -20, y: -4, z: 30 };
    pos['resolutions']      = { x: 20,  y: -4, z: 30 };
    pos['assignments']      = { x: 0,   y: 16, z: -32 };

    // Ring 2 (Core Entities: Users, Assets, Staff)
    pos['users']            = { x: -56, y: 8,  z: 12 };
    pos['assets']           = { x: 56,  y: 8,  z: 12 };
    pos['support_staff']    = { x: 0,   y: 28, z: -58 };

    // Ring 3 (Organization & Taxonomy)
    pos['departments']      = { x: -84, y: 12, z: 24 };
    pos['categories']       = { x: -40, y: -6, z: -60 };
    pos['priorities']       = { x: 40,  y: -6, z: -60 };

    // Ring 4 (Asset Sub-domain)
    pos['warranties']       = { x: 84,  y: 12, z: -20 };
    pos['maintenance']      = { x: 80,  y: 2,  z: 46 };

    // Fallback for any unknown tables
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
  // NODE CREATION - APPLE FROSTED CRYSTAL SLABS
  // ==========================================================
  createTableNode(table, position) {
    const group = new THREE.Group();
    group.position.set(position.x, position.y, position.z);

    const count = table.record_count || 0;
    const hexColor = this.domainColors[table.name] || '#0071e3';
    const domainColor = new THREE.Color(hexColor);

    // Dimensions
    const baseW = 18 + Math.log2(count + 1) * 3.0;
    const baseH = 6 + Math.log2(count + 1) * 1.5;
    const baseD = 15 + Math.log2(count + 1) * 2.5;

    // 1. Frosted Crystal Slab Body (High-contrast pure white with domain glow)
    const boxGeo = new THREE.BoxGeometry(baseW, baseH, baseD);
    const boxMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.22,
      metalness: 0.1,
      emissive: domainColor,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.94
    });

    const mesh = new THREE.Mesh(boxGeo, boxMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { tableName: table.name };
    group.add(mesh);

    // 2. High-Contrast Vibrant Wireframe Cage
    const edgesGeo = new THREE.EdgesGeometry(boxGeo);
    const edgesMat = new THREE.LineBasicMaterial({
      color: domainColor,
      linewidth: 2.0,
      transparent: false
    });
    const edgeLines = new THREE.LineSegments(edgesGeo, edgesMat);
    group.add(edgeLines);

    // 3. Vibrant Luminous Top Surface Plate
    const topPlateGeo = new THREE.PlaneGeometry(baseW * 0.94, baseD * 0.94);
    const topPlateMat = new THREE.MeshBasicMaterial({
      color: domainColor,
      transparent: true,
      opacity: 0.82,
      side: THREE.DoubleSide
    });
    const topPlate = new THREE.Mesh(topPlateGeo, topPlateMat);
    topPlate.rotation.x = -Math.PI / 2;
    topPlate.position.y = baseH / 2 + 0.08;
    group.add(topPlate);

    // 4. White Center Dot
    const coreGeo = new THREE.BoxGeometry(baseW * 0.35, 0.4, baseD * 0.35);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const corePlate = new THREE.Mesh(coreGeo, coreMat);
    corePlate.position.y = baseH / 2 + 0.12;
    group.add(corePlate);

    // 5. Architectural Vertical Label Stem
    const stemGeo = new THREE.CylinderGeometry(0.25, 0.25, 6.5, 8);
    const stemMat = new THREE.MeshBasicMaterial({ color: domainColor, transparent: true, opacity: 0.75 });
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.y = baseH / 2 + 3.25;
    group.add(stem);

    // 6. Floating VisionOS Pill Canvas Label (Pure White, Dark Typography)
    const labelSprite = this.createCanvasLabel(table.name, count, hexColor);
    labelSprite.position.set(0, baseH / 2 + 8.0, 0);
    group.add(labelSprite);

    const nodeObj = {
      name: table.name,
      data: table,
      recordCount: count,
      group: group,
      mesh: mesh,
      boxMat: boxMat,
      edgeLines: edgesMat,
      topPlateMat: topPlateMat,
      corePlate: corePlate,
      labelSprite: labelSprite,
      baseColor: domainColor,
      hexColor: hexColor,
      baseDims: { w: baseW, h: baseH, d: baseD },
      position: group.position
    };

    return nodeObj;
  }

  createCanvasLabel(tableName, recordCount, accentColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
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
    sprite.scale.set(30, 8.5, 1);
    sprite.userData = { canvas, ctx, texture };

    return sprite;
  }

  drawLabelCanvas(ctx, tableName, recordCount, accentColor) {
    ctx.clearRect(0, 0, 512, 144);

    // VisionOS Frosted White Pill Background with Vibrant Accent Border
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = accentColor || '#0071e3';
    ctx.lineWidth = 4.5;

    // Rounded rectangle
    const x = 8, y = 8, w = 496, h = 128, r = 24;
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

    // Pulse Status Dot on the Left
    ctx.fillStyle = accentColor || '#0071e3';
    ctx.beginPath();
    ctx.arc(36, 72, 8, 0, Math.PI * 2);
    ctx.fill();

    // Table Name (Uppercase, Apple Near-Black, Ultra-Crisp on Projectors)
    ctx.fillStyle = '#1d1d1f';
    ctx.font = 'bold 34px -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(tableName.toUpperCase(), 56, 72);

    // Record count badge on the right
    const countStr = `${recordCount} rows`;
    ctx.font = 'bold 26px "SF Mono", monospace';
    ctx.fillStyle = accentColor || '#0071e3';
    ctx.textAlign = 'right';
    ctx.fillText(countStr, 474, 72);
  }

  updateNodeLabel(node) {
    if (!node.labelSprite || !node.labelSprite.userData.ctx) return;
    const { ctx, texture } = node.labelSprite.userData;
    this.drawLabelCanvas(ctx, node.name, node.recordCount, node.hexColor);
    texture.needsUpdate = true;
  }

  updateNodeGeometryScale(node) {
    const count = node.recordCount || 0;
    const newW = 18 + Math.log2(count + 1) * 3.0;
    const newH = 6 + Math.log2(count + 1) * 1.5;
    const newD = 15 + Math.log2(count + 1) * 2.5;

    const scaleX = newW / node.baseDims.w;
    const scaleY = newH / node.baseDims.h;
    const scaleZ = newD / node.baseDims.d;

    node.mesh.scale.set(scaleX, scaleY, scaleZ);
  }

  animateNodePulse(node) {
    const initialY = node.group.position.y;
    const startTime = performance.now();
    const duration = 600;

    const pulseStep = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1.0, elapsed / duration);
      const bounce = Math.sin(progress * Math.PI) * 4.5;
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
  // RELATIONSHIP CONNECTORS & SYNAPTIC DATA FLOW
  // ==========================================================
  createRelationshipLink(srcNode, tgtNode, relData) {
    const p1 = srcNode.position;
    const p2 = tgtNode.position;

    // Midpoint elevated into an architectural arch
    const midX = (p1.x + p2.x) / 2;
    const midY = Math.max(p1.y, p2.y) + 6.0 + Math.hypot(p2.x - p1.x, p2.z - p1.z) * 0.08;
    const midZ = (p1.z + p2.z) / 2;
    const controlPoint = new THREE.Vector3(midX, midY, midZ);

    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(p1.x, p1.y, p1.z),
      controlPoint,
      new THREE.Vector3(p2.x, p2.y, p2.z)
    );

    const points = curve.getPoints(24);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    // Visible slate relationship curve
    const material = new THREE.LineBasicMaterial({
      color: 0x94a3b8,
      linewidth: 2.0,
      transparent: true,
      opacity: 0.8
    });

    const curveLine = new THREE.Line(geometry, material);

    // Traveling packet dot
    const pulseMat = new THREE.MeshBasicMaterial({ color: 0x0071e3 });
    const pulseGeo = new THREE.SphereGeometry(0.85, 12, 12);
    const pulseDot = new THREE.Mesh(pulseGeo, pulseMat);
    this.graphGroup.add(pulseDot);

    const linkObj = {
      curve: curve,
      curveLine: curveLine,
      material: material,
      pulseDot: pulseDot,
      pulseT: Math.random(),
      pulseSpeed: 0.16 + Math.random() * 0.1,
      source: srcNode.name,
      target: tgtNode.name,
      relData: relData
    };

    this.pulses.push(linkObj);
    return linkObj;
  }

  // ==========================================================
  // GEN Z WOW FACTOR: TRAFFIC PULSE BURST
  // ==========================================================
  triggerPulseBurst() {
    this.pulses.forEach(link => {
      link.pulseSpeed *= 3.0;
      link.pulseDot.scale.set(1.8, 1.8, 1.8);
      link.pulseDot.material.color.setHex(0xf59e0b); // burst amber
    });

    setTimeout(() => {
      this.pulses.forEach(link => {
        link.pulseSpeed /= 3.0;
        link.pulseDot.scale.set(1.0, 1.0, 1.0);
        link.pulseDot.material.color.setHex(0x0071e3);
      });
    }, 1200);
  }

  // ==========================================================
  // CLUSTER SPOTLIGHT FILTER (Operations / Entities / Taxonomy)
  // ==========================================================
  setCluster(clusterName) {
    this.currentCluster = clusterName;
    const activeSet = this.clusters[clusterName];

    this.nodes.forEach(node => {
      const isMatch = clusterName === 'all' || (activeSet && activeSet.has(node.name));
      if (isMatch) {
        node.boxMat.opacity = 0.94;
        node.boxMat.emissiveIntensity = 0.35;
        node.edgeLines.opacity = 1.0;
        node.labelSprite.material.opacity = 1.0;
      } else {
        node.boxMat.opacity = 0.18;
        node.boxMat.emissiveIntensity = 0.05;
        node.edgeLines.opacity = 0.15;
        node.labelSprite.material.opacity = 0.15;
      }
    });

    this.links.forEach(l => {
      const srcMatch = clusterName === 'all' || (activeSet && activeSet.has(l.source));
      const tgtMatch = clusterName === 'all' || (activeSet && activeSet.has(l.target));
      if (srcMatch && tgtMatch) {
        l.material.opacity = 0.8;
        l.pulseDot.visible = true;
      } else {
        l.material.opacity = 0.12;
        l.pulseDot.visible = false;
      }
    });
  }

  // ==========================================================
  // CAMERA FRAMING & CINEMATIC GLIDE
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
      // Top Blueprint Plan View
      this.smoothGlideCamera(new THREE.Vector3(0, 180, 0.1), new THREE.Vector3(0, 0, 0));
    } else {
      // Default Perspective 3D
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

    node.boxMat.emissiveIntensity = 0.65;

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
      this.hoveredNode.boxMat.emissiveIntensity = 0.35;
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

    this.selectedNode = node;

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
        n.boxMat.emissiveIntensity = n === node ? 0.75 : 0.45;
        n.edgeLines.opacity = 1.0;
        n.labelSprite.material.opacity = 1.0;
      } else {
        n.boxMat.opacity = 0.22;
        n.boxMat.emissiveIntensity = 0.05;
        n.edgeLines.opacity = 0.2;
        n.labelSprite.material.opacity = 0.22;
      }
    });

    // Highlight relationship curves
    this.links.forEach(l => {
      if (l.source === node.name || l.target === node.name) {
        l.material.color.setHex(0xf59e0b);
        l.material.opacity = 1.0;
      } else {
        l.material.color.setHex(0xcbd5e1);
        l.material.opacity = 0.15;
      }
    });

    // Smooth camera glide to intimate focus view
    const targetPos = new THREE.Vector3(
      node.position.x,
      node.position.y + 36,
      node.position.z + 58
    );
    this.smoothGlideCamera(targetPos, node.position);

    // Prepare enriched node data with related tables
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
    this.selectedNode = null;

    // Restore cluster or all nodes
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
      l.material.opacity = 0.8;
    });
  }

  // ==========================================================
  // RENDER LOOP & SMOOTH INTERPOLATION
  // ==========================================================
  animate() {
    this.animationFrameId = requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();

    // 1. Smooth Camera Glide Lerp (Cinematic Focus)
    if (this.targetCameraPos && this.camera) {
      this.camera.position.lerp(this.targetCameraPos, 0.06);
      if (this.controls && this.targetLookAt) {
        this.controls.target.lerp(this.targetLookAt, 0.06);
      }
      if (this.camera.position.distanceTo(this.targetCameraPos) < 0.5) {
        this.targetCameraPos = null;
      }
    }

    // 2. Subtle idle drift
    if (!this.isUserInteracting && !this.reducedMotion && this.graphGroup && !this.selectedNode && !this.targetCameraPos) {
      this.graphGroup.rotation.y += this.idleRotationSpeed;
    }

    // 3. Animate packet markers along relationship lines
    if (!this.reducedMotion) {
      this.pulses.forEach(link => {
        link.pulseT = (link.pulseT + link.pulseSpeed * delta) % 1.0;
        const pt = link.curve.getPoint(link.pulseT);
        link.pulseDot.position.copy(pt);
      });
    }

    // 4. Update controls
    if (this.controls) {
      this.controls.update();
    }

    // 5. Render scene
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  // ==========================================================
  // FALLBACK 2D SVG VISUALIZATION (Light Theme)
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

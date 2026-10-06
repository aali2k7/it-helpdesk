/**
 * IT Helpdesk & Asset Support Management System
 * 3D Database Architecture Visualizer (Three.js WebGL Engine)
 * Visualizes real MySQL schema topology, foreign-key relationships, and record volume.
 * Course: DBMS - Woxsen University | Md Aali Rahman (25WU0102156)
 */

class DatabaseVisualizer {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Visualizer container #${containerId} not found.`);
      return;
    }

    this.options = Object.assign({
      onNodeSelect: null,
      onNodeHover: null,
      onViewTable: null
    }, options);

    this.graphData = null;
    this.nodes = new Map(); // tableName -> nodeObject
    this.links = []; // array of link objects
    this.pulses = []; // animated packet markers traveling on curves
    this.selectedNode = null;
    this.hoveredNode = null;

    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.isUserInteracting = false;
    this.idleRotationSpeed = this.reducedMotion ? 0 : 0.0006;
    this.clock = new THREE.Clock();

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-1000, -1000);
    this.mouseClientPos = { x: 0, y: 0 };

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
      console.warn('WebGL or Three.js not available. Using SVG fallback.');
      this.initSvgFallback();
      return;
    }

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0d12);
    this.scene.fog = new THREE.FogExp2(0x0a0d12, 0.0035);

    // 2. Camera setup
    const rect = this.container.getBoundingClientRect();
    const aspect = (rect.width || 800) / (rect.height || 520);
    this.camera = new THREE.PerspectiveCamera(42, aspect, 1, 1000);
    this.initialCameraPos = new THREE.Vector3(0, 75, 125);
    this.camera.position.copy(this.initialCameraPos);
    this.camera.lookAt(0, 0, 0);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false
    });
    this.renderer.setSize(rect.width || 800, rect.height || 520);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.container.appendChild(this.renderer.domElement);

    // 4. Controls setup
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.06;
      this.controls.maxDistance = 260;
      this.controls.minDistance = 35;
      this.controls.maxPolarAngle = Math.PI / 2 + 0.1; // allow slight under-view
      this.controls.target.set(0, 0, 0);

      this.controls.addEventListener('start', () => { this.isUserInteracting = true; });
      this.controls.addEventListener('end', () => { 
        setTimeout(() => { this.isUserInteracting = false; }, 800); 
      });
    }

    // 5. Lighting
    this.setupLighting();

    // 6. Architectural Reference Plane / Floor Grid
    this.setupFloorGrid();

    // 7. Node Root Group
    this.graphGroup = new THREE.Group();
    this.scene.add(this.graphGroup);

    // 8. Event Listeners
    this.setupEvents();

    // 9. Start Render Loop
    this.animate = this.animate.bind(this);
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  setupLighting() {
    // Ambient light - restrained, technical illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    // Directional key light with architectural tone
    const dirLight1 = new THREE.DirectionalLight(0xe2e8f0, 0.9);
    dirLight1.position.set(50, 90, 60);
    this.scene.add(dirLight1);

    // Subtle blue-tint fill light from below
    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.35);
    dirLight2.position.set(-60, -30, -50);
    this.scene.add(dirLight2);
  }

  setupFloorGrid() {
    // Circular concentric range rings
    const ringGroup = new THREE.Group();
    const ringMat = new THREE.LineBasicMaterial({
      color: 0x1e2735,
      transparent: true,
      opacity: 0.55
    });

    [30, 60, 95, 130].forEach(radius => {
      const ringGeo = new THREE.BufferGeometry();
      const points = [];
      const segments = 64;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * radius, -12, Math.sin(theta) * radius));
      }
      ringGeo.setFromPoints(points);
      const ring = new THREE.Line(ringGeo, ringMat);
      ringGroup.add(ring);
    });

    // Technical crosshairs
    const crossMat = new THREE.LineBasicMaterial({ color: 0x18202d, transparent: true, opacity: 0.6 });
    const crossGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-140, -12, 0), new THREE.Vector3(140, -12, 0),
      new THREE.Vector3(0, -12, -140), new THREE.Vector3(0, -12, 140)
    ]);
    const cross = new THREE.LineSegments(crossGeo, crossMat);
    ringGroup.add(cross);

    this.scene.add(ringGroup);
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
    const height = rect.height || 520;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  // ==========================================================
  // GRAPH POPULATION & TOPOLOGICAL LAYOUT
  // ==========================================================
  setData(graphData) {
    this.graphData = graphData;
    this.buildGraph();
    this.playIntroAssembly();
  }

  updateData(graphData) {
    this.graphData = graphData;
    // Update node metrics smoothly without destroying current scene
    if (this.nodes.size === 0) {
      this.setData(graphData);
      return;
    }

    graphData.tables.forEach(tableData => {
      const node = this.nodes.get(tableData.name);
      if (node) {
        node.data = tableData;
        node.recordCount = tableData.record_count;
        this.updateNodeGeometryScale(node);
        this.updateNodeLabel(node);
      }
    });
  }

  buildGraph() {
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

    if (!this.graphData || !this.graphData.tables) return;

    // 1. Calculate Positions based on Relational Topology
    const positions = this.computeTopologicalPositions(this.graphData.tables, this.graphData.relationships);

    // 2. Build 3D Table Nodes
    this.graphData.tables.forEach(table => {
      const pos = positions[table.name] || { x: 0, y: 0, z: 0 };
      const node = this.createTableNode(table, pos);
      this.nodes.set(table.name, node);
      this.graphGroup.add(node.group);
    });

    // 3. Build 3D Relationship Connectors
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

    // Topological Layers based on entity importance and relationships
    // Central Hub: tickets (degree 6)
    pos['tickets'] = { x: 0, y: 4, z: 0 };

    // Ring 1 (Immediate Operational Subtypes & Lifecycle)
    pos['incidents']        = { x: -28, y: 2, z: -14 };
    pos['service_requests'] = { x: 28,  y: 2, z: -14 };
    pos['status_histories'] = { x: -16, y: -4, z: 28 };
    pos['resolutions']      = { x: 16,  y: -4, z: 28 };
    pos['assignments']      = { x: 0,   y: 14, z: -28 };

    // Ring 2 (Core Entities: Users, Assets, Staff)
    pos['users']         = { x: -48, y: 8,  z: 10 };
    pos['assets']        = { x: 48,  y: 8,  z: 10 };
    pos['support_staff'] = { x: 0,   y: 28, z: -52 };

    // Ring 3 (Organization & Taxonomy)
    pos['departments'] = { x: -74, y: 12, z: 22 };
    pos['categories']  = { x: -36, y: -8, z: -55 };
    pos['priorities']  = { x: 36,  y: -8, z: -55 };

    // Ring 4 (Asset Sub-domain)
    pos['warranties']  = { x: 74,  y: 12, z: -18 };
    pos['maintenance'] = { x: 70,  y: 2,  z: 42 };

    // Fallback for any unexpected future dynamic tables
    tables.forEach(t => {
      if (!pos[t.name]) {
        const angle = Math.random() * Math.PI * 2;
        const rad = 85 + Math.random() * 20;
        pos[t.name] = {
          x: Math.cos(angle) * rad,
          y: (Math.random() - 0.5) * 20,
          z: Math.sin(angle) * rad
        };
      }
    });

    return pos;
  }

  createTableNode(table, position) {
    const group = new THREE.Group();
    group.position.set(position.x, position.y, position.z);

    // Compute dimensions based on record count and importance
    const count = table.record_count || 0;
    const baseW = 14 + Math.log2(count + 1) * 2.8;
    const baseH = 4 + Math.log2(count + 1) * 1.2;
    const baseD = 12 + Math.log2(count + 1) * 2.4;

    // Node Box Geometry
    const boxGeo = new THREE.BoxGeometry(baseW, baseH, baseD);
    const domainColor = new THREE.Color(table.color || '#3b82f6');

    // Precision Dark Architectural Slab Material
    const boxMat = new THREE.MeshStandardMaterial({
      color: 0x131822,
      roughness: 0.35,
      metalness: 0.45,
      transparent: true,
      opacity: 0.95
    });

    const mesh = new THREE.Mesh(boxGeo, boxMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { tableName: table.name };
    group.add(mesh);

    // Crisp Architectural Wireframe Edge
    const edgesGeo = new THREE.EdgesGeometry(boxGeo);
    const edgesMat = new THREE.LineBasicMaterial({
      color: domainColor,
      transparent: true,
      opacity: 0.75,
      linewidth: 1.5
    });
    const edgeLines = new THREE.LineSegments(edgesGeo, edgesMat);
    group.add(edgeLines);

    // Subtle Top Surface Plate with Domain Accent
    const topPlateGeo = new THREE.PlaneGeometry(baseW * 0.92, baseD * 0.92);
    const topPlateMat = new THREE.MeshBasicMaterial({
      color: domainColor,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide
    });
    const topPlate = new THREE.Mesh(topPlateGeo, topPlateMat);
    topPlate.rotation.x = -Math.PI / 2;
    topPlate.position.y = baseH / 2 + 0.05;
    group.add(topPlate);

    // Billboard Text Label (Canvas Sprite)
    const labelSprite = this.createCanvasLabel(table.name, count, table.color);
    labelSprite.position.set(0, baseH / 2 + 3.8, 0);
    group.add(labelSprite);

    const nodeObj = {
      name: table.name,
      data: table,
      group: group,
      mesh: mesh,
      edgeLines: edgesMat,
      topPlateMat: topPlateMat,
      labelSprite: labelSprite,
      baseColor: domainColor,
      targetScale: 1.0,
      currentScale: 1.0,
      baseDims: { w: baseW, h: baseH, d: baseD },
      position: group.position
    };

    return nodeObj;
  }

  createCanvasLabel(tableName, recordCount, accentColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 72;
    const ctx = canvas.getContext('2d');

    this.drawLabelCanvas(ctx, tableName, recordCount, accentColor);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(13, 3.6, 1);
    sprite.userData = { canvas, ctx, texture };

    return sprite;
  }

  drawLabelCanvas(ctx, tableName, recordCount, accentColor) {
    ctx.clearRect(0, 0, 256, 72);

    // Pill background
    ctx.fillStyle = 'rgba(10, 14, 20, 0.88)';
    ctx.strokeStyle = accentColor || '#388bfd';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(8, 8, 240, 56, 8) : ctx.rect(8, 8, 240, 56);
    ctx.fill();
    ctx.stroke();

    // Table Name (Uppercase, Technical)
    ctx.fillStyle = '#f0f6fc';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(tableName.toUpperCase(), 22, 36);

    // Record count pill on the right
    const countStr = `${recordCount} rows`;
    ctx.font = 'bold 15px monospace';
    ctx.fillStyle = accentColor || '#60a5fa';
    ctx.textAlign = 'right';
    ctx.fillText(countStr, 234, 36);
  }

  updateNodeLabel(node) {
    if (!node.labelSprite || !node.labelSprite.userData.ctx) return;
    const { ctx, texture } = node.labelSprite.userData;
    this.drawLabelCanvas(ctx, node.name, node.recordCount, node.data.color);
    texture.needsUpdate = true;
  }

  updateNodeGeometryScale(node) {
    const count = node.recordCount || 0;
    const newW = 14 + Math.log2(count + 1) * 2.8;
    const newH = 4 + Math.log2(count + 1) * 1.2;
    const newD = 12 + Math.log2(count + 1) * 2.4;

    const scaleX = newW / node.baseDims.w;
    const scaleY = newH / node.baseDims.h;
    const scaleZ = newD / node.baseDims.d;

    // Smoothly scale mesh
    node.mesh.scale.set(scaleX, scaleY, scaleZ);
  }

  createRelationshipLink(srcNode, tgtNode, relData) {
    // Generate curved quadratic bezier curve between nodes
    const p1 = srcNode.position;
    const p2 = tgtNode.position;

    // Midpoint elevated slightly to produce elegant architectural arch
    const midX = (p1.x + p2.x) / 2;
    const midY = Math.max(p1.y, p2.y) + 4.5 + Math.hypot(p2.x - p1.x, p2.z - p1.z) * 0.08;
    const midZ = (p1.z + p2.z) / 2;
    const controlPoint = new THREE.Vector3(midX, midY, midZ);

    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(p1.x, p1.y, p1.z),
      controlPoint,
      new THREE.Vector3(p2.x, p2.y, p2.z)
    );

    const points = curve.getPoints(24);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    // Subtle graphite line
    const material = new THREE.LineBasicMaterial({
      color: 0x334155,
      transparent: true,
      opacity: 0.38,
      linewidth: 1.2
    });

    const curveLine = new THREE.Line(geometry, material);

    // Animated packet dot
    const pulseMat = new THREE.MeshBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.9 });
    const pulseGeo = new THREE.SphereGeometry(0.5, 8, 8);
    const pulseDot = new THREE.Mesh(pulseGeo, pulseMat);
    this.graphGroup.add(pulseDot);

    const linkObj = {
      curve: curve,
      curveLine: curveLine,
      material: material,
      pulseDot: pulseDot,
      pulseT: Math.random(), // randomized initial offset along curve
      pulseSpeed: 0.12 + Math.random() * 0.08,
      source: srcNode.name,
      target: tgtNode.name,
      relData: relData
    };

    this.pulses.push(linkObj);
    return linkObj;
  }

  // ==========================================================
  // INTRO ANIMATION (1.5 seconds assembly sequence)
  // ==========================================================
  playIntroAssembly() {
    const startTime = performance.now();
    const duration = 1400; // ms

    // Initially scale down nodes
    this.nodes.forEach(node => {
      node.group.scale.set(0.001, 0.001, 0.001);
    });

    const updateAssembly = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1.0, elapsed / duration);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);

      this.nodes.forEach(node => {
        node.group.scale.set(ease, ease, ease);
      });

      if (progress < 1.0) {
        requestAnimationFrame(updateAssembly);
      }
    };

    requestAnimationFrame(updateAssembly);
  }

  // ==========================================================
  // INTERACTION: HOVER & SELECTION
  // ==========================================================
  handlePointerMove() {
    if (this.mouse.x === -1000) return;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const meshes = Array.from(this.nodes.values()).map(n => n.mesh);
    const intersects = this.raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const mesh = intersects[0].object;
      const tableName = mesh.userData.tableName;
      const node = this.nodes.get(tableName);

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
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const meshes = Array.from(this.nodes.values()).map(n => n.mesh);
    const intersects = this.raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const mesh = intersects[0].object;
      const tableName = mesh.userData.tableName;
      const node = this.nodes.get(tableName);
      if (node) {
        this.selectNode(node);
      }
    } else {
      // Clicked in empty space -> deselect
      this.deselect();
    }
  }

  setHoveredNode(node) {
    this.hoveredNode = node;
    this.container.style.cursor = 'pointer';

    // Highlight hovered node and connected links
    this.links.forEach(l => {
      if (l.source === node.name || l.target === node.name) {
        l.material.color.setHex(0x60a5fa);
        l.material.opacity = 0.9;
      } else if (!this.selectedNode) {
        l.material.color.setHex(0x334155);
        l.material.opacity = 0.25;
      }
    });

    if (typeof this.options.onNodeHover === 'function') {
      this.options.onNodeHover(node.data, this.mouseClientPos);
    }
  }

  clearHover() {
    this.hoveredNode = null;
    this.container.style.cursor = 'default';

    if (!this.selectedNode) {
      this.resetLinkStyles();
    }

    if (typeof this.options.onNodeHover === 'function') {
      this.options.onNodeHover(null);
    }
  }

  selectNode(node) {
    this.selectedNode = node;

    // Find connected tables
    const connectedTables = new Set([node.name]);
    this.links.forEach(l => {
      if (l.source === node.name) connectedTables.add(l.target);
      if (l.target === node.name) connectedTables.add(l.source);
    });

    // Dim unconnected nodes, highlight connected ones
    this.nodes.forEach(n => {
      if (connectedTables.has(n.name)) {
        n.mesh.material.opacity = 1.0;
        n.edgeLines.opacity = 1.0;
        n.labelSprite.material.opacity = 1.0;
      } else {
        n.mesh.material.opacity = 0.25;
        n.edgeLines.opacity = 0.2;
        n.labelSprite.material.opacity = 0.25;
      }
    });

    // Highlight relevant relationship curves
    this.links.forEach(l => {
      if (l.source === node.name || l.target === node.name) {
        l.material.color.setHex(0xf59e0b);
        l.material.opacity = 1.0;
      } else {
        l.material.color.setHex(0x1e293b);
        l.material.opacity = 0.1;
      }
    });

    // Dispatch callback to update the UI Table Inspector Drawer
    if (typeof this.options.onNodeSelect === 'function') {
      this.options.onNodeSelect(node.data);
    }
  }

  deselect() {
    this.selectedNode = null;

    // Restore all nodes
    this.nodes.forEach(n => {
      n.mesh.material.opacity = 0.95;
      n.edgeLines.opacity = 0.75;
      n.labelSprite.material.opacity = 1.0;
    });

    this.resetLinkStyles();

    if (typeof this.options.onNodeSelect === 'function') {
      this.options.onNodeSelect(null);
    }
  }

  resetLinkStyles() {
    this.links.forEach(l => {
      l.material.color.setHex(0x334155);
      l.material.opacity = 0.38;
    });
  }

  resetCamera() {
    if (!this.camera || !this.controls) return;
    this.controls.reset();
    this.camera.position.copy(this.initialCameraPos);
    this.camera.lookAt(0, 0, 0);
    this.deselect();
  }

  // ==========================================================
  // RENDER LOOP & PACKET ANIMATION
  // ==========================================================
  animate() {
    this.animationFrameId = requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();

    // 1. Subtle idle drift when not actively interacting
    if (!this.isUserInteracting && !this.reducedMotion && this.graphGroup) {
      this.graphGroup.rotation.y += this.idleRotationSpeed;
    }

    // 2. Animate relationship data packets along curves
    if (!this.reducedMotion) {
      this.pulses.forEach(link => {
        link.pulseT = (link.pulseT + link.pulseSpeed * delta) % 1.0;
        const pt = link.curve.getPoint(link.pulseT);
        link.pulseDot.position.copy(pt);
      });
    }

    // 3. Update controls
    if (this.controls) {
      this.controls.update();
    }

    // 4. Render frame
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  // ==========================================================
  // FALLBACK 2D SVG VISUALIZATION (When WebGL unavailable)
  // ==========================================================
  initSvgFallback() {
    this.container.innerHTML = `
      <div class="svg-graph-fallback" style="width:100%; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; background:#0b0d10; color:#cbd5e1; padding:20px;">
        <div style="font-size:14px; font-weight:700; color:#388bfd; margin-bottom:8px;">DATABASE ARCHITECTURE // 2D TOPOLOGY FALLBACK</div>
        <p style="font-size:12px; color:#8b949e; margin-bottom:16px;">WebGL hardware acceleration unavailable. Displaying relational topology schema.</p>
        <div id="svgFallbackCanvas" style="width:100%; height:400px; overflow:hidden;"></div>
      </div>
    `;

    // Render 2D SVG graph
    setTimeout(() => {
      const el = document.getElementById('svgFallbackCanvas');
      if (!el || !this.graphData) return;
      const w = el.clientWidth || 700;
      const h = el.clientHeight || 400;

      let svgHtml = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="width:100%; height:100%;">`;
      // Lines
      svgHtml += `<g stroke="#2d3748" stroke-width="1.5">`;
      // Render simple circle nodes in grid
      const cols = 5;
      this.graphData.tables.forEach((t, i) => {
        const x = 70 + (i % cols) * (w / cols);
        const y = 50 + Math.floor(i / cols) * 110;
        svgHtml += `
          <g style="cursor:pointer;" onclick="window.dbVisualizerDispatchView('${t.name}')">
            <rect x="${x - 45}" y="${y - 20}" width="90" height="40" rx="6" fill="#161b22" stroke="${t.color || '#3b82f6'}" stroke-width="1.5" />
            <text x="${x}" y="${y - 2}" fill="#f0f6fc" font-size="11" font-weight="bold" text-anchor="middle">${t.name.toUpperCase()}</text>
            <text x="${x}" y="${y + 12}" fill="${t.color || '#388bfd'}" font-size="9.5" font-family="monospace" text-anchor="middle">${t.record_count} rows</text>
          </g>
        `;
      });
      svgHtml += `</svg>`;
      el.innerHTML = svgHtml;
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

// Global fallback helper
window.dbVisualizerDispatchView = function(tableName) {
  if (typeof switchViewForTable === 'function') {
    switchViewForTable(tableName);
  }
};

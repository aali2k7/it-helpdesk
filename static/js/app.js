/**
 * IT Helpdesk & Asset Support Management System
 * Frontend Controller & API Client (app.js)
 * Course: DBMS - Woxsen University | Md Aali Rahman (25WU0102156)
 */

// Global State
let currentActiveView = 'dashboard';
let activeTicketForDetails = null;
let pendingDeleteAction = null;
let debounceTimer = null;

// Lookup Caches
let cacheCategories = [];
let cachePriorities = [];
let cacheUsers = [];
let cacheStaff = [];
let cacheDepartments = [];
let cacheWarranties = [];

// Pre-configured Demonstration SQL Queries
const SQL_QUERIES = {
  audit_trail: {
    title: "1. Complete Ticket Audit Trail",
    desc: "Chronological status history log demonstrating immutable audit trail (old_status NULL -> 'Open' -> 'In Progress' -> 'Resolved').",
    sql: `SELECT 
    t.ticket_no,
    t.title,
    COALESCE(sh.old_status, 'Initial (None)') AS old_status,
    sh.new_status,
    DATE_FORMAT(sh.changed_at, '%Y-%m-%d %H:%i:%s') AS transition_timestamp
FROM status_histories sh
JOIN tickets t ON sh.ticket_id = t.ticket_id
ORDER BY t.ticket_no ASC, sh.changed_at ASC;`
  },
  staff_workload: {
    title: "2. Active Support Staff Workload",
    desc: "Aggregated active tickets vs resolved tickets assigned to each technician using GROUP BY and CASE expressions.",
    sql: `SELECT 
    s.name AS technician,
    s.specialization,
    COUNT(a.assignment_id) AS total_assigned_tickets,
    SUM(CASE WHEN t.status IN ('Open', 'In Progress', 'Pending') THEN 1 ELSE 0 END) AS active_tickets,
    SUM(CASE WHEN t.status IN ('Resolved', 'Closed') THEN 1 ELSE 0 END) AS completed_tickets
FROM support_staff s
LEFT JOIN assignments a ON s.staff_id = a.staff_id
LEFT JOIN tickets t ON a.ticket_id = t.ticket_id
GROUP BY s.staff_id, s.name, s.specialization
ORDER BY active_tickets DESC;`
  },
  department_maint: {
    title: "3. Maintenance Costs per Department",
    desc: "Relational 4-table JOIN aggregating total hardware servicing costs incurred across departments.",
    sql: `SELECT 
    d.name AS department_name,
    COUNT(DISTINCT a.asset_id) AS total_assets,
    CONCAT('$', FORMAT(COALESCE(SUM(m.cost), 0.00), 2)) AS total_maintenance_spent
FROM departments d
LEFT JOIN users u ON d.department_id = u.department_id
LEFT JOIN assets a ON u.user_id = a.user_id
LEFT JOIN maintenance m ON a.asset_id = m.asset_id
GROUP BY d.department_id, d.name
ORDER BY SUM(m.cost) DESC;`
  },
  expiring_warranties: {
    title: "4. Expiring Hardware Warranties",
    desc: "Hardware asset inventory cross-referenced with manufacturer warranties calculating days until expiry.",
    sql: `SELECT 
    a.asset_tag,
    a.name AS asset_name,
    w.provider AS warranty_provider,
    DATE_FORMAT(w.end_date, '%Y-%m-%d') AS expiry_date,
    DATEDIFF(w.end_date, CURDATE()) AS days_remaining
FROM assets a
JOIN warranties w ON a.warranty_id = w.warranty_id
ORDER BY days_remaining ASC;`
  },
  ticket_subtypes: {
    title: "5. Ticket Subtypes: Incidents vs Service Requests",
    desc: "Demonstrates relational entity inheritance modeling between parent tickets and subtype tables.",
    sql: `SELECT 
    t.ticket_no,
    t.title,
    t.status,
    CASE 
        WHEN i.ticket_id IS NOT NULL THEN 'Incident'
        WHEN sr.ticket_id IS NOT NULL THEN 'Service Request'
        ELSE 'Standard'
    END AS subtype_class,
    COALESCE(i.incident_type, sr.request_type, '-') AS subtype_specific_attribute
FROM tickets t
LEFT JOIN incidents i ON t.ticket_id = i.ticket_id
LEFT JOIN service_requests sr ON t.ticket_id = sr.ticket_id
ORDER BY t.ticket_id ASC;`
  }
};

// ==========================================================
// INITIALIZATION
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  checkDatabaseStatus();
  loadAllLookups();
  loadDashboard();
  initDbVisualizer();
  updateSqlDisplay();

  // Ping DB button
  document.getElementById('btnRefreshDb').addEventListener('click', () => {
    checkDatabaseStatus(true);
  });

  // Handle URL query parameters for direct navigation and demo capture
  const urlParams = new URLSearchParams(window.location.search);
  const targetView = urlParams.get('view');
  const targetModal = urlParams.get('modal');
  const ticketId = urlParams.get('ticket_id');

  if (targetView) {
    switchView(targetView);
  }

  if (targetModal === 'ticket') {
    setTimeout(openTicketModal, 150);
  } else if (targetModal === 'user') {
    setTimeout(openUserModal, 150);
  } else if (targetModal === 'asset') {
    setTimeout(openAssetModal, 150);
  } else if (targetModal === 'details') {
    setTimeout(() => viewTicketDetails(ticketId ? parseInt(ticketId) : 1), 200);
  } else if (targetModal === 'delete') {
    setTimeout(() => confirmDeleteTicket(ticketId ? parseInt(ticketId) : 5, 'TKT-005', 'Request second monitor for software engineering'), 200);
  }

  const selectTable = urlParams.get('select_table');
  if (selectTable) {
    setTimeout(() => {
      if (window.dbVisualizer && window.dbVisualizer.nodes) {
        const node = window.dbVisualizer.nodes.get(selectTable);
        if (node) window.dbVisualizer.selectNode(node);
      }
    }, 600);
  }
});


// ==========================================================
// NAVIGATION CONTROLLER
// ==========================================================
function setupNavigation() {
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item[data-view]');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const view = item.getAttribute('data-view');
      switchView(view);
    });
  });
}

function switchView(viewName) {
  currentActiveView = viewName;

  // Update navigation styles
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(el => {
    if (el.getAttribute('data-view') === viewName) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });

  // Switch visible panel
  document.querySelectorAll('.view-panel').forEach(panel => {
    panel.classList.remove('active');
  });

  const targetPanel = document.getElementById(`view-${viewName}`);
  if (targetPanel) {
    targetPanel.classList.add('active');
  }

  // Load relevant data
  switch (viewName) {
    case 'dashboard':
      loadDashboard();
      if (window.dbVisualizerInstance) {
        setTimeout(() => window.dbVisualizerInstance.onWindowResize(), 50);
      }
      break;
    case 'tickets':
      loadTickets();
      break;
    case 'users':
      loadUsers();
      break;
    case 'assets':
      loadAssets();
      break;
    case 'incidents':
      loadIncidents();
      break;
    case 'service-requests':
      loadServiceRequests();
      break;
    case 'staff':
      loadStaff();
      break;
    case 'departments':
      loadDepartments();
      break;
    case 'maintenance':
      loadMaintenance();
      break;
    case 'sql':
      updateSqlDisplay();
      break;
  }
}

// ==========================================================
// LIVE DATABASE STATUS CHECK
// ==========================================================
async function checkDatabaseStatus(showNotification = false) {
  const pill = document.getElementById('dbStatusPill');
  const text = document.getElementById('dbStatusText');

  text.textContent = 'Pinging MySQL...';

  try {
    const res = await fetch('/api/status');
    const data = await res.json();

    if (data.connected) {
      pill.className = 'db-status-pill connected';
      text.textContent = `MySQL Connected (${data.database})`;
      pill.title = `Host: ${data.host}:${data.port} | Engine: ${data.version} | Tables: ${data.tables_count}`;
      if (showNotification) {
        showToast('Database Online', `Connected to MySQL database '${data.database}' successfully.`, 'success');
      }
    } else {
      pill.className = 'db-status-pill offline';
      text.textContent = 'Database Offline';
      pill.title = data.error || 'Cannot connect to MySQL server.';
      showToast('Database Connection Warning', data.error || 'Ensure MySQL is running on localhost:3306.', 'error', 6000);
    }
  } catch (err) {
    pill.className = 'db-status-pill offline';
    text.textContent = 'Database Offline';
    showToast('Database Offline', 'Backend server could not reach MySQL. Please check MySQL service.', 'error', 6000);
  }
}

// ==========================================================
// LOOKUP PRE-FETCHING & POPULATION
// ==========================================================
async function loadAllLookups() {
  try {
    const [catsRes, prisRes, usersRes, staffRes, deptsRes, warsRes] = await Promise.all([
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/priorities').then(r => r.json()),
      fetch('/api/users').then(r => r.json()),
      fetch('/api/support-staff').then(r => r.json()),
      fetch('/api/departments').then(r => r.json()),
      fetch('/api/warranties').then(r => r.json())
    ]);

    cacheCategories = catsRes.categories || [];
    cachePriorities = prisRes.priorities || [];
    cacheUsers = usersRes.users || [];
    cacheStaff = staffRes.support_staff || [];
    cacheDepartments = deptsRes.departments || [];
    cacheWarranties = warsRes.warranties || [];

    populateSelectElements();
  } catch (err) {
    console.error('Failed to load lookup caches:', err);
  }
}

function populateSelectElements() {
  // 1. Categories dropdowns
  const catFilter = document.getElementById('tickets-filter-category');
  const catSelect = document.getElementById('ticket-input-category');
  const assetCatSelect = document.getElementById('asset-input-cat');

  if (catFilter) {
    catFilter.innerHTML = '<option value="">All Categories</option>' + 
      cacheCategories.map(c => `<option value="${c.category_id}">${escapeHtml(c.name)}</option>`).join('');
  }
  if (catSelect) {
    catSelect.innerHTML = '<option value="">Select Category...</option>' +
      cacheCategories.map(c => `<option value="${c.category_id}">${escapeHtml(c.name)}</option>`).join('');
  }
  if (assetCatSelect) {
    assetCatSelect.innerHTML = '<option value="">Select Category...</option>' +
      cacheCategories.map(c => `<option value="${c.category_id}">${escapeHtml(c.name)}</option>`).join('');
  }

  // 2. Priorities dropdown
  const priSelect = document.getElementById('ticket-input-priority');
  if (priSelect) {
    priSelect.innerHTML = '<option value="">Select Priority...</option>' +
      cachePriorities.map(p => `<option value="${p.priority_id}">${escapeHtml(p.name)} (Level ${p.level})</option>`).join('');
  }

  // 3. Users dropdowns
  const userTicketSelect = document.getElementById('ticket-input-user');
  const userAssetSelect = document.getElementById('asset-input-user');

  if (userTicketSelect) {
    userTicketSelect.innerHTML = '<option value="">Select User...</option>' +
      cacheUsers.map(u => `<option value="${u.user_id}">${escapeHtml(u.name)} (${escapeHtml(u.department_name || 'User')})</option>`).join('');
  }
  if (userAssetSelect) {
    userAssetSelect.innerHTML = '<option value="">Unassigned (In Inventory)</option>' +
      cacheUsers.map(u => `<option value="${u.user_id}">${escapeHtml(u.name)} (${escapeHtml(u.email)})</option>`).join('');
  }

  // 4. Departments dropdown
  const deptSelect = document.getElementById('user-input-dept');
  if (deptSelect) {
    deptSelect.innerHTML = '<option value="">Select Department...</option>' +
      cacheDepartments.map(d => `<option value="${d.department_id}">${escapeHtml(d.name)} (${escapeHtml(d.location)})</option>`).join('');
  }

  // 5. Support Staff dropdown
  const staffSelect = document.getElementById('status-staff-select');
  if (staffSelect) {
    staffSelect.innerHTML = '<option value="">Keep current assignment</option>' +
      cacheStaff.map(s => `<option value="${s.staff_id}">${escapeHtml(s.name)} - ${escapeHtml(s.specialization)}</option>`).join('');
  }

  // 6. Warranties dropdown
  const warSelect = document.getElementById('asset-input-warranty');
  if (warSelect) {
    warSelect.innerHTML = '<option value="">None / Standard</option>' +
      cacheWarranties.map(w => `<option value="${w.warranty_id}">${escapeHtml(w.provider)} (Expires: ${w.end_date})</option>`).join('');
  }
}

// ==========================================================
// 1. DASHBOARD CONTROLLER & 3D DATABASE VISUALIZER
// ==========================================================
let dbVisualizerInstance = null;
let selectedInspectorTable = null;

function initDbVisualizer() {
  const container = document.getElementById('dbVisualizerContainer');
  if (!container) return;

  if (typeof DatabaseVisualizer === 'undefined') {
    console.warn('DatabaseVisualizer script not yet loaded, retrying...');
    setTimeout(initDbVisualizer, 100);
    return;
  }

  try {
    dbVisualizerInstance = new DatabaseVisualizer('dbVisualizerContainer', {
      onSelectNode: handleVisualizerNodeSelected,
      onHoverNode: handleVisualizerNodeHovered
    });
    window.dbVisualizerInstance = dbVisualizerInstance;
    window.dbVisualizer = dbVisualizerInstance;
    window.refreshDatabaseGraph = refreshDatabaseVisualizer;
    dbVisualizerInstance.loadGraph('/api/database/graph');
  } catch (err) {
    console.error('Failed to initialize 3D Database Visualizer:', err);
  }
}

function refreshDatabaseVisualizer() {
  if (dbVisualizerInstance) {
    dbVisualizerInstance.refresh('/api/database/graph');
  }
}
window.refreshDatabaseGraph = refreshDatabaseVisualizer;

function handleVisualizerNodeSelected(node) {
  const inspector = document.getElementById('hud-node-inspector');
  if (!inspector) return;

  if (!node) {
    inspector.style.display = 'none';
    selectedInspectorTable = null;
    return;
  }

  selectedInspectorTable = node.name;
  inspector.style.display = 'block';

  // Table Name
  const nameEl1 = document.getElementById('inspector-table-name');
  if (nameEl1) nameEl1.textContent = node.name.toUpperCase();
  const nameEl2 = document.getElementById('insp-table-name');
  if (nameEl2) nameEl2.textContent = node.name.toUpperCase();

  // Record Count
  const countEl1 = document.getElementById('inspector-record-count');
  if (countEl1) countEl1.textContent = `${node.recordCount} rows`;
  const countEl2 = document.getElementById('insp-records');
  if (countEl2) countEl2.textContent = `${node.recordCount}`;

  // Primary Key
  const pkEl1 = document.getElementById('inspector-pk');
  if (pkEl1) pkEl1.textContent = node.primary_key || node.primaryKey || 'None';
  const pkEl2 = document.getElementById('insp-pk');
  if (pkEl2) pkEl2.textContent = node.primary_key || node.primaryKey || 'None';

  // Foreign Keys
  const fks = (node.foreign_keys || node.foreignKeys || []);
  const fkText = fks.length > 0
    ? fks.map(fk => typeof fk === 'string' ? fk : `${fk.column} -> ${fk.referenced_table}`).join(', ')
    : 'None';
  const fkEl1 = document.getElementById('inspector-fks');
  if (fkEl1) fkEl1.textContent = fkText;
  const fkEl2 = document.getElementById('insp-fks');
  if (fkEl2) fkEl2.textContent = `${fks.length} FKs`;

  // Columns & Domain
  const cols = node.columns || [];
  const colEl = document.getElementById('insp-cols');
  if (colEl) colEl.textContent = `${cols.length || 'Schema'} columns`;

  const domainEl = document.getElementById('insp-domain');
  if (domainEl) {
    const domainMap = {
      tickets: 'CORE OPERATIONS',
      incidents: 'INCIDENT MGMT',
      service_requests: 'SERVICE DESK',
      assets: 'HARDWARE ASSETS',
      users: 'IDENTITY / USERS',
      departments: 'ORGANIZATION',
      support_staff: 'HUMAN RESOURCES',
      maintenance: 'HARDWARE SERVICING',
      warranties: 'CONTRACTS'
    };
    domainEl.textContent = domainMap[node.name] || 'RELATIONAL ENTITY';
  }

  const relsContainer = document.getElementById('inspector-rels');
  if (relsContainer) {
    const relTables = node.relatedTables || [];
    if (relTables.length > 0) {
      relsContainer.innerHTML = relTables.map(t => `<span class="inspector-rel-tag">${escapeHtml(t)}</span>`).join('');
    } else {
      relsContainer.innerHTML = '<span style="color: var(--text-muted); font-size: 11px;">Standalone entity</span>';
    }
  }
}

function handleVisualizerNodeHovered(node) {
  // Optional hover feedback
}

function closeNodeInspector() {
  const inspector = document.getElementById('hud-node-inspector');
  if (inspector) inspector.style.display = 'none';
  if (dbVisualizerInstance) {
    dbVisualizerInstance.deselect();
  }
  selectedInspectorTable = null;
}
window.closeNodeInspector = closeNodeInspector;

let currentCameraMode = 'perspective';

function setVisualizerCluster(clusterName, btnEl) {
  if (btnEl && btnEl.parentElement) {
    btnEl.parentElement.querySelectorAll('.cluster-btn').forEach(b => b.classList.remove('active'));
    btnEl.classList.add('active');
  }
  if (window.dbVisualizer) {
    window.dbVisualizer.setCluster(clusterName);
  }
}
window.setVisualizerCluster = setVisualizerCluster;

function triggerVisualizerPulse() {
  if (window.dbVisualizer) {
    window.dbVisualizer.triggerPulseBurst();
    showToast('Synaptic Pulse', 'Live relational signals propagated through foreign keys.', 'info', 2200);
  }
}
window.triggerVisualizerPulse = triggerVisualizerPulse;

function toggleCameraView(btnEl) {
  if (!window.dbVisualizer) return;
  if (currentCameraMode === 'perspective') {
    currentCameraMode = 'top';
    window.dbVisualizer.setCameraView('top');
    if (btnEl) btnEl.textContent = 'Spatial 3D';
  } else {
    currentCameraMode = 'perspective';
    window.dbVisualizer.setCameraView('perspective');
    if (btnEl) btnEl.textContent = '⤢ Top Plan';
  }
}
window.toggleCameraView = toggleCameraView;

function resetVisualizerCamera() {
  currentCameraMode = 'perspective';
  const planBtn = document.getElementById('btn-toggle-camera-plan');
  if (planBtn) planBtn.textContent = '⤢ Top Plan';

  document.querySelectorAll('.cluster-btn').forEach(b => {
    if (b.textContent.includes('All')) b.classList.add('active');
    else b.classList.remove('active');
  });

  if (window.dbVisualizer) {
    window.dbVisualizer.resetCamera();
  }
}
window.resetVisualizerCamera = resetVisualizerCamera;

function inspectNodeViewRecords() {
  if (!selectedInspectorTable) return;
  const tableMapping = {
    'tickets': 'tickets',
    'incidents': 'incidents',
    'service_requests': 'service-requests',
    'assets': 'assets',
    'users': 'users',
    'support_staff': 'staff',
    'departments': 'departments',
    'maintenance': 'maintenance',
    'warranties': 'assets',
    'categories': 'tickets',
    'priorities': 'tickets',
    'resolutions': 'tickets',
    'assignments': 'tickets',
    'status_histories': 'sql-verify'
  };
  const targetView = tableMapping[selectedInspectorTable] || 'tickets';
  switchView(targetView);
}
window.inspectNodeViewRecords = inspectNodeViewRecords;

async function loadDashboard() {
  try {
    const res = await fetch('/api/stats');
    const data = await res.json();

    if (data.error) {
      showToast('Dashboard Error', data.error, 'error');
      return;
    }

    // Update Metric Cards / Editorial Rail
    document.getElementById('stat-total-tickets').textContent = data.total_tickets || 0;
    document.getElementById('stat-open-tickets').textContent = data.open_tickets || 0;
    document.getElementById('stat-resolved-tickets').textContent = data.resolved_tickets || 0;
    document.getElementById('stat-total-assets').textContent = data.total_assets || 0;
    document.getElementById('stat-total-users').textContent = data.total_users || 0;
    document.getElementById('stat-total-maint').textContent = '$' + (data.total_maintenance_cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Update HUD metrics in Hero visualizer
    const hudTables = document.getElementById('hud-metric-tables');
    if (hudTables && data.total_tables) hudTables.textContent = data.total_tables;
    const hudRecords = document.getElementById('hud-metric-records');
    if (hudRecords && data.total_records) hudRecords.textContent = data.total_records;

    // Refresh 3D visualizer data
    refreshDatabaseVisualizer();

    // Update Sidebar Badges
    const badgeOpen = document.getElementById('badge-open-tickets');
    if (badgeOpen) badgeOpen.textContent = data.open_tickets || 0;
    const badgeAssets = document.getElementById('badge-total-assets');
    if (badgeAssets) badgeAssets.textContent = data.total_assets || 0;

    // Render Recent Tickets
    const tbody = document.getElementById('dashboard-recent-tbody');
    if (!data.recent_tickets || data.recent_tickets.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No tickets registered in MySQL yet.</td></tr>';
      return;
    }

    tbody.innerHTML = data.recent_tickets.map(t => `
      <tr>
        <td><span class="mono-pill">${escapeHtml(t.ticket_no)}</span></td>
        <td><strong>${escapeHtml(t.title)}</strong></td>
        <td>${escapeHtml(t.user_name)}</td>
        <td>${escapeHtml(t.category_name)}</td>
        <td><span class="priority-${t.priority_level}">${escapeHtml(t.priority_name)}</span></td>
        <td>${renderStatusBadge(t.status)}</td>
        <td style="font-family: var(--font-mono); font-size: 11px;">${escapeHtml(t.created_at)}</td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="viewTicketDetails(${t.ticket_id})">View</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Failed to load dashboard:', err);
  }
}

// ==========================================================
// 2. TICKETS CONTROLLER (VIEW, INSERT, DELETE, STATUS)
// ==========================================================
function debounceTicketsSearch() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    loadTickets();
  }, 250);
}

async function loadTickets() {
  const tbody = document.getElementById('tickets-tbody');
  const countLabel = document.getElementById('tickets-count-label');

  const search = document.getElementById('tickets-search')?.value.trim() || '';
  const status = document.getElementById('tickets-filter-status')?.value || 'all';
  const category = document.getElementById('tickets-filter-category')?.value || '';
  const type = document.getElementById('tickets-filter-type')?.value || '';

  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (status && status !== 'all') params.append('status', status);
  if (category) params.append('category_id', category);
  if (type) params.append('type', type);

  try {
    const res = await fetch(`/api/tickets?${params.toString()}`);
    const data = await res.json();

    if (data.error) {
      tbody.innerHTML = `<tr><td colspan="9" class="empty-state" style="color: var(--accent-red);">${escapeHtml(data.error)}</td></tr>`;
      return;
    }

    const tickets = data.tickets || [];
    countLabel.textContent = `Showing ${tickets.length} ticket${tickets.length === 1 ? '' : 's'}`;

    if (tickets.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="empty-state">
            <div class="empty-state-icon">🎫</div>
            <h4>No Tickets Found</h4>
            <p>No matching tickets exist in the MySQL database.</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = tickets.map(t => {
      const typeBadgeClass = t.ticket_type === 'Incident' ? 'tag-incident' : 'tag-service-request';
      return `
        <tr>
          <td><span class="mono-pill">${escapeHtml(t.ticket_no)}</span></td>
          <td>
            <div style="font-weight: 600; color: var(--text-primary);">${escapeHtml(t.title)}</div>
            <div style="font-size: 11px; color: var(--text-muted);">${escapeHtml(t.category_name)}</div>
          </td>
          <td>
            <span class="badge ${typeBadgeClass}">${escapeHtml(t.ticket_type)}</span>
            <div style="font-size: 11px; color: var(--text-secondary); margin-top: 3px;">${escapeHtml(t.subtype_detail)}</div>
          </td>
          <td>
            <div style="font-weight: 500;">${escapeHtml(t.user_name)}</div>
            <div style="font-size: 11px; color: var(--text-muted);">${escapeHtml(t.user_email)}</div>
          </td>
          <td>${escapeHtml(t.department_name || '-')}</td>
          <td><span class="priority-${t.priority_level}">${escapeHtml(t.priority_name)}</span></td>
          <td>${renderStatusBadge(t.status)}</td>
          <td style="font-family: var(--font-mono); font-size: 11.5px; white-space: nowrap;">${escapeHtml(t.created_at_fmt)}</td>
          <td>
            <div style="display: flex; gap: 6px;">
              <button class="btn btn-secondary btn-sm" onclick="viewTicketDetails(${t.ticket_id})" title="View Details & Audit Trail">
                View
              </button>
              <button class="btn btn-secondary btn-sm" onclick="openStatusModal(${t.ticket_id}, '${t.status}', '${escapeHtml(t.ticket_no)}')" title="Update Status / Assign">
                Update
              </button>
              <button class="btn btn-danger btn-sm" onclick="confirmDeleteTicket(${t.ticket_id}, '${escapeHtml(t.ticket_no)}', '${escapeHtml(t.title)}')" title="Delete from MySQL">
                Delete
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9" class="empty-state">Failed to load tickets: ${err.message}</td></tr>`;
  }
}

// ----------------------------------------------------------
// Ticket Details & Audit Trail (VIEW)
// ----------------------------------------------------------
async function viewTicketDetails(ticketId) {
  try {
    const res = await fetch(`/api/tickets/${ticketId}`);
    const data = await res.json();

    if (data.error) {
      showToast('Error', data.error, 'error');
      return;
    }

    activeTicketForDetails = data;
    const t = data.ticket;

    document.getElementById('td-ticket-no').textContent = t.ticket_no;
    document.getElementById('td-title').textContent = t.title;
    document.getElementById('td-desc').textContent = t.description;
    document.getElementById('td-user').textContent = `${t.user_name} (${t.user_email})`;
    document.getElementById('td-dept').textContent = `${t.department_name} [${t.department_location}]`;
    document.getElementById('td-category').textContent = t.category_name;
    document.getElementById('td-priority').textContent = `${t.priority_name} (Level ${t.priority_level})`;
    document.getElementById('td-created').textContent = t.created_at_fmt;

    // Badges
    const statusBadge = document.getElementById('td-status-badge');
    statusBadge.className = 'badge ' + getStatusBadgeClass(t.status);
    statusBadge.textContent = t.status;

    const typeBadge = document.getElementById('td-type-badge');
    typeBadge.className = 'badge ' + (t.ticket_type === 'Incident' ? 'tag-incident' : 'tag-service-request');
    typeBadge.textContent = `${t.ticket_type}: ${t.subtype_detail}`;

    // Assigned Technicians
    const assignContainer = document.getElementById('td-assignments-container');
    if (data.assignments && data.assignments.length > 0) {
      assignContainer.innerHTML = data.assignments.map(a => `
        <div style="background-color: var(--bg-card); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); margin-bottom: 6px;">
          <strong>${escapeHtml(a.staff_name)}</strong> (${escapeHtml(a.specialization)})
          <span style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); float: right;">Assigned: ${a.assigned_at}</span>
        </div>
      `).join('');
    } else {
      assignContainer.innerHTML = '<span style="color: var(--text-muted); font-style: italic;">No technician assigned yet.</span>';
    }

    // Status History Timeline Audit Trail
    const timelineContainer = document.getElementById('td-timeline-container');
    if (data.status_histories && data.status_histories.length > 0) {
      timelineContainer.innerHTML = data.status_histories.map(h => `
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <div class="timeline-header">
              <span style="font-weight: 600; font-size: 12.5px;">
                ${escapeHtml(h.old_status)} &rarr; <span style="color: var(--accent-blue);">${escapeHtml(h.new_status)}</span>
              </span>
              <span class="timeline-time">${escapeHtml(h.changed_at)}</span>
            </div>
            <div style="font-size: 11.5px; color: var(--text-secondary);">State transition recorded in MySQL status_histories</div>
          </div>
        </div>
      `).join('');
    } else {
      timelineContainer.innerHTML = '<div style="color: var(--text-muted); font-size: 12px;">No historical transitions recorded.</div>';
    }

    // Resolution Record
    const resBox = document.getElementById('td-resolution-box');
    if (data.resolution) {
      resBox.style.display = 'block';
      document.getElementById('td-resolution-desc').textContent = data.resolution.description;
      document.getElementById('td-resolution-time').textContent = `Resolved At: ${data.resolution.resolved_at}`;
    } else {
      resBox.style.display = 'none';
    }

    openModal('modal-ticket-details');
  } catch (err) {
    showToast('Failed', `Could not fetch ticket details: ${err.message}`, 'error');
  }
}

function openStatusModalFromDetails() {
  closeModal('modal-ticket-details');
  if (activeTicketForDetails && activeTicketForDetails.ticket) {
    const t = activeTicketForDetails.ticket;
    openStatusModal(t.ticket_id, t.status, t.ticket_no);
  }
}

// ----------------------------------------------------------
// Create Ticket Form (INSERT)
// ----------------------------------------------------------
function openTicketModal() {
  document.getElementById('form-create-ticket').reset();
  toggleSubtypeFields();
  openModal('modal-ticket');
}

function openTicketModalWithSubtype(type) {
  openTicketModal();
  if (type === 'Incident') {
    document.getElementById('type-incident').checked = true;
  } else {
    document.getElementById('type-request').checked = true;
  }
  toggleSubtypeFields();
}

function toggleSubtypeFields() {
  const isIncident = document.getElementById('type-incident').checked;
  const label = document.getElementById('subtype-detail-label');
  const input = document.getElementById('ticket-input-subtype');
  const help = document.getElementById('subtype-detail-help');

  if (isIncident) {
    label.innerHTML = 'Incident Type <span class="req">*</span>';
    input.placeholder = 'e.g. Hardware Malfunction, System Crash, Network Outage';
    help.textContent = 'Will be inserted into the incidents relational subtype table.';
  } else {
    label.innerHTML = 'Service Request Type <span class="req">*</span>';
    input.placeholder = 'e.g. Access Provisioning, Hardware Allocation, Software Installation';
    help.textContent = 'Will be inserted into the service_requests relational subtype table.';
  }
}

async function handleCreateTicket(event) {
  event.preventDefault();
  const btn = document.getElementById('btn-submit-ticket');
  btn.disabled = true;
  btn.textContent = 'Executing SQL INSERT...';

  const isIncident = document.getElementById('type-incident').checked;
  const payload = {
    user_id: document.getElementById('ticket-input-user').value,
    priority_id: document.getElementById('ticket-input-priority').value,
    category_id: document.getElementById('ticket-input-category').value,
    ticket_type: isIncident ? 'Incident' : 'Service Request',
    subtype_detail: document.getElementById('ticket-input-subtype').value.trim(),
    title: document.getElementById('ticket-input-title').value.trim(),
    description: document.getElementById('ticket-input-desc').value.trim()
  };

  try {
    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (!res.ok || data.error) {
      showToast('Insertion Failed', data.error || 'Database rejected insertion.', 'error');
      btn.disabled = false;
      btn.textContent = 'Create Ticket in MySQL';
      return;
    }

    // Success: Step 5.B
    showToast('Ticket Created!', `${data.message} (Assigned: ${data.ticket_no})`, 'success');
    closeModal('modal-ticket');
    document.getElementById('form-create-ticket').reset();

    // Live immediate UI updates
    loadTickets();
    loadDashboard();
    if (currentActiveView === 'incidents') loadIncidents();
    if (currentActiveView === 'service-requests') loadServiceRequests();

  } catch (err) {
    showToast('Network Error', err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Create Ticket in MySQL';
  }
}

// ----------------------------------------------------------
// Update Status / Assignment Modal
// ----------------------------------------------------------
function openStatusModal(ticketId, currentStatus, ticketNo) {
  document.getElementById('status-ticket-id').value = ticketId;
  document.getElementById('status-modal-title').textContent = `Update Status: ${ticketNo}`;
  document.getElementById('status-select').value = currentStatus;
  document.getElementById('status-staff-select').value = '';
  document.getElementById('status-resolution-desc').value = '';
  toggleResolutionInput();
  openModal('modal-status');
}

function toggleResolutionInput() {
  const status = document.getElementById('status-select').value;
  const resGroup = document.getElementById('group-resolution-desc');
  const resInput = document.getElementById('status-resolution-desc');
  if (status === 'Resolved') {
    resGroup.style.display = 'block';
    resInput.required = true;
  } else {
    resGroup.style.display = 'none';
    resInput.required = false;
  }
}

async function handleUpdateStatus(event) {
  event.preventDefault();
  const ticketId = document.getElementById('status-ticket-id').value;
  const status = document.getElementById('status-select').value;
  const staffId = document.getElementById('status-staff-select').value;
  const resolutionDesc = document.getElementById('status-resolution-desc').value.trim();

  try {
    // 1. Update Status
    const res = await fetch(`/api/tickets/${ticketId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: status, resolution_description: resolutionDesc })
    });
    const data = await res.json();

    if (!res.ok || data.error) {
      showToast('Status Update Failed', data.error, 'error');
      return;
    }

    // 2. Assign staff if selected
    if (staffId) {
      await fetch(`/api/tickets/${ticketId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staff_id: staffId })
      });
    }

    showToast('Status Updated', data.message, 'success');
    closeModal('modal-status');
    loadTickets();
    loadDashboard();
  } catch (err) {
    showToast('Error', err.message, 'error');
  }
}

// ----------------------------------------------------------
// Delete Ticket (DELETE)
// ----------------------------------------------------------
function confirmDeleteTicket(ticketId, ticketNo, title) {
  pendingDeleteAction = {
    type: 'ticket',
    id: ticketId,
    endpoint: `/api/tickets/${ticketId}`,
    identifier: ticketNo,
    title: title
  };

  document.getElementById('del-record-type').textContent = 'Ticket';
  document.getElementById('del-record-identifier').textContent = ticketNo;
  document.getElementById('del-record-title').textContent = title;

  openModal('modal-delete');
}

// ==========================================================
// 3. USERS CONTROLLER (VIEW, INSERT, DELETE)
// ==========================================================
async function loadUsers() {
  const tbody = document.getElementById('users-tbody');
  const countLabel = document.getElementById('users-count-label');

  try {
    const res = await fetch('/api/users');
    const data = await res.json();

    if (data.error) {
      tbody.innerHTML = `<tr><td colspan="8" class="empty-state">${escapeHtml(data.error)}</td></tr>`;
      return;
    }

    cacheUsers = data.users || [];
    countLabel.textContent = `Showing ${cacheUsers.length} user${cacheUsers.length === 1 ? '' : 's'}`;

    if (cacheUsers.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No users registered in MySQL.</td></tr>';
      return;
    }

    tbody.innerHTML = cacheUsers.map(u => `
      <tr>
        <td><span class="mono-pill">#${u.user_id}</span></td>
        <td><strong>${escapeHtml(u.name)}</strong></td>
        <td>${escapeHtml(u.email)}</td>
        <td>${escapeHtml(u.department_name)}</td>
        <td>${escapeHtml(u.department_location)}</td>
        <td>
          <span class="badge ${u.total_tickets > 0 ? 'badge-open' : 'badge-closed'}">
            ${u.total_tickets} ticket${u.total_tickets === 1 ? '' : 's'}
          </span>
        </td>
        <td>${u.total_assets} device${u.total_assets === 1 ? '' : 's'}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="confirmDeleteUser(${u.user_id}, '${escapeHtml(u.name)}')">
            Delete
          </button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-state">Failed to load users: ${err.message}</td></tr>`;
  }
}

function openUserModal() {
  document.getElementById('form-create-user').reset();
  openModal('modal-user');
}

async function handleCreateUser(event) {
  event.preventDefault();
  const payload = {
    name: document.getElementById('user-input-name').value.trim(),
    email: document.getElementById('user-input-email').value.trim(),
    department_id: document.getElementById('user-input-dept').value
  };

  try {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (!res.ok || data.error) {
      showToast('Registration Error', data.error, 'error');
      return;
    }

    showToast('User Created', data.message, 'success');
    closeModal('modal-user');
    loadUsers();
    loadDashboard();
    loadAllLookups();
  } catch (err) {
    showToast('Error', err.message, 'error');
  }
}

function confirmDeleteUser(userId, name) {
  pendingDeleteAction = {
    type: 'user',
    id: userId,
    endpoint: `/api/users/${userId}`,
    identifier: `User ID #${userId}`,
    title: name
  };

  document.getElementById('del-record-type').textContent = 'User Profile';
  document.getElementById('del-record-identifier').textContent = `User #${userId}`;
  document.getElementById('del-record-title').textContent = name;

  openModal('modal-delete');
}

// ==========================================================
// 4. ASSETS CONTROLLER (VIEW, INSERT, DELETE)
// ==========================================================
async function loadAssets() {
  const tbody = document.getElementById('assets-tbody');
  const countLabel = document.getElementById('assets-count-label');

  try {
    const res = await fetch('/api/assets');
    const data = await res.json();

    if (data.error) {
      tbody.innerHTML = `<tr><td colspan="8" class="empty-state">${escapeHtml(data.error)}</td></tr>`;
      return;
    }

    const assets = data.assets || [];
    countLabel.textContent = `Showing ${assets.length} asset${assets.length === 1 ? '' : 's'}`;

    if (assets.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No hardware assets registered in MySQL.</td></tr>';
      return;
    }

    tbody.innerHTML = assets.map(a => `
      <tr>
        <td><span class="mono-pill">${escapeHtml(a.asset_tag)}</span></td>
        <td>
          <div style="font-weight: 600; color: var(--text-primary);">${escapeHtml(a.asset_name)}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${escapeHtml(a.category_name)}</div>
        </td>
        <td style="font-family: var(--font-mono); font-size: 12px;">${escapeHtml(a.serial_no)}</td>
        <td>${escapeHtml(a.category_name)}</td>
        <td>
          <div style="font-weight: 500;">${escapeHtml(a.assigned_user)}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${escapeHtml(a.department_name || 'In Stock')}</div>
        </td>
        <td>
          <div>${escapeHtml(a.warranty_provider || 'None')}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${a.warranty_end_date ? 'Exp: ' + a.warranty_end_date : ''}</div>
        </td>
        <td>
          <span class="badge ${a.warranty_status === 'Active' ? 'badge-resolved' : 'badge-closed'}">
            ${escapeHtml(a.warranty_status)}
          </span>
        </td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="confirmDeleteAsset(${a.asset_id}, '${escapeHtml(a.asset_tag)}', '${escapeHtml(a.asset_name)}')">
            Delete
          </button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-state">Failed to load assets: ${err.message}</td></tr>`;
  }
}

function openAssetModal() {
  document.getElementById('form-create-asset').reset();
  openModal('modal-asset');
}

async function handleCreateAsset(event) {
  event.preventDefault();
  const payload = {
    asset_tag: document.getElementById('asset-input-tag').value.trim(),
    name: document.getElementById('asset-input-name').value.trim(),
    serial_no: document.getElementById('asset-input-serial').value.trim(),
    category_id: document.getElementById('asset-input-cat').value,
    user_id: document.getElementById('asset-input-user').value || null,
    warranty_id: document.getElementById('asset-input-warranty').value || null
  };

  try {
    const res = await fetch('/api/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (!res.ok || data.error) {
      showToast('Registration Error', data.error, 'error');
      return;
    }

    showToast('Asset Registered', data.message, 'success');
    closeModal('modal-asset');
    loadAssets();
    loadDashboard();
  } catch (err) {
    showToast('Error', err.message, 'error');
  }
}

function confirmDeleteAsset(assetId, tag, name) {
  pendingDeleteAction = {
    type: 'asset',
    id: assetId,
    endpoint: `/api/assets/${assetId}`,
    identifier: tag,
    title: name
  };

  document.getElementById('del-record-type').textContent = 'Hardware Asset';
  document.getElementById('del-record-identifier').textContent = tag;
  document.getElementById('del-record-title').textContent = name;

  openModal('modal-delete');
}

// ==========================================================
// UNIFIED DELETE DISPATCHER (Step 5.C Requirement)
// ==========================================================
async function executeDeleteRecord() {
  if (!pendingDeleteAction) return;

  const btn = document.getElementById('btn-confirm-delete');
  btn.disabled = true;
  btn.textContent = 'Executing SQL DELETE...';

  try {
    const res = await fetch(pendingDeleteAction.endpoint, {
      method: 'DELETE'
    });
    const data = await res.json();

    if (!res.ok || data.error) {
      // Step 5.C Graceful foreign key violation handling
      showToast('Deletion Blocked', data.error || 'Cannot delete record due to database integrity constraints.', 'error', 6000);
      btn.disabled = false;
      btn.textContent = 'Delete from MySQL';
      closeModal('modal-delete');
      return;
    }

    showToast('Deleted Successfully', data.message, 'success');
    closeModal('modal-delete');

    // Live refresh of corresponding tables
    if (pendingDeleteAction.type === 'ticket') {
      loadTickets();
      loadDashboard();
      if (currentActiveView === 'incidents') loadIncidents();
      if (currentActiveView === 'service-requests') loadServiceRequests();
    } else if (pendingDeleteAction.type === 'user') {
      loadUsers();
      loadDashboard();
    } else if (pendingDeleteAction.type === 'asset') {
      loadAssets();
      loadDashboard();
    }
  } catch (err) {
    showToast('Error', err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Delete from MySQL';
    pendingDeleteAction = null;
  }
}

// ==========================================================
// 5. INCIDENTS CONTROLLER (SUBTYPE VIEW)
// ==========================================================
async function loadIncidents() {
  const tbody = document.getElementById('incidents-tbody');
  try {
    const res = await fetch('/api/tickets?type=Incident');
    const data = await res.json();
    const rows = data.tickets || [];

    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No incidents currently logged.</td></tr>';
      return;
    }

    tbody.innerHTML = rows.map(t => `
      <tr>
        <td><span class="mono-pill">${escapeHtml(t.ticket_no)}</span></td>
        <td><strong style="color: #fca5a5;">${escapeHtml(t.subtype_detail)}</strong></td>
        <td>${escapeHtml(t.title)}</td>
        <td>${escapeHtml(t.user_name)}</td>
        <td><span class="priority-${t.priority_level}">${escapeHtml(t.priority_name)}</span></td>
        <td>${renderStatusBadge(t.status)}</td>
        <td style="font-family: var(--font-mono); font-size: 11px;">${escapeHtml(t.created_at_fmt)}</td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="viewTicketDetails(${t.ticket_id})">View</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-state">${err.message}</td></tr>`;
  }
}

// ==========================================================
// 6. SERVICE REQUESTS CONTROLLER (SUBTYPE VIEW)
// ==========================================================
async function loadServiceRequests() {
  const tbody = document.getElementById('service-requests-tbody');
  try {
    const res = await fetch('/api/tickets?type=Service+Request');
    const data = await res.json();
    const rows = data.tickets || [];

    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No service requests currently logged.</td></tr>';
      return;
    }

    tbody.innerHTML = rows.map(t => `
      <tr>
        <td><span class="mono-pill">${escapeHtml(t.ticket_no)}</span></td>
        <td><strong style="color: #93c5fd;">${escapeHtml(t.subtype_detail)}</strong></td>
        <td>${escapeHtml(t.title)}</td>
        <td>${escapeHtml(t.user_name)}</td>
        <td><span class="priority-${t.priority_level}">${escapeHtml(t.priority_name)}</span></td>
        <td>${renderStatusBadge(t.status)}</td>
        <td style="font-family: var(--font-mono); font-size: 11px;">${escapeHtml(t.created_at_fmt)}</td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="viewTicketDetails(${t.ticket_id})">View</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-state">${err.message}</td></tr>`;
  }
}

// ==========================================================
// 7. SUPPORT STAFF CONTROLLER
// ==========================================================
async function loadStaff() {
  const tbody = document.getElementById('staff-tbody');
  try {
    const res = await fetch('/api/support-staff');
    const data = await res.json();
    const staff = data.support_staff || [];

    tbody.innerHTML = staff.map(s => `
      <tr>
        <td><span class="mono-pill">#${s.staff_id}</span></td>
        <td><strong>${escapeHtml(s.name)}</strong></td>
        <td>${escapeHtml(s.email)}</td>
        <td><span class="badge" style="background: var(--accent-purple-subtle); color: #c084fc;">${escapeHtml(s.specialization)}</span></td>
        <td><strong style="color: var(--accent-amber);">${s.active_tickets || 0} active</strong></td>
        <td>${s.total_assignments || 0} tickets</td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">${err.message}</td></tr>`;
  }
}

// ==========================================================
// 8. DEPARTMENTS CONTROLLER
// ==========================================================
async function loadDepartments() {
  const tbody = document.getElementById('departments-tbody');
  try {
    const res = await fetch('/api/departments');
    const data = await res.json();
    const depts = data.departments || [];

    tbody.innerHTML = depts.map(d => `
      <tr>
        <td><span class="mono-pill">#${d.department_id}</span></td>
        <td><strong>${escapeHtml(d.name)}</strong></td>
        <td>${escapeHtml(d.location)}</td>
        <td>${d.total_users || 0} members</td>
        <td>${d.total_assets || 0} devices</td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-state">${err.message}</td></tr>`;
  }
}

// ==========================================================
// 9. MAINTENANCE CONTROLLER
// ==========================================================
async function loadMaintenance() {
  const tbody = document.getElementById('maintenance-tbody');
  try {
    const res = await fetch('/api/maintenance');
    const data = await res.json();
    const logs = data.maintenance || [];

    tbody.innerHTML = logs.map(m => `
      <tr>
        <td><span class="mono-pill">#${m.maintenance_id}</span></td>
        <td><span class="mono-pill">${escapeHtml(m.asset_tag)}</span></td>
        <td>${escapeHtml(m.asset_name)}</td>
        <td style="font-family: var(--font-mono); font-size: 12px;">${escapeHtml(m.maintenance_date)}</td>
        <td>${escapeHtml(m.description)}</td>
        <td><strong style="color: #34d399;">$${parseFloat(m.cost).toFixed(2)}</strong></td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">${err.message}</td></tr>`;
  }
}

// ==========================================================
// 10. LIVE SQL DEMONSTRATION CONTROLLER (FOR FACULTY)
// ==========================================================
function updateSqlDisplay() {
  const key = document.getElementById('sql-query-select').value;
  const q = SQL_QUERIES[key];
  if (q) {
    document.getElementById('sql-display-code').textContent = q.sql;
    document.getElementById('sql-query-desc').textContent = q.desc;
    document.getElementById('sql-query-stats').textContent = 'Ready to execute';
  }
}

async function executeSelectedSqlQuery() {
  const key = document.getElementById('sql-query-select').value;
  const btn = document.getElementById('btn-run-sql');
  const stats = document.getElementById('sql-query-stats');
  const resultsCard = document.getElementById('sql-results-card');
  const thead = document.getElementById('sql-results-thead');
  const tbody = document.getElementById('sql-results-tbody');
  const countBadge = document.getElementById('sql-row-count-badge');

  btn.disabled = true;
  btn.textContent = 'Running Query in MySQL...';
  stats.textContent = 'Executing...';

  try {
    const res = await fetch('/api/sql/run-sample', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: key })
    });
    const data = await res.json();

    if (!res.ok || data.error) {
      showToast('Query Execution Failed', data.error, 'error');
      stats.textContent = 'Failed';
      btn.disabled = false;
      btn.textContent = '▶ Execute Live Query in MySQL';
      return;
    }

    stats.textContent = `Executed in ${data.execution_time_ms} ms (${data.row_count} rows returned)`;
    countBadge.textContent = `${data.row_count} row${data.row_count === 1 ? '' : 's'}`;

    // Render Headers
    thead.innerHTML = '<tr>' + data.headers.map(h => `<th>${escapeHtml(h)}</th>`).join('') + '</tr>';

    // Render Rows
    if (data.rows.length === 0) {
      tbody.innerHTML = `<tr><td colspan="${data.headers.length}" class="empty-state">No matching rows returned from MySQL.</td></tr>`;
    } else {
      tbody.innerHTML = data.rows.map(r => `
        <tr>
          ${r.map(val => `<td>${escapeHtml(String(val))}</td>`).join('')}
        </tr>
      `).join('');
    }

    resultsCard.style.display = 'block';
    showToast('Query Succeeded', `MySQL returned ${data.row_count} rows in ${data.execution_time_ms} ms.`, 'success');

  } catch (err) {
    showToast('Execution Error', err.message, 'error');
    stats.textContent = 'Error';
  } finally {
    btn.disabled = false;
    btn.textContent = '▶ Execute Live Query in MySQL';
  }
}

// ==========================================================
// UTILITY & UI HELPERS
// ==========================================================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal && typeof modal.showModal === 'function') {
    modal.showModal();
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal && typeof modal.close === 'function') {
    modal.close();
  }
}

function renderStatusBadge(status) {
  return `<span class="badge ${getStatusBadgeClass(status)}">${escapeHtml(status)}</span>`;
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'Open': return 'badge-open';
    case 'In Progress': return 'badge-in-progress';
    case 'Pending': return 'badge-pending';
    case 'Resolved': return 'badge-resolved';
    case 'Closed': return 'badge-closed';
    case 'Cancelled': return 'badge-cancelled';
    default: return 'badge-open';
  }
}

function showToast(title, message, type = 'info', duration = 4000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <div class="toast-content">
      <div class="toast-title">${escapeHtml(title)}</div>
      <div class="toast-msg">${escapeHtml(message)}</div>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideIn 0.25s ease-out reverse';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 250);
  }, duration);
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

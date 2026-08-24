import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useMatch, useLocation } from 'react-router-dom';
import API from '../services/api';
import logo from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';
import { getDepartmentTheme, getDepartmentThemeByRole } from '../services/departmentJobs';

const SidebarIcon = ({ name }) => {
  const size = 17;
  const cls = 'sidebar-svg-icon';
  const p = {
    xmlns: 'http://www.w3.org/2000/svg',
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: cls,
  };

  switch (name) {
    case 'dept-crm':
      return <svg {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
    case 'dept-inventory':
      return <svg {...p}><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>;
    case 'dept-supply':
      return <svg {...p}><rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
    case 'dept-hrm':
      return <svg {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case 'dept-workspace':
      return <svg {...p}><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
    case 'dashboard':
      return <svg {...p}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
    case 'leads':
      return <svg {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
    case 'teams':
      return <svg {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case 'kanban':
      return <svg {...p}><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>;
    case 'tickets':
      return <svg {...p}><path d="M12 2H2v10l9.29 9.29c.39.39 1.02.39 1.41 0l7.59-7.59c.39-.39.39-1.02 0-1.41z"/><path d="m20 12-8-8"/><line x1="7" x2="7.01" y1="7" y2="7" strokeWidth="3" strokeLinecap="round"/></svg>;
    case 'bookings':
      return <svg {...p}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="9" x2="15" y1="9" y2="15"/><line x1="15" x2="9" y1="9" y2="15"/></svg>;
    case 'campaigns':
      return <svg {...p}><path d="m3 11 18-5v12L3 13v-2Z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>;
    case 'analytics':
      return <svg {...p}><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>;
    case 'executive':
      return <svg {...p}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
    case 'box':
      return <svg {...p}><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>;
    case 'inventory':
      return <svg {...p}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10"/><path d="M7 12h6"/></svg>;
    case 'supplychain':
      return <svg {...p}><path d="M12 2 2 7v10l10 5 10-5V7Z"/><path d="M2 7l10 5 10-5"/><path d="M12 12v10"/></svg>;
    case 'users':
      return <svg {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case 'settings':
      return <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
    case 'devtools':
      return <svg {...p}><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>;
    case 'rtm':
      return <svg {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
    case 'email':
      return <svg {...p}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>;
    case 'personal':
      return <svg {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
    case 'calendar':
      return <svg {...p}><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
    case 'payroll':
      return <svg {...p}><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>;
    case 'training':
      return <svg {...p}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
    case 'talent':
      return <svg {...p}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
    case 'partnerships':
      return <svg {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    default:
      return null;
  }
};

const CRM_ROLES = [
  'CRM core Administrator', 'Core 360 Administrator', 'Sales Agent', 'Sales Manager', 'Customer Support Agent',
  'Customer Support Manager', 'Marketing Specialist', 'Marketing Manager', 'Business Analyst',
  'CRM Developer', 'CRM Consultant', 'System Architect', 'Executive User', 'RTM Team Member',
];

const HRM_ROLES = [
  'HRM System Administrator', 'HR Manager', 'HR Specialist (Generalist)',
  'Recruitment Specialist (Talent Acquisition)', 'Payroll Specialist', 'HR Business Partner',
  'Training and Development Specialist', 'Performance Management Specialist',
  'Attendance and Time Officer', 'Employee (General User)', 'HR Director / Executive HR User',
  'RTM Team Member', 'CRM core Administrator', 'Core 360 Administrator',
  'Super Admin', 'Super CRM Administrator', 'Administrator',
];

// 1. CRM core NAV ITEMS
const CRM_NAV_ITEMS = [
  { label: 'Dashboard', icon: 'dashboard', path: '/dashboard', roles: null },
  { label: 'Leads', icon: 'leads', path: '/leads', roles: ['CRM core Administrator','Sales Agent','Sales Manager','Marketing Specialist','Marketing Manager','Executive User','System Architect','Business Analyst'] },
  { label: 'Teams', icon: 'teams', path: '/teams', roles: ['CRM core Administrator','System Architect','Sales Manager','Sales Agent','Customer Support Manager','Customer Support Agent','Marketing Manager','Marketing Specialist'] },
  { label: 'Sales Dashboard', icon: 'kanban', path: '/kanban', roles: ['CRM core Administrator','Sales Agent','Sales Manager','Executive User','System Architect','Business Analyst'] },
  { label: 'Technical Issues', icon: 'tickets', path: '/tickets', roles: null },
  { label: 'Bookings', icon: 'bookings', path: '/bookings', roles: ['Sales Agent','Sales Manager','Customer Support Agent','Customer Support Manager','CRM Developer','CRM Consultant','System Architect','CRM core Administrator'], businessModel: ['service', 'both'] },
  { label: 'Products', icon: 'box', path: '/products', roles: ['CRM core Administrator','System Architect','Sales Agent','Sales Manager','Executive User'], businessModel: ['product', 'both'] },
  { label: 'Campaigns', icon: 'campaigns', path: '/campaigns', roles: ['CRM core Administrator','Marketing Specialist','Marketing Manager','Executive User','Business Analyst','System Architect'] },
  { label: 'Analytics', icon: 'analytics', path: '/analytics', roles: ['CRM core Administrator','Executive User','Business Analyst','System Architect'] },
  { label: 'Executive Dashboard', icon: 'executive', path: '/executive', roles: ['CRM core Administrator','Executive User','Business Analyst','System Architect'] },
  { label: 'User Management', icon: 'users', path: '/users', roles: ['CRM core Administrator','System Architect'] },
  { label: 'System Settings', icon: 'settings', path: '/settings', roles: ['CRM core Administrator'] },
  { label: 'CRM Dev Tools', icon: 'devtools', path: '/devtools', roles: ['CRM Developer','System Architect','CRM core Administrator'] },
  { label: 'RTM Monitor', icon: 'rtm', path: '/rtm', roles: ['RTM Team Member','CRM core Administrator','HRM System Administrator','HR Manager','Super Admin','Super CRM Administrator','Administrator','Core 360 Administrator'] },
];

// 2. inventory core SUB ITEMS
const INVENTORY_SUB_ITEMS = [
  { label: 'Dashboard', path: '/inventory', icon: 'dashboard' },
  { label: 'Items & Matrix', path: '/inventory/items', icon: 'box' },
  { label: 'Stock Overview', path: '/inventory/stock', icon: 'analytics' },
  { label: 'Storage Map', path: '/inventory/warehouse-map', icon: 'dashboard' },
  { label: 'Batches & FEFO', path: '/inventory/batches', icon: 'calendar' },
  { label: 'Requisitions', path: '/inventory/requisitions', icon: 'personal' },
  { label: 'Import Costs', path: '/inventory/landed-costs', icon: 'supplychain' },
  { label: 'Transactions', path: '/inventory/transactions', icon: 'teams' },
  { label: 'Receiving (GRN)', path: '/inventory/receiving', icon: 'box' },
  { label: 'Shipping & Picks', path: '/inventory/shipping', icon: 'box' },
  { label: 'Transfers', path: '/inventory/transfers', icon: 'teams' },
  { label: 'Adjustments', path: '/inventory/adjustments', icon: 'analytics' },
  { label: 'Cycle Counts', path: '/inventory/cycle-counts', icon: 'calendar' },
  { label: 'Warehouses', path: '/inventory/warehouses', icon: 'dashboard', roles: ['CRM core Administrator', 'System Architect', 'Inventory Manager', 'Warehouse Manager'] },
  { label: 'Valuation & Reports', path: '/inventory/reports', icon: 'analytics', roles: ['CRM core Administrator', 'System Architect', 'Inventory Manager', 'Warehouse Manager', 'Inventory Clerk'] },
];

// 3. supply chain core SUB ITEMS
const SUPPLY_CHAIN_SUB_ITEMS = [
  { label: 'Control Tower', path: '/supply-chain', icon: 'dashboard' },
  { label: 'Demand & Planning', path: '/supply-chain/planning', icon: 'analytics' },
  { label: 'Requisitions', path: '/supply-chain/requisitions', icon: 'personal' },
  { label: 'RFQs & Matrix', path: '/supply-chain/rfqs', icon: 'analytics' },
  { label: 'Purchase Orders', path: '/supply-chain/purchase-orders', icon: 'box' },
  { label: 'Imports & ACI', path: '/supply-chain/imports', icon: 'supplychain' },
  { label: 'Suppliers & Ratings', path: '/supply-chain/vendors', icon: 'teams' },
  { label: 'Contracts & Prices', path: '/supply-chain/contracts', icon: 'box' },
  { label: 'Logistics', path: '/supply-chain/logistics', icon: 'supplychain' },
  { label: 'Spend & Reports', path: '/supply-chain/reports', icon: 'analytics' },
];

// 3.5. ACCOUNTING CORE SUB ITEMS
const ACCOUNTING_SUB_ITEMS = [
  { label: 'Financial Control Tower', path: '/accounting', icon: 'dashboard' },
  { label: 'Chart of Accounts (COA)', path: '/accounting/coa', icon: 'analytics' },
  { label: 'Journal Ledger', path: '/accounting/journals', icon: 'box' },
  { label: 'Accounts Receivable (AR)', path: '/accounting/ar', icon: 'personal' },
  { label: 'Accounts Payable (AP)', path: '/accounting/ap', icon: 'teams' },
  { label: 'Cash & Banks', path: '/accounting/banks', icon: 'payroll' },
  { label: 'Tax & E-Invoice', path: '/accounting/tax', icon: 'supplychain' },
  { label: 'Fixed Assets', path: '/accounting/assets', icon: 'box' },
  { label: 'Cost Centers & Budgets', path: '/accounting/cost-centers', icon: 'analytics' },
  { label: 'Month-End Closing', path: '/accounting/closing', icon: 'calendar' },
  { label: 'Financial Reports', path: '/accounting/reports', icon: 'analytics' },
];

// 4. HRM core NAV ITEMS
const HRM_NAV_ITEMS = [
  { label: 'HRM Dashboard', icon: 'dashboard', path: '/hrm', roles: null },
  { label: 'Personal & Staff', icon: 'personal', path: '/hrm/personal', roles: ['CRM core Administrator','HRM System Administrator','HR Manager','HR Specialist (Generalist)','HR Business Partner','Employee (General User)'] },
  { label: 'Payroll', icon: 'payroll', path: '/hrm/payroll', roles: ['CRM core Administrator','HRM System Administrator','HR Manager','Payroll Specialist','Employee (General User)','Super Admin','Super CRM Administrator','Administrator','Core 360 Administrator'] },
  { label: 'Training & Development', icon: 'training', path: '/hrm/training', roles: ['CRM core Administrator','HRM System Administrator','HR Manager','Training and Development Specialist','Employee (General User)','Super Admin','Super CRM Administrator','Administrator','Core 360 Administrator'] },
  { label: 'Talent Acquisition', icon: 'talent', path: '/hrm/talent', roles: ['CRM core Administrator','HRM System Administrator','HR Manager','Recruitment Specialist (Talent Acquisition)'] },
  { label: 'BD & People Culture', icon: 'partnerships', path: '/hrm/partnerships', roles: ['CRM core Administrator','HRM System Administrator','HR Manager','HR Business Partner','Employee (General User)'] },
];

// 5. MY WORKSPACE NAV ITEMS
const WORKSPACE_NAV_ITEMS = [
  { label: 'Internal Emails', icon: 'email', path: '/emails' },
  { label: 'Sent Emails', icon: 'email', path: '/emails/sent' },
  { label: 'My Schedule', icon: 'calendar', path: '/ess/schedule' },
  { label: 'My Payroll & Payslip', icon: 'payroll', path: '/ess/payroll' },
];

const INVENTORY_ROLES = [
  'Inventory Manager', 'Warehouse Manager', 'Receiving Clerk', 'Shipping Clerk',
  'Warehouse Operator', 'Inventory Clerk', 'Quality Inspector'
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 5 Mini Sidebar Department States
  const [crmOpen, setCrmOpen] = useState(true);
  const [inventoryOpen, setInventoryOpen] = useState(true);
  const [supplyChainOpen, setSupplyChainOpen] = useState(true);
  const [accountingOpen, setAccountingOpen] = useState(true);
  const [hrmOpen, setHrmOpen] = useState(true);
  const [workspaceOpen, setWorkspaceOpen] = useState(true);

  // Auto expand active department based on current route
  useEffect(() => {
    const p = location.pathname;
    if (p.startsWith('/inventory')) {
      setInventoryOpen(true);
    } else if (p.startsWith('/supply-chain')) {
      setSupplyChainOpen(true);
    } else if (p.startsWith('/accounting')) {
      setAccountingOpen(true);
    } else if (p.startsWith('/hrm')) {
      setHrmOpen(true);
    } else if (p.startsWith('/ess') || p.startsWith('/emails')) {
      setWorkspaceOpen(true);
    } else {
      setCrmOpen(true);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isSuperAdmin =
    !user?.role ||
    user?.role === 'Super CRM Administrator' ||
    user?.role === 'Super Admin' ||
    user?.role === 'Administrator' ||
    user?.role === 'CRM core Administrator' ||
    user?.role === 'Core 360 Administrator' ||
    user?.role === 'System Architect' ||
    user?.role === 'Executive User' ||
    (typeof user?.role === 'string' && (user?.role.toLowerCase().includes('admin') || user?.role.toLowerCase().includes('super')));

  const canSee = (item) => {
    if (isSuperAdmin) return true;
    if (item.roles && !item.roles.includes(user?.role)) return false;
    if (item.businessModel) {
      const bm = user?.businessModel || 'both';
      if (!item.businessModel.includes(bm)) return false;
    }
    return true;
  };

  const isUserProfile = useMatch('/users/:id');
  const isInventoryActive = useMatch('/inventory') || useMatch('/inventory/*');
  const isSupplyChainActive = useMatch('/supply-chain') || useMatch('/supply-chain/*');
  const isAccountingActive = useMatch('/accounting') || useMatch('/accounting/*');

  const showCRM = isSuperAdmin || CRM_ROLES.includes(user?.role);
  const showHRM = isSuperAdmin || HRM_ROLES.includes(user?.role);
  const bm = user?.businessModel || 'both';
  const showERP = isSuperAdmin || ['product', 'both'].includes(bm) || INVENTORY_ROLES.includes(user?.role);

  const userTheme = getDepartmentThemeByRole(user?.role) || { primary: '#6366f1', dark: '#4338ca' };

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : '?';

  // Filtered lists for counter badges
  const filteredCrmItems = CRM_NAV_ITEMS.filter(canSee);
  const filteredInventoryItems = INVENTORY_SUB_ITEMS.filter((sub) => isSuperAdmin || !sub.roles || sub.roles.includes(user?.role));
  const filteredSupplyChainItems = SUPPLY_CHAIN_SUB_ITEMS;
  const filteredAccountingItems = ACCOUNTING_SUB_ITEMS;
  const filteredHrmItems = HRM_NAV_ITEMS.filter(canSee);
  const filteredWorkspaceItems = WORKSPACE_NAV_ITEMS;

  return (
    <aside className="sidebar" aria-label="Workspace navigation">
      {/* Sidebar Header Brand */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-logo-icon">
            <img src={logo} alt="Core 360 Logo" style={{ width: 36, height: 36, objectFit: 'contain' }} />
          </div>
          <div className="sidebar-brand-meta">
            <span className="sidebar-logo-text">Core 360</span>
            <span className="sidebar-brand-subtitle">Enterprise Workspace</span>
          </div>
        </div>
      </div>

      {/* Main Nav Scroll Container */}
      <nav className="sidebar-nav">

        {/* 1. MINI SIDEBAR: CRM core */}
        <div className="mini-sidebar-group">
          <div
            className="mini-sidebar-sticky-header crm-header"
            onClick={() => setCrmOpen(!crmOpen)}
            title="CRM core Department"
          >
            <div className="mini-sidebar-header-left">
              <span className="mini-sidebar-icon"><SidebarIcon name="dept-crm" /></span>
              <span className="mini-sidebar-title">1. CRM core</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="mini-sidebar-badge">{filteredCrmItems.length}</span>
              <span className="mini-sidebar-arrow" style={{ transform: crmOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}>›</span>
            </div>
          </div>

          {crmOpen && (
            <div className="mini-sidebar-body">
              {filteredCrmItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar-link${isActive || (item.path === '/users' && isUserProfile) ? ' active' : ''}`
                  }
                >
                  <span className="sidebar-link-icon"><SidebarIcon name={item.icon} /></span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* 2. MINI SIDEBAR: inventory core */}
        <div className="mini-sidebar-group">
          <div
            className="mini-sidebar-sticky-header inventory-header"
            onClick={() => setInventoryOpen(!inventoryOpen)}
            title="inventory core Department"
          >
            <div className="mini-sidebar-header-left">
              <span className="mini-sidebar-icon"><SidebarIcon name="dept-inventory" /></span>
              <span className="mini-sidebar-title">2. inventory core</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="mini-sidebar-badge">{filteredInventoryItems.length}</span>
              <span className="mini-sidebar-arrow" style={{ transform: inventoryOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}>›</span>
            </div>
          </div>

          {inventoryOpen && (
            <div className="mini-sidebar-body">
              {filteredInventoryItems.map((sub) => (
                <NavLink
                  key={sub.path}
                  to={sub.path}
                  className={({ isActive }) =>
                    `sidebar-link${isActive || (sub.path === '/inventory' && isInventoryActive) ? ' active' : ''}`
                  }
                >
                  <span className="sidebar-link-icon"><SidebarIcon name={sub.icon} /></span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* 3. MINI SIDEBAR: supply chain core */}
        <div className="mini-sidebar-group">
          <div
            className="mini-sidebar-sticky-header supply-header"
            onClick={() => setSupplyChainOpen(!supplyChainOpen)}
            title="supply chain core Department"
          >
            <div className="mini-sidebar-header-left">
              <span className="mini-sidebar-icon"><SidebarIcon name="dept-supply" /></span>
              <span className="mini-sidebar-title">3. supply chain core</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="mini-sidebar-badge">{filteredSupplyChainItems.length}</span>
              <span className="mini-sidebar-arrow" style={{ transform: supplyChainOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}>›</span>
            </div>
          </div>

          {supplyChainOpen && (
            <div className="mini-sidebar-body">
              {filteredSupplyChainItems.map((sub) => (
                <NavLink
                  key={sub.path}
                  to={sub.path}
                  className={({ isActive }) =>
                    `sidebar-link${isActive || (sub.path === '/supply-chain' && isSupplyChainActive) ? ' active' : ''}`
                  }
                >
                  <span className="sidebar-link-icon"><SidebarIcon name={sub.icon} /></span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* 4. MINI SIDEBAR: ACCOUNTING CORE */}
        <div className="mini-sidebar-group">
          <div
            className="mini-sidebar-sticky-header accounting-header"
            onClick={() => setAccountingOpen(!accountingOpen)}
            title="Accounting Core Department"
            style={{ borderLeft: '4px solid #16a34a' }}
          >
            <div className="mini-sidebar-header-left">
              <span className="mini-sidebar-icon"><SidebarIcon name="payroll" /></span>
              <span className="mini-sidebar-title">4. Accounting Core</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="mini-sidebar-badge" style={{ background: '#dcfce7', color: '#166534' }}>{filteredAccountingItems.length}</span>
              <span className="mini-sidebar-arrow" style={{ transform: accountingOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}>›</span>
            </div>
          </div>

          {accountingOpen && (
            <div className="mini-sidebar-body">
              {filteredAccountingItems.map((sub) => (
                <NavLink
                  key={sub.path}
                  to={sub.path}
                  className={({ isActive }) =>
                    `sidebar-link${isActive || (sub.path === '/accounting' && isAccountingActive) ? ' active' : ''}`
                  }
                >
                  <span className="sidebar-link-icon"><SidebarIcon name={sub.icon} /></span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* 5. MINI SIDEBAR: HRM core */}
        <div className="mini-sidebar-group">
          <div
            className="mini-sidebar-sticky-header hrm-header"
            onClick={() => setHrmOpen(!hrmOpen)}
            title="HRM core Department"
          >
            <div className="mini-sidebar-header-left">
              <span className="mini-sidebar-icon"><SidebarIcon name="dept-hrm" /></span>
              <span className="mini-sidebar-title">5. HRM core</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="mini-sidebar-badge">{filteredHrmItems.length}</span>
              <span className="mini-sidebar-arrow" style={{ transform: hrmOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}>›</span>
            </div>
          </div>

          {hrmOpen && (
            <div className="mini-sidebar-body">
              {filteredHrmItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                >
                  <span className="sidebar-link-icon"><SidebarIcon name={item.icon} /></span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* 6. MINI SIDEBAR: MY WORKSPACE */}
        <div className="mini-sidebar-group">
          <div
            className="mini-sidebar-sticky-header workspace-header"
            onClick={() => setWorkspaceOpen(!workspaceOpen)}
            title="My Personal Workspace"
          >
            <div className="mini-sidebar-header-left">
              <span className="mini-sidebar-icon"><SidebarIcon name="dept-workspace" /></span>
              <span className="mini-sidebar-title">6. My Workspace</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="mini-sidebar-badge">{filteredWorkspaceItems.length}</span>
              <span className="mini-sidebar-arrow" style={{ transform: workspaceOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}>›</span>
            </div>
          </div>

          {workspaceOpen && (
            <div className="mini-sidebar-body">
              {filteredWorkspaceItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                >
                  <span className="sidebar-link-icon"><SidebarIcon name={item.icon} /></span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

      </nav>

      {/* Sidebar Footer User Card */}
      <div className="sidebar-footer">
        <div className="sidebar-user" onClick={() => navigate(`/users/${user?._id}`)} style={{ cursor: 'pointer' }}>
          <div className="sidebar-user-avatar" style={{ background: `linear-gradient(135deg, ${userTheme.primary}, ${userTheme.dark})`, color: '#fff' }}>{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.firstName} {user?.lastName}</div>
            <div className="sidebar-user-role" style={{ color: userTheme.primary }}>{user?.role}</div>
          </div>
        </div>
        <button
          className="sidebar-link btn-danger"
          onClick={handleLogout}
          style={{ marginTop: 8, width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px' }}
        >
          <span className="sidebar-link-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" x2="9" y1="12" y2="12"/>
            </svg>
          </span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

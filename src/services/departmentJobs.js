export const DEPARTMENT_THEMES = {
  // CRM / SALES
  Sales: {
    id: 'Sales',
    label: 'CRM / Sales',
    primary: '#F97316',
    dark: '#C2410C',
    light: '#FFF7ED',
    badgeClass: 'badge-new',
  },
  'Customer Support': {
    id: 'Customer Support',
    label: 'Customer Support',
    primary: '#F97316',
    dark: '#C2410C',
    light: '#FFF7ED',
    badgeClass: 'badge-converted',
  },
  Marketing: {
    id: 'Marketing',
    label: 'Marketing',
    primary: '#F97316',
    dark: '#C2410C',
    light: '#FFF7ED',
    badgeClass: 'badge-meta',
  },
  // HR
  'Human Resources': {
    id: 'Human Resources',
    label: 'HR',
    primary: '#8B5CF6',
    dark: '#6D28D9',
    light: '#F5F3FF',
    badgeClass: 'badge-meta',
  },
  Personal: {
    id: 'Personal',
    label: 'Personal',
    primary: '#8B5CF6',
    dark: '#6D28D9',
    light: '#F5F3FF',
    badgeClass: 'badge-new',
  },
  Payroll: {
    id: 'Payroll',
    label: 'Payroll',
    primary: '#8B5CF6',
    dark: '#6D28D9',
    light: '#F5F3FF',
    badgeClass: 'badge-qualified',
  },
  Training: {
    id: 'Training',
    label: 'Training',
    primary: '#8B5CF6',
    dark: '#6D28D9',
    light: '#F5F3FF',
    badgeClass: 'badge-converted',
  },
  'Talent Acquisition': {
    id: 'Talent Acquisition',
    label: 'Talent Acquisition',
    primary: '#8B5CF6',
    dark: '#6D28D9',
    light: '#F5F3FF',
    badgeClass: 'badge-meta',
  },
  'BD & People Culture': {
    id: 'BD & People Culture',
    label: 'BD & People Culture',
    primary: '#8B5CF6',
    dark: '#6D28D9',
    light: '#F5F3FF',
    badgeClass: 'badge-contacted',
  },
  // FINANCE
  Finance: {
    id: 'Finance',
    label: 'Finance',
    primary: '#10B981',
    dark: '#047857',
    light: '#ECFDF5',
    badgeClass: 'badge-contacted',
  },
  // INVENTORY
  Inventory: {
    id: 'Inventory',
    label: 'Inventory',
    primary: '#F59E0B',
    dark: '#B45309',
    light: '#FFFBEB',
    badgeClass: 'badge-qualified',
  },
  // OPERATIONS
  Operations: {
    id: 'Operations',
    label: 'Operations',
    primary: '#E11D48',
    dark: '#BE123C',
    light: '#FFF1F2',
    badgeClass: 'badge-contacted',
  },
  // IT / TECHNOLOGY
  Technology: {
    id: 'Technology',
    label: 'IT / Technology',
    primary: '#06B6D4',
    dark: '#0E7490',
    light: '#ECFEFF',
    badgeClass: 'badge-qualified',
  },
  // EXECUTIVE (workspace)
  Executive: {
    id: 'Executive',
    label: 'Executive',
    primary: '#06B6D4',
    dark: '#0E7490',
    light: '#ECFEFF',
    badgeClass: 'badge-converted',
  },
};

export const DEPARTMENTS = [
  {
    id: 'Sales',
    label: 'Sales',
    icon: 'leads',
    roles: ['Sales Agent', 'Sales Manager'],
  },
  {
    id: 'Customer Support',
    label: 'Customer Support',
    icon: 'support',
    roles: ['Customer Support Agent', 'Customer Support Manager'],
  },
  {
    id: 'Marketing',
    label: 'Marketing',
    icon: 'megaphone',
    roles: ['Marketing Specialist', 'Marketing Manager'],
  },
  {
    id: 'Technology',
    label: 'Technology',
    icon: 'devtools',
    roles: ['CRM Developer', 'CRM Consultant', 'System Architect', 'Business Analyst'],
  },
  {
    id: 'Executive',
    label: 'Executive',
    icon: 'dashboard',
    roles: ['Executive User', 'Core 360 Administrator', 'CRM core Administrator'],
  },
  {
    id: 'Human Resources',
    label: 'Human Resources',
    icon: 'users',
    roles: [
      'HRM System Administrator',
      'HR Manager',
      'HR Director / Executive HR User',
      'HR Specialist (Generalist)',
      'HR Business Partner',
      'Recruitment Specialist (Talent Acquisition)',
      'Payroll Specialist',
      'Training and Development Specialist',
      'Performance Management Specialist',
      'Attendance and Time Officer',
      'Employee (General User)',
    ],
  },
  {
    id: 'Finance',
    label: 'Finance',
    icon: 'money',
    roles: ['Finance Manager', 'Finance Analyst', 'Accountant', 'Controller', 'Bookkeeper'],
  },
  {
    id: 'Inventory',
    label: 'Inventory',
    icon: 'box',
    roles: ['Inventory Manager', 'Warehouse Manager', 'Inventory Clerk', 'Stock Controller'],
  },
  {
    id: 'Operations',
    label: 'Operations',
    icon: 'supplychain',
    roles: ['Operations Manager', 'Operations Analyst', 'Operations Supervisor'],
  },
  {
    id: 'Personal',
    label: 'Personal',
    icon: 'personal',
    roles: ['HR Specialist (Generalist)', 'Employee (General User)'],
  },
  {
    id: 'Payroll',
    label: 'Payroll',
    icon: 'payroll',
    roles: ['Payroll Specialist'],
  },
  {
    id: 'Training',
    label: 'Training',
    icon: 'training',
    roles: ['Training and Development Specialist'],
  },
  {
    id: 'Talent Acquisition',
    label: 'Talent Acquisition',
    icon: 'talent',
    roles: ['Recruitment Specialist (Talent Acquisition)'],
  },
  {
    id: 'BD & People Culture',
    label: 'BD & People Culture',
    icon: 'partnerships',
    roles: ['HR Business Partner'],
  },
];

export const ALL_ROLES = DEPARTMENTS.flatMap((d) => d.roles);

export const getRolesByDepartment = (deptId) =>
  DEPARTMENTS.find((d) => d.id === deptId)?.roles || [];

export const getDepartmentByRole = (role) => {
  if (!role) return '';
  const normalized = String(role).trim().toLowerCase();
  const match = DEPARTMENTS.find((d) => d.roles.some((r) => String(r).trim().toLowerCase() === normalized));
  return match?.id || '';
};

export const getDepartmentTheme = (deptId = '') => {
  const normalized = String(deptId || '').trim().toLowerCase();
  if (!normalized) return DEPARTMENT_THEMES.Sales;

  const directMatch = DEPARTMENT_THEMES[deptId];
  if (directMatch) return directMatch;

  const aliasMap = {
    sales: 'Sales',
    'crm/sales': 'Sales',
    crm: 'Sales',
    hr: 'Human Resources',
    'human resources': 'Human Resources',
    'human-resources': 'Human Resources',
    personal: 'Personal',
    payroll: 'Payroll',
    training: 'Training',
    'talent acquisition': 'Talent Acquisition',
    'bd & people culture': 'BD & People Culture',
    'bd and people culture': 'BD & People Culture',
    finance: 'Finance',
    inventory: 'Inventory',
    operations: 'Operations',
    technology: 'Technology',
    'it/technology': 'Technology',
    it: 'Technology',
    executive: 'Executive',
  };

  const alias = aliasMap[normalized];
  return alias ? DEPARTMENT_THEMES[alias] : DEPARTMENT_THEMES.Sales;
};

export const getDepartmentThemeByRole = (role = '') => {
  const dept = getDepartmentByRole(role);
  return getDepartmentTheme(dept);
};

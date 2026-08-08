export const DEPARTMENT_THEMES = {
  Sales: {
    id: 'Sales',
    label: 'CRM / Sales',
    primary: '#2563EB',
    dark: '#1D4ED8',
    light: '#DBEAFE',
    badgeClass: 'badge-new',
    icon: '💼',
  },
  'Customer Support': {
    id: 'Customer Support',
    label: 'Customer Support',
    primary: '#F59E0B',
    dark: '#B45309',
    light: '#FEF3C7',
    badgeClass: 'badge-converted',
    icon: '🎧',
  },
  Marketing: {
    id: 'Marketing',
    label: 'Marketing',
    primary: '#8B5CF6',
    dark: '#6D28D9',
    light: '#EDE9FE',
    badgeClass: 'badge-meta',
    icon: '📣',
  },
  Technology: {
    id: 'Technology',
    label: 'IT / Technology',
    primary: '#0EA5E9',
    dark: '#0369A1',
    light: '#E0F2FE',
    badgeClass: 'badge-qualified',
    icon: '⚙️',
  },
  Executive: {
    id: 'Executive',
    label: 'Executive',
    primary: '#0F766E',
    dark: '#115E59',
    light: '#CCFBF1',
    badgeClass: 'badge-converted',
    icon: '🏢',
  },
  'Human Resources': {
    id: 'Human Resources',
    label: 'HR',
    primary: '#7C3AED',
    dark: '#5B21B6',
    light: '#EDE9FE',
    badgeClass: 'badge-meta',
    icon: '👥',
  },
  Finance: {
    id: 'Finance',
    label: 'Finance',
    primary: '#D97706',
    dark: '#B45309',
    light: '#FEF3C7',
    badgeClass: 'badge-contacted',
    icon: '💰',
  },
  Inventory: {
    id: 'Inventory',
    label: 'Inventory',
    primary: '#F97316',
    dark: '#C2410C',
    light: '#FFEDD5',
    badgeClass: 'badge-qualified',
    icon: '📦',
  },
  Operations: {
    id: 'Operations',
    label: 'Operations',
    primary: '#14B8A6',
    dark: '#0F766E',
    light: '#CCFBF1',
    badgeClass: 'badge-contacted',
    icon: '🛠️',
  },
  Personal: {
    id: 'Personal',
    label: 'Personal',
    primary: '#3B82F6',
    dark: '#1D4ED8',
    light: '#DBEAFE',
    badgeClass: 'badge-new',
    icon: '👤',
  },
  Payroll: {
    id: 'Payroll',
    label: 'Payroll',
    primary: '#D97706',
    dark: '#B45309',
    light: '#FEF3C7',
    badgeClass: 'badge-qualified',
    icon: '💵',
  },
  Training: {
    id: 'Training',
    label: 'Training',
    primary: '#F59E0B',
    dark: '#B45309',
    light: '#FEF3C7',
    badgeClass: 'badge-converted',
    icon: '📚',
  },
  'Talent Acquisition': {
    id: 'Talent Acquisition',
    label: 'Talent Acquisition',
    primary: '#8B5CF6',
    dark: '#6D28D9',
    light: '#EDE9FE',
    badgeClass: 'badge-meta',
    icon: '🎯',
  },
  'BD & People Culture': {
    id: 'BD & People Culture',
    label: 'BD & People Culture',
    primary: '#EC4899',
    dark: '#BE185D',
    light: '#FCE7F3',
    badgeClass: 'badge-contacted',
    icon: '🤝',
  },
};

export const DEPARTMENTS = [
  {
    id: 'Sales',
    label: 'Sales',
    roles: ['Sales Agent', 'Sales Manager'],
  },
  {
    id: 'Customer Support',
    label: 'Customer Support',
    roles: ['Customer Support Agent', 'Customer Support Manager'],
  },
  {
    id: 'Marketing',
    label: 'Marketing',
    roles: ['Marketing Specialist', 'Marketing Manager'],
  },
  {
    id: 'Technology',
    label: 'Technology',
    roles: ['CRM Developer', 'CRM Consultant', 'System Architect', 'Business Analyst'],
  },
  {
    id: 'Executive',
    label: 'Executive',
    roles: ['Executive User', 'Super CRM Administrator', 'Core 360 Administrator'],
  },
  {
    id: 'Human Resources',
    label: 'Human Resources',
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
    roles: ['Finance Manager', 'Finance Analyst', 'Accountant', 'Controller', 'Bookkeeper'],
  },
  {
    id: 'Inventory',
    label: 'Inventory',
    roles: ['Inventory Manager', 'Warehouse Manager', 'Inventory Clerk', 'Stock Controller'],
  },
  {
    id: 'Operations',
    label: 'Operations',
    roles: ['Operations Manager', 'Operations Analyst', 'Operations Supervisor'],
  },
  {
    id: 'Personal',
    label: 'Personal',
    roles: ['HR Specialist (Generalist)', 'Employee (General User)'],
  },
  {
    id: 'Payroll',
    label: 'Payroll',
    roles: ['Payroll Specialist'],
  },
  {
    id: 'Training',
    label: 'Training',
    roles: ['Training and Development Specialist'],
  },
  {
    id: 'Talent Acquisition',
    label: 'Talent Acquisition',
    roles: ['Recruitment Specialist (Talent Acquisition)'],
  },
  {
    id: 'BD & People Culture',
    label: 'BD & People Culture',
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

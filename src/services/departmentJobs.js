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
    label: 'Operations',
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
    roles: ['Executive User', 'Core 360 Administrator'],
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
];

export const ALL_ROLES = DEPARTMENTS.flatMap((d) => d.roles);

export const getRolesByDepartment = (deptId) =>
  DEPARTMENTS.find((d) => d.id === deptId)?.roles || [];

export const getDepartmentByRole = (role) =>
  DEPARTMENTS.find((d) => d.roles.includes(role))?.id || '';

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
    finance: 'Finance',
    inventory: 'Inventory',
    operations: 'Operations',
    technology: 'Technology',
    'it/technology': 'Technology',
    it: 'Technology',
  };

  const alias = aliasMap[normalized];
  return alias ? DEPARTMENT_THEMES[alias] : DEPARTMENT_THEMES.Sales;
};

export const getDepartmentThemeByRole = (role = '') => {
  const dept = getDepartmentByRole(role);
  return getDepartmentTheme(dept);
};

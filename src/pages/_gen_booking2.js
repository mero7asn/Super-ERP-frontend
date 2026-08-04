const fs = require('fs');
const path = 'C:\\Users\\Admin\\Desktop\\Core 360\\frontend\\src\\pages\\BookingLookupPage.jsx';
const lines = [];
function L() { return lines; }
lines.push(``);
lines.push(`import { useState } from 'react';`);
lines.push(`import { useNavigate } from 'react-router-dom';`);
lines.push(`import { Icon } from '../components/Icons';`);
lines.push(`import API from '../services/api';`);
lines.push(`import { useAuth } from '../context/AuthContext';`);
fs.writeFileSync(path, lines.join('\n'));
console.log('Test:', lines.length, 'lines');

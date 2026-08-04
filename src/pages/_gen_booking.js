const fs = require('fs');
const path = 'C:\\Users\\Admin\\Desktop\\Core 360\\frontend\\src\\pages\\BookingLookupPage.jsx';

const header = `import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icons';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
`;

fs.writeFileSync(path, header);
console.log('Header written:', header.length, 'chars');

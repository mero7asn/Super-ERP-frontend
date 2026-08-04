const fs = require('fs');
const path = require('path');

// Each entry: [Buffer of UTF-8 bytes, replacement string]
const BYTE_MAP = [
  [Buffer.from([0xF0,0x9F,0x91,0x81]), '<Icon name="search" size={18} />'],    // U+1F441 eye
  [Buffer.from([0xF0,0x9F,0x94,0x84]), '<Icon name="refresh" size={18} />'],   // U+1F504 arrows
  [Buffer.from([0xF0,0x9F,0x94,0x81]), '<Icon name="refresh" size={18} />'],   // U+1F501 repeat
  [Buffer.from([0xF0,0x9F,0x94,0x8C]), '<Icon name="settings" size={18} />'],  // U+1F50C plug
  [Buffer.from([0xF0,0x9F,0xA7,0xB9]), '<Icon name="trash" size={18} />'],     // U+1F9F9 broom
  [Buffer.from([0xF0,0x9F,0x98,0x8A]), '<Icon name="wave" size={18} />'],      // U+1F60A smile
  [Buffer.from([0xF0,0x9F,0x92,0xBC]), '<Icon name="folder" size={18} />'],    // U+1F4BC briefcase
  [Buffer.from([0xF0,0x9F,0xA7,0xBE]), '<Icon name="kanban" size={18} />'],    // U+1F9FE receipt
  [Buffer.from([0xF0,0x9F,0x8E,0x81]), '<Icon name="play" size={18} />'],      // U+1F381 gift
  [Buffer.from([0xF0,0x9F,0x91,0xBB]), '<Icon name="alert" size={18} />'],     // U+1F47B ghost
  [Buffer.from([0xF0,0x9F,0x87,0xAA]), ''],                                    // U+1F1EA flag-E
  [Buffer.from([0xF0,0x9F,0x87,0xAC]), ''],                                    // U+1F1EC flag-G
  [Buffer.from([0xF0,0x9F,0x93,0x8E]), '<Icon name="flag" size={18} />'],      // U+1F4CE paperclip
  [Buffer.from([0xF0,0x9F,0x8C,0x9F]), '<Icon name="star" size={18} />'],      // U+1F31F glowing star
  [Buffer.from([0xF0,0x9F,0x8F,0x9B]), '<Icon name="settings" size={18} />'],  // U+1F3DB building
];

function replaceInBuffer(buf, search, replace) {
  const replBuf = Buffer.from(replace, 'utf8');
  const parts = [];
  let pos = 0;
  while (pos < buf.length) {
    const idx = buf.indexOf(search, pos);
    if (idx === -1) { parts.push(buf.slice(pos)); break; }
    parts.push(buf.slice(pos, idx));
    parts.push(replBuf);
    pos = idx + search.length;
  }
  return Buffer.concat(parts);
}

function processFile(filePath) {
  let buf = fs.readFileSync(filePath);
  let changed = false;
  for (const [seq, replacement] of BYTE_MAP) {
    if (buf.indexOf(seq) !== -1) {
      buf = replaceInBuffer(buf, seq, replacement);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(filePath, buf);
    console.log('Fixed:', path.relative(process.cwd(), filePath));
  }
}

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(e.name)) {
      walk(full);
    } else if (e.name.endsWith('.jsx') || e.name.endsWith('.js')) {
      processFile(full);
    }
  }
}

walk(path.join(__dirname, 'src'));
console.log('\nDone.');

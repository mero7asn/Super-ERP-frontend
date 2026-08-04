const fs = require('fs');
const path = require('path');

// Map every emoji to its Icon component replacement
const EMOJI_MAP = [
  ['\u{1F44B}', '<Icon name="wave" size={18} />'],
  ['\u{1F464}', '<Icon name="person" size={18} />'],
  ['\u{1F465}', '<Icon name="users" size={18} />'],
  ['\u{1F916}', '<Icon name="robot" size={18} />'],
  ['\u{1F91D}', '<Icon name="handshake" size={18} />'],
  ['\u{1F44D}', '<Icon name="like" size={18} />'],
  ['\u{1F4CB}', '<Icon name="kanban" size={18} />'],
  ['\u{1F4C1}', '<Icon name="folder" size={18} />'],
  ['\u{1F4C4}', '<Icon name="kanban" size={18} />'],
  ['\u{1F4E6}', '<Icon name="box" size={18} />'],
  ['\u{1F4B0}', '<Icon name="money" size={18} />'],
  ['\u{1F4B5}', '<Icon name="money" size={18} />'],
  ['\u{1F4B3}', '<Icon name="money" size={18} />'],
  ['\u{1F4B8}', '<Icon name="money" size={18} />'],
  ['\u{1F4CA}', '<Icon name="analytics" size={18} />'],
  ['\u{1F4C8}', '<Icon name="trending" size={18} />'],
  ['\u{1F4C9}', '<Icon name="trending" size={18} />'],
  ['\u{1F4E7}', '<Icon name="email" size={18} />'],
  ['\u{1F4E8}', '<Icon name="send" size={18} />'],
  ['\u{1F4E4}', '<Icon name="send" size={18} />'],
  ['\u{1F4E5}', '<Icon name="inbox" size={18} />'],
  ['\u{1F4CC}', '<Icon name="flag" size={18} />'],
  ['\u{1F4DA}', '<Icon name="book" size={18} />'],
  ['\u{1F4BB}', '<Icon name="devtools" size={18} />'],
  ['\u{1F5D1}', '<Icon name="trash" size={18} />'],
  ['\u{1F5C2}', '<Icon name="folder" size={18} />'],
  ['\u{1F4DD}', '<Icon name="edit" size={18} />'],
  ['\u{1F50D}', '<Icon name="search" size={18} />'],
  ['\u{1F512}', '<Icon name="lock" size={18} />'],
  ['\u{1F513}', '<Icon name="unlock" size={18} />'],
  ['\u{1F514}', '<Icon name="alert" size={18} />'],
  ['\u{1F6A8}', '<Icon name="siren" size={18} />'],
  ['\u{1F680}', '<Icon name="rocket" size={18} />'],
  ['\u{1F6AB}', '<Icon name="ban" size={18} />'],
  ['\u{1F3AB}', '<Icon name="ticket" size={18} />'],
  ['\u{1F3AF}', '<Icon name="target" size={18} />'],
  ['\u{1F3C6}', '<Icon name="trophy" size={18} />'],
  ['\u{1F3E2}', '<Icon name="settings" size={18} />'],
  ['\u{1F3E5}', '<Icon name="support" size={18} />'],
  ['\u{1F393}', '<Icon name="graduation" size={18} />'],
  ['\u{1F4A1}', '<Icon name="bulb" size={18} />'],
  ['\u{2705}',  '<Icon name="check" size={18} />'],
  ['\u{274C}',  '<Icon name="close" size={18} />'],
  ['\u{26A0}',  '<Icon name="warning" size={18} />'],
  ['\u{2699}',  '<Icon name="settings" size={18} />'],
  ['\u{23F0}',  '<Icon name="clock" size={18} />'],
  ['\u{1F550}', '<Icon name="clock" size={18} />'],
  ['\u{2B50}',  '<Icon name="star" size={18} />'],
  ['\u{2728}',  '<Icon name="star" size={18} />'],
  ['\u{1F4AF}', '<Icon name="check" size={18} />'],
  ['\u{1F389}', '<Icon name="play" size={18} />'],
  ['\u{1F4AC}', '<Icon name="support" size={18} />'],
  ['\u{1F5D3}', '<Icon name="calendar" size={18} />'],
  ['\u{1F4C5}', '<Icon name="calendar" size={18} />'],
  ['\u{1F517}', '<Icon name="globe" size={18} />'],
  ['\u{1F310}', '<Icon name="globe" size={18} />'],
  ['\u{1F4DE}', '<Icon name="phone" size={18} />'],
  ['\u{260E}',  '<Icon name="phone" size={18} />'],
  ['\u{1F4E3}', '<Icon name="megaphone" size={18} />'],
  ['\u{1F4E2}', '<Icon name="megaphone" size={18} />'],
  ['\u{1F334}', '<Icon name="clock" size={18} />'],
  ['\u{1F6E1}', '<Icon name="lock" size={18} />'],
  ['\u{1F68C}', '<Icon name="settings" size={18} />'],
  ['\u{1F5BC}', '<Icon name="kanban" size={18} />'],
  ['\u{1F5A8}', '<Icon name="print" size={18} />'],
  ['\u{1F4BE}', '<Icon name="download" size={18} />'],
  ['\u{1F3E6}', '<Icon name="money" size={18} />'],
  ['\u{1F4F1}', '<Icon name="phone" size={18} />'],
  ['\u{1F4F2}', '<Icon name="phone" size={18} />'],
  ['\u{1F6A9}', '<Icon name="flag" size={18} />'],
  ['\u{1F4B9}', '<Icon name="trending" size={18} />'],
  ['\u{1F3A7}', '<Icon name="support" size={18} />'],
  ['\u{2764}',  '<Icon name="like" size={18} />'],
  ['\u{1F4AA}', '<Icon name="trending" size={18} />'],
  ['\u{1F440}', '<Icon name="search" size={18} />'],
  ['\u{1F6D2}', '<Icon name="box" size={18} />'],
  ['\u{1F4B1}', '<Icon name="globe" size={18} />'],
  ['\u{1F6CC}', '<Icon name="clock" size={18} />'],
  ['\u{1F4FC}', '<Icon name="play" size={18} />'],
  ['\u{1F4A4}', '<Icon name="clock" size={18} />'],
  ['\u{1F6A7}', '<Icon name="warning" size={18} />'],
  ['\u{1F4BB}', '<Icon name="devtools" size={18} />'],
  ['\u{1F4B2}', '<Icon name="money" size={18} />'],
  ['\u{1F4A5}', '<Icon name="alert" size={18} />'],
  ['\u{1F527}', '<Icon name="settings" size={18} />'],
  ['\u{1F528}', '<Icon name="settings" size={18} />'],
  ['\u{1F4F0}', '<Icon name="kanban" size={18} />'],
  ['\u{1F4FB}', '<Icon name="megaphone" size={18} />'],
  ['\u{1F6AA}', '<Icon name="settings" size={18} />'],
  ['\u{1F4A0}', '<Icon name="target" size={18} />'],
  ['\u{1F522}', '<Icon name="analytics" size={18} />'],
  ['\u{1F523}', '<Icon name="settings" size={18} />'],
  ['\u{1F524}', '<Icon name="edit" size={18} />'],
  ['\u{1F4EF}', '<Icon name="megaphone" size={18} />'],
  ['\u{1F4EC}', '<Icon name="email" size={18} />'],
  ['\u{1F4ED}', '<Icon name="email" size={18} />'],
  ['\u{1F4EE}', '<Icon name="email" size={18} />'],
  ['\u{1F4EA}', '<Icon name="inbox" size={18} />'],
  ['\u{1F4EB}', '<Icon name="send" size={18} />'],
  ['\u{1F50E}', '<Icon name="search" size={18} />'],
  ['\u{1F50F}', '<Icon name="lock" size={18} />'],
  ['\u{1F510}', '<Icon name="lock" size={18} />'],
  ['\u{1F511}', '<Icon name="lock" size={18} />'],
  ['\u{1F515}', '<Icon name="alert" size={18} />'],
  ['\u{1F516}', '<Icon name="flag" size={18} />'],
  ['\u{1F518}', '<Icon name="target" size={18} />'],
  ['\u{1F519}', '<Icon name="close" size={18} />'],
  ['\u{1F51A}', '<Icon name="trending" size={18} />'],
  ['\u{1F51B}', '<Icon name="trending" size={18} />'],
  ['\u{1F51C}', '<Icon name="trending" size={18} />'],
  ['\u{1F51D}', '<Icon name="trending" size={18} />'],
  ['\u{1F4D1}', '<Icon name="kanban" size={18} />'],
  ['\u{1F4D2}', '<Icon name="kanban" size={18} />'],
  ['\u{1F4D3}', '<Icon name="kanban" size={18} />'],
  ['\u{1F4D4}', '<Icon name="kanban" size={18} />'],
  ['\u{1F4D5}', '<Icon name="kanban" size={18} />'],
  ['\u{1F4D6}', '<Icon name="book" size={18} />'],
  ['\u{1F4D7}', '<Icon name="book" size={18} />'],
  ['\u{1F4D8}', '<Icon name="book" size={18} />'],
  ['\u{1F4D9}', '<Icon name="book" size={18} />'],
  ['\u{1F4DC}', '<Icon name="kanban" size={18} />'],
  ['\u{1F4DE}', '<Icon name="phone" size={18} />'],
  ['\u{1F4DF}', '<Icon name="phone" size={18} />'],
  ['\u{1F4E0}', '<Icon name="phone" size={18} />'],
  ['\u{1F4E1}', '<Icon name="megaphone" size={18} />'],
  ['\u{1F4E9}', '<Icon name="email" size={18} />'],
  ['\u{1F4F3}', '<Icon name="alert" size={18} />'],
  ['\u{1F4F4}', '<Icon name="close" size={18} />'],
  ['\u{1F4F5}', '<Icon name="ban" size={18} />'],
  ['\u{1F4F6}', '<Icon name="analytics" size={18} />'],
  ['\u{1F4F7}', '<Icon name="kanban" size={18} />'],
  ['\u{1F4F8}', '<Icon name="kanban" size={18} />'],
  ['\u{1F4F9}', '<Icon name="play" size={18} />'],
  ['\u{1F4FA}', '<Icon name="play" size={18} />'],
  ['\u{2611}',  '<Icon name="check" size={18} />'],
  ['\u{2714}',  '<Icon name="check" size={18} />'],
  ['\u{2716}',  '<Icon name="close" size={18} />'],
  ['\u{2718}',  '<Icon name="close" size={18} />'],
  ['\u{2757}',  '<Icon name="alert" size={18} />'],
  ['\u{2753}',  '<Icon name="support" size={18} />'],
  ['\u{2754}',  '<Icon name="support" size={18} />'],
  ['\u{2755}',  '<Icon name="alert" size={18} />'],
  ['\u{203C}',  '<Icon name="alert" size={18} />'],
  ['\u{2049}',  '<Icon name="alert" size={18} />'],
  ['\u{25B6}',  '<Icon name="play" size={18} />'],
  ['\u{23E9}',  '<Icon name="play" size={18} />'],
  ['\u{23EA}',  '<Icon name="play" size={18} />'],
  ['\u{23EB}',  '<Icon name="trending" size={18} />'],
  ['\u{23EC}',  '<Icon name="trending" size={18} />'],
  ['\u{23F3}',  '<Icon name="clock" size={18} />'],
  ['\u{231B}',  '<Icon name="clock" size={18} />'],
  ['\u{1F551}', '<Icon name="clock" size={18} />'],
  ['\u{1F552}', '<Icon name="clock" size={18} />'],
  ['\u{1F553}', '<Icon name="clock" size={18} />'],
  ['\u{1F554}', '<Icon name="clock" size={18} />'],
  ['\u{1F555}', '<Icon name="clock" size={18} />'],
  ['\u{1F556}', '<Icon name="clock" size={18} />'],
  ['\u{1F557}', '<Icon name="clock" size={18} />'],
  ['\u{1F558}', '<Icon name="clock" size={18} />'],
  ['\u{1F559}', '<Icon name="clock" size={18} />'],
  ['\u{1F55A}', '<Icon name="clock" size={18} />'],
  ['\u{1F55B}', '<Icon name="clock" size={18} />'],
  // Colored circles — remove (UI uses CSS dots)
  ['\u{1F7E2}', ''],
  ['\u{1F7E1}', ''],
  ['\u{1F7E3}', ''],
  ['\u{1F535}', ''],
  ['\u{1F534}', ''],
  ['\u{2B55}',  ''],
  ['\u{26AB}',  ''],
  ['\u{26AA}',  ''],
  ['\u{1F7E0}', ''],
  ['\u{1F7E4}', ''],
  // Variation selector & ZWJ — strip
  ['\uFE0F', ''],
  ['\u200D', ''],
];

function replaceEmoji(text) {
  let result = text;
  for (const [emoji, replacement] of EMOJI_MAP) {
    if (result.includes(emoji)) {
      result = result.split(emoji).join(replacement);
    }
  }
  return result;
}

function ensureIconImport(text, filePath) {
  // Only add import if file uses <Icon and doesn't already import it
  if (!text.includes('<Icon ')) return text;
  if (text.includes("from '../components/Icons'") ||
      text.includes("from '../../components/Icons'") ||
      text.includes("from './Icons'")) return text;

  // Determine relative path depth
  const rel = filePath.replace(/\\/g, '/');
  const depth = (rel.match(/src\//)?.[0] ? rel.split('src/')[1].split('/').length - 1 : 0);
  const importPath = depth >= 2 ? '../../components/Icons' : '../components/Icons';

  // Insert after first import line
  const firstImport = text.indexOf('import ');
  if (firstImport === -1) return text;
  const lineEnd = text.indexOf('\n', firstImport);
  return text.slice(0, lineEnd + 1) +
    `import { Icon } from '${importPath}';\n` +
    text.slice(lineEnd + 1);
}

function processFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  let updated = replaceEmoji(original);
  updated = ensureIconImport(updated, filePath);
  if (updated !== original) {
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log('Fixed:', path.relative(process.cwd(), filePath));
  }
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
        walkDir(full);
      }
    } else if (entry.name.endsWith('.jsx') || entry.name.endsWith('.js')) {
      processFile(full);
    }
  }
}

walkDir(path.join(__dirname, 'src'));
console.log('\nDone. All emoji replaced with <Icon> components.');

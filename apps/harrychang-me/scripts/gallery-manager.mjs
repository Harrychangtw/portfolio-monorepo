#!/usr/bin/env node

/**
 * PORTFOLIO GALLERY MANAGER
 * 
 * An interactive CLI to rearrange gallery items and update frontmatter.
 * 
 * Usage: node scripts/gallery-manager.mjs
 * dependencies: gray-matter (already in project)
 */

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

// --- Configuration ---
const CONTENT_DIR = path.join(process.cwd(), 'content/gallery');
const PINNED_KEY = 'pinned';

// --- Colors & formatting helpers ---
const C = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgBlue: '\x1b[44m',
};

// --- State Management ---
const state = {
  // Lists
  pinned: [], // { slug, title, date, pinned, paths: [] }
  pool: [],   // { slug, title, date, pinned, paths: [] }
  
  // UI State
  mode: 'PINNED', // 'PINNED' | 'POOL'
  cursor: 0,      // Current index in the active list
  dragging: false, // Is the user currently moving an item?
  scrollOffset: 0,
  message: '',
  dirty: false
};

// --- Core Logic ---

async function loadItems() {
  // Import gray-matter dynamically
  let matter;
  try {
    const mod = await import('gray-matter');
    matter = mod.default;
  } catch (e) {
    console.error(C.red + 'Error: "gray-matter" package not found.' + C.reset);
    console.error('Please run `pnpm install` to ensure dependencies are available.');
    process.exit(1);
  }

  if (!fs.existsSync(CONTENT_DIR)) {
    console.error(C.red + `Error: Directory not found: ${CONTENT_DIR}` + C.reset);
    process.exit(1);
  }

  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
  const itemsMap = new Map();

  // 1. Group files by slug (combining en and zh-tw)
  for (const file of files) {
    const fullPath = path.join(CONTENT_DIR, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(content);
    
    // Determine canonical slug (remove _zh-tw suffix)
    const isZh = file.includes('_zh-tw');
    const canonicalSlug = file.replace('_zh-tw.md', '').replace('.md', '');
    
    if (!itemsMap.has(canonicalSlug)) {
      itemsMap.set(canonicalSlug, {
        slug: canonicalSlug,
        title: data.title || canonicalSlug,
        date: data.date || 'No Date',
        pinned: typeof data.pinned === 'number' ? data.pinned : -1,
        paths: []
      });
    }
    
    const item = itemsMap.get(canonicalSlug);
    item.paths.push(fullPath);
    
    // specific logic: if English version exists, prefer its title/data for display
    if (!isZh) {
      item.title = data.title || item.title;
      item.date = data.date || item.date;
      item.pinned = typeof data.pinned === 'number' ? data.pinned : item.pinned;
    }
  }

  // 2. Split into Pinned and Pool
  const allItems = Array.from(itemsMap.values());
  
  state.pinned = allItems
    .filter(i => i.pinned > 0)
    .sort((a, b) => a.pinned - b.pinned);
    
  state.pool = allItems
    .filter(i => i.pinned <= 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function saveItems() {
  let changedCount = 0;

  // Helper to update a single file content
  const updateFileContent = (filePath, pinValue) => {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent;
    
    // Use Regex to safely update pinned value without reformatting the whole file
    // This preserves comments and custom formatting
    const pinnedRegex = /^pinned:\s*-?\d+\s*$/m;
    
    if (pinnedRegex.test(content)) {
      newContent = content.replace(pinnedRegex, `pinned: ${pinValue}`);
    } else {
      // Insert pinned field if missing (after the first --- and preferably after date or title)
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (frontmatterMatch) {
        const fm = frontmatterMatch[1];
        const newFm = fm + `\npinned: ${pinValue}`;
        newContent = content.replace(fm, newFm);
      } else {
        // Fallback for malformed files
        return; 
      }
    }

    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent);
      changedCount++;
    }
  };

  // Update Pinned Items (1, 2, 3...)
  state.pinned.forEach((item, index) => {
    item.paths.forEach(p => updateFileContent(p, index + 1));
  });

  // Update Pool Items (-1)
  state.pool.forEach(item => {
    item.paths.forEach(p => updateFileContent(p, -1));
  });

  state.dirty = false;
  state.message = `${C.green}Successfully updated ${changedCount} files.${C.reset}`;
}

// --- TUI Rendering ---

function render() {
  // Clear screen
  process.stdout.write('\x1b[2J');
  process.stdout.write('\x1b[0f');

  // Header
  console.log(`${C.bgBlue}${C.bright}  PORTFOLIO GALLERY MANAGER  ${C.reset}`);
  console.log(`${C.dim}  ${CONTENT_DIR}${C.reset}\n`);

  const activeList = state.mode === 'PINNED' ? state.pinned : state.pool;
  const maxLines = process.stdout.rows ? process.stdout.rows - 10 : 20;

  // --- Pinned Section ---
  console.log(`${C.bright}${C.cyan}📌 PINNED ITEMS (${state.pinned.length})${C.reset}`);
  if (state.pinned.length === 0) {
    console.log(C.dim + '   (No pinned items)' + C.reset);
  } else {
    state.pinned.forEach((item, idx) => {
      const isSelected = state.mode === 'PINNED' && state.cursor === idx;
      const isDragging = isSelected && state.dragging;
      
      let prefix = ` ${idx + 1}. `;
      if (isSelected) prefix = isDragging ? ` ${C.green}MOVE${C.reset} ` : ` ${C.cyan}➜${C.reset}  `;
      
      const title = item.title.length > 50 ? item.title.substring(0, 47) + '...' : item.title;
      const line = `${prefix}${isDragging ? C.green : ''}${title}${C.reset} ${C.dim}(${item.date})${C.reset}`;
      
      console.log(line);
    });
  }

  console.log(C.dim + '─'.repeat(40) + C.reset);

  // --- Pool Section ---
  console.log(`${C.bright}${C.white}📂 UNPINNED POOL (${state.pool.length})${C.reset}`);
  
  // Calculate viewport for pool
  const poolStart = Math.max(0, state.mode === 'POOL' ? state.cursor - 5 : 0);
  const poolEnd = Math.min(state.pool.length, poolStart + 10);
  
  if (poolStart > 0) console.log(C.dim + '   ... ' + C.reset);
  
  state.pool.slice(poolStart, poolEnd).forEach((item, idx) => {
    const realIdx = poolStart + idx;
    const isSelected = state.mode === 'POOL' && state.cursor === realIdx;
    
    let prefix = '    ';
    if (isSelected) prefix = ` ${C.cyan}➜${C.reset}  `;
    
    const title = item.title.length > 50 ? item.title.substring(0, 47) + '...' : item.title;
    console.log(`${prefix}${title} ${C.dim}(${item.date})${C.reset}`);
  });

  if (poolEnd < state.pool.length) console.log(C.dim + '   ... ' + C.reset);

  // Footer / Status
  console.log('\n' + C.dim + '─'.repeat(60) + C.reset);
  if (state.message) {
    console.log(state.message);
    // Clear message after render if it's not a persistent one
    // (Managed manually in input handler)
  } else {
    if (state.mode === 'PINNED') {
      if (state.dragging) {
        console.log(`${C.green}DRAG MODE${C.reset} • ${C.bright}↑/↓${C.reset}: Move • ${C.bright}Space${C.reset}: Drop`);
      } else {
        console.log(`${C.bright}Space${C.reset}: Reorder • ${C.bright}Tab${C.reset}: Go to Pool • ${C.bright}x${C.reset}: Unpin • ${C.bright}s${C.reset}: Save`);
      }
    } else {
      console.log(`${C.bright}Enter${C.reset}: Pin Item • ${C.bright}Tab${C.reset}: Go to Pinned • ${C.bright}s${C.reset}: Save`);
    }
  }
}

// --- Input Handling ---

function handleInput(key) {
  state.message = ''; // Clear status

  // Global Keys
  if (key.name === 'c' && key.ctrl) process.exit();
  if (key.name === 'q' || key.name === 'escape') process.exit();
  
  if (key.name === 's') {
    saveItems();
    setTimeout(() => { state.message = ''; render(); }, 2000);
    return;
  }

  // Navigation
  if (key.name === 'up') {
    if (state.dragging && state.mode === 'PINNED') {
      // Move Item Logic
      if (state.cursor > 0) {
        const item = state.pinned[state.cursor];
        state.pinned.splice(state.cursor, 1);
        state.pinned.splice(state.cursor - 1, 0, item);
        state.cursor--;
        state.dirty = true;
      }
    } else {
      // Normal Nav
      state.cursor = Math.max(0, state.cursor - 1);
    }
  }

  if (key.name === 'down') {
    const list = state.mode === 'PINNED' ? state.pinned : state.pool;
    if (state.dragging && state.mode === 'PINNED') {
      // Move Item Logic
      if (state.cursor < state.pinned.length - 1) {
        const item = state.pinned[state.cursor];
        state.pinned.splice(state.cursor, 1);
        state.pinned.splice(state.cursor + 1, 0, item);
        state.cursor++;
        state.dirty = true;
      }
    } else {
      // Normal Nav
      state.cursor = Math.min(list.length - 1, state.cursor + 1);
    }
  }

  // Mode Switching
  if (key.name === 'tab') {
    if (state.dragging) return; // Block while dragging
    state.mode = state.mode === 'PINNED' ? 'POOL' : 'PINNED';
    state.cursor = 0;
  }

  // Actions based on mode
  if (state.mode === 'PINNED') {
    if (state.pinned.length > 0) {
      if (key.name === 'space') {
        state.dragging = !state.dragging;
      }
      if (key.name === 'x' || key.name === 'delete' || key.name === 'backspace') {
        if (!state.dragging) {
          // Unpin
          const item = state.pinned.splice(state.cursor, 1)[0];
          state.pool.unshift(item); // Add to top of pool temporarily
          // Resort pool by date to keep it clean? Optional. 
          // Let's keep it simple: insert at top is usually fine for UX
          state.pool.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          state.cursor = Math.min(state.cursor, state.pinned.length - 1);
          state.dirty = true;
        }
      }
    }
  } else if (state.mode === 'POOL') {
    if (state.pool.length > 0) {
      if (key.name === 'return' || key.name === 'enter') {
        // Pin item
        const item = state.pool.splice(state.cursor, 1)[0];
        state.pinned.push(item);
        state.dirty = true;
        
        // Optional: switch to pinned mode to show it landed?
        // state.mode = 'PINNED';
        // state.cursor = state.pinned.length - 1;
        
        // Or just stay in pool to pin more
        state.cursor = Math.min(state.cursor, state.pool.length - 1);
        state.message = `${C.green}Pinned "${item.title}"${C.reset}`;
      }
    }
  }
}

// --- Init ---

async function main() {
  await loadItems();
  
  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) process.stdin.setRawMode(true);

  process.stdin.on('keypress', (str, key) => {
    handleInput(key);
    render();
  });

  render();
}

main().catch(console.error);

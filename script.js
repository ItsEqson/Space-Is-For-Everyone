const subjects = [
  { id: 'math', name: 'Math', icon: '✚', color: '#ffe1a7', piece: 'Supply plan', teaser: 'Load supplies and see the numbers change.', title: 'Pack the rocket', tip: 'Try changing the crew size. Watch how the water packs and cargo space change.', notes: [
    ['Count for every astronaut', 'Each crew member needs their own supplies. Multiplication is a quick way to count equal groups.'],
    ['Make room', 'Space inside a rocket is limited. Engineers measure how much cargo fits before launch.'],
    ['Check the plan', 'Changing one number can change the whole supply list.'] ] },
  { id: 'science', name: 'Science', icon: '◐', color: '#bfe4d9', piece: 'Planet model', teaser: 'Shape a planet and experiment with its look.', title: 'Create a new world', tip: 'A planet’s shape, surface, and rings make a model easier to study and describe.', notes: [
    ['Gravity shapes worlds', 'Gravity pulls material toward a planet’s center, making large worlds nearly round.'],
    ['Surfaces tell stories', 'A world can look rocky, icy, or cloudy. Scientists study clues in its surface.'],
    ['Rings are many pieces', 'Planetary rings are made of many small bits of ice, dust, or rock.'] ] },
  { id: 'reading', name: 'Reading & Writing', icon: '✎', color: '#cbdafa', piece: 'Explorer message', teaser: 'Compose a visual report for mission control.', title: 'Send a field report', tip: 'Choose what you discovered, where it is, and what the crew should do next.', notes: [
    ['Observe closely', 'Explorers notice details before they report a discovery.'],
    ['Give a location', 'A clear report helps the crew find the same place.'],
    ['Share a next step', 'Good communication helps teammates decide what to do.'] ] },
  { id: 'art', name: 'Art & Design', icon: '✦', color: '#f7cbd4', piece: 'Mission patch', teaser: 'Design a patch using shapes and symbols.', title: 'Design a mission patch', tip: 'Try a shape, symbol, and color combination that tells your mission’s story.', notes: [
    ['Shapes have meaning', 'A circle can suggest a planet; a shield can suggest protection.'],
    ['Color catches attention', 'Strong color choices make a design easy to spot.'],
    ['Keep it clear', 'A simple symbol is easier for a crew to recognize.'] ] },
  { id: 'engineering', name: 'Engineering & Technology', icon: '⚙', color: '#dfd0f5', piece: 'Rocket design', teaser: 'Change a rocket’s parts and test its look.', title: 'Build your rocket', tip: 'Experiment with the nose, fins, engine flame, and body color.', notes: [
    ['Start with a model', 'Engineers build models to try out a design before making a full spacecraft.'],
    ['Parts have jobs', 'The body carries cargo, the engine pushes, and fins can help a model stay steady.'],
    ['Improve and try again', 'Each change is a chance to test a new idea.'] ] },
  { id: 'history', name: 'History & Teamwork', icon: '✋', color: '#f8d7b8', piece: 'Crew plan', teaser: 'Build a crew and a plan for the next launch.', title: 'Plan the next mission', tip: 'Assign crew jobs and choose how the team will improve after a test.', notes: [
    ['Learn from earlier tests', 'Teams record what happened so they can improve the next attempt.'],
    ['Different people help', 'A mission needs builders, explorers, communicators, and careful planners.'],
    ['Decide together', 'Sharing observations helps a crew make a stronger plan.'] ] }
];

const defaults = {
  math: { crew: 2, packs: 3, cargo: 2 },
  science: { shape: 'round', color: 'coral', surface: 'craters', rings: 'single', size: 62 },
  reading: { find: 'craters', place: 'north', action: 'explore' },
  art: { shape: 'circle', color: 'gold', symbol: 'star', border: 'solid' },
  engineering: { nose: 'point', fins: 'wide', color: 'white', flame: 'orange' },
  history: { captain: 'explorer', helper: 'engineer', plan: 'redesign' }
};
const palettes = { coral: '#f19277', mint: '#83d8bd', violet: '#bda6ed', blue: '#84bbeb', gold: '#ffcf61', white: '#f8f9fd' };
const storeKey = 'space-is-for-everyone-progress-v2';
const oldStoreKey = 'space-is-for-everyone-progress-v1';
const designKey = 'space-is-for-everyone-designs-v2';
const $ = id => document.getElementById(id);
const safeRead = key => { try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; } };
const previous = safeRead(oldStoreKey);
let completed = safeRead(storeKey);
let savedDesigns = safeRead(designKey);
let activeSubject = null;
let working = null;
for (const subject of subjects) if (previous[subject.id] && !completed[subject.id]) completed[subject.id] = { legacy: true };

function escapeHTML(value) { return String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char])); }
function validState(id, candidate) {
  const options = {
    math: { crew: [1,2,3,4], packs: [1,2,3,4,5], cargo: [1,2,3,4] },
    science: { shape: ['round','oval','squashed'], color: ['coral','mint','violet','blue'], surface: ['craters','stripes','clouds'], rings: ['none','single','double'], size: [40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90] },
    reading: { find: ['craters','ice','rocks'], place: ['north','valley','ridge'], action: ['explore','photograph','map'] },
    art: { shape: ['circle','shield','diamond'], color: ['gold','mint','violet','blue'], symbol: ['star','planet','rocket'], border: ['solid','dashed'] },
    engineering: { nose: ['point','round','flat'], fins: ['wide','small','swept'], color: ['white','blue','coral','mint'], flame: ['orange','blue','violet'] },
    history: { captain: ['explorer','scientist','pilot'], helper: ['engineer','artist','writer'], plan: ['redesign','retest','record'] }
  }[id];
  const result = { ...defaults[id] };
  if (candidate && typeof candidate === 'object') for (const key in options) if (options[key].includes(candidate[key])) result[key] = candidate[key];
  return result;
}

function renderSubjectList(activeId) {
  $('subject-list').innerHTML = subjects.map((s, i) => `<a class="subject-link ${activeId === s.id ? 'is-active' : ''}" href="#studio/${s.id}" ${activeId === s.id ? 'aria-current="page"' : ''} style="--subject-color:${s.color}"><span class="subject-link-icon" aria-hidden="true">${s.icon}</span><span class="subject-link-name"><small>0${i + 1}</small>${s.name}</span><span class="subject-link-done" aria-label="${completed[s.id] ? 'Saved to mission board' : ''}">${completed[s.id] ? '✓' : '↗'}</span></a>`).join('');
  $('sidebar-progress').textContent = `${subjects.filter(s => completed[s.id]).length} of 6 pieces saved`;
}
function renderBoard() {
  const count = subjects.filter(s => completed[s.id]).length;
  $('progress-fill').style.width = `${count / subjects.length * 100}%`;
  $('progress-track').setAttribute('aria-valuenow', String(count));
  $('progress-label').textContent = `${count} of 6 mission pieces collected${count === 6 ? ' — mission ready!' : ''}`;
  $('mission-grid').innerHTML = subjects.map(s => {
    const result = completed[s.id];
    const state = validState(s.id, savedDesigns[s.id]);
    const icon = {
      math: `${state.crew} 🧑‍🚀 · ${state.crew * state.packs} 💧`,
      science: `<i class="board-planet ${state.rings === 'none' ? '' : 'has-ring'}" style="--board-color:${palettes[state.color]}"></i>`,
      reading: { craters:'◌', ice:'❄', rocks:'◆' }[state.find],
      art: `<i class="board-patch patch-${state.shape}" style="--board-color:${palettes[state.color]}">${{ star:'★', planet:'◐', rocket:'🚀' }[state.symbol]}</i>`,
      engineering: '🚀',
      history: { explorer:'🧑‍🚀', scientist:'🔬', pilot:'👩‍✈️' }[state.captain] + ' + ' + { engineer:'🛠️', artist:'🎨', writer:'✎' }[state.helper]
    }[s.id];
    return `<a class="mission-piece ${result ? 'is-complete' : ''}" href="#studio/${s.id}"><span class="board-art" aria-hidden="true">${icon}</span><strong>${s.piece}</strong><small>${result ? 'Edit creation ↗' : 'Open studio ↗'}</small></a>`;
  }).join('');
}
function showRoute() {
  const hash = decodeURIComponent(location.hash.slice(1));
  const studioId = hash.startsWith('studio/') ? hash.slice(7) : null;
  const subject = subjects.find(s => s.id === studioId) || subjects[0];
  const view = hash === 'mission-board' ? 'board' : 'studio';
  $('studio-view').hidden = view !== 'studio';
  $('board-view').hidden = view !== 'board';
  $('sidebar-notes').hidden = view === 'board';
  $('board-nav').classList.toggle('is-active', view === 'board');
  if (view === 'studio') openStudio(subject);
  renderSubjectList(view === 'studio' ? subject.id : null);
  if (view === 'board') renderBoard();
  requestAnimationFrame(() => window.scrollTo(0, 0));
}
function openStudio(subject) {
  if (activeSubject?.id !== subject.id) {
    activeSubject = subject;
    working = validState(subject.id, savedDesigns[subject.id]);
  }
  const i = subjects.indexOf(subject);
  $('studio-count').textContent = `STUDIO 0${i + 1} / 06`;
  $('studio-kicker').textContent = `SUBJECT 0${i + 1} · EXPLORE AND CREATE`;
  $('studio-title').textContent = subject.name;
  $('studio-intro').textContent = subject.teaser;
  $('studio-icon').textContent = subject.icon;
  $('studio-icon').style.background = subject.color;
  $('workshop-title').textContent = subject.title;
  $('studio-tip').textContent = subject.tip;
  $('studio-notes').innerHTML = subject.notes.map((note, n) => `<article class="note"><span>0${n + 1}</span><div><h3>${note[0]}</h3><p>${note[1]}</p></div></article>`).join('');
  $('feedback').textContent = '';
  $('save-creation').textContent = completed[subject.id] ? 'Update mission piece ✓' : 'Add to mission board →';
  $('next-subject').href = `#studio/${subjects[(i + 1) % subjects.length].id}`;
  $('next-subject').textContent = i === subjects.length - 1 ? 'First subject →' : 'Next subject →';
  renderActivity();
}
function select(label, key, values) {
  return `<label class="control-field">${label}<select data-key="${key}">${values.map(([value, text]) => `<option value="${value}" ${working[key] === value ? 'selected' : ''}>${text}</option>`).join('')}</select></label>`;
}
function range(label, key, min, max, unit = '') {
  return `<label class="control-field">${label} <strong id="value-${key}">${working[key]}${unit}</strong><input type="range" data-key="${key}" min="${min}" max="${max}" value="${working[key]}"></label>`;
}
function stage(content, label) { return `<div class="visual-stage" role="img" aria-label="${escapeHTML(label)}"><div class="stage-stars" aria-hidden="true"></div>${content}</div>`; }
function renderActivity(previewOnly = false) {
  const id = activeSubject.id;
  let controls = '';
  let visual = '';
  if (id === 'math') {
    const total = working.crew * working.packs;
    const packs = Array.from({length: total}, () => '<span class="water-pack" aria-hidden="true">💧</span>').join('');
    visual = stage(`<div class="cargo-scene"><div class="cargo-rocket">🚀</div><div class="crew-row">${'🧑‍🚀'.repeat(working.crew)}</div><div class="cargo-bay">${packs}</div><div class="crate-row">${'📦'.repeat(working.cargo)}</div><div class="scene-caption">${working.crew} astronauts × ${working.packs} packs = <strong>${total} water packs</strong> · ${working.cargo} crates</div></div>`, `Rocket cargo with ${total} water packs and ${working.cargo} crates for ${working.crew} astronauts`);
    controls = range('Astronauts', 'crew', 1, 4) + range('Water packs each', 'packs', 1, 5) + range('Cargo crates', 'cargo', 1, 4);
  } else if (id === 'science') {
    const color = palettes[working.color];
    visual = stage(`<div class="planet-scene"><div class="made-planet shape-${working.shape} surface-${working.surface} rings-${working.rings}" style="--planet-color:${color};--planet-size:${working.size}%;"><span class="surface-detail"></span></div><div class="scene-caption">${working.shape} · ${working.surface} · ${working.rings === 'none' ? 'no rings' : working.rings === 'single' ? 'one ring' : 'two rings'}</div></div>`, `A ${working.color} ${working.shape} planet with ${working.surface} and ${working.rings === 'none' ? 'no rings' : working.rings === 'single' ? 'one ring' : 'two rings'}`);
    controls = select('Planet shape', 'shape', [['round','Round'],['oval','Oval'],['squashed','Wide']]) + select('Color', 'color', [['coral','Coral'],['mint','Mint'],['violet','Violet'],['blue','Blue']]) + select('Surface', 'surface', [['craters','Craters'],['stripes','Stripes'],['clouds','Clouds']]) + select('Rings', 'rings', [['none','No rings'],['single','One ring'],['double','Two rings']]) + range('Planet size', 'size', 40, 90, '%');
  } else if (id === 'reading') {
    const finds = { craters:['◌','Craters'], ice:['❄','Ice'], rocks:['◆','Rocks'] };
    const places = { north:'North plain', valley:'Valley', ridge:'Ridge' };
    const actions = { explore:'Explore it', photograph:'Take photos', map:'Map the area' };
    visual = stage(`<div class="report-scene"><div class="report-landscape"><span>${finds[working.find][0]}</span></div><div class="report-card"><span>FIELD REPORT · SOL 01</span><strong>We found ${finds[working.find][1].toLowerCase()} at the ${places[working.place].toLowerCase()}.</strong><p>Next step: ${actions[working.action]}.</p></div></div>`, `Field report showing ${finds[working.find][1]} at the ${places[working.place]}`);
    controls = select('What did you find?', 'find', [['craters','Craters'],['ice','Ice'],['rocks','Rocks']]) + select('Where?', 'place', [['north','North plain'],['valley','Valley'],['ridge','Ridge']]) + select('Next step', 'action', [['explore','Explore it'],['photograph','Take photos'],['map','Map the area']]);
  } else if (id === 'art') {
    const icons = { star:'★', planet:'◐', rocket:'🚀' };
    visual = stage(`<div class="patch-scene"><div class="made-patch patch-${working.shape} border-${working.border}" style="--patch-color:${palettes[working.color]}"><span>${icons[working.symbol]}</span></div><div class="scene-caption">MISSION PATCH · ${working.symbol.toUpperCase()}</div></div>`, `A ${working.color} ${working.shape} mission patch with a ${working.symbol} symbol`);
    controls = select('Patch shape', 'shape', [['circle','Circle'],['shield','Shield'],['diamond','Diamond']]) + select('Color', 'color', [['gold','Gold'],['mint','Mint'],['violet','Violet'],['blue','Blue']]) + select('Symbol', 'symbol', [['star','Star'],['planet','Planet'],['rocket','Rocket']]) + select('Edge', 'border', [['solid','Solid'],['dashed','Dashed']]);
  } else if (id === 'engineering') {
    visual = stage(`<div class="rocket-scene"><div class="made-rocket nose-${working.nose} fins-${working.fins}" style="--rocket-color:${palettes[working.color]}"><div class="made-nose"></div><div class="made-body"><span class="made-window"></span></div><div class="made-fin left"></div><div class="made-fin right"></div><div class="made-flame flame-${working.flame}"></div></div><div class="scene-caption">${working.nose} nose · ${working.fins} fins · ${working.flame} flame</div></div>`, `Rocket with ${working.nose} nose, ${working.fins} fins, and ${working.flame} flame`);
    controls = select('Nose shape', 'nose', [['point','Pointed'],['round','Rounded'],['flat','Flat']]) + select('Fins', 'fins', [['wide','Wide'],['small','Small'],['swept','Swept']]) + select('Body color', 'color', [['white','White'],['blue','Blue'],['coral','Coral'],['mint','Mint']]) + select('Engine flame', 'flame', [['orange','Orange'],['blue','Blue'],['violet','Violet']]);
  } else {
    const roles = { explorer:['🧑‍🚀','Explorer'], scientist:['🔬','Scientist'], pilot:['👩‍✈️','Pilot'], engineer:['🛠️','Engineer'], artist:['🎨','Artist'], writer:['✎','Writer'] };
    const plans = { redesign:['✏️','Redesign the model'], retest:['🚀','Run another test'], record:['📋','Record what happened'] };
    visual = stage(`<div class="crew-scene"><div class="crew-pair"><div><span>${roles[working.captain][0]}</span><strong>${roles[working.captain][1]}</strong></div><b>+</b><div><span>${roles[working.helper][0]}</span><strong>${roles[working.helper][1]}</strong></div></div><div class="plan-board"><small>AFTER THE TEST</small><strong>${plans[working.plan][0]} ${plans[working.plan][1]}</strong></div></div>`, `Crew with a ${roles[working.captain][1]} and ${roles[working.helper][1]} who will ${plans[working.plan][1].toLowerCase()}`);
    controls = select('Lead crew member', 'captain', [['explorer','Explorer'],['scientist','Scientist'],['pilot','Pilot']]) + select('Teammate', 'helper', [['engineer','Engineer'],['artist','Artist'],['writer','Writer']]) + select('After a test', 'plan', [['redesign','Redesign the model'],['retest','Run another test'],['record','Record what happened']]);
  }
  if (previewOnly) {
    $('activity-area').querySelector('.visual-stage').outerHTML = visual;
    const value = $(`value-${eventKey}`);
    if (value) value.textContent = `${working[eventKey]}${eventKey === 'size' ? '%' : ''}`;
  } else {
    $('activity-area').innerHTML = `<div class="activity-layout">${visual}<div class="control-panel"><h3>Change your creation</h3><p>Try different settings and watch the preview.</p>${controls}</div></div>`;
  }
}

let eventKey = '';
$('activity-area').addEventListener('input', event => {
  const key = event.target.dataset.key;
  if (!key || !activeSubject) return;
  working[key] = event.target.type === 'range' ? Number(event.target.value) : event.target.value;
  working = validState(activeSubject.id, working);
  eventKey = key;
  renderActivity(true);
  $('feedback').textContent = '';
});
$('save-creation').addEventListener('click', () => {
  if (!activeSubject) return;
  savedDesigns[activeSubject.id] = { ...working };
  completed[activeSubject.id] = { created: true };
  try { localStorage.setItem(designKey, JSON.stringify(savedDesigns)); localStorage.setItem(storeKey, JSON.stringify(completed)); } catch { $('feedback').textContent = 'Created! Browser storage is unavailable, so this may not stay after you close the page.'; }
  if (!$('feedback').textContent) $('feedback').textContent = `${activeSubject.piece} added to your mission board!`;
  $('save-creation').textContent = 'Update mission piece ✓';
  renderSubjectList(activeSubject.id);
  renderBoard();
});
window.addEventListener('hashchange', showRoute);
renderBoard();
showRoute();

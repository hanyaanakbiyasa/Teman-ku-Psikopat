import { createWorld } from './world.js';
import { createPlayer } from './player.js';
import { createUI } from './ui.js';

const root = document.querySelector('#game');
const ui = createUI();
let world = null;
let player = null;
let started = false;
let phase = 'menu';
let sensitivity = 1;

document.querySelector('#playButton').addEventListener('click', startGame);
document.querySelector('#settingsButton').addEventListener('click', () => ui.showModal('settingsPanel'));
document.querySelector('#creditButton').addEventListener('click', () => ui.showModal('creditPanel'));
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', ui.hideModals));
document.querySelector('#sensitivity').addEventListener('input', event => {
  sensitivity = Number(event.target.value);
});

async function startGame() {
  if (started) return;
  started = true;
  phase = 'loading';
  document.querySelector('#mainMenu').classList.add('hidden');
  try {
    world = createWorld(root);
    player = createPlayer(world.camera, world.renderer.domElement, () => sensitivity);
    ui.showHud();
    await openingCutscene();
  } catch (error) {
    console.error('Game initialization failed:', error);
    started = false;
    phase = 'menu';
    document.querySelector('#mainMenu').classList.remove('hidden');
    alert('Game gagal dimuat. Pastikan koneksi internet aktif dan browser mendukung WebGL.');
  }
}

async function openingCutscene() {
  phase = 'cutscene';
  player.setEnabled(false);
  player.setPosition(0, 1.65, 1.7);
  world.setRoomLighting();
  await ui.fade(false);
  await ui.dialogue('Hadeh... lapar banget.');
  await ui.dialogue('Dari tadi belum makan apa-apa.');
  await ui.dialogue('Eh, bentar...');
  await ui.dialogue('Warung temen gue masih buka kayaknya.');
  ui.hideDialogue();
  phase = 'room';
  ui.setObjective('KELUAR DARI KAMAR. DEKATI PINTU.');
  player.setEnabled(true);
}

function interact() {
  if (!player || !world || phase === 'cutscene') return;
  const position = player.getPosition();
  if (phase === 'room' && world.isNearDoor(position)) {
    world.openDoor();
    phase = 'door';
    ui.setObjective('KELUAR KE JALAN');
  } else if (phase === 'street' && world.isNearStall(position)) {
    phase = 'arrived';
    ui.setObjective('TUJUAN TERCAPAI');
    ui.dialogue('Akhirnya... sampai juga.');
  }
}

document.addEventListener('keydown', event => {
  if (event.code === 'KeyE') interact();
});

function updateProgress(position) {
  if (phase === 'door' && world.isOutside(position)) {
    phase = 'street';
    world.setStreetLighting();
    ui.setObjective('IKUTI JALAN MENUJU WARUNG BAKSO MAGELANG RIZKI');
  }
}

function animate() {
  requestAnimationFrame(animate);
  if (!world) return;
  const delta = Math.min(world.clock.getDelta(), 0.05);
  if (player) {
    player.update(delta);
    const position = player.getPosition();
    ui.setHint(world.getHint(position, phase));
    updateProgress(position);
  }
  world.renderer.render(world.scene, world.camera);
}

window.addEventListener('resize', () => world?.resize());
animate();

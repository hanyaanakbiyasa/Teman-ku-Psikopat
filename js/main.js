import { createWorld } from "./world.js";
import { createPlayer } from "./player.js";
import { createUI } from "./ui.js";

const gameRoot = document.querySelector("#game");
const ui = createUI();
let world;
let player;
let started = false;
let locked = false;

const state = {
  phase: "menu",
  objective: "BANGUN DAN KELUAR DARI KAMAR",
  doorOpen: false,
  outside: false,
  stallReached: false
};

document.querySelector("#playButton").addEventListener("click", startGame);
document.querySelector("#settingsButton").addEventListener("click", () => ui.showModal("settingsPanel"));
document.querySelector("#creditButton").addEventListener("click", () => ui.showModal("creditPanel"));
document.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", ui.hideModals));

function startGame() {
  if (started) return;
  started = true;
  document.querySelector("#mainMenu").classList.add("hidden");
  world = createWorld(gameRoot);
  player = createPlayer(world.camera, world.renderer.domElement, () => Number(document.querySelector("#sensitivity").value));
  ui.showHud();
  runOpening();
}

async function runOpening() {
  state.phase = "cutscene";
  player.setEnabled(false);
  await ui.fade(false);
  await ui.dialogue("Hadeh... lapar banget.");
  await ui.dialogue("Dari tadi belum makan apa-apa.");
  await ui.dialogue("Eh, bentar...");
  await ui.dialogue("Warung temen gue masih buka kayaknya.");
  await ui.fade(true);
  ui.hideDialogue();
  state.phase = "room";
  state.objective = "KELUAR DARI KAMAR. DEKATI PINTU.";
  ui.setObjective(state.objective);
  world.setRoomLighting();
  player.setPosition(0, 1.65, 2.8);
  await ui.fade(false);
  player.setEnabled(true);
}

function interact() {
  if (state.phase === "room" && world.isNearDoor(player.getPosition())) {
    world.openDoor();
    state.doorOpen = true;
    state.phase = "door";
    state.objective = "KELUAR KE JALAN";
    ui.setObjective(state.objective);
    return;
  }
  if (state.phase === "door" && world.isOutside(player.getPosition())) {
    state.phase = "street";
    state.outside = true;
    state.objective = "IKUTI JALAN MENUJU WARUNG BAKSO MAGELANG RIZKI";
    ui.setObjective(state.objective);
    world.setStreetLighting();
    return;
  }
  if (state.phase === "street" && world.isNearStall(player.getPosition())) {
    state.phase = "arrived";
    state.stallReached = true;
    ui.dialogue("Akhirnya... sampai juga.");
    ui.setObjective("TUJUAN TERCAPAI");
  }
}

document.addEventListener("keydown", event => {
  if (event.code === "KeyE" && player && state.phase !== "cutscene") interact();
  if (event.code === "Escape" && player) player.releasePointer();
});

function animate() {
  requestAnimationFrame(animate);
  if (world) {
    const delta = world.clock.getDelta();
    if (player) {
      player.update(delta);
      const position = player.getPosition();
      ui.setHint(world.getHint(position, state.phase));
      if (state.phase === "door" && world.isOutside(position)) {
        state.phase = "street";
        state.objective = "IKUTI JALAN MENUJU WARUNG BAKSO MAGELANG RIZKI";
        ui.setObjective(state.objective);
        world.setStreetLighting();
      }
      if (state.phase === "street" && world.isNearStall(position)) {
        state.phase = "arrived";
        ui.setObjective("TUJUAN TERCAPAI");
        ui.dialogue("Akhirnya... sampai juga.");
      }
    }
    world.renderer.render(world.scene, world.camera);
  }
}
animate();

window.addEventListener("resize", () => world?.resize());

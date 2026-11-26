export function createUI() {
  const objective = document.querySelector('#objective');
  const hint = document.querySelector('#interactionHint');
  const dialogueBox = document.querySelector('#dialogueBox');
  const dialogueText = document.querySelector('#dialogueText');
  const fade = document.querySelector('#fade');
  let resolveDialogue = null;

  function showHud() {
    document.querySelector('#hud').classList.remove('hidden');
  }

  function setObjective(text) {
    objective.textContent = `OBJECTIVE: ${text}`;
  }

  function setHint(text) {
    hint.textContent = text || '';
    hint.classList.toggle('hidden', !text);
  }

  function showModal(id) {
    document.getElementById(id).classList.remove('hidden');
  }

  function hideModals() {
    document.querySelectorAll('.modal').forEach(panel => panel.classList.add('hidden'));
  }

  function closeDialogue() {
    if (!resolveDialogue) return;
    const resolve = resolveDialogue;
    resolveDialogue = null;
    dialogueBox.classList.add('hidden');
    resolve();
  }

  function dialogue(text) {
    dialogueText.textContent = text;
    dialogueBox.classList.remove('hidden');
    return new Promise(resolve => { resolveDialogue = resolve; });
  }

  function advanceDialogue(event) {
    if (!resolveDialogue) return;
    if (event.code === 'Space' || event.code === 'Enter') {
      event.preventDefault();
      closeDialogue();
    }
  }

  document.addEventListener('keydown', advanceDialogue);
  dialogueBox.addEventListener('click', closeDialogue);

  function fadeTo(black) {
    fade.classList.toggle('active', black);
    return new Promise(resolve => window.setTimeout(resolve, 1050));
  }

  return { showHud, setObjective, setHint, showModal, hideModals, hideDialogue: closeDialogue, dialogue, fade: fadeTo };
}

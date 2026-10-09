/* 拖动只作用于把手，项目链接始终保持正常点击/键盘访问。
   位置仅保留在本次页面访问中；刷新或 Reset layout 恢复原图。 */
(() => {
  const notes = [...document.querySelectorAll('.movable')];
  const mobile = window.matchMedia('(max-width: 600px)');
  const position = new WeakMap();
  let active = null;
  function place(note, x, y) {
    // 限制在所属分区内，避免拖出画布后无法找回。
    const frame = note.parentElement;
    x = Math.max(8 - note.offsetLeft, Math.min(x, frame.clientWidth - note.offsetLeft - note.offsetWidth - 8));
    y = Math.max(60 - note.offsetTop, Math.min(y, frame.clientHeight - note.offsetTop - note.offsetHeight - 12));
    position.set(note, {x, y});
    note.style.setProperty('--dx', `${x}px`);
    note.style.setProperty('--dy', `${y}px`);
  }
  notes.forEach(note => {
    const handle = note.querySelector('.drag-handle');
    handle.addEventListener('pointerdown', event => {
      if (mobile.matches || event.button !== 0 || active) return;
      event.preventDefault();
      const previous = position.get(note) || {x:0,y:0};
      active = {note, id:event.pointerId, startX:event.clientX, startY:event.clientY, ...previous};
      handle.setPointerCapture(event.pointerId);
      note.classList.add('dragging');
    });
    handle.addEventListener('pointermove', event => {
      if (!active || active.note !== note || active.id !== event.pointerId) return;
      place(note, active.x + event.clientX - active.startX, active.y + event.clientY - active.startY);
    });
    const end = () => { note.classList.remove('dragging'); if(active?.note === note) active = null; };
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
    handle.addEventListener('lostpointercapture', end);
    handle.addEventListener('keydown', event => {
      const moves = {ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]};
      if (!moves[event.key]) return;
      event.preventDefault();
      const previous = position.get(note) || {x:0,y:0};
      place(note, previous.x + moves[event.key][0], previous.y + moves[event.key][1]);
    });
  });
  function reset() {
    active = null;
    notes.forEach(note => {position.delete(note);note.style.removeProperty('--dx');note.style.removeProperty('--dy');note.classList.remove('dragging');});
  }
  document.querySelector('#reset-layout').addEventListener('click', () => {
    reset();document.querySelector('#status').textContent = 'Original layout restored.';
  });
  window.addEventListener('resize', reset);
})();

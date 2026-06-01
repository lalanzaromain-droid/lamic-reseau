// ui.js — Composants UI réutilisables (modales, drag & drop, toast)

// ─── Toast ──────────────────────────────────────────────
function showToast(msg, duration = 3000) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.className = 'toast show';
  setTimeout(() => { t.className = 'toast'; }, duration);
}

// ─── Modale ─────────────────────────────────────────────
function showModal(title, bodyHtml, buttons = []) {
  let overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.remove();

  overlay = document.createElement('div');
  overlay.id = 'modal-overlay';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${title}</h3>
        <button class="modal-close" onclick="document.getElementById('modal-overlay').remove()">&times;</button>
      </div>
      <div class="modal-body">${bodyHtml}</div>
      <div class="modal-footer" id="modal-footer"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  const footer = document.getElementById('modal-footer');
  buttons.forEach(b => {
    const btn = document.createElement('button');
    btn.textContent = b.label;
    btn.className = b.class || 'btn';
    btn.onclick = () => { b.action(); overlay.remove(); };
    footer.appendChild(btn);
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.remove();
}

// ─── Drag & Drop (touch + mouse) ────────────────────────
function initDragDrop(container, onReorder) {
  let dragItem = null;
  let placeholder = null;
  let startY = 0;
  let itemHeight = 0;

  function getItems() {
    return [...container.querySelectorAll('.drag-item:not(.drag-placeholder)')];
  }

  function createPlaceholder() {
    placeholder = document.createElement('div');
    placeholder.className = 'drag-item drag-placeholder';
    placeholder.style.height = itemHeight + 'px';
    return placeholder;
  }

  function onStart(item, y) {
    dragItem = item;
    startY = y;
    itemHeight = item.offsetHeight;
    item.classList.add('dragging');
    item.parentNode.insertBefore(createPlaceholder(), item.nextSibling);
  }

  function onMove(y) {
    if (!dragItem) return;
    const items = getItems();
    for (const item of items) {
      const rect = item.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      if (y < mid && item !== dragItem) {
        container.insertBefore(placeholder, item);
        break;
      }
      if (item === items[items.length - 1] && y > mid) {
        container.insertBefore(placeholder, item.nextSibling);
      }
    }
    // Auto-scroll
    const containerRect = container.getBoundingClientRect();
    if (y - containerRect.top < 80) container.scrollTop -= 8;
    if (containerRect.bottom - y < 80) container.scrollTop += 8;
  }

  function onEnd() {
    if (!dragItem || !placeholder) return;
    container.insertBefore(dragItem, placeholder);
    dragItem.classList.remove('dragging');
    placeholder.remove();
    dragItem = null;
    placeholder = null;
    // Callback avec le nouvel ordre
    const ids = getItems().map(el => el.dataset.id);
    if (onReorder) onReorder(ids);
  }

  // Mouse events
  container.addEventListener('mousedown', (e) => {
    const handle = e.target.closest('.drag-handle');
    if (!handle) return;
    const item = handle.closest('.drag-item');
    if (!item) return;
    e.preventDefault();
    onStart(item, e.clientY);
    const moveHandler = (e2) => onMove(e2.clientY);
    const upHandler = () => {
      onEnd();
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', upHandler);
    };
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
  });

  // Touch events
  container.addEventListener('touchstart', (e) => {
    const handle = e.target.closest('.drag-handle');
    if (!handle) return;
    const item = handle.closest('.drag-item');
    if (!item) return;
    onStart(item, e.touches[0].clientY);
  }, { passive: true });

  container.addEventListener('touchmove', (e) => {
    if (!dragItem) return;
    e.preventDefault();
    onMove(e.touches[0].clientY);
  }, { passive: false });

  container.addEventListener('touchend', () => onEnd());
}

// ─── Loader ─────────────────────────────────────────────
function showLoader() {
  let l = document.getElementById('loader');
  if (!l) {
    l = document.createElement('div');
    l.id = 'loader';
    l.className = 'loader-overlay';
    l.innerHTML = '<div class="loader-spinner"></div>';
    document.body.appendChild(l);
  }
  l.style.display = 'flex';
}

function hideLoader() {
  const l = document.getElementById('loader');
  if (l) l.style.display = 'none';
}

export { showToast, showModal, closeModal, initDragDrop, showLoader, hideLoader };

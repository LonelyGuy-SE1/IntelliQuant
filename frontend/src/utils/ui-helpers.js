/**
 * UI Helper Functions
 * Custom modals, toasts, and loading states
 */

// ========== MODAL SYSTEM ==========
export function showModal(title, message, options = {}) {
  const overlay = document.getElementById('modalOverlay');
  const modal = document.getElementById('customModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const modalFooter = document.getElementById('modalFooter');
  const confirmBtn = document.getElementById('modalConfirmBtn');
  const cancelBtn = document.getElementById('modalCancelBtn');

  modalTitle.textContent = title;
  modalBody.innerHTML = message;

  // Handle buttons
  if (options.showCancel !== false) {
    cancelBtn.style.display = 'inline-flex';
  } else {
    cancelBtn.style.display = 'none';
  }

  if (options.confirmText) {
    confirmBtn.textContent = options.confirmText;
  } else {
    confirmBtn.textContent = 'Confirm';
  }

  // Show modal
  overlay.classList.add('active');

  return new Promise((resolve) => {
    const handleConfirm = () => {
      hideModal();
      resolve(true);
    };

    const handleCancel = () => {
      hideModal();
      resolve(false);
    };

    confirmBtn.onclick = handleConfirm;
    cancelBtn.onclick = handleCancel;
    document.getElementById('modalClose').onclick = handleCancel;

    // Close on overlay click
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        handleCancel();
      }
    };
  });
}

export function hideModal() {
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.remove('active');
}

// ========== TOAST SYSTEM ==========
let toastId = 0;

export function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toastContainer');
  const id = `toast-${toastId++}`;

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  };

  const toast = document.createElement('div');
  toast.id = id;
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <div class="toast-content">
      <div class="toast-message">${message}</div>
    </div>
  `;

  container.appendChild(toast);

  // Auto remove
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }

  // Click to dismiss
  toast.onclick = () => removeToast(id);

  return id;
}

export function removeToast(id) {
  const toast = document.getElementById(id);
  if (toast) {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }
}

export function showSuccess(message, duration = 3000) {
  return showToast(message, 'success', duration);
}

export function showError(message, duration = 5000) {
  return showToast(message, 'error', duration);
}

export function showInfo(message, duration = 3000) {
  return showToast(message, 'info', duration);
}

export function showWarning(message, duration = 4000) {
  return showToast(message, 'warning', duration);
}

// ========== LOADING STATE ==========
export function showLoading(message = 'Loading...') {
  const overlay = document.getElementById('loadingOverlay');
  const loadingMessage = document.getElementById('loadingMessage');

  loadingMessage.textContent = message;
  overlay.classList.add('active');
}

export function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  overlay.classList.remove('active');
}

// ========== NAVIGATION ==========
export function navigateToSection(sectionName) {
  // Update nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.section === sectionName) {
      item.classList.add('active');
    }
  });

  // Update sections
  document.querySelectorAll('.content-section').forEach(section => {
    section.classList.remove('active');
  });

  const targetSection = document.getElementById(`section-${sectionName}`);
  if (targetSection) {
    targetSection.classList.add('active');
  }

  // Close mobile sidebar
  if (window.innerWidth <= 1024) {
    document.getElementById('sidebar').classList.remove('active');
  }
}

export default {
  showModal,
  hideModal,
  showToast,
  showSuccess,
  showError,
  showInfo,
  showWarning,
  showLoading,
  hideLoading,
  navigateToSection
};

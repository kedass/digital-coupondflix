/*
 * Coupondflix — JavaScript
 * Vanilla JS · interactions, filters, modal flow, persistence
 */

const CATEGORIES = [
  { id: 'all', label: 'Tutti' },
  { id: 'food', label: 'Cibo' },
  { id: 'uscite', label: 'Uscite' },
  { id: 'relax', label: 'Relax' },
  { id: 'special', label: 'Speciali' },
];

const COUPONS = [
  {
    id: 'pizza-mare',
    title: 'Pizza al mare',
    description: 'Niente di più bello di guardare Temptation a mare, no?',
    icon: '🌊',
    category: 'food',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80',
    terms: 'Valido per una serata a stagione con un falò di confronto anticipato gratuito',
    status: 'available',
    availableDays: [5, 8, 10, 12, 14, 17, 20, 22, 25, 28],
    slots: ['19:30', '20:30', '21:30', '22:00'],
  },
  {
    id: 'cena-romantica',
    title: 'Cena romantica',
    description: 'Può sempre essere la solita cena "romantica", però se pago io non penso che rifiuti!',
    icon: '🍽️',
    category: 'food',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    terms: 'Il tavolo è riservato per una serata speciale.',
    status: 'available',
    availableDays: [4, 7, 9, 11, 13, 16, 19, 21, 24, 27],
    slots: ['19:00', '20:00', '21:00', '22:30'],
  },
  {
    id: 'bowling',
    title: 'Bowling',
    description: 'Siccome non mi hai invitata al tuo compleanno in questo posto, lo faccio io!',
    icon: '🎳',
    category: 'uscite',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
    terms: 'Perfetto per una serata spensierata.',
    status: 'available',
    availableDays: [6, 8, 11, 15, 18, 20, 23, 26, 29],
    slots: ['18:30', '20:00', '21:30'],
  },
  {
    id: 'netflix-relax',
    title: 'Netflix & Relax',
    description: 'So benissimo che il 90% delle sere ti scocci di uscire, questa mi sembra una buona soluzione',
    icon: '🎬',
    category: 'relax',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    terms: 'Disponibile per una serata tutta per voi.',
    status: 'available',
    availableDays: [3, 5, 10, 12, 16, 19, 21, 24, 28],
    slots: ['19:30', '20:30', '21:30', '22:20'],
  },
  {
    id: 'piscina',
    title: 'Piscina',
    description: 'Per questa serve che mi inviti tu a casa di tua zia!!',
    icon: '🏊',
    category: 'special',
    image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80',
    terms: 'Utilizzabile per disponibilità altrui',
    status: 'available',
    availableDays: [2, 4, 9, 13, 17, 22, 25, 27],
    slots: ['12:00', '14:00', '16:00'],
  },
];

const STORAGE_KEY = 'coupondflix_coupon_states';

let coupons = [];
let activeFilter = 'all';
let selectedCouponId = null;
let bookingState = {
  phase: 'details',
  selectedDay: null,
  selectedTime: null,
  month: new Date().getMonth(),
  year: new Date().getFullYear(),
};

const DOM = {
  landing: null,
  dashboard: null,
  enterBtn: null,
  filterButtons: null,
  couponsGrid: null,
  completionBanner: null,
  modalOverlay: null,
  modalClose: null,
  modalCancel: null,
  modalPrimary: null,
  modalTitle: null,
  modalDescription: null,
  modalMeta: null,
  modalIcon: null,
  modalEyebrow: null,
  modalBody: null,
  modalConfirmText: null,
  loadingOverlay: null,
};

function loadCouponStates() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const states = JSON.parse(saved);
      coupons = COUPONS.map((coupon) => ({
        ...coupon,
        status: states[coupon.id] || coupon.status,
      }));
    } else {
      coupons = COUPONS.map((coupon) => ({ ...coupon }));
    }
  } catch (error) {
    console.warn('Could not load coupon states:', error);
    coupons = COUPONS.map((coupon) => ({ ...coupon }));
  }
}

function saveCouponStates() {
  try {
    const states = {};
    coupons.forEach((coupon) => {
      states[coupon.id] = coupon.status;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
  } catch (error) {
    console.warn('Could not save coupon states:', error);
  }
}

function updateCouponStatus(couponId, newStatus) {
  const coupon = coupons.find((item) => item.id === couponId);
  if (coupon) {
    coupon.status = newStatus;
    saveCouponStates();
  }
}

function initDOMReferences() {
  DOM.landing = document.getElementById('landing');
  DOM.dashboard = document.getElementById('dashboard');
  DOM.enterBtn = document.getElementById('enter-btn');
  DOM.filterButtons = document.getElementById('filter-buttons');
  DOM.couponsGrid = document.getElementById('coupons-grid');
  DOM.completionBanner = document.getElementById('completion-banner');
  DOM.modalOverlay = document.getElementById('modal-overlay');
  DOM.modalClose = document.getElementById('modal-close');
  DOM.modalCancel = document.getElementById('modal-cancel');
  DOM.modalPrimary = document.getElementById('modal-primary');
  DOM.modalTitle = document.getElementById('modal-title');
  DOM.modalDescription = document.getElementById('modal-description');
  DOM.modalMeta = document.getElementById('modal-meta');
  DOM.modalIcon = document.getElementById('modal-icon');
  DOM.modalEyebrow = document.getElementById('modal-eyebrow');
  DOM.modalBody = document.getElementById('modal-body');
  DOM.modalConfirmText = document.getElementById('modal-confirm-text');
  DOM.loadingOverlay = document.getElementById('loading-overlay');
}

function lockBodyScroll() {
  document.body.classList.add('modal-open');
}

function unlockBodyScroll() {
  document.body.classList.remove('modal-open');
}

function enterDashboard() {
  DOM.landing.classList.add('exit');

  setTimeout(() => {
    DOM.landing.classList.add('hidden');
    DOM.dashboard.classList.remove('hidden');

    requestAnimationFrame(() => {
      DOM.dashboard.classList.add('visible');
      renderCoupons();
    });
  }, 600);
}

function renderFilters() {
  DOM.filterButtons.innerHTML = CATEGORIES.map((cat) => `
    <button
      class="filter-btn ${cat.id === activeFilter ? 'active' : ''}"
      data-filter="${cat.id}"
      type="button"
    >
      ${cat.label}
    </button>
  `).join('');

  DOM.filterButtons.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => handleFilterChange(btn.dataset.filter));
  });
}

function handleFilterChange(filterId) {
  if (filterId === activeFilter) return;

  activeFilter = filterId;

  DOM.filterButtons.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.filter === filterId);
  });

  animateFilterTransition();
}

function animateFilterTransition() {
  const cards = DOM.couponsGrid.querySelectorAll('.coupon-card');
  cards.forEach((card) => card.classList.add('filtering-out'));

  setTimeout(() => {
    renderCoupons(true);
  }, 280);
}

function getStatusLabel(status) {
  const labels = {
    available: 'Disponibile',
    pending: 'In elaborazione',
    redeemed: 'Utilizzato',
  };
  return labels[status] || status;
}

function getCategoryLabel(category) {
  const labels = {
    food: 'Cibo',
    uscite: 'Uscite',
    relax: 'Relax',
    special: 'Speciali',
  };
  return labels[category] || category;
}

function createCouponCardHTML(coupon, index) {
  const isDisabled = coupon.status !== 'available';
  const cardClass = coupon.status !== 'available' ? `coupon-card--${coupon.status}` : '';
  const buttonLabel = coupon.status === 'pending'
    ? 'In elaborazione'
    : coupon.status === 'redeemed'
      ? 'Utilizzato'
      : 'Riscatta Coupon';

  return `
    <article
      class="coupon-card ${cardClass}"
      data-id="${coupon.id}"
      data-category="${coupon.category}"
      style="animation-delay: ${index * 0.08}s"
    >
      <div class="coupon-card__media">
        <img src="${coupon.image}" alt="${coupon.title}" loading="lazy">
        <div class="coupon-card__media-overlay"></div>
        <span class="coupon-card__pill">${coupon.icon} ${getCategoryLabel(coupon.category)}</span>
      </div>
      <div class="coupon-card__content">
        <div class="coupon-card__head">
          <h3 class="coupon-card__title">${coupon.title}</h3>
          <span class="status-badge status-badge--${coupon.status}" data-status="${coupon.status}">${getStatusLabel(coupon.status)}</span>
        </div>
        <p class="coupon-card__description">${coupon.description}</p>
        <div class="coupon-card__terms">
          <span class="coupon-card__terms-title">Termini e condizioni</span>
          <p>${coupon.terms}</p>
        </div>
        <div class="coupon-card__footer">
          <button
            class="btn btn--primary btn--small ripple redeem-btn"
            type="button"
            data-coupon-id="${coupon.id}"
            ${isDisabled ? 'disabled' : ''}
          >
            ${buttonLabel}
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderCoupons(isFilterTransition = false) {
  const filtered = activeFilter === 'all'
    ? coupons
    : coupons.filter((coupon) => coupon.category === activeFilter);

  DOM.couponsGrid.innerHTML = filtered.map((coupon, index) => createCouponCardHTML(coupon, index)).join('');

  if (isFilterTransition) {
    DOM.couponsGrid.querySelectorAll('.coupon-card').forEach((card, index) => {
      card.classList.remove('filtering-out');
      card.classList.add('filtering-in');
      card.style.animationDelay = `${index * 0.06}s`;
    });
  }

  attachCardEventListeners();
  renderCompletionBanner();
}

function attachCardEventListeners() {
  DOM.couponsGrid.querySelectorAll('.redeem-btn:not(:disabled)').forEach((btn) => {
    btn.addEventListener('click', () => openModal(btn.dataset.couponId));
  });
}

function getSelectedCoupon() {
  return coupons.find((item) => item.id === selectedCouponId) || null;
}

function resetBookingState() {
  bookingState = {
    phase: 'details',
    selectedDay: null,
    selectedTime: null,
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  };
}

function formatMonthLabel() {
  return new Intl.DateTimeFormat('it-IT', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(bookingState.year, bookingState.month, 1));
}

function renderBookingView() {
  const coupon = getSelectedCoupon();
  if (!coupon) return;

  const steps = ['1', '2', '3', '4'];
  const activeStep = bookingState.phase === 'details' ? 0 : bookingState.phase === 'calendar' ? 1 : bookingState.phase === 'times' ? 2 : 3;

  DOM.modalEyebrow.textContent = bookingState.phase === 'details'
    ? 'Prenotazione rapida'
    : bookingState.phase === 'calendar'
      ? 'Scegli il giorno'
      : bookingState.phase === 'times'
        ? 'Scegli l’orario'
        : 'Conferma';

  DOM.modalBody.innerHTML = `
    <div class="booking-stepper" aria-label="Progressi prenotazione">
      ${steps.map((step, index) => `
        <span class="booking-step ${index === activeStep ? 'booking-step--active' : index < activeStep ? 'booking-step--done' : ''}">${step}</span>
      `).join('')}
    </div>
  `;

  if (bookingState.phase === 'details') {
    DOM.modalBody.innerHTML += `
      <div class="booking-panel">
        <div class="booking-panel__badge">Pronto per la tua serata</div>
        <p class="booking-help">Seleziona un giorno disponibile e l’orario perfetto per il tuo appuntamento.</p>
        <div class="booking-summary">
          <div class="booking-summary__row">
            <span class="booking-summary__label">Coupon</span>
            <strong class="booking-summary__value">${coupon.title}</strong>
          </div>
          <div class="booking-summary__row">
            <span class="booking-summary__label">Esperienza</span>
            <span class="booking-summary__value">${coupon.description}</span>
          </div>
        </div>
      </div>
    `;
    DOM.modalConfirmText.textContent = 'Scegli il giorno e l’orario, poi conferma la prenotazione.';
    DOM.modalPrimary.textContent = 'Scegli il giorno';
    DOM.modalPrimary.disabled = false;
    return;
  }

  if (bookingState.phase === 'calendar') {
    const monthLabel = formatMonthLabel();
    const firstDay = new Date(bookingState.year, bookingState.month, 1);
    const firstWeekday = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(bookingState.year, bookingState.month + 1, 0).getDate();
    const cells = [];

    for (let i = 0; i < firstWeekday; i += 1) {
      cells.push('<div class="booking-day booking-day--muted"></div>');
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const isAvailable = coupon.availableDays.includes(day);
      const isSelected = bookingState.selectedDay === day;
      const classes = ['booking-day'];
      if (isAvailable) classes.push('booking-day--available');
      if (isSelected) classes.push('booking-day--selected');
      if (!isAvailable) classes.push('booking-day--muted');

      cells.push(`
        <button
          class="${classes.join(' ')}"
          type="button"
          data-day="${day}"
          ${isAvailable ? '' : 'disabled'}
        >
          ${day}
        </button>
      `);
    }

    DOM.modalBody.innerHTML += `
      <div class="booking-panel">
        <div class="booking-panel__badge">Giorno</div>
        <p class="booking-help">${monthLabel.charAt(0).toUpperCase()}${monthLabel.slice(1)}</p>
        <div class="booking-calendar__header">
          <span>Lun</span><span>Mar</span><span>Mer</span><span>Gio</span><span>Ven</span><span>Sab</span><span>Dom</span>
        </div>
        <div class="booking-grid booking-grid--days">
          ${cells.join('')}
        </div>
      </div>
    `;
    DOM.modalConfirmText.textContent = 'Seleziona un giorno disponibile per continuare.';
    DOM.modalPrimary.textContent = 'Continua';
    DOM.modalPrimary.disabled = !bookingState.selectedDay;
    attachBookingEvents();
    return;
  }

  if (bookingState.phase === 'times') {
    DOM.modalBody.innerHTML += `
      <div class="booking-panel">
        <div class="booking-panel__badge">Orario</div>
        <p class="booking-help">Hai scelto il ${bookingState.selectedDay} ${formatMonthLabel().toLowerCase()}.</p>
        <div class="booking-grid booking-grid--times">
          ${coupon.slots.map((slot) => `
            <button
              class="booking-time ${bookingState.selectedTime === slot ? 'booking-time--selected' : ''}"
              type="button"
              data-time="${slot}"
            >
              ${slot}
            </button>
          `).join('')}
        </div>
      </div>
    `;
    DOM.modalConfirmText.textContent = 'Scegli un orario e poi conferma la prenotazione.';
    DOM.modalPrimary.textContent = 'Conferma prenotazione';
    DOM.modalPrimary.disabled = !bookingState.selectedTime;
    attachBookingEvents();
    return;
  }

  DOM.modalBody.innerHTML += `
    <div class="booking-panel">
      <div class="booking-panel__badge">Conferma</div>
      <div class="booking-summary">
        <div class="booking-summary__row">
          <span class="booking-summary__label">Coupon</span>
          <strong class="booking-summary__value">${coupon.title}</strong>
        </div>
        <div class="booking-summary__row">
          <span class="booking-summary__label">Giorno</span>
          <span class="booking-summary__value">${bookingState.selectedDay} ${formatMonthLabel().toLowerCase()}</span>
        </div>
        <div class="booking-summary__row">
          <span class="booking-summary__label">Orario</span>
          <span class="booking-summary__value">${bookingState.selectedTime}</span>
        </div>
      </div>
    </div>
  `;
  DOM.modalConfirmText.textContent = 'La tua prenotazione è quasi pronta. Conferma e lasciati sorprendere.';
  DOM.modalPrimary.textContent = 'Conferma prenotazione';
  DOM.modalPrimary.disabled = false;
}

function attachBookingEvents() {
  DOM.modalBody.querySelectorAll('.booking-day--available').forEach((button) => {
    button.addEventListener('click', () => {
      bookingState.selectedDay = Number(button.dataset.day);
      bookingState.phase = 'times';
      renderBookingView();
    });
  });

  DOM.modalBody.querySelectorAll('.booking-time').forEach((button) => {
    button.addEventListener('click', () => {
      bookingState.selectedTime = button.dataset.time;
      renderBookingView();
    });
  });
}

function handleModalPrimary() {
  const coupon = getSelectedCoupon();
  if (!coupon) return;

  if (bookingState.phase === 'details') {
    bookingState.phase = 'calendar';
    renderBookingView();
    return;
  }

  if (bookingState.phase === 'calendar') {
    if (!bookingState.selectedDay) return;
    bookingState.phase = 'times';
    renderBookingView();
    return;
  }

  if (bookingState.phase === 'times') {
    if (!bookingState.selectedTime) return;
    bookingState.phase = 'confirm';
    renderBookingView();
    return;
  }

  confirmBooking();
}

function openModal(couponId) {
  const coupon = coupons.find((item) => item.id === couponId);
  if (!coupon || coupon.status !== 'available') return;

  selectedCouponId = couponId;
  resetBookingState();
  DOM.modalTitle.textContent = coupon.title;
  DOM.modalDescription.textContent = coupon.description;
  DOM.modalMeta.textContent = coupon.terms;
  DOM.modalIcon.textContent = coupon.icon;

  DOM.modalOverlay.classList.remove('hidden');
  DOM.modalOverlay.setAttribute('aria-hidden', 'false');

  requestAnimationFrame(() => {
    DOM.modalOverlay.classList.add('open');
    renderBookingView();
  });

  lockBodyScroll();
}

function closeModal() {
  DOM.modalOverlay.classList.remove('open');
  DOM.modalOverlay.setAttribute('aria-hidden', 'true');
  setTimeout(() => {
    DOM.modalOverlay.classList.add('hidden');
    selectedCouponId = null;
    DOM.modalBody.innerHTML = '';
    DOM.modalPrimary.textContent = 'Continua';
    DOM.modalPrimary.disabled = false;
    DOM.modalConfirmText.textContent = 'Scegli il giorno, l’orario e conferma la prenotazione.';
    DOM.modalEyebrow.textContent = 'Coupon selezionato';
    unlockBodyScroll();
  }, 350);
}

function showLoadingState() {
  DOM.loadingOverlay.classList.remove('hidden');
}

function hideLoadingState() {
  DOM.loadingOverlay.classList.add('hidden');
}

function showCelebration() {
  const burst = document.createElement('div');
  burst.className = 'celebration';
  burst.innerHTML = '<span>💖</span><span>✨</span><span>💫</span>';
  document.body.appendChild(burst);
  setTimeout(() => burst.remove(), 1600);
}

function confirmBooking() {
  if (!selectedCouponId) return;

  const coupon = getSelectedCoupon();
  if (!coupon || coupon.status !== 'available') return;

  closeModal();
  showLoadingState();
  notifyPartnerRedemption(coupon);

  setTimeout(() => {
    updateCouponStatus(coupon.id, 'pending');
    renderCoupons();
    hideLoadingState();

    setTimeout(() => {
      updateCouponStatus(coupon.id, 'redeemed');
      renderCoupons();
      showCelebration();
    }, 1800);
  }, 900);
}

function renderCompletionBanner() {
  const allRedeemed = coupons.every((coupon) => coupon.status === 'redeemed');
  if (allRedeemed) {
    DOM.completionBanner.classList.remove('hidden');
    DOM.completionBanner.innerHTML = '❤️ Hai utilizzato tutti i coupon disponibili. Il momento perfetto è ancora davanti a te.';
  } else {
    DOM.completionBanner.classList.add('hidden');
  }
}

function createRipple(event) {
  const button = event.currentTarget;
  if (!button.classList.contains('ripple')) return;

  const ripple = document.createElement('span');
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  ripple.classList.add('ripple-effect');
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;

  button.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
}

function initRippleEffect() {
  document.addEventListener('click', createRipple);
}

function handleKeyboardEvents(event) {
  if (event.key === 'Escape' && DOM.modalOverlay.classList.contains('open')) {
    closeModal();
  }
}

function sendEmailNotification(coupon) {
  console.info('[Future] Email notification for:', coupon.title);
}

function sendTelegramNotification(coupon) {
  console.info('[Future] Telegram notification for:', coupon.title);
}

function sendWhatsAppNotification(coupon) {
  console.info('[Future] WhatsApp notification for:', coupon.title);
}

async function syncWithBackend(couponId, status) {
  console.info('[Future] Backend sync:', couponId, status);
}

function notifyPartnerRedemption(coupon) {
  sendEmailNotification(coupon);
  sendTelegramNotification(coupon);
  sendWhatsAppNotification(coupon);
  syncWithBackend(coupon.id, 'pending');
}

function initApp() {
  initDOMReferences();
  loadCouponStates();
  renderFilters();
  initRippleEffect();

  DOM.enterBtn.addEventListener('click', enterDashboard);
  DOM.modalClose.addEventListener('click', closeModal);
  DOM.modalCancel.addEventListener('click', closeModal);
  DOM.modalPrimary.addEventListener('click', handleModalPrimary);

  DOM.modalOverlay.addEventListener('click', (event) => {
    if (event.target === DOM.modalOverlay) closeModal();
  });

  document.addEventListener('keydown', handleKeyboardEvents);
}

document.addEventListener('DOMContentLoaded', initApp);

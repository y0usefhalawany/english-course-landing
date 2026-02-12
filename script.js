function forcePageTopOnLoad() {
  const clearHash = () => {
    if (!window.location.hash) return;

    try {
      history.replaceState(null, document.title, window.location.pathname + window.location.search);
    } catch {
      // no-op
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };

  const resetView = () => {
    clearHash();
    scrollToTop();
  };

  try {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  } catch {
    // no-op
  }

  resetView();
  requestAnimationFrame(resetView);
  window.addEventListener("load", resetView, { once: true });
  setTimeout(resetView, 0);

  window.addEventListener("pageshow", resetView);
}

forcePageTopOnLoad();

const modalBackdrop = document.getElementById("modalBackdrop");
const closeModalBtn = document.getElementById("closeModalBtn");
const ctaBtn = document.getElementById("ctaBtn");
const ctaBtn2 = document.getElementById("ctaBtn2");
const modal = modalBackdrop ? modalBackdrop.querySelector(".modal") : null;

const form = document.getElementById("leadForm");
const successMsg = document.getElementById("successMsg");

const nameInput = document.getElementById("nameInput");
const emailInput = document.getElementById("emailInput");
const phoneInput = document.getElementById("phoneInput");

const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const phoneError = document.getElementById("phoneError");

const submitBtn = document.getElementById("submitBtn");

let isSubmitting = false;
let lastFocusedElement = null;

const focusableSelector =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function trackEvent(eventName, payload = {}) {
  const detail = { event: eventName, ...payload, ts: Date.now() };

  console.log("[tracking]", eventName, detail);

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, payload);
  } else if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: eventName, ...payload });
  }

  try {
    window.dispatchEvent(new CustomEvent("tracking:event", { detail }));
  } catch {
    // no-op
  }
}

function setupWebVitalsTracking() {
  if (typeof PerformanceObserver === "undefined") return;

  let lcp = 0;
  let cls = 0;
  let inp = 0;
  let sent = false;

  try {
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) lcp = Math.round(lastEntry.startTime);
    });
    lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
  } catch {
    // no-op
  }

  try {
    const clsObserver = new PerformanceObserver((entryList) => {
      entryList.getEntries().forEach((entry) => {
        if (!entry.hadRecentInput) cls += entry.value;
      });
    });
    clsObserver.observe({ type: "layout-shift", buffered: true });
  } catch {
    // no-op
  }

  try {
    const inpObserver = new PerformanceObserver((entryList) => {
      entryList.getEntries().forEach((entry) => {
        inp = Math.max(inp, Math.round(entry.duration));
      });
    });
    inpObserver.observe({ type: "event", buffered: true, durationThreshold: 16 });
  } catch {
    // no-op
  }

  function sendVitalsOnce() {
    if (sent) return;
    sent = true;

    trackEvent("web_vitals", {
      lcp_ms: lcp,
      inp_ms: inp,
      cls: Number(cls.toFixed(4)),
      page_path: window.location.pathname,
    });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") sendVitalsOnce();
  });

  window.addEventListener("pagehide", sendVitalsOnce);
}

function getFocusableElements() {
  if (!modal) return [];

  return [...modal.querySelectorAll(focusableSelector)].filter((element) => {
    const hidden = element.getAttribute("aria-hidden") === "true";
    return !hidden && !element.hasAttribute("disabled");
  });
}

function trapFocus(e) {
  const focusableElements = getFocusableElements();

  if (focusableElements.length === 0) {
    e.preventDefault();
    if (closeModalBtn) closeModalBtn.focus();
    return;
  }

  const first = focusableElements[0];
  const last = focusableElements[focusableElements.length - 1];
  const active = document.activeElement;

  if (e.shiftKey && (active === first || active === modalBackdrop)) {
    e.preventDefault();
    last.focus();
    return;
  }

  if (!e.shiftKey && (active === last || !modal.contains(active))) {
    e.preventDefault();
    first.focus();
  }
}

function openModal(triggerElement) {
  lastFocusedElement =
    triggerElement instanceof HTMLElement ? triggerElement : document.activeElement;

  modalBackdrop.classList.add("open");
  modalBackdrop.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  successMsg.textContent = "";
  clearErrors();

  const focusableElements = getFocusableElements();
  const firstFocusable = focusableElements[0] || closeModalBtn;

  setTimeout(() => {
    if (firstFocusable) firstFocusable.focus();
  }, 50);
}

function closeModal() {
  modalBackdrop.classList.remove("open");
  modalBackdrop.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");

  if (lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus();
  }
}

function clearErrors() {
  nameError.textContent = "";
  emailError.textContent = "";
  phoneError.textContent = "";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  const onlyDigits = phone.replace(/\D/g, "");
  return onlyDigits.length >= 10 && onlyDigits.length <= 15;
}

function setLoading(loading) {
  if (!submitBtn) return;

  submitBtn.disabled = loading;
  submitBtn.textContent = loading ? "جاري الإرسال..." : "إرسال";
  submitBtn.style.opacity = loading ? "0.8" : "1";
  submitBtn.style.cursor = loading ? "not-allowed" : "pointer";
}

if (ctaBtn) ctaBtn.addEventListener("click", () => openModal(ctaBtn));
if (ctaBtn2) ctaBtn2.addEventListener("click", () => openModal(ctaBtn2));
if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);

const scrollTargetLinks = document.querySelectorAll("[data-scroll-target]");
scrollTargetLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    const targetId = link.getAttribute("data-scroll-target");
    const target = targetId ? document.getElementById(targetId) : null;
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

modalBackdrop.addEventListener("click", (e) => {
  if (e.target === modalBackdrop) closeModal();
});

document.addEventListener("keydown", (e) => {
  if (!modalBackdrop.classList.contains("open")) return;

  if (e.key === "Escape") {
    closeModal();
    return;
  }

  if (e.key === "Tab") {
    trapFocus(e);
  }
});

setupWebVitalsTracking();

// ===== SCROLL REVEAL ANIMATIONS =====
(function initRevealAnimations() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach((el) => observer.observe(el));
  } else {
    // Fallback: show all immediately
    reveals.forEach((el) => el.classList.add('visible'));
  }
})();

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (isSubmitting) return;

  clearErrors();
  successMsg.textContent = "";

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const phone = phoneInput.value.trim();

  let ok = true;

  if (name.length < 2) {
    nameError.textContent = "اكتب اسم صحيح.";
    ok = false;
  }

  if (!isValidEmail(email)) {
    emailError.textContent = "اكتب إيميل صحيح.";
    ok = false;
  }

  if (!isValidPhone(phone)) {
    phoneError.textContent = "اكتب رقم موبايل صحيح.";
    ok = false;
  }

  if (!ok) return;

  isSubmitting = true;
  setLoading(true);

  const GOOGLE_FORM_ACTION =
    "https://docs.google.com/forms/d/e/1FAIpQLSce-lkDkbNCdELEH7nM1UHQxWimW0iEEGmZjY3gteM_Q-Uwjg/formResponse";

  const formData = new FormData();
  formData.append("entry.122485896", name);
  formData.append("entry.1852627432", email);
  formData.append("entry.2047924891", phone);

  try {
    await fetch(GOOGLE_FORM_ACTION, {
      method: "POST",
      mode: "no-cors",
      body: formData,
    });

    trackEvent("generate_lead", {
      form_id: "leadForm",
      source: "landing_page",
      method: "google_form",
    });

    successMsg.textContent = "تم استلام طلبك ✅ هنكلمك قريبًا.";
    form.reset();

    setTimeout(() => {
      closeModal();
      successMsg.textContent = "";
    }, 1400);
  } catch (err) {
    successMsg.textContent = "حصل خطأ. جرّب تاني.";
  } finally {
    isSubmitting = false;
    setLoading(false);
  }
});

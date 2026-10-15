(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const expandAllBtn = document.getElementById('btn-expand-all');
    const collapseAllBtn = document.getElementById('btn-collapse-all');
    const toggleButtons = document.querySelectorAll('.accordion-toggle-btn');

    toggleButtons.forEach(function (button) {
      button.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = button.getAttribute('data-target') || button.getAttribute('data-bs-target');
        if (!targetId) return;

        const targetEl = document.querySelector(targetId);
        const chevron = button.querySelector('.accordion-chevron');
        if (!targetEl) return;

        const isExpanded = button.getAttribute('aria-expanded') === 'true';

        if (isExpanded) {
          targetEl.classList.remove('show');
          button.setAttribute('aria-expanded', 'false');
          if (chevron) chevron.classList.remove('rotated');
        } else {
          targetEl.classList.add('show');
          button.setAttribute('aria-expanded', 'true');
          if (chevron) chevron.classList.add('rotated');
        }
      });

      button.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          button.click();
        }
      });
    });

    if (expandAllBtn) {
      expandAllBtn.addEventListener('click', function () {
        const collapses = document.querySelectorAll('.accordion-collapse-body');
        collapses.forEach(function (el) {
          el.classList.add('show');
        });

        toggleButtons.forEach(function (button) {
          button.setAttribute('aria-expanded', 'true');
          const chevron = button.querySelector('.accordion-chevron');
          if (chevron) chevron.classList.add('rotated');
        });
      });
    }

    if (collapseAllBtn) {
      collapseAllBtn.addEventListener('click', function () {
        const collapses = document.querySelectorAll('.accordion-collapse-body');
        collapses.forEach(function (el) {
          el.classList.remove('show');
        });

        toggleButtons.forEach(function (button) {
          button.setAttribute('aria-expanded', 'false');
          const chevron = button.querySelector('.accordion-chevron');
          if (chevron) chevron.classList.remove('rotated');
        });
      });
    }
  });
})();

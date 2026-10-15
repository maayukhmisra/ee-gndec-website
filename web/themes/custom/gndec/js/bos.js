(function (Drupal) {
  'use strict';

  Drupal.behaviors.bosPageLinks = {
    attach: function (context) {
      context.querySelectorAll('.hero-banner .field__label, .bos-page-wrapper .field__label, .field__label').forEach(function (label) {
        label.style.display = 'none';
      });

      context.querySelectorAll('.heading-container').forEach(function (container) {
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.textAlign = 'center';
        container.style.width = '100%';

        var textEl = container.querySelector('.heading-text');
        if (textEl) {
          textEl.style.color = '#b84018';
          textEl.style.fontSize = '2.25rem';
          textEl.style.fontWeight = '700';
          textEl.style.textTransform = 'uppercase';
          textEl.style.letterSpacing = '1.5px';
          textEl.style.textAlign = 'center';
        }

        var underlineEl = container.querySelector('.underline');
        if (underlineEl) {
          underlineEl.style.width = '50px';
          underlineEl.style.height = '3.5px';
          underlineEl.style.backgroundColor = '#b84018';
          underlineEl.style.margin = '6px auto 0 auto';
          underlineEl.style.borderRadius = '2px';
        }
      });

      // Delegate document card formatting to global.js
      if (typeof Drupal.behaviors.globalDocCardFormatter !== 'undefined' && Drupal.behaviors.globalDocCardFormatter.attach) {
        Drupal.behaviors.globalDocCardFormatter.attach(context);
      }
    }
  };
})(Drupal);


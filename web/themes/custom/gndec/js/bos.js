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

      context.querySelectorAll('.bos-page-wrapper iframe, .view-bos iframe, .views-row iframe, embed, object, .pdf-preview').forEach(function (preview) {
        if (!preview.closest('header') && !preview.closest('footer')) {
          preview.style.display = 'none';
          if (preview.parentNode) {
            preview.parentNode.removeChild(preview);
          }
        }
      });

      context.querySelectorAll('.doc-card, div.doc-card, .bos-document-card').forEach(function (card) {
        card.style.display = 'flex';
        card.style.flexDirection = 'row';
        card.style.alignItems = 'center';
        card.style.justifyContent = 'space-between';
        card.style.width = '100%';
        card.style.maxWidth = '100%';
      });

      var linkSelectors = [
        '.bos-page-wrapper a',
        '.view-bos a',
        '.view-id-bos a',
        '.block-views-block--bos a',
        '.views-element-container a',
        '.field--name-field-document a',
        '.field--name-field-file a',
        '.doc-card a',
        'a[href*=".pdf"]'
      ].join(', ');

      context.querySelectorAll(linkSelectors).forEach(function (link) {
        if (link.closest('header') || link.closest('footer') || link.closest('.site-branding') || link.closest('.menu--main')) {
          return;
        }

        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');

        var linkText = link.textContent.trim();
        if (['View PDF', 'View', 'PDF'].indexOf(linkText) !== -1 || linkText.toLowerCase().indexOf('view') !== -1) {
          link.innerHTML = 'View PDF &rarr;';
        } else if (link.href && link.href.indexOf('.pdf') !== -1 && linkText.indexOf('→') === -1) {
          if (link.closest('.views-field-field-document') || link.closest('.views-field-file') || link.closest('.doc-card')) {
            link.innerHTML = 'View PDF &rarr;';
          }
        }
      });

      var cardSelectors = [
        '.bos-page-wrapper .views-row',
        '.bos-document-card',
        '.doc-card',
        'div.doc-card',
        '.view-bos .views-row',
        'body.path-bos .views-row'
      ].join(', ');

      context.querySelectorAll(cardSelectors).forEach(function (card) {
        var targetLink = card.querySelector('a[href]');
        var hasValidHref = targetLink && targetLink.getAttribute('href') && targetLink.getAttribute('href') !== '#';

        if (hasValidHref) {
          card.style.cursor = 'pointer';
          card.classList.add('has-document');
        } else {
          card.style.cursor = 'default';
          card.classList.add('no-document');

          var docField = card.querySelector('.views-field-field-document, .views-field-file, .field--name-field-document');
          if (docField && !docField.querySelector('a')) {
            docField.innerHTML = '<span class="no-doc-text">No Document Attached</span>';
          }
        }

        card.addEventListener('click', function (event) {
          if (!event.target.closest('a')) {
            var link = card.querySelector('a[href]');
            if (link && link.getAttribute('href') && link.getAttribute('href') !== '#') {
              window.open(link.getAttribute('href'), '_blank', 'noopener,noreferrer');
            }
          }
        });
      });
    }
  };
})(Drupal);

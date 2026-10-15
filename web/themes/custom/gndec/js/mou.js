(function (Drupal) {
  'use strict';

  function removeNotFoundMessage(context) {
    const root = context || document;
    const elements = root.querySelectorAll('p, div, span, section, article, main, .block-system-main-block, #block-gndec-content');
    elements.forEach(function (el) {
      if (el.children.length === 0 && el.textContent && el.textContent.trim().indexOf('The requested page could not be found') !== -1) {
        el.style.display = 'none';
        el.style.visibility = 'hidden';

        let parent = el.parentElement;
        while (parent && parent !== document.body && !parent.classList.contains('main-content-blocks-wrapper')) {
          if (parent.querySelector('.block-content, .doc-card, .heading-wrapper, .heading-item')) {
            break;
          }
          parent.style.display = 'none';
          parent.style.visibility = 'hidden';
          parent = parent.parentElement;
        }
      }
    });
  }

  function styleDocCards(context) {
    const docCards = context.querySelectorAll('.doc-card');
    docCards.forEach(function (card) {
      const titleEl = card.querySelector('.doc-title');
      const titleText = titleEl ? titleEl.textContent.trim().toLowerCase() : '';
      const linkEl = card.querySelector('.doc-link, .views-field-field-document a, .field--name-field-document a, span.file a, a[href*=".pdf"]');
      const href = linkEl ? linkEl.getAttribute('href') : '';
      const iconWrapper = card.querySelector('.icon-wrapper');

      // Detect file extension type
      let fileType = 'pdf';
      if (titleText.endsWith('.gif') || titleText.endsWith('.jpg') || titleText.endsWith('.png') || (href && href.match(/\.(gif|jpg|png|jpeg)$/i))) {
        fileType = 'gif';
      } else if (titleText.endsWith('.docx') || titleText.endsWith('.doc') || (href && href.match(/\.(docx|doc)$/i))) {
        fileType = 'docx';
      }

      card.setAttribute('data-filetype', fileType);

      if (iconWrapper) {
        if (fileType === 'gif') {
          iconWrapper.className = 'icon-wrapper icon-image';
          iconWrapper.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
        } else if (fileType === 'docx') {
          iconWrapper.className = 'icon-wrapper icon-word';
          iconWrapper.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>';
        } else {
          iconWrapper.className = 'icon-wrapper icon-pdf';
          iconWrapper.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>';
        }
      }

      // Handle View link visibility & open in new tab
      if (linkEl) {
        if (!href || href === '#' || href.trim() === '' || href.indexOf('javascript:') === 0) {
          linkEl.style.display = 'none';
          linkEl.style.visibility = 'hidden';
          linkEl.classList.add('empty-link');
          const wrapper = linkEl.closest('.views-field-field-document, .field--name-field-document, .doc-link-wrapper');
          if (wrapper) {
            wrapper.style.display = 'none';
            wrapper.style.visibility = 'hidden';
          }
        } else {
          linkEl.style.display = 'inline-flex';
          linkEl.classList.remove('empty-link');
          if (linkEl.hasAttribute('download')) {
            linkEl.removeAttribute('download');
          }
          linkEl.setAttribute('target', '_blank');
          linkEl.setAttribute('rel', 'noopener noreferrer');
        }
      }
    });
  }

  Drupal.behaviors.mouPage = {
    attach: function (context) {
      removeNotFoundMessage(context);
      styleDocCards(context);
    }
  };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        removeNotFoundMessage(document);
        styleDocCards(document);
      });
    } else {
      removeNotFoundMessage(document);
      styleDocCards(document);
    }
  }
})(Drupal);

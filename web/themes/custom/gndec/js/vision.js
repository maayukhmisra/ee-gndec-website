(function (Drupal) {
  'use strict';

  function removeNotFoundMessage(context) {
    const root = context || document;
    
    // Find any element containing the text "The requested page could not be found"
    const elements = root.querySelectorAll('p, div, span, section, article, main, .block-system-main-block, #block-gndec-content');
    elements.forEach(function (el) {
      if (el.children.length === 0 && el.textContent && el.textContent.trim().indexOf('The requested page could not be found') !== -1) {
        el.style.display = 'none';
        el.style.visibility = 'hidden';

        // Hide parent container if it has no other content
        let parent = el.parentElement;
        while (parent && parent !== document.body && !parent.classList.contains('main-content-blocks-wrapper')) {
          if (parent.querySelector('.block-content, .card-vision, .card-mission, .attributes-list, .pso-list, .doc-card')) {
            break;
          }
          parent.style.display = 'none';
          parent.style.visibility = 'hidden';
          parent = parent.parentElement;
        }
      }
    });
  }

  Drupal.behaviors.visionPage = {
    attach: function (context) {
      // 1. Remove "The requested page could not be found." error message if present
      removeNotFoundMessage(context);

      // 2. Handle document download links (open in new tab if uploaded, hide if empty)
      const selectors = [
        '.doc-link',
        '.doc-card a',
        '.doc-item a',
        '.pdf-card a',
        'a[href$=".pdf"]',
        'a[href*="/sites/default/files/"]'
      ];
      
      const docLinks = context.querySelectorAll(selectors.join(', '));
      docLinks.forEach(function (link) {
        const href = link.getAttribute('href');
        
        // Hide link if no document is uploaded (href is empty, missing, or '#')
        if (!href || href === '#' || href.trim() === '' || href.indexOf('javascript:') === 0) {
          link.style.display = 'none';
          link.classList.add('empty-link');
        } else {
          // Document exists: display link and open in a new tab
          link.style.display = 'inline-flex';
          link.classList.remove('empty-link');
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        }
      });
    }
  };

  // Run on DOM Ready as fallback
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        removeNotFoundMessage(document);
      });
    } else {
      removeNotFoundMessage(document);
    }
  }
})(Drupal);

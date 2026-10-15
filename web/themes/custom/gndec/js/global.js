/**
 * @file
 * Global utilities.
 *
 */
(function (Drupal) {
  'use strict';

  Drupal.behaviors.gndecNavigation = {
    attach: function (context) {
      // Target parent menu items inside main header/navigation
      var menuSelectors = [
        'header.bg-navy li',
        '.menu--main li',
        '.region-primary-menu li',
        '.primary-menu-wrapper li'
      ].join(', ');

      var parentMenuItems = context.querySelectorAll(menuSelectors);

      parentMenuItems.forEach(function (li) {
        var subMenu = li.querySelector('ul, .dropdown-menu');
        if (!subMenu) {
          return;
        }

        // Add class indicating this menu item has a submenu
        li.classList.add('has-submenu');

        var toggleLink = li.querySelector(':scope > a, :scope > span, :scope > button');
        if (!toggleLink) {
          return;
        }

        // Avoid attaching multiple click listeners if attached previously
        if (toggleLink.dataset.gndecSubmenuAttached) {
          return;
        }
        toggleLink.dataset.gndecSubmenuAttached = 'true';

        toggleLink.addEventListener('click', function (e) {
          var isMobile = window.innerWidth <= 991.98;
          var href = toggleLink.getAttribute('href');
          var isPlaceholder = !href || href === '#' || href.indexOf('javascript:') === 0;
          var isOpen = li.classList.contains('is-open') || li.classList.contains('open');

          // On mobile or if link is a placeholder: toggle submenu on click
          if (isMobile || isPlaceholder) {
            // If it's not open, or if it's a placeholder link, intercept click to toggle
            if (!isOpen || isPlaceholder) {
              e.preventDefault();
              e.stopPropagation();

              // Close other open submenus at the same level
              var siblings = li.parentNode ? li.parentNode.children : [];
              Array.prototype.forEach.call(siblings, function (sibling) {
                if (sibling !== li) {
                  sibling.classList.remove('is-open');
                  sibling.classList.remove('open');
                  var sibLink = sibling.querySelector(':scope > a');
                  if (sibLink) {
                    sibLink.setAttribute('aria-expanded', 'false');
                  }
                }
              });

              // Toggle this submenu
              if (isOpen) {
                li.classList.remove('is-open');
                li.classList.remove('open');
                toggleLink.setAttribute('aria-expanded', 'false');
              } else {
                li.classList.add('is-open');
                li.classList.add('open');
                toggleLink.setAttribute('aria-expanded', 'true');
              }
            }
          } else {
            // On desktop with real links, toggle class on click if needed
            if (!isOpen && !isPlaceholder) {
              li.classList.add('is-open');
              li.classList.add('open');
              toggleLink.setAttribute('aria-expanded', 'true');
            }
          }
        });
      });

      // Close submenus on click outside (only attach listener once)
      if (!document.body.dataset.gndecMenuClickOutsideAttached) {
        document.body.dataset.gndecMenuClickOutsideAttached = 'true';
        document.addEventListener('click', function (e) {
          if (!e.target.closest('header.bg-navy, .menu--main, .region-primary-menu, .primary-menu-wrapper')) {
            var openItems = document.querySelectorAll('header.bg-navy li.is-open, .menu--main li.is-open, .region-primary-menu li.is-open, .primary-menu-wrapper li.is-open, header.bg-navy li.open, .menu--main li.open, .region-primary-menu li.open, .primary-menu-wrapper li.open');
            openItems.forEach(function (openLi) {
              openLi.classList.remove('is-open');
              openLi.classList.remove('open');
              var link = openLi.querySelector(':scope > a');
              if (link) {
                link.setAttribute('aria-expanded', 'false');
              }
            });
          }
        });

        // Close submenus on Escape key
        document.addEventListener('keydown', function (e) {
          if (e.key === 'Escape') {
            var openItems = document.querySelectorAll('header.bg-navy li.is-open, .menu--main li.is-open, .region-primary-menu li.is-open, .primary-menu-wrapper li.is-open, header.bg-navy li.open, .menu--main li.open, .region-primary-menu li.open, .primary-menu-wrapper li.open');
            openItems.forEach(function (openLi) {
              openLi.classList.remove('is-open');
              openLi.classList.remove('open');
              var link = openLi.querySelector(':scope > a');
              if (link) {
                link.setAttribute('aria-expanded', 'false');
              }
            });
          }
        });
      }
    }
  };

  // Global Document Links Behavior — ensures ALL document links open in a new tab without downloading
  Drupal.behaviors.globalDocumentTabOpener = {
    attach: function (context) {
      var docSelectors = [
        'a[href*=".pdf"]',
        'a[href*=".doc"]',
        'a[href*=".docx"]',
        'a[href*=".xls"]',
        'a[href*=".xlsx"]',
        'a[href*=".ppt"]',
        'a[href*=".pptx"]',
        'a[href*="sites/default/files"]',
        '.field--type-file a',
        'span.file a',
        '.pdf-view-link',
        '.pdf-download-link',
        '.doc-link'
      ].join(', ');

      var root = context || document;
      var links = root.querySelectorAll(docSelectors);
      links.forEach(function (link) {
        if (link.hasAttribute('download')) {
          link.removeAttribute('download');
        }

        var href = link.getAttribute('href');
        if (href && href !== '#' && href.indexOf('javascript:') !== 0) {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        }
      });
    }
  };

  // Universal Document Card Formatter Behavior
  Drupal.behaviors.globalDocCardFormatter = {
    attach: function (context) {
      var root = context || document;
      var rows = root.querySelectorAll('.doc-card, .views-row');

      rows.forEach(function (row) {
        if (row.dataset.docCardFormatted === 'true') {
          return;
        }

        // Look for document links or document field wrappers inside row
        var linkEl = row.querySelector('.views-field-field-document a, span.file a, a[href*=".pdf"], a[href*="sites/default/files"], a.doc-link');
        var docFieldWrapper = row.querySelector('.views-field-field-document, .views-field-file, .field--name-field-document');

        // Only process rows that belong to document views or contain document fields/links
        if (!linkEl && !row.classList.contains('doc-card') && !docFieldWrapper) {
          return;
        }

        row.dataset.docCardFormatted = 'true';
        row.classList.add('doc-card');

        // Extract title text
        var titleEl = row.querySelector('.views-field-title .field-content, .views-field-title, .doc-title, h3, h4');
        var titleText = titleEl ? titleEl.textContent.trim() : '';

        // Extract description text
        var descEl = row.querySelector('.views-field-body .field-content, .views-field-body, .doc-desc, p');
        var descText = descEl ? descEl.textContent.trim() : '';

        // Extract PDF link href
        var href = linkEl ? linkEl.getAttribute('href') : '';

        // Clear row content completely to avoid duplicate field outputs
        row.innerHTML = '';

        // Create doc-left container
        var docLeft = document.createElement('div');
        docLeft.className = 'doc-left';

        var iconWrapper = document.createElement('div');
        iconWrapper.className = 'icon-wrapper icon-pdf';
        iconWrapper.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>';

        var textWrapper = document.createElement('div');
        textWrapper.className = 'doc-text-wrapper';

        if (titleText) {
          var h4 = document.createElement('h4');
          h4.className = 'doc-title';
          h4.textContent = titleText;
          textWrapper.appendChild(h4);
        }

        if (descText && descText !== titleText) {
          var p = document.createElement('p');
          p.className = 'doc-desc';
          p.textContent = descText;
          textWrapper.appendChild(p);
        }

        docLeft.appendChild(iconWrapper);
        docLeft.appendChild(textWrapper);
        row.appendChild(docLeft);

        // Build right-aligned View button if valid href exists
        if (href && href !== '#' && href.trim() !== '' && href.indexOf('javascript:') !== 0) {
          var docRight = document.createElement('div');
          docRight.className = 'doc-right';

          var btn = document.createElement('a');
          btn.className = 'doc-link';
          btn.href = href;
          btn.target = '_blank';
          btn.rel = 'noopener noreferrer';
          btn.removeAttribute('download');
          btn.innerHTML = 'View &rarr;';

          docRight.appendChild(btn);
          row.appendChild(docRight);

          row.style.cursor = 'pointer';
          row.addEventListener('click', function (e) {
            if (!e.target.closest('a')) {
              window.open(href, '_blank', 'noopener,noreferrer');
            }
          });
        } else {
          row.style.cursor = 'default';
        }
      });
    }
  };
})(Drupal);





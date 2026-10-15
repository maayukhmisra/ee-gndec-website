(function (Drupal) {
  'use strict';

  Drupal.behaviors.videosPageLinks = {
    attach: function (context) {
      // PDF/Video link target assignment & card click handler to open video in a new tab
      var cardSelectors = [
        '.videos-page-wrapper .video-card',
        '.videos-page-wrapper .doc-card',
        '.videos-page-wrapper div.doc-card',
        '.videos-page-wrapper .views-row',
        'body.path-videos .views-row',
        'body.path-academics-videos .views-row'
      ].join(', ');

      context.querySelectorAll(cardSelectors).forEach(function (card) {
        // Ensure video links inside cards open in a new tab
        var videoLinks = card.querySelectorAll('a[href*="youtube.com"], a[href*="youtu.be"], a[href*="http"], a[href]');
        videoLinks.forEach(function (link) {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        });

        // Add card click listener to open video link if user clicks anywhere on card
        if (!card.dataset.videosClickAttached) {
          card.dataset.videosClickAttached = 'true';
          card.addEventListener('click', function (event) {
            if (!event.target.closest('a')) {
              var link = card.querySelector('a[href*="youtube.com"], a[href*="youtu.be"], a[href*="http"], a[href]');
              if (link && link.getAttribute('href') && link.getAttribute('href') !== '#') {
                window.open(link.getAttribute('href'), '_blank', 'noopener,noreferrer');
              }
            }
          });
        }
      });
    }
  };
})(Drupal);

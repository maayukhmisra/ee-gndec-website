(function (Drupal) {
  'use strict';

  Drupal.behaviors.programmesPage = {
    attach: function (context) {
      // Ensure all PDF links on the Programmes page open in a new tab
      var pdfLinks = context.querySelectorAll('.programmes-page-wrapper a[href*=".pdf"], .doc-view-pdf-link');
      pdfLinks.forEach(function (link) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
        if (link.hasAttribute('download')) {
          link.removeAttribute('download');
        }
      });
    }
  };
})(Drupal);

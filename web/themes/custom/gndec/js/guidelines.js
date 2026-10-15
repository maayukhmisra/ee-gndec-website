(function (Drupal) {
  'use strict';

  Drupal.behaviors.guidelinesPdfOpening = {
    attach: function (context) {
      if (typeof Drupal.behaviors.globalDocCardFormatter !== 'undefined' && Drupal.behaviors.globalDocCardFormatter.attach) {
        Drupal.behaviors.globalDocCardFormatter.attach(context);
      }
    }
  };
})(Drupal);


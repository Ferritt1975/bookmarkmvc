/*global angular */

/**
 * Directive that places focus on the element it is applied to when the
 * expression it binds to evaluates to true
 */
angular.module('bookmarkmvc').directive('bookmarkFocus', function bookmarkFocus($timeout) {
  'use strict';

  return function (scope, elem, attrs) {
    scope.$watch(attrs.bookmarkFocus, function (newVal) {
      if (newVal) {
        $timeout(function () {
          elem[0].focus();
        }, 0, false);
      }
    });
  };
});

/*global angular */

/**
 * The main BookmarkMVC app module
 *
 * @type {angular.Module}
 */
angular.module('bookmarkmvc', ['ngRoute', 'ngResource']).config(function ($routeProvider) {
  'use strict';

  var routeConfig = {
    controller: 'BookmarkCtrl',
    templateUrl: 'bookmarkmvc-index.html',
    resolve: {
      store: function (bookmarkStorage) {
        // Get the correct module (API or localStorage).
        return bookmarkStorage.then(function (module) {
          module.get(); // Fetch the bookmark records in the background.
          return module;
        });
      }
    }
  };

  $routeProvider.when('/', routeConfig).when('/:status', routeConfig).otherwise({
    redirectTo: '/'
  });
});

/*global angular */

/**
 * Services that persists and retrieves bookmarks from localStorage or a backend API
 * if available.
 *
 * They both follow the same API, returning promises for all changes to the
 * model.
 */
angular.module('bookmarkmvc')
  .factory('bookmarkStorage', function ($http, $injector) {
    'use strict';

    // Detect if an API backend is present. If so, return the API module, else
    // hand off the localStorage adapter
    return $http.get('/api')
      .then(function () {
        return $injector.get('api');
      }, function () {
        return $injector.get('localStorage');
      });
  })

  .factory('api', function ($resource) {
    'use strict';

    var store = {
      bookmarks: [],

      api: $resource('/api/bookmarks/:id', null,
        {
          update: { method:'PUT' }
        }
      ),

      clearFavorite: function () {
        var originalBookmarks = store.bookmarks.slice(0);

        var unfavoriteBookmarks = store.bookmarks.filter(function (bookmark) {
          return !bookmark.favorite;
        });

        angular.copy(unfavoriteBookmarks, store.bookmarks);

        return store.api.delete(function () {
          }, function error() {
            angular.copy(originalBookmarks, store.bookmarks);
          });
      },

      delete: function (bookmark) {
        var originalBookmarks = store.bookmarks.slice(0);

        store.bookmarks.splice(store.bookmarks.indexOf(bookmark), 1);
        return store.api.delete({ id: bookmark.id },
          function () {
          }, function error() {
            angular.copy(originalBookmarks, store.bookmarks);
          });
      },

      get: function () {
        return store.api.query(function (resp) {
          angular.copy(resp, store.bookmarks);
        });
      },

      insert: function (bookmark) {
        var originalBookmarks = store.bookmarks.slice(0);

        return store.api.save(bookmark,
          function success(resp) {
            bookmark.id = resp.id;
            store.bookmarks.push(bookmark);
          }, function error() {
            angular.copy(originalBookmarks, store.bookmarks);
          })
          .$promise;
      },

      put: function (bookmark) {
        return store.api.update({ id: bookmark.id }, bookmark)
          .$promise;
      }
    };

    return store;
  })

  .factory('localStorage', function ($q) {
    'use strict';

    var STORAGE_ID = 'bookmarks-angularjs';

    var store = {
      bookmarks: [],

      _getFromLocalStorage: function () {
        return JSON.parse(localStorage.getItem(STORAGE_ID) || '[]');
      },

      _saveToLocalStorage: function (bookmarks) {
        localStorage.setItem(STORAGE_ID, JSON.stringify(bookmarks));
      },

      clearFavorite: function () {
        var deferred = $q.defer();

        var unfavoriteBookmarks = store.bookmarks.filter(function (bookmark) {
          return !bookmark.favorite;
        });

        angular.copy(unfavoriteBookmarks, store.bookmarks);

        store._saveToLocalStorage(store.bookmarks);
        deferred.resolve(store.bookmarks);

        return deferred.promise;
      },

      delete: function (bookmark) {
        var deferred = $q.defer();

        store.bookmarks.splice(store.bookmarks.indexOf(bookmark), 1);

        store._saveToLocalStorage(store.bookmarks);
        deferred.resolve(store.bookmarks);

        return deferred.promise;
      },

      get: function () {
        var deferred = $q.defer();

        angular.copy(store._getFromLocalStorage(), store.bookmarks);
        deferred.resolve(store.bookmarks);

        return deferred.promise;
      },

      insert: function (bookmark) {
        var deferred = $q.defer();

	var l = store.bookmarks.filter(function (obj) { return obj.title == bookmark.title; });

        if ( l.length == 0 ) {
          store.bookmarks.push(bookmark);

          store._saveToLocalStorage(store.bookmarks);
        }
        
        deferred.resolve(store.bookmarks);
        return deferred.promise;
      },

      put: function (bookmark, index) {
        var deferred = $q.defer();

        store.bookmarks[index] = bookmark;

        store._saveToLocalStorage(store.bookmarks);
        deferred.resolve(store.bookmarks);

        return deferred.promise;
      }
    };

    return store;
  });

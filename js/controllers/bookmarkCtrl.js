/*global angular */

/**
 * The main controller for the app. The controller:
 * - retrieves and persists the model via the bookmarkStorage service
 * - exposes the model to the template and provides event handlers
 */
angular.module('bookmarkmvc')
  .controller('BookmarkCtrl', function BookmarkCtrl($scope, $window, $routeParams, $filter, store) {
    'use strict';

    var bookmarks = $scope.bookmarks = store.bookmarks;

    $scope.newBookmark = '';
    $scope.editedBookmark = null;

    $scope.$watch('bookmarks', function () {
      $scope.favoriteCount = $filter('filter')(bookmarks, { favorite: true }).length;
      $scope.allChecked = !$scope.remainingCount;
    }, true);

    // Monitor the current route for changes and adjust the filter accordingly.
    $scope.$on('$routeChangeSuccess', function () {
      var status = $scope.status = $routeParams.status || '';
      $scope.statusFilter = (status === 'active') ?
        { favorite: false } : (status === 'favorite') ?
        { favorite: true } : {};
    });

    $scope.addBookmark = function () {
      var newBookmark = {
        title: $scope.newBookmark.trim(),
        favorite: false
      };

      if (!newBookmark.title) {
        return;
      }

      if (newBookmark.title != undefined && newBookmark.title != null) {
        var url = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;
        if  (url.test(newBookmark.title)) {
          if (newBookmark.title.indexOf("http") != 0) {
           newBookmark.title  = "http://" + newBookmark.title;
          }
          $scope.isPresent = true;
          $scope.bookmarkForm.bookmarkURL.$setViewValue(undefined);
          $scope.bookmarkForm.bookmarkURL.$setPristine();
          $scope.bookmarkForm.bookmarkURL.$setUntouched();
          $scope.bookmarkForm.bookmarkURL.$setValidity('', true);
          $scope.bookmarkForm.submitted=false;
          $scope.bookmarkForm.$setPristine();
          $scope.bookmarkForm.$setUntouched();
          $scope.bookmarkForm.$setValidity('', true);
        } else {
          $scope.bookmarkForm.submitted=true;
          $scope.bookmarkForm.bookmarkURL.$setValidity('', false);
          $scope.bookmarkForm.bookmarkURL.$error.badURL=true;
          return;
        }
      } else {
        return;
      }

      $scope.saving = true;
      store.insert(newBookmark)
        .then(function success() {
          $scope.newBookmark = '';
        })
        .finally(function () {
          $scope.saving = false;
        });
    };

    $scope.editBookmark = function (bookmark) {
      $scope.editedBookmark = bookmark;
      // Clone the original bookmark to restore it on demand.
      $scope.originalBookmark = angular.extend({}, bookmark);
    };

    $scope.saveEdits = function (bookmark, event) {
      // Blur events are automatically triggered after the form submit event.
      // This does some unfortunate logic handling to prevent saving twice.
      if (event === 'blur' && $scope.saveEvent === 'submit') {
        $scope.saveEvent = null;
        return;
      }

      $scope.saveEvent = event;

      if ($scope.reverted) {
        // Bookmark edits were reverted-- don't save.
        $scope.reverted = null;
        return;
      }

      bookmark.title = bookmark.title.trim();

      if (bookmark.title === $scope.originalBookmark.title) {
        $scope.editedBookmark = null;
        return;
      }

      store[bookmark.title ? 'put' : 'delete'](bookmark)
        .then(function success() {}, function error() {
          bookmark.title = $scope.originalBookmark.title;
        })
        .finally(function () {
          $scope.editedBookmark = null;
        });
    };

    $scope.revertEdits = function (bookmark) {
      bookmarks[bookmarks.indexOf(bookmark)] = $scope.originalBookmark;
      $scope.editedBookmark = null;
      $scope.originalBookmark = null;
      $scope.reverted = true;
    };

    $scope.removeBookmark = function (bookmark) {
      store.delete(bookmark);
    };

    $scope.saveBookmark = function (bookmark) {
      store.put(bookmark);
    };

    $scope.toggleFavorite = function (bookmark, favorite) {
      if (angular.isDefined(favorite)) {
        bookmark.favorite = favorite;
      }
      store.put(bookmark, bookmarks.indexOf(bookmark))
        .then(function success() {}, function error() {
          bookmark.favorite = !bookmark.favorite;
        });
    };

    $scope.clearFavoriteBookmarks = function () {
      store.clearFavorite();
    };

  });

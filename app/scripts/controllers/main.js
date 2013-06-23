'use strict';

angular.module('AngularFeedReaderApp')
  .controller('MainCtrl', function ($scope, $http, $timeout, $filter) {

    $scope.refreshInterval = 60;
    
    $scope.stories = [];

    $scope.feeds = [{
      title: 'dailyjs',
      url: 'http://dailyjs.com/atom.xml',
      items:[]
    }];

    $scope.addFeed = function(feed) {
      if (feed.$valid) {
        var newFeed = angular.copy(feed);
        $scope.feeds.push(newFeed);
        $scope.fetchFeed(newFeed);
        $scope.newFeed = {};

      }
    };

    $scope.fetchFeed = function(feed){
        feed.items = [];

        var apiUrl = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D'";
        apiUrl += encodeURIComponent(feed.url);
        apiUrl += "'%20and%20%28itemPath%20%3D%20%27rss.channel.item%27%20or%20itemPath%20%3D%20%27feed.entry%27%29&format=json&diagnostics=true&callback=JSON_CALLBACK";

        $http.jsonp(apiUrl).
          success(function(data, status, headers, config) {
            if (data.query.results) {
              feed.items = data.query.results.entry || data.query.results.item;
            }
            addStories(feed.items);
          }).
          error(function(data, status, headers, config) {
            console.error('Error fetching feed:', data);
          });

        $timeout(function() { $scope.fetchFeed(feed); }, $scope.refreshInterval * 1000);

    };

    var addStories = function(stories) {
      var changed = false;
      for (var i = 0; i < stories.length; i++) {
        if (!storyInCollection(stories[i])) {
          $scope.stories.push(stories[i]);
          changed = true;
        }
      };

      if (changed) {
        $scope.stories = $filter('orderBy')($scope.stories, 'date');
      }
    };

    var storyInCollection = function(story) {
      for (var i = 0; i < $scope.stories.length; i++) {
        if ($scope.stories[i].id === story.id) {
          return true;
        }
      }
      return false;
    };

    $scope.deleteFeed = function(feed) {
      $scope.feeds.splice($scope.feeds.indexOf(feed), 1);
    };

     $scope.fetchFeed($scope.feeds[0]);
  });

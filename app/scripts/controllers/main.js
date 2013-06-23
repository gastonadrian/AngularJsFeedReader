'use strict';

angular.module('AngularFeedReaderApp')
  .controller('MainCtrl', function ($scope, $http, $timeout) {

    $scope.refreshInterval = 60;


    $scope.feeds = [{
      title: 'dailyjs',
      url: 'http://dailyjs.com/atom.xml',
      items:[]
    }];

    $scope.addFeed = function(feed) {
      $scope.feeds.push(feed);
      $scope.fetchFeed(feed);
    };

    $scope.fetchFeed = function(feed){
        feed.items = [];

        $timeout(function() { $scope.fetchFeed(feed); }, $scope.refreshInterval * 1000);


        var apiUrl = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D'";
        apiUrl += encodeURIComponent(feed.url);
        apiUrl += "'%20and%20%28itemPath%20%3D%20%27rss.channel.item%27%20or%20itemPath%20%3D%20%27feed.entry%27%29&format=json&diagnostics=true&callback=JSON_CALLBACK";

        $http.jsonp(apiUrl).
          success(function(data, status, headers, config) {
            if (data.query.results) {
              feed.items = data.query.results.entry || data.query.results.item;
            }
          }).
          error(function(data, status, headers, config) {
            console.error('Error fetching feed:', data);
          });
    };

    $scope.deleteFeed = function(feed) {
      $scope.feeds.splice($scope.feeds.indexOf(feed), 1);
    };
  });

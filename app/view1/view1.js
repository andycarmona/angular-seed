'use strict';

angular.module('myApp.view1', ['ngRoute','googlechart'])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/view1', {
      templateUrl: 'view1/view1.html',
      controller: 'View1Ctrl'
    });
  }])
  .controller('View1Ctrl', View1Ctrl);

View1Ctrl.$inject = ['$scope','$q']

function View1Ctrl($scope,$q) {

    
}
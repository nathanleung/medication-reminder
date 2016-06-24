'use strict';

var app = angular.module('medicationReminderApp');
app.controller('MainCtrl', function ($scope, $http, $window) {
	$scope.currentTimeUnformatted = moment();

    var start = moment().format('MM/DD/YYYY'),
        end = moment().add(1, 'day').format('MM/DD/YYYY');

    $http.get('/api/medications?start=' + start + '&end=' + end).then(function (meds) {
        $scope.meds = meds.data;
    });

    $window.setInterval(function () {
        $scope.currentTime = $scope.currentTimeUnformatted.format('MMMM Do YYYY, h:mm:ss a');
        $scope.$apply();
    }, 1000); 

});
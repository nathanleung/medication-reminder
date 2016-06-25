'use strict';

var app = angular.module('medicationReminderApp');
app.controller('MainCtrl', function ($scope, $http, $window) {
	$scope.currentTimeUnformatted = moment();
    $scope.selectedDate = new Date();

    var start = moment().format('MM/DD/YYYY'),
        end = moment().add(1, 'day').format('MM/DD/YYYY');

    $http.get('/api/medications?start=' + start + '&end=' + end).then(function (meds) {
        $scope.meds = meds.data;
    });

    $window.setInterval(function () {
        $scope.currentTimeUnformatted = moment();
        $scope.currentTime = $scope.currentTimeUnformatted.format('MMMM Do YYYY, h:mm:ss a');
        $scope.$apply();
    }, 1000); 

    //datePicker setup
    $scope.today = function() {
        $scope.selectedDate = new Date();
    };
    $scope.today();

    $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

    $scope.opened = true;
    };

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };

    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];

    //create reminder
    $scope.createMedReminder = function(){
        console.log($scope.medName + ", " + $scope.medDosage + ", " + $scope.medOffset);
        var date = new Date();
        date = new Date(date.valueOf() + $scope.medOffset*60*1000);
        var updateMed = {
            name: $scope.medName,
            dosage: $scope.medDosage,
            time: date,
            completed: false

        }
        $http.post('/api/medications', updateMed).then(function(med){
            console.log(med.data.name + " is created");
            var start = moment().format('MM/DD/YYYY'),
            end = moment().add(1, 'day').format('MM/DD/YYYY');
            $http.get('/api/medications?start=' + start + '&end=' + end).then(function (meds) {
                $scope.$parent.med = meds.data;
                // $scope.$parent.apply();
            });
        });
    };

});
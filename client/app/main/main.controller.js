'use strict';

angular.module('medicationReminderApp').controller('MainCtrl', function ($scope, $http, $window) {
	$scope.currentTimeUnformatted = moment();

    var start = moment().format('MM/DD/YYYY'),
        end = moment().add(1, 'day').format('MM/DD/YYYY');

    $http.get('/api/medications?start=' + start + '&end=' + end).then(function (meds) {
        $scope.meds = meds.data;
        // console.log(meds.data[0].d.f === "");
        // console.log(meds.data[0].d.f === null);
        // console.log(meds.data[0].d.f === undefined);
    });

    $window.setInterval(function () {
        $scope.currentTime = $scope.currentTimeUnformatted.format('MMMM Do YYYY, h:mm:ss a');
        $scope.$apply();
    }, 1000);

    //different states of the med 
	$scope.COM = "completed";
	$scope.UP = "coming up";
	$scope.LAT = "coming up later";
	$scope.MIS = "missed";
	$scope.fiveMinsInMilli = 5*60*1000;
	//Returns string representing status of med
	$scope.getStatus = function(currMed){
		var medList = $scope;
		function convertMedTimeToMilli(medTime){
			return (new Date(medTime)).getTime();
		};
		function compareMedTimeWithCurrTime(medTime){
			// console.log("Current Time: "+ medList.currentTimeUnformatted.valueOf());
			// console.log("Med Time: "+ convertMedTimeToMilli(medTime));
			return convertMedTimeToMilli(medTime) - medList.currentTimeUnformatted.valueOf();
		};
		//if no completed time
		if(currMed.d.f !== undefined){
			return $scope.COM;
		//if med is to be taken in longer than 5 minutes
		}else if(compareMedTimeWithCurrTime(currMed.time) < 0){
			return $scope.MIS;
		//if med is to be taking within 5 minutes
		}else{
			if($scope.currentTimeUnformatted.milliseconds(currMed.time) <= 5){
				return $scope.UP;
			//if med was not taken before due date time
			}else{
				return $scope.LAT;
			}
		}
	};
	$scope.hideCompletedButton = function(currMed){
		return $scope.getStatus(currMed) === $scope.COM;
	}
	$scope.getDate = function(dateString){
		return moment(dateString).format('MMMM Do YYYY, h:mm:ss a');
	}
	//sets the completed time 
	$scope.completedButtonClicked = function(currMed){
		currMed.d.f = moment();
		//update value in api
	}

});
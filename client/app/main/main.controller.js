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
	//local scope
	var medList = $scope;
	//helper function convert time
	function convertMedTimeToMilli(medTime){
		return (new Date(medTime)).getTime();
	};
	//helper function to compare medTime
	function compareMedTimeWithCurrTime(medTime){
		// console.log("Current Time: "+ medList.currentTimeUnformatted.valueOf());
		// console.log("Med Time: "+ convertMedTimeToMilli(medTime));
		return convertMedTimeToMilli(medTime) - medList.currentTimeUnformatted.valueOf();
	};
	//Returns string representing status of med
	$scope.getStatus = function(currMed){
		//if has completed time
		if(currMed.d.f !== undefined){
			return $scope.COM;
		//if med time has passed
		}else if(compareMedTimeWithCurrTime(currMed.time) < 0){
			return $scope.MIS;
		//if med is to be taking within 5 minutes
		}else{
			if(compareMedTimeWithCurrTime(currMed.time) <= $scope.fiveMinsInMilli){
				return $scope.UP;
			//if med greater than 5 min away
			}else{
				return $scope.LAT;
			}
		}
	};
	$scope.onMissedList = function(currMed){
		return ($scope.getStatus(currMed) === $scope.MIS);
	}
	$scope.onMedList = function(currMed){
		return !$scope.onMissedList(currMed);
	}
	//hide if no completed time and not within 5 minutes
	$scope.hideCompletedButton = function(currMed){
		return ($scope.getStatus(currMed) === $scope.COM || compareMedTimeWithCurrTime(currMed.time) > $scope.fiveMinsInMilli);
	}
	//formats date
	$scope.getDate = function(dateString){
		return moment(dateString).format('MMMM Do YYYY, h:mm:ss a');
	}
	//sets the completed time 
	$scope.completedButtonClicked = function(currMed){
		currMed.d.f = moment();
		//update value in api
	}

});
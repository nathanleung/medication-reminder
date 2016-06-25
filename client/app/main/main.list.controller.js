var app = angular.module('medicationReminderApp');

app.controller('ListCtrl', function($scope, $controller){
	$controller('MainCtrl', {$scope: $scope});
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
		return convertMedTimeToMilli(medTime) - medList.currentTimeUnformatted.valueOf();
	};
	//Returns string representing status of med
	$scope.getStatus = function(currMed){
		//if has completed time
		if(currMed.d.f !== undefined){
			return $scope.COM;
		//if med time has passed by 5 minutes
		}else if(compareMedTimeWithCurrTime(currMed.time) <= -$scope.fiveMinsInMilli){
			return $scope.MIS;
		//if med is to be taking within 5 minutes
		}else{
			if(compareMedTimeWithCurrTime(currMed.time) <= $scope.fiveMinsInMilli){
				return $scope.UP;
			//if med is further than 5 min away
			}else{
				return $scope.LAT;
			}
		}
	};
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

app.controller('MedListCtrl', function($scope, $controller){
	$controller('ListCtrl', {$scope: $scope});
	$scope.title = "Medication List";
	$scope.$on('dateSelected', function(event, selectedDate){
        $scope.selectedDate = selectedDate;
	});
	$scope.onList = function(currMed){
		var selectedDate = $scope.selectedDate.toDateString();
		var currDate = moment(currMed.time).format('ddd MMM DD YYYY');
		return (selectedDate === currDate && $scope.getStatus(currMed) !== $scope.MIS);
	}
});

app.controller('MissedListCtrl', function($scope, $controller){
	$controller('ListCtrl', {$scope: $scope});
	$scope.title = "Missed Medication";
	$scope.onList = function(currMed){
		return ($scope.getStatus(currMed) === $scope.MIS);
	}
});
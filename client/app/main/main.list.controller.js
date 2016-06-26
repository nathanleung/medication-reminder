var app = angular.module('medicationReminderApp');

app.controller('ListCtrl', function($scope, $controller, $http){
	//different states of the med 
	$scope.COM = "completed";
	$scope.UP = "coming up";
	$scope.LAT = "coming up later";
	$scope.MIS = "missed";
	$scope.fiveMinsInMilli = 5*60*1000;
	$scope.currentTimeUnformatted = moment();
	//helper function convert time
	function convertMedTimeToMilli(medTime){
		return (new Date(medTime)).getTime();
	};
	//helper function to compare medTime
	function compareMedTimeWithCurrTime(medTime){
		return convertMedTimeToMilli(medTime) - $scope.currentTimeUnformatted.valueOf();
	};
	//Returns string representing status of med
	$scope.getStatus = function(currMed){
		//if has completed time
		if(currMed.d.f !== undefined){
			return $scope.COM;
		}
		//if med time has passed by 5 minutes
		if(compareMedTimeWithCurrTime(currMed.time) <= -$scope.fiveMinsInMilli){
			return $scope.MIS;
		}
		//if med is to be taking within 5 minutes
		if(compareMedTimeWithCurrTime(currMed.time) <= $scope.fiveMinsInMilli){
			return $scope.UP;
		}else{
			//if med is further than 5 min away
			return $scope.LAT;
		}
	};
	//hide if no completed time and not within 5 minutes
	$scope.hideCompletedButton = function(currMed){
		return ($scope.getStatus(currMed) === $scope.COM || compareMedTimeWithCurrTime(currMed.time) > $scope.fiveMinsInMilli);
	};
	//formats date
	$scope.getDate = function(dateString){
		return moment(dateString).format('MMMM Do YYYY, h:mm:ss a');
	};
	//sets the completed time 
	$scope.completedButtonClicked = function(currMed){
		currMed.completed = true;
		currMed.d.f = moment().toDate();
        $http.patch('/api/medications/'+currMed._id, currMed).then(function(med){
		   	$scope.$emit('updateUpMeds');
        });
	};
	//delete reminder
	$scope.deleteReminder = function(currMed){
        $http.delete('/api/medications/'+currMed._id).then(function(response){
        	if(response.status === 204){
		   		$scope.$emit('updateUpMeds');
		   	}else{
		   		console.log("Failed to emit with status code: "+response.status)
		   	}
    	});
	};
	//watch when medication reminders are updated
	$scope.$on('updateMeds', function(event, meds){
		$scope.meds = meds;
	});
	//get alert class for missed and upcomming reminders
	$scope.getAlertClass = function(m){
		var status = $scope.getStatus(m);
		if(status === $scope.MIS){
			return 'redPanel';
		}
		if(status === $scope.UP){
			return 'bluePanel';
		}
		return "";
	};
	//get the icon class for the different states
	$scope.getIconClass = function(m){
		var status = $scope.getStatus(m);
		if(status === $scope.COM){
			return 'glyphicon glyphicon-ok';
		}
		if(status === $scope.UP || status === $scope.LAT){
			return 'glyphicon glyphicon-time';
		}
		if(status === $scope.MIS){
			return 'glyphicon glyphicon-warning-sign';
		}
		return "";
	};
	//get the text for the completed reminder
	$scope.getCompletedText = function(m){
		var date = moment(m.d.f);
		return "Completed task on: " + date.format('MMMM Do YYYY') + " at: " + date.format('h:mm:ss:a');
	};
	//update med list current time
	$scope.$on('updateCurrentTime', function(event, currentTime){
		$scope.currentTimeUnformatted = currentTime;
	});
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
	};
});

app.controller('MissedListCtrl', function($scope, $controller){
	$controller('ListCtrl', {$scope: $scope});
	$scope.title = "Missed Medication";
	$scope.onList = function(currMed){
		return ($scope.getStatus(currMed) === $scope.MIS);
	}
});
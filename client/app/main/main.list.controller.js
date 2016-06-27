var app = angular.module('medicationReminderApp');

app.controller('ListCtrl', function($scope, $controller, $http, date, status, meds){
	//different states of the med 
	$scope.status = status;
	$scope.date = date;
	$scope.meds = meds;

	//wrapper for Returns string representing status of med
	$scope.getStatus = function(currMed){
		return $scope.status.getStatus(currMed, $scope.date.currentTime);
	}
	//hide if no completed time and not within 5 minutes
	$scope.hideCompletedButton = function(currMed){
		var status = $scope.getStatus(currMed);
		return (status === $scope.status.COM || 
			status === $scope.status.LAT);
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
	//get alert class for missed and upcomming reminders
	$scope.getAlertClass = function(m){
		var status = $scope.getStatus(m);
		if(status === $scope.status.MIS){
			return 'redPanel';
		}
		if(status === $scope.status.UP){
			return 'bluePanel';
		}
		return "";
	};
	//get the icon class for the different states
	$scope.getIconClass = function(m){
		var status = $scope.getStatus(m);
		if(status === $scope.status.COM){
			return 'glyphicon glyphicon-ok';
		}
		if(status === $scope.status.UP || status === $scope.status.LAT){
			return 'glyphicon glyphicon-time';
		}
		if(status === $scope.status.MIS){
			return 'glyphicon glyphicon-warning-sign';
		}
		return "";
	};
	//get the text for the completed reminder
	$scope.getCompletedText = function(m){
		var date = moment(m.d.f);
		return "Completed task on: " + date.format('MMMM Do YYYY') + " at: " + date.format('h:mm:ss:a');
	};
	//Check if reminder is completed
	$scope.isCompleted = function(m){
		return $scope.getStatus(m) === $scope.status.COM;
	}
});
//controller for medication list
app.controller('MedListCtrl', function($scope, $controller){
	$controller('ListCtrl', {$scope: $scope});
	$scope.title = "Medication List";
	$scope.onList = function(currMed){
		return ($scope.getStatus(currMed) !== $scope.status.MIS);
	};
});
//controller for missed list
app.controller('MissedListCtrl', function($scope, $controller){
	$controller('ListCtrl', {$scope: $scope});
	$scope.title = "Missed Medication";
	$scope.onList = function(currMed){
		return ($scope.getStatus(currMed) === $scope.status.MIS);
	}
});
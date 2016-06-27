var app = angular.module('medicationReminderApp');

app.factory('date', function(){
	var date = {};
	date.currentTime = moment();
	date.currentTimeFormatted = date.currentTime.format('MMMM Do YYYY, h:mm:ss a');
	date.updateTime = function(){
		date.currentTime = moment();
		date.currentTimeFormatted = date.currentTime.format('MMMM Do YYYY, h:mm:ss a');
	}

	return date;
});

app.factory('status', function(){
	var status = {};	
	status.COM = "completed";
	status.UP = "coming up";
	status.LAT = "coming up later";
	status.MIS = "missed";
	status.fiveMinsInMilliseconds = 5*60*1000;
	//helper function convert date to time
	status.convertMedTimeToMilli = function(medTime){
		return (new Date(medTime)).getTime();
	};
	//helper function to compare medTime
	status.compareMedTimeWithCurrTime = function(medTime, currentTime){
		return status.convertMedTimeToMilli(medTime) - currentTime.valueOf();
	};
	status.getStatus = function(currMed, currentTime){
		//if has completed time
		if(currMed.d.f !== undefined){
			return status.COM;
		}
		//if med time has passed by 5 minutes
		if(status.compareMedTimeWithCurrTime(currMed.time, currentTime) <= -status.fiveMinsInMilliseconds){
			return status.MIS;
		}
		//if med is to be taking within 5 minutes
		if(status.compareMedTimeWithCurrTime(currMed.time, currentTime) <= status.fiveMinsInMilliseconds){
			return status.UP;
		}else{
			//if med is further than 5 min away
			return status.LAT;
		}
	};
	return status;
});

app.factory('meds', function($http){
	var meds = {};
	meds.medList = [];
	meds.selectedDate = new Date();
	meds.updateMedList = function(arrOfNewMeds){
		angular.copy(arrOfNewMeds, meds.medList);
	}
	meds.updateSelectedDate = function(){
		meds.selectedDate = new Date();
	}
    //update start, end dates
    meds.updateReminders = function(){
    	var medReminders = meds;
        var start = moment(meds.selectedDate).format('MM/DD/YYYY'),
            end = moment(meds.selectedDate).add(1, 'day').format('MM/DD/YYYY');
        $http.get('/api/medications?start=' + start + '&end=' + end).then(function (meds) {
            medReminders.updateMedList(meds.data);
        });
    };
    //create reminder - not quite created exactly offset off
    meds.createMedReminder = function(reminderOffset, medName, medDosage){
    	var medReminders = meds;
        date = new Date(meds.selectedDate.valueOf() + reminderOffset*60*1000);
        var updateMed = {
            name: medName,
            dosage: medDosage,
            time: date,
            completed: false

        }
        $http.post('/api/medications', updateMed).then(function(med){
            var start = moment().format('MM/DD/YYYY'),
            end = moment().add(1, 'day').format('MM/DD/YYYY');
            medReminders.updateReminders();
        });
    };
	//sets the completed time 
	meds.completeReminder = function(currMed){
    	var medReminders = meds;
		currMed.completed = true;
		currMed.d.f = moment().toDate();
        $http.patch('/api/medications/'+currMed._id, currMed).then(function(med){
            medReminders.updateReminders();
        });
	};
	//delete reminder
	meds.deleteReminder = function(currMed){
    	var medReminders = meds;
        $http.delete('/api/medications/'+currMed._id).then(function(response){
        	if(response.status === 204){
            	medReminders.updateReminders();
		   	}else{
		   		console.log("Failed to emit with status code: "+response.status)
		   	}
    	});
	};
	return meds;
})
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

app.factory('meds', function(){
	var meds = {};
	meds.medList = [];

	meds.updateMedList = function(arrOfNewMeds){
		angular.copy(arrOfNewMeds, meds.medList);
	}
	return meds;
})
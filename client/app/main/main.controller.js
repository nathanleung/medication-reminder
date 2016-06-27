'use strict';

var app = angular.module('medicationReminderApp');
app.controller('MainCtrl', function ($scope, $window, audio, date, status, meds) {
	$scope.date = date;
    $scope.status = status;
    $scope.meds = meds;
    $scope.prevSelectedDate = null;
    $scope.audio = audio;
    //update start, end dates
    $scope.updateReminders = function(){
        $scope.meds.updateReminders();
    };

    $window.setInterval(function () {
        $scope.date.updateTime();
        if($scope.prevSelectedDate !== $scope.meds.selectedDate){
            $scope.updateReminders();
            $scope.prevSelectedDate = $scope.meds.selectedDate;
        }
        $scope.searchCurrentReminders();
        $scope.$apply();
    }, 1000); 

    //helper function convert time
    function convertMedTimeToMilli(medTime){
        return (new Date(medTime)).getTime();
    };

    //search current reminders only for today - check if alarm should be on
    //methods for alert
    $scope.searchCurrentReminders = function(){
        var missedAlerts = false;
        var comingUpAlerts = false;
        //linear search through reminders of today
        for(var i = 0; i< $scope.meds.medList.length; i++){
            var currMed = $scope.meds.medList[i];
            var status = $scope.status.getStatus(currMed, $scope.date.currentTime);
            if(status === $scope.status.UP){
                comingUpAlerts = true;
            }
            if(status === $scope.status.MIS){
                missedAlerts = true;
                break;
            }
        }
        if(missedAlerts){
            $scope.audio.playAlertMissed();
            return;
        }
        if(comingUpAlerts){
            $scope.audio.playAlertComingUp();
            return;
        }
        if($scope.audio.soundIsPlaying){
            $scope.audio.turnOffAudio();
        }
    };
    $scope.muteAudio = function(){
        $scope.audio.muteAudio();
    }

    $scope.enableAudio = function(){
            $scope.audio.enableAudio();
    }
    //datePicker setup
    $scope.today = function() {
        $scope.meds.updateSelectedDate();
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

    //create reminder - not quite created exactly offset off
    $scope.createMedReminder = function(){
        $scope.meds.createMedReminder($scope.medOffset, $scope.medName, $scope.medDosage);
    };

});
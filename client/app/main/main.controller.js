'use strict';

var app = angular.module('medicationReminderApp');
app.controller('MainCtrl', function ($scope, $window, ngAudio, date, status, meds) {
	$scope.date = date;
    $scope.status = status;
    $scope.meds = meds;
    $scope.prevSelectedDate = null;
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

    //search current reminders only for today - check if alarm should be on
    //refactor these helper functions
    $scope.soundIsPlaying = false;
    $scope.mute = false;
    $scope.sound = null;
    //helper function convert time
    function convertMedTimeToMilli(medTime){
        return (new Date(medTime)).getTime();
    };
    $scope.searchCurrentReminders = function(){
        //linear search through reminders of today
        for(var i = 0; i< $scope.meds.medList.length; i++){
            var currMed = $scope.meds.medList[i];
            if($scope.status.getStatus(currMed, $scope.date.currentTime) === $scope.status.UP){
                if(!$scope.soundIsPlaying && !$scope.mute){
                    $scope.playAlertSound();
                }
                return;
            }
        }
        if($scope.soundIsPlaying){
            $scope.muteAudio();
        }
    };
    $scope.playAlertSound = function(){
        if($scope.sound === null){
            $scope.sound = ngAudio.load("../assets/audio/pager.mp3"); // returns NgAudioObject
        }
        $scope.sound.loop = true;
        $scope.sound.play();
        $scope.soundIsPlaying = true;
    };
    $scope.muteAudio = function(){
        if($scope.sound !== null){
            $scope.sound.pause();
            $scope.sound.loop = 0;
            $scope.sound.soundIsPlaying = false;
            $scope.mute = true;
        }
    }
    $scope.enableAudio = function(){
        $scope.playAlertSound();
        $scope.mute = false;
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
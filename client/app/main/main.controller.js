'use strict';

var app = angular.module('medicationReminderApp');
app.controller('MainCtrl', function ($scope, $http, $window, ngAudio, date, status, meds) {
	$scope.date = date;
    $scope.status = status;
    $scope.meds = meds;
    $scope.prevSelectedDate = null;
    //update start, end dates
    $scope.updateReminders = function(){
        var start = moment($scope.meds.selectedDate).format('MM/DD/YYYY'),
            end = moment($scope.meds.selectedDate).add(1, 'day').format('MM/DD/YYYY');
        $http.get('/api/medications?start=' + start + '&end=' + end).then(function (meds) {
            $scope.meds.updateMedList(meds.data);
        });
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
    $scope.fiveMinsInMilli = 5*60*1000;
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
        var date = new Date();
        date = new Date(date.valueOf() + $scope.medOffset*60*1000);
        var updateMed = {
            name: $scope.medName,
            dosage: $scope.medDosage,
            time: date,
            completed: false

        }
        $http.post('/api/medications', updateMed).then(function(med){
            var start = moment().format('MM/DD/YYYY'),
            end = moment().add(1, 'day').format('MM/DD/YYYY');
            $scope.updateReminders();
        });
    };

    //watch when medication reminders are updated
    $scope.$on('updateUpMeds', function(event){
        $scope.updateReminders();
    });

});
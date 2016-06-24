'use strict';

var app =angular.module('medicationReminderApp');
  app.config(function ($stateProvider) {
    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      })
      .state('main.medList', {
      	url: 'medList',
      	views:{
      		"missedList": { 
      			templateUrl: 'app/main/main.medList.html', 
      			controller: 'MissedListCtrl'
      		},
      		"medList": {
      			templateUrl: 'app/main/main.medList.html', 
      			controller: 'MedListCtrl'
      		}
      	}
      });
  });
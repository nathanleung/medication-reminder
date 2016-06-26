'use strict';

angular.module('medicationReminderApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngAnimate',
  'ui.router',
  'ui.bootstrap',
  'ngAudio'
])
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    //have to reroute?
    $urlRouterProvider.when('/', '/medList');
    $urlRouterProvider
      .otherwise('/medList');

    $locationProvider.html5Mode(true);
  });
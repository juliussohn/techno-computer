 var socket = io();
var app = angular.module('keyframer',['ui.router','hmTouchEvents']);


app.config(function( $urlRouterProvider, $stateProvider){
	//$locationProvider.html5Mode(true);
	 $stateProvider

            .state('home', {
            	url:'/',
                templateUrl : 'templates/preview.html',
                controller  : 'playerController'
            })
            .state('recorder', {
            	url:'/recorder',
                templateUrl : 'templates/recorder.html',
                controller  : 'recorderController'
            })
             .state('sequencer', {
                url:'/sequencer',
                templateUrl : 'templates/step-sequencer.html',
                controller  : 'sequencerController'
            })
              .state('arpeggiator', {
                url:'/arpeggiator',
                templateUrl : 'templates/arpeggiator.html',
                controller  : 'arpeggiatorController'
            });

            $urlRouterProvider.otherwise('/');

            
		
});
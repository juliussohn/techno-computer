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
            });

            $urlRouterProvider.otherwise('/');

            
		
});
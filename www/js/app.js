 var DEBUG = true;
 angular.module("static-include", []).directive('staticInclude', function($templateRequest, $compile) {
     return {
         restrict: 'A',
         transclude: true,
         replace: true,
         scope: false,
         link: function($scope, element, attrs, ctrl, transclude) {
             var templatePath = attrs.staticInclude;

             $templateRequest(templatePath)
                 .then(function(response) {
                     var contents = element.html(response).contents();
                     $compile(contents)($scope.$new(false, $scope.$parent));
                 });
         }
     };
 });


 var socket = io();
 var app = angular.module('keyframer', ['ui.router', 'hmTouchEvents', 'static-include']);


 app.config(function($urlRouterProvider, $stateProvider) {
     //$locationProvider.html5Mode(true);
     $stateProvider
         .state('home', {
             url: '/select-device',
             templateUrl: 'templates/home.html',
             controller: 'homeController'
         })
        .state('intro', {
             url: '/intro',
             templateUrl: 'templates/intro.html',
             controller: 'introController'
         })
          .state('login', {
             url: '/connect',
             templateUrl: 'templates/login.html',
             controller: 'loginController'
         })
         .state('monitor', {
             url: '/',
             templateUrl: 'templates/preview.html',
             controller: 'playerController'
         })
         .state('sequencer', {
             url: '/sequencer',
             templateUrl: 'templates/step-sequencer.html',
             controller: 'sequencerController'
         })
         .state('arpeggiator', {
             url: '/arpeggiator',
             templateUrl: 'templates/arpeggiator.html',
             controller: 'arpeggiatorController'
         });

     $urlRouterProvider.otherwise('/');



 });


 app.run(function($rootScope) {

     $rootScope.chordOrders = [
         [0, 2, 1, 2],
         [1, -1, 2, 0],
         [1, -1, 1, -1],
         [0, 1, 0, 2],
         [0, 1, 2, 1],
         [0, 1, 2, 1],
         [0, 0, 0, 0],
         [0, 1, 2, 2],
     ];
     $rootScope.registeredDevices = {
         monitor: false,
         sequencer: false,
         arpeggiator: false
     }
     $rootScope.connectDevice = function(deviceFunction) {
         socket.emit("connectDevice", {value:deviceFunction,token:$rootScope.clientToken});
     };

     socket.on('connectDeviceClient', function(deviceFunction) {

         $rootScope.$apply(function() {
             $rootScope.registeredDevices[deviceFunction] = true;
         })

     });
 })


 /**
  * Disable scrolling
  * @type {Object}
  */


 /**
  * Calculate from one range to another
  * @type {Object}
  */
 function rangeToRange(input, inMin, inMax, outMin, outMax) {
     return (input - inMin) * ((outMax - outMin) / (inMax - inMin)) + outMin;
 }
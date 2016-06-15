 /**
  * Controler for Homepage
  * @type {Object}
  */
 app.controller('homeController', function($scope, $state, $interval, $window, $rootScope) {

     /**
      * Redirect Desktop to Monitor
      * @type {Object}
      */
     if(DEBUG == false){
        if (!navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i)) {
           $state.go("monitor");
       }
     }
     

     $scope.launchController = function(controllerName){
        if($rootScope.registeredDevices[controllerName] == false){
            $state.go(controllerName);
        }
     }

 });

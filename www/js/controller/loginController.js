 /**
  * Controler for Homepage
  * @type {Object}
  */
 app.controller('loginController', function($scope, $state, $window, $rootScope, $timeout) {
     $scope.code = ['', '', '', ''];
     $scope.currentIndex = 0;

     $scope.enterNumber = function(number) {
         $scope.code[$scope.currentIndex] = number;
         if ($scope.currentIndex < 3) {
             $scope.currentIndex++;
         } else {
             $scope.authenticate();
         }

     };

     $scope.deleteNumber = function() {
         if ($scope.currentIndex > 0) {
             $scope.currentIndex--;
             $scope.code[$scope.currentIndex] = '';
         }
     };

     $scope.authenticate = function() {
         $scope.clientToken = $scope.code.join('');
         console.log($scope.clientToken);
         socket.emit('login', $scope.clientToken);


     };

     socket.on('loginFailedClient', function() {
     	console.log("login failed");
     	$scope.$apply(function(){
         	$scope.error = true;
     	});
     	$timeout($scope.clearCode , 820);
     	
         
     });

     $scope.authSuccessful = function(){
     	$state.go('home');
     };

     socket.on('loginSuccessfulClient', function() {
     	$scope.$apply(function(){
         	$scope.success = true;
     	 });
         $rootScope.clientToken = $scope.clientToken;
         $timeout( $scope.authSuccessful, 820); 
     });

     $scope.clearCode = function() {
         $scope.code = ['', '', '', ''];
         $scope.currentIndex = 0;
         $scope.error = false;
     };

 });
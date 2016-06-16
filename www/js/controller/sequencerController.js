 /**
  * Controler for Sequencer
  * @type {Object}
  */
 app.controller('sequencerController', function($scope, $state,$rootScope, $interval, $window) {
     var steps = 8;
     $scope.bpm = 128;
     $scope.currentStep = 0;
     $scope.playing = false;
     $scope.bpmToSeconds = function(bpm) {
         return (60000 / bpm) / 4;
     };
       
       if(!$rootScope.clientToken){
           $state.go('login')
       }
     
 document.ontouchmove = function(event) {
     event.preventDefault();
 }


     $scope.filter = false;

     /**
      * Set initial sequence
      * @type {Object}
      */
     $scope.instruments = {
         'kick': {
             active: true,
             sequence: [false, false, false, false, false, false, false, false]
         },
         'snare': {
             active: true,
             sequence: [false, false, false, false, false, false, false, false]
         },
         'hhClosed': {
             active: true,
             sequence: [false, false, false, false, false, false, false, false]
         },
         'hhOpen': {
             active: true,
             sequence: [false, false, false, false, false, false, false, false]
         },
     };


     /**
      * Toggle instrument Step on/off
      * @type {Object}
      */
     $scope.toggleStep = function(instrument, index) {

         $scope.instruments[instrument]['sequence'][index] = !$scope.instruments[instrument]['sequence'][index];
         $scope.changeSequencer();
     };

     /**
      * Toggle instrument  on/off
      * @type {Object}
      */
     $scope.toggleInstrument = function(instrument) {
         $scope.instruments[instrument]['active'] = !$scope.instruments[instrument]['active'];
         console.log($scope.instruments[instrument]['active'])
         $scope.changeSequencer();
     };

     /**
      * Toggle filter  on/off
      * @type {Object}
      */
     $scope.toggleFilter = function(filter) {
         if ($scope.filter == filter) {
             $scope.filter = false;
         } else {
             $scope.filter = filter;
         }

         $scope.changeFilter();
     }

     /**
      * Emit Socket events
      * @type {Object}
      */
     $scope.changeFilter = function() {
         socket.emit('changeFilter', {value: $scope.filter, token:$rootScope.clientToken});
     };

     $scope.changeSequencer = function() {
         socket.emit('changeSequence',  {value: $scope.instruments, token:$rootScope.clientToken} );
     };
     $scope.changeBPM = function() {
         socket.emit('changeBPM',{value: $scope.bpm, token:$rootScope.clientToken});
     };

     /**
      * Emit Sequencer data on load
      * @type {Object}
      */
     
     $scope.initSequencer = function(){
         $scope.changeSequencer();
         $scope.changeFilter();
         $rootScope.connectDevice("sequencer");
     }

     $scope.initSequencer();
    
     /*socket.on('connectDeviceClient', function(deviceFunction) {
         if (deviceFunction == "monitor") {
           // $scope.initSequencer();
         }
     })*/


     /**
      * Receive change BPM event
      * @param  {[type]} BPM) {                	console.log('changeBPMClient', BPM)     	$scope.BPM [description]
      * @return {[type]}      [description]
      */
     socket.on('changeBPMClient', function(BPM) {
     	console.log('changeBPMClient', BPM)
     	$scope.BPM = BPM;
     	if($scope.playing){
     		$scope.resetSequencer();
     	}
     	
     });

     /**
      * Receive play event
      * @param  {[type]} BPM) {                	$scope.BPM [description]
      * @return {[type]}      [description]
      */
     socket.on('playClient', function(BPM) {
     	$scope.BPM = BPM;
     	console.log("play", BPM);
     	$scope.playing = true;
     	$scope.resetSequencer();
     });

     /**
      * Receive stop event
      * @param  {[type]} BPM) {                	$scope.BPM [description]
      * @return {[type]}      [description]
      */
     socket.on('stopClient', function() {
     	console.log("stop");
     	$scope.playing = false;
     	$interval.cancel($scope.sequencerInterval);
     });


     /**
      * Reset the sequencer Interval
      * @return {[type]} [description]
      */
      $scope.resetSequencer = function(){
      		if($scope.sequencerInterval){
      			$interval.cancel($scope.sequencerInterval);
      		}
      		$scope.sequencerInterval = $interval($scope.playSequence, $scope.bpmToSeconds($scope.BPM));

      };

     
     /**
      * Function for Sequencer Interval
      * @type {Object}
      */
     $scope.playSequence = function(){
     	 if ($scope.currentStep < steps - 1) {
             $scope.currentStep++;
         } else {
             $scope.currentStep = 0;
         }
     };

     /**
      * Watch device orientation and send data to sockets
      * @type {Object}
      */
     angular.element($window).bind("deviceorientation", function(event) {
         $scope.$apply(function() {
             $scope.currentOrientation = {
                 alpha: event.alpha,
                 beta: event.beta,
                 gamma: event.gamma,
             };

             var rad = $scope.currentOrientation.alpha * (Math.PI/180);
             $scope.passFilter = rangeToRange(Math.sin(rad)+1, 0, 2, 400, 1500);
             $scope.sin =  Math.sin(rad ) + 1 ;
             $scope.filterAmount = 100 - rangeToRange(Math.sin(rad)+1, 0, 2, 0, 100);
         });

         socket.emit("changeFilterAmount",{value:  $scope.currentOrientation, token:$rootScope.clientToken});
     });






 });
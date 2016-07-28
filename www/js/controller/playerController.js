 app.controller('playerController', function($scope, $interval, $window, $rootScope, $state) {

     var steps = 8;
     $scope.BPM = 128;
     $scope.currentStep = 0;
     $scope.playing = false;
     $scope.bpmToSeconds = function(bpm) {
         return (60000 / bpm) / 4;
     }


     if(DEBUG == false){
        if (!navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i)) {
           $state.go("monitor");
       }else if(!$rootScope.clientToken){
          $state.go('login')
       }
     }
     

     $scope.launchController = function(controllerName){
        if($rootScope.registeredDevices[controllerName] == false){
            $state.go(controllerName);
        }
     }






     $scope.arpeggiatorActive = false;
     $scope.showTutorial=true;

     $scope.chords = {
     	'C' : [261.63, 329.63, 392],
     	'D' : [293.66, 369.99, 440],
     	'E' : [329.63, 415.30, 493.88],
     	'F' : [349.23, 440.00, 523.25],
     	'G' : [392.00,493.88 ,587.33	 ],
     	'A' : [440.00, 554.37	,659.25 ],
     	'B' : [493.88	,622.25 , 739.99],
     };

     

     $scope.chordOrder = $rootScope.chordOrders[0];



     $scope.stepBPM = function(num){
     	$scope.BPM = $scope.BPM + num
     }

     $rootScope.connectDevice("monitor");
     $rootScope.registeredDevices["monitor"] = true;


     /**
      * Create Audio Context
      * @type {[type]}
      */
     $scope.audioCtx = new(window.AudioContext || window.webkitAudioContext);
	 $scope.analyser = $scope.audioCtx.createAnalyser();
	 

	 

          /**
      * Syncthesiser
      * @type {Object}
      */
     $scope.synth = {
     	type: 'sinus'
     };
     $scope.synth.play = function (freq) {
     		// create web audio api context
			 var now = $scope.audioCtx.currentTime;

             var tuna = new Tuna($scope.audioCtx);

            $scope.synth.delay =  new tuna.Delay({
                feedback: 0.6 ,    //0 to 1+
                delayTime: 100,    //how many milliseconds should the wet signal be delayed?
                wetLevel: 0.25,    //0 to 1+
                dryLevel: 1,       //0 to 1+
                cutoff: 2000,      //cutoff frequency of the built in lowpass-filter. 20 to 22050
                bypass: 0
            });


			// create Oscillator node
			$scope.synth.oscillator = $scope.audioCtx.createOscillator();
			$scope.synth.gainNode = $scope.audioCtx.createGain();
			$scope.synth.gainNode.gain.value  = 0.8;

			

           $scope.synth.oscillator.type = $scope.synth.type;
			//$scope.synth.oscillator.type ="triangle";
			
            $scope.synth.oscillator.frequency.value = freq; // value in hertz


           //s $scope.synth.delay

            

          


			$scope.synth.gainNode.gain.linearRampToValueAtTime(0.8,$scope.audioCtx.currentTime + 0.1);
			$scope.synth.gainNode.gain.linearRampToValueAtTime(0,$scope.audioCtx.currentTime + 0.2);

			//$scope.synth.oscillator.connect($scope.synth.gainNode);
			//$scope.synth.gainNode.connect($scope.audioCtx.destination);
     
            $scope.synth.oscillator.connect($scope.synth.gainNode);
            $scope.synth.gainNode.connect($scope.synth.delay);       //
			
           // $scope.synth.oscillator.connect($scope.synth.delay);
            $scope.synth.delay.connect($scope.audioCtx.destination)

			now = $scope.audioCtx.currentTime;
			$scope.synth.oscillator.start();
         	$scope.synth.oscillator.stop(now + 0.2);
     }
     
     

     /**
      * Filter for Highpass, Bandpass, Lowpass
      * @type {Object}
      */
     $scope.passFilter = $scope.audioCtx.createBiquadFilter();
     $scope.passFilter.frequency.value = 500;

     /**
      * Snare
      * @type {Object}
      */
     $scope.snare = {};
     $scope.snare.setup = function() {
         $scope.snare.noise = $scope.audioCtx.createBufferSource();

         $scope.snare.noise.buffer = $scope.snare.noiseBuffer();
         var noiseFilter = $scope.audioCtx.createBiquadFilter();
         noiseFilter.type = 'highpass';
         noiseFilter.frequency.value = 1000;
         $scope.snare.noise.connect(noiseFilter);
         $scope.snare.noiseEnvelope = $scope.audioCtx.createGain();
         noiseFilter.connect($scope.snare.noiseEnvelope);

         $scope.snare.osc = $scope.audioCtx.createOscillator();
         $scope.snare.osc.type = 'triangle';
         $scope.snare.oscEnvelope = $scope.audioCtx.createGain();
         $scope.snare.osc.connect($scope.snare.oscEnvelope);

         if ($scope.filter) {
             $scope.snare.oscEnvelope.connect($scope.passFilter);
             $scope.snare.noiseEnvelope.connect($scope.passFilter);

             $scope.passFilter.connect($scope.analyser);
         } else {
             $scope.snare.noiseEnvelope.connect($scope.analyser);
             $scope.snare.oscEnvelope.connect($scope.analyser);
         }
           $scope.analyser.connect($scope.audioCtx.destination);
        




     }

     $scope.snare.noiseBuffer = function() {
         var bufferSize = $scope.audioCtx.sampleRate;
         var buffer = $scope.audioCtx.createBuffer(1, bufferSize, $scope.audioCtx.sampleRate);
         var output = buffer.getChannelData(0);
         for (var i = 0; i < bufferSize; i++) {
             output[i] = Math.random() * 2 - 1;
         }
         return buffer;
     }

     $scope.snare.trigger = function(time) {
         $scope.snare.setup();
         $scope.snare.noiseEnvelope.gain.setValueAtTime(1, time);
         $scope.snare.noiseEnvelope.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
         $scope.snare.noise.start(time)
         $scope.snare.osc.frequency.setValueAtTime(100, time);
         $scope.snare.oscEnvelope.gain.setValueAtTime(0.7, time);
         $scope.snare.oscEnvelope.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
         $scope.snare.osc.start(time)
         $scope.snare.osc.stop(time + 0.2);

         $scope.snare.noise.stop(time + 0.2);


     }

     $scope.snare.play = function() {
         var now = $scope.audioCtx.currentTime;
         $scope.snare.trigger(now);
     }


     /**
      * Kick
      * @type {Object}
      */
     $scope.kick = {};


     $scope.kick.setup = function() {
         $scope.kick.osc = $scope.audioCtx.createOscillator();
         $scope.kick.gain = $scope.audioCtx.createGain();
         $scope.kick.osc.connect($scope.kick.gain);


         if ($scope.filter) {
             $scope.kick.gain.connect($scope.passFilter);
             $scope.passFilter.connect($scope.analyser);
         } else {
             $scope.kick.gain.connect($scope.analyser);
         }

          $scope.analyser.connect($scope.audioCtx.destination);

     };
     $scope.kick.trigger = function(time) {
         $scope.kick.setup();

         $scope.kick.osc.frequency.setValueAtTime(150, time);
         $scope.kick.gain.gain.setValueAtTime(1, time);

         $scope.kick.osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
         $scope.kick.gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

         $scope.kick.osc.start(time);

         $scope.kick.osc.stop(time + 0.5);
     };

     $scope.kick.play = function() {
         var now = $scope.audioCtx.currentTime;
         $scope.kick.trigger(now);
     }


     /**
      * HiHat Closed
      * @type {Object}
      */
     $scope.hhClosed = {};
     $scope.hhClosed.setup = function(buffer) {
         if (!$scope.hhClosed.buffer) {
             $scope.hhClosed.buffer = buffer;
         }
         $scope.hhClosed.source = $scope.audioCtx.createBufferSource();
         $scope.hhClosed.source.buffer = $scope.hhClosed.buffer;


         if ($scope.filter) {
             $scope.hhClosed.source.connect($scope.passFilter);
             $scope.passFilter.connect($scope.analyser);
         } else {
             $scope.hhClosed.source.connect($scope.analyser);
         }
         $scope.analyser.connect($scope.audioCtx.destination);
     };

     $scope.hhClosed.trigger = function(time) {
         $scope.hhClosed.setup();
         $scope.hhClosed.source.start(time);
     };
     $scope.hhClosed.play = function() {
         var now = $scope.audioCtx.currentTime;
         $scope.hhClosed.trigger(now);
     }


     /**
      * Hihat Open
      * @type {Object}
      */
     $scope.hhOpen = {};

     $scope.hhOpen.setup = function(buffer) {
         if (!$scope.hhOpen.buffer) {
             $scope.hhOpen.buffer = buffer;
         }

         $scope.hhOpen.source = $scope.audioCtx.createBufferSource();
         $scope.hhOpen.source.buffer = $scope.hhOpen.buffer;


         if ($scope.filter) {
             $scope.hhOpen.source.connect($scope.passFilter);
             $scope.passFilter.connect( $scope.analyser);
         } else {
             $scope.hhOpen.source.connect( $scope.analyser);
         }
         $scope.analyser.connect($scope.audioCtx.destination);


     };

     $scope.hhOpen.trigger = function(time) {
         $scope.hhOpen.setup();
         $scope.hhOpen.source.start(time);
     };
     $scope.hhOpen.play = function() {
         var now = $scope.audioCtx.currentTime;
         $scope.hhOpen.trigger(now);
     }

     /**
      * Audio Sample Loader
      * @type {Object}
      */

     $scope.sampleLoader = function(url, context, callback) {
         var request = new XMLHttpRequest();
         request.open("GET", url, true);
         request.responseType = "arraybuffer";
         request.onload = function() {
             $scope.audioCtx.decodeAudioData(request.response, function(buffer) {
                 callback(buffer);
             });
         };

         request.send();
     };

     /**
      * Load Audio samples
      * @type {Object}
      */

     $scope.sampleLoader('/samples/hhClosed.wav', $scope.audioCtx, $scope.hhClosed.setup);
     $scope.sampleLoader('/samples/hhOpen.wav', $scope.audioCtx, $scope.hhOpen.setup);



     /**
      * Receive Socket Events
      * @type {Object}
      */
     socket.on('changeSequenceClient', function(instruments) {
     	console.log(instruments)
         $scope.instruments = instruments;
     });

     socket.on('changeBPMDesktop', function(bpm) {
         $scope.bpm = bpm;
         if($scope.beatInterval){
            $interval.cancel($scope.beatInterval);
         }
         $scope.beatInterval = $interval($scope.playBeat, $scope.bpmToSeconds($scope.bpm));
     });

     socket.on('changeFilterClient', function(filter) {
         $scope.filter = filter;
         $scope.passFilter.type = filter;
         console.log("filter changed", $scope.passFilter.type);




     });

     socket.on('changeArpeggiatorPowerClient', function(filter) {
     	$scope.$apply(function(){
     		 $scope.arpeggiatorActive = !$scope.arpeggiatorActive;
     	})
       

     });

      socket.on('changeArpeggiatorNoteOrderClient', function(i) {
      	$scope.$apply(function(){
      		 $scope.chordOrder = $rootScope.chordOrders[i];
      	})
     });



      socket.on('changeOscillatorTypeClient', function(type) {
      	$scope.$apply(function(){
      		 $scope.synth.type= type;
      	})
     });

    socket.on('clientToken', function(token) {
        console.log(token)
        $rootScope.$apply(function(){
             $rootScope.clientToken=token;
        })
     });






      


      




     var lowpassRange = [5000, 200];
     var bypassRange = [5000, 200];
     var highpassRange = [5000, 200];

     socket.on('changeFilterAmountClient', function(orientation) {
         var rad = orientation.alpha * (Math.PI/180)
         var lowpass = rangeToRange(Math.sin(rad)+1, 0, 2, lowpassRange[0], lowpassRange[1]);
         $scope.passFilter.frequency.value = lowpass;


             $scope.filterAmount = 100 - rangeToRange(Math.sin(rad)+1, 0, 2, 0, 100);
     });

     socket.on('changeArpeggiatorOrientationClient', function(rootNote) {
     	$scope.$apply(function(){
     		 $scope.rootNote = rootNote;
          $scope.chord = $scope.chords[$scope.rootNote.name]; 
     	})
        
     });

     $scope.isCurrentPatternBar = function(index){
     	if((Math.ceil($scope.currentStep/2)) == index && $scope.arpeggiatorActive){
     		return true;
     	}
     	 
     }


     $scope.drawVisualizer = function(){
     		$scope.analyser.fftSize = 128;
        var frequencyData = new Uint8Array($scope.analyser.frequencyBinCount);
		$scope.analyser.getByteFrequencyData(frequencyData);
		var canvas = document.getElementById('visualiser');
		  var drawContext = canvas.getContext('2d');
		  WIDTH = 300;
		  HEIGHT = 160;
		  canvas.width = WIDTH;
		 canvas.height = HEIGHT;
		  // Draw the frequency domain chart.
		  // 
		  for (var i = 0; i < $scope.analyser.frequencyBinCount; i++) {
		    var value = frequencyData[i];
		    var percent = value / 256;
		    var height = HEIGHT * percent;
		    var offset = HEIGHT - height - 1 ;
		    var barWidth = (WIDTH/$scope.analyser.frequencyBinCount) - 1;
		    //var hue = i/$scope.analyser.frequencyBinCount * 360;
		    drawContext.fillStyle = '#3881FF';//'hsl(' + hue + ', 100%, 50%)';
		    drawContext.fillRect(i * barWidth +i, offset, barWidth, height);


		  }

		     for (var i = 0; i < $scope.analyser.frequencyBinCount; i++) {
			    var value = frequencyData[i];
			    var percent = value / 256;
			    var height = HEIGHT * percent;
			    var offset = HEIGHT - height - 1;
			    var barWidth = WIDTH/$scope.analyser.frequencyBinCount -1 ;
			    drawContext.fillStyle = 'white';
			    drawContext.fillRect(i * barWidth + i, offset, 1, 4);
			  }


     }
     /**
      * Play Sequence in interval
      * @type {Object}
      */

     $scope.playBeat = function() {
     	 if($scope.currentStep % 2 == false && $scope.arpeggiatorActive && $scope.chordOrder[ Math.ceil($scope.currentStep/2)] > -1){
     	 	console.log($scope.chords["E"][0]);

             $scope.synth.play( $scope.chord[$scope.chordOrder[ Math.ceil($scope.currentStep/2)]]);
     	 	// $scope.synth.play( $scope.chords["E"][$scope.chordOrder[ Math.ceil($scope.currentStep/2)]]);
     	 }
     	
     	 //console.log($scope.chord[$scope.chordOrder[$scope.currentStep]])
         if ($scope.instruments) {
             if ($scope.instruments.kick.sequence[$scope.currentStep] === true && $scope.instruments.kick.active) {
                 $scope.kick.play();
             }
             if ($scope.instruments.snare.sequence[$scope.currentStep] === true && $scope.instruments.snare.active) {
                 $scope.snare.play();
             }
             if ($scope.instruments.hhClosed.sequence[$scope.currentStep] === true && $scope.instruments.hhClosed.active) {
                 $scope.hhClosed.play();
             }
             if ($scope.instruments.hhOpen.sequence[$scope.currentStep] === true && $scope.instruments.hhOpen.active) {
                 $scope.hhOpen.play();
             }

         }
       
        

         if ($scope.currentStep < steps - 1) {
             $scope.currentStep++;
         } else {
             $scope.currentStep = 0;
         }
     };

     $scope.resetBeat = function(){
     	console.log("test")
     	 if($scope.beatInterval){
            $interval.cancel($scope.beatInterval);
         }
         $scope.beatInterval = $interval($scope.playBeat, $scope.bpmToSeconds($scope.BPM));
     }

       
        $scope.visualiserInterval = $interval($scope.drawVisualizer, 10);
socket.on('loginSuccessfulClient',function(){
             $scope.$apply(function(){
             $scope.showTutorial=false;
        })
        })
     $scope.changeBPM = function(BPM){
     	  socket.emit('changeBPM', {value: BPM,token:$rootScope.clientToken});
     	  if($scope.playing){
     	  	 $scope.resetBeat();
     	  }
     	 
     };

     $scope.$watch("BPM", function ( newValue, oldValue ) {
            $scope.changeBPM(newValue);
        }
     );

     $scope.togglePlay = function(){
     	if($scope.playing){
     		$scope.stop();
     	}else{
		$scope.play();
     	}
     }
     $scope.play = function(){
     	socket.emit('play',    {value: $scope.BPM ,token:$rootScope.clientToken});
     	$scope.playing = true;
     	$scope.resetBeat();
     };
      $scope.stop = function(){
     	socket.emit('stop' , {token:$rootScope.clientToken});
     	$scope.playing = false;
     	$interval.cancel($scope.beatInterval);
     };

 });
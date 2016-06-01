 var context = new (window.AudioContext || window.webkitAudioContext);
    function Kick(context) {
        this.context = context;
    };
     
    Kick.prototype.setup = function() {
        this.osc = this.context.createOscillator();
        this.gain = this.context.createGain();
        this.osc.connect(this.gain);
        this.gain.connect(this.context.destination)
    };

    Kick.prototype.trigger = function(time) {
        this.setup();

        this.osc.frequency.setValueAtTime(150, time);
        this.gain.gain.setValueAtTime(1, time);

        this.osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
        this.gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

        this.osc.start(time);

        this.osc.stop(time + 0.5);
    };
    var kick = new Kick(context);

    function playKick(){
        
        var now = context.currentTime;
        kick.trigger(now + 0.5);
    }

    function Snare(context) {
  this.context = context;
};

Snare.prototype.setup = function() {
  this.noise = this.context.createBufferSource();
  this.noise.buffer = this.noiseBuffer();

  var noiseFilter = this.context.createBiquadFilter();
  noiseFilter.type = 'highpass';
  noiseFilter.frequency.value = 1000;
  this.noise.connect(noiseFilter);

  this.noiseEnvelope = this.context.createGain();
  noiseFilter.connect(this.noiseEnvelope);

  this.noiseEnvelope.connect(this.context.destination);

  this.osc = this.context.createOscillator();
  this.osc.type = 'triangle';

  this.oscEnvelope = this.context.createGain();
  this.osc.connect(this.oscEnvelope);
  this.oscEnvelope.connect(this.context.destination);
};

Snare.prototype.noiseBuffer = function() {
  var bufferSize = this.context.sampleRate;
  var buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
  var output = buffer.getChannelData(0);

  for (var i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  return buffer;
};

Snare.prototype.trigger = function(time) {
  this.setup();

  this.noiseEnvelope.gain.setValueAtTime(1, time);
  this.noiseEnvelope.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
  this.noise.start(time)

  this.osc.frequency.setValueAtTime(100, time);
  this.oscEnvelope.gain.setValueAtTime(0.7, time);
  this.oscEnvelope.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
  this.osc.start(time)

  this.osc.stop(time + 0.2);
  this.noise.stop(time + 0.2);
};


var snare = new Snare(context);

    function playSnare(){
        
        var now = context.currentTime;
        snare.trigger(now + 0.5);
    }








app.controller('recorderController', function($scope, $interval, $window) {
    $scope.recording = false;
    $scope.currentMotion = {};
    $scope.currentOrientation = {};
    $scope.startRecording = function() {
            $scope.recordInterval = $interval(function() {
                socket.emit('record', {
                    acceleration: $scope.currentMotion,
                    orientation: $scope.currentOrientation
                });
            }, 100);
            socket.emit('startRecording');
    };

    $scope.stopRecording = function() {
        console.log("Stop Recording initiated ...")
        $interval.cancel($scope.recordInterval);
        socket.emit('stopRecording');
    }

    angular.element($window).bind("devicemotion", function(event) {
        $scope.$apply(function() {
            $scope.currentMotion = {
                acceleration: event.acceleration,
                accelerationIncludingGravity: event.accelerationIncludingGravity,
                rotationRate: event.rotationRate
            };
        });
    });

    angular.element($window).bind("deviceorientation", function(event) {
        $scope.$apply(function() {
            $scope.currentOrientation = {
                alpha: event.alpha,
                beta: event.beta,
                gamma: event.gamma,
                compass: event.webkitCompassHeading,
            };
        });
    });
});
app.controller('playerController', function($scope, $interval, $window) {
    
    $scope.frequencyRange = [400, 1000];
    $scope.motion = [];
    
    $scope.playing = false;
   

    function frequencyToNote(input) {
        if (input > 523 && input < 587.33) {
            // C
            output = {
                frequency: 523.25,
                note: "C"
            };
        } else if (input >= 523 && input < 587.33) {
            // D
            output = {
                frequency: 587.33,
                note: "D"
            };
        } else if (input >= 659.25 && input < 698.46) {
            // E
            output = {
                frequency: 659.25,
                note: "E"
            };
        } else if (input >= 698.46 && input < 783.99) {
            // F
            output = {
                frequency: 698.46,
                note: "F"
            };
        } else if (input >= 783.99 && input < 880.00) {
            // G
            output = {
                frequency: 783.99,
                note: "G"
            };
        } else if (input >= 880.00 && input < 987.77) {
            // A
            output = {
                frequency: 880.00,
                note: "A"
            };
        } else if (input >= 987.77 && input < 1046.50) {
            // H
            output = {
                frequency: 987.77,
                note: "H"
            };
        }
        return output;
    }

    function rangeToRange(input, inMin, inMax, outMin, outMax) {
        return (input - inMin) * ((outMax - outMin) / (inMax - inMin)) + outMin;
    }

    socket.on('startRecordingClient', function() {
          $scope.$apply(function(){
        console.log("Recording started");
        $scope.audioCtx = new(window.AudioContext || window.webkitAudioContext);
        $scope.oscillator = $scope.audioCtx.createOscillator();
        $scope.oscillator.connect($scope.audioCtx.destination);
        $scope.oscillator.frequency.value = 500;
        $scope.oscillator.type = 'square';
        $scope.oscillator.start();
    })
    });


    socket.on('stopRecordingClient', function() {
        console.log("Recording stopped");
        $scope.$apply(function(){
             $scope.oscillator.stop();
        delete $scope.oscillator;
        delete $scope.audioCtx;
        })
       
    })

    socket.on('record', function(motion) {
        //console.log(motion);
        $scope.$apply(function() {
            $scope.motion.push(motion);
            note = frequencyToNote(rangeToRange(motion.orientation.alpha, 0, 360, 523.25, 1046.50));
            detune = motion.orientation.gamma * 10;
            $scope.note = note.note;
            $scope.detune = Math.round(detune);
            $scope.modifyOscillator(note.frequency, detune);
        })
    });

     $scope.modifyOscillator = function(frequency, detune) {
        if($scope.oscillator){
            $scope.oscillator.frequency.value = frequency;
            $scope.oscillator.detune.value = detune;
        }
        
    };
});

app.controller('sequencerController', function($scope, $interval, $window) {
    var steps = 8;
    $scope.bpm = 140;
    $scope.currentStep = 0;
    $scope.bpmToSeconds = function(bpm){
        return (60000/bpm) / 4;
    }
    $scope.instruments ={
        'kick':[false,false,false,false,false,false,false,false],  
        'snare':[false,false,false,false,false,false,false,false],  
        'hihat':[false,false,false,false,false,false,false,false],  
        'clap':[false,false,false,false,false,false,false,false],    
    };




    /**
     * [playKick description]
     * @return {[type]} [description]
     */
    


    $scope.sequencerInterval = $interval(function() {
         console.log("play Kick 1");

         if($scope.instruments.kick[$scope.currentStep]){
             playKick();
         }
         if($scope.instruments.snare[$scope.currentStep]){
             playSnare();
         }
        
        if($scope.currentStep < steps -1){
            $scope.currentStep++;
        }else{
            $scope.currentStep = 0;
        }

       

    }, $scope.bpmToSeconds($scope.bpm));

    $scope.toggleStep = function(instrument, index){
        $scope.instruments[instrument][index] = !$scope.instruments[instrument][index];
    };
    

});
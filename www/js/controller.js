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
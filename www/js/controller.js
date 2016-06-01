document.ontouchmove = function(event) {
    event.preventDefault();
}

function rangeToRange(input, inMin, inMax, outMin, outMax) {
    return (input - inMin) * ((outMax - outMin) / (inMax - inMin)) + outMin;
}


app.controller('arpeggiatorController', function($scope, $interval, $window) {
    angular.element($window).bind("deviceorientation", function(event) {
        $scope.$apply(function(){
              $scope.currentOrientation = {
            alpha: event.alpha,
            beta: event.beta,
            gamma: event.gamma,
        };
        })
      
    })


});


app.controller('playerController', function($scope, $interval, $window) {
    var steps = 8;
    $scope.currentStep = 0;
    $scope.bpmToSeconds = function(bpm) {
        return (60000 / bpm) / 4;
    }

    $scope.audioCtx = new(window.AudioContext || window.webkitAudioContext);

    $scope.snare = {};


    $scope.passFilter = $scope.audioCtx.createBiquadFilter();



    $scope.passFilter.frequency.value = 500;


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

            $scope.passFilter.connect($scope.audioCtx.destination);
        } else {
            $scope.snare.noiseEnvelope.connect($scope.audioCtx.destination);
            $scope.snare.oscEnvelope.connect($scope.audioCtx.destination);
        }



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
     * KICK
     */



    $scope.kick = {};


    $scope.kick.setup = function() {
        $scope.kick.osc = $scope.audioCtx.createOscillator();
        $scope.kick.gain = $scope.audioCtx.createGain();
        $scope.kick.osc.connect($scope.kick.gain);


        if ($scope.filter) {
            $scope.kick.gain.connect($scope.passFilter);
            $scope.passFilter.connect($scope.audioCtx.destination);
        } else {
            $scope.kick.gain.connect($scope.audioCtx.destination);
        }

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



    /* function HiHat(context, buffer) {
       this.context = context;
       this.buffer = buffer;
     };*/


    /*

    function HiHat(context, buffer) {
      this.context = context;
      this.buffer = buffer;
    };

    HiHat.prototype.setup = function() {
      this.source = this.context.createBufferSource();
      this.source.buffer = this.buffer;
      this.source.connect(this.context.destination);
    };

    HiHat.prototype.trigger = function(time) {
      this.setup();

      this.source.start(time);
    };

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
            $scope.passFilter.connect($scope.audioCtx.destination);
        } else {
            $scope.hhClosed.source.connect($scope.audioCtx.destination);
        }
    };

    $scope.hhClosed.trigger = function(time) {
        $scope.hhClosed.setup();
        $scope.hhClosed.source.start(time);
    };
    $scope.hhClosed.play = function() {
        var now = $scope.audioCtx.currentTime;
        $scope.hhClosed.trigger(now);
    }



    $scope.hhOpen = {};

    $scope.hhOpen.setup = function(buffer) {
        if (!$scope.hhOpen.buffer) {
            $scope.hhOpen.buffer = buffer;
        }

        $scope.hhOpen.source = $scope.audioCtx.createBufferSource();
        $scope.hhOpen.source.buffer = $scope.hhOpen.buffer;


        if ($scope.filter) {
            $scope.hhOpen.source.connect($scope.passFilter);
            $scope.passFilter.connect($scope.audioCtx.destination);
        } else {
            $scope.hhOpen.source.connect($scope.audioCtx.destination);
        }


    };

    $scope.hhOpen.trigger = function(time) {
        $scope.hhOpen.setup();
        $scope.hhOpen.source.start(time);
    };
    $scope.hhOpen.play = function() {
        var now = $scope.audioCtx.currentTime;
        $scope.hhOpen.trigger(now);
    }

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

    $scope.sampleLoader('/samples/hhClosed.wav', $scope.audioCtx, $scope.hhClosed.setup);
    $scope.sampleLoader('/samples/hhOpen.wav', $scope.audioCtx, $scope.hhOpen.setup);

    /**
     * SOCKET
     */


    /**
     * [description]
     * @param  {[type]} instruments) {                   $scope.instruments [description]
     * @return {[type]}              [description]
     */
    socket.on('changeSequencerDesktop', function(instruments) {
        $scope.instruments = instruments;
        console.log("jo")
    });

    socket.on('changeBPMDesktop', function(bpm) {
        $scope.bpm = bpm;
        $scope.sequencerInterval = $interval($scope.playSequence, $scope.bpmToSeconds($scope.bpm));
    });

    socket.on('changeFilterDesktop', function(filter) {
        $scope.filter = filter;
        $scope.passFilter.type = filter;
        console.log("filter changed", $scope.passFilter.type);

    });


    var lowpassRange = [5000, 200];
    var bypassRange = [5000, 200];
    var highpassRange = [5000, 200];
    socket.on('changedDeviceOrienationDesktop', function(orientation) {
        console.log("orientation changed")

        var lowpass = rangeToRange((360 - orientation.alpha), 0, 360, lowpassRange[0], lowpassRange[1]);

        $scope.passFilter.frequency.value = lowpass;
        //$scope.bypass.frequency.value = lowpass;
        //$scope.highpass.frequency.value = lowpass;

    });



    $scope.playSequence = function() {
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
    }

});

app.controller('sequencerController', function($scope, $interval, $window) {
    var steps = 8;
    $scope.bpm = 128;
    $scope.currentStep = 0;
    $scope.bpmToSeconds = function(bpm) {
        return (60000 / bpm) / 4;
    }

    $scope.filter = false;

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

    $scope.toggleStep = function(instrument, index) {

        $scope.instruments[instrument]['sequence'][index] = !$scope.instruments[instrument]['sequence'][index];
        $scope.changeSequencer();
    };

    $scope.toggleInstrument = function(instrument) {
        $scope.instruments[instrument]['active'] = !$scope.instruments[instrument]['active'];
        console.log($scope.instruments[instrument]['active'])
        $scope.changeSequencer();
    };

    $scope.toggleFilter = function(filter) {
        if ($scope.filter == filter) {
            $scope.filter = false;
        } else {
            $scope.filter = filter;
        }

        $scope.changeFilter();
    }

    $scope.changeFilter = function() {
        socket.emit('changeFilter', $scope.filter);
    };

    $scope.changeSequencer = function() {
        socket.emit('changeSequencer', $scope.instruments);
    };
    $scope.changeBPM = function() {
        socket.emit('changeBPM', $scope.bpm);
    };

    $scope.changeSequencer();
    $scope.changeBPM();
    $scope.changeFilter();

    $scope.sequencerInterval = $interval(function() {
        if ($scope.currentStep < steps - 1) {
            $scope.currentStep++;
        } else {
            $scope.currentStep = 0;
        }



    }, $scope.bpmToSeconds($scope.bpm));




    angular.element($window).bind("deviceorientation", function(event) {
        $scope.$apply(function() {
            $scope.currentOrientation = {
                alpha: event.alpha,
                beta: event.beta,
                gamma: event.gamma,
                //compass: event.webkitCompassHeading,
            };
            $scope.passFilter = rangeToRange((360 - $scope.currentOrientation.alpha), 0, 360, 400, 1500);
            $scope.filterAmount = rangeToRange((360 - $scope.currentOrientation.alpha), 0, 360, 0, 100);
        })

        socket.emit("changedDeviceOrienation", $scope.currentOrientation);
    });




});
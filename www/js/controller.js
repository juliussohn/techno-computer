
/*
 * Common tools for use with WebAudio.
 * 
 * This code was based on original code by Boris Smus
 * from: http://www.webaudioapi.com/
 *
 * with extensions and modifications by Phil Burk
 * from http://www.softsynth.com/webaudio/
 */
/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function createAudioContext()
{
    var contextClass = (window.AudioContext ||
            window.webkitAudioContext ||
            window.mozAudioContext ||
            window.oAudioContext);
    if (contextClass) {
        return new contextClass();
    } else {
        alert("Sorry. WebAudio API not supported. Try using the Google Chrome or Safari browser.");
        return null;
    }
}

// Start off by initializing a new audioContext.
var audioContext =  createAudioContext();

// shim layer with setTimeout fallback
window.requestAnimFrame = (function() {
    return  window.requestAnimationFrame       || 
      window.webkitRequestAnimationFrame || 
      window.mozRequestAnimationFrame    || 
      window.oRequestAnimationFrame      || 
      window.msRequestAnimationFrame     || 
      function( callback ){
      window.setTimeout(callback, 1000 / 60);
    };
})();


// Add missing functions to make the oscillator compatible with the later standard.
function fixOscillator(osc)
{
    if (typeof osc.start == 'undefined') {
        osc.start = function(when) {
            osc.noteOn(when);
        }
    }
    if (typeof osc.stop == 'undefined') {
        osc.stop = function(when) {
            osc.noteOff(when);
        }
    }
}

// Change HTML in a DIV or other element for debugging
function writeMessageToID(id,message)
{
    // Voodoo for browser compatibility.
    d = document;
    re = d.all ? d.all[id] : d.getElementById(id);
    if (re) {
        re.innerHTML = message;
    }
}

function AudioVisualizer(width, height)
{
  this.analyser = audioContext.createAnalyser();

  this.width = width;
  this.height = height;
  this.analyser.connect(audioContext.destination);
  this.analyser.minDecibels = -140;
  this.analyser.maxDecibels = 0;
  this.fft_smoothing = 0.6;
  this.fft_size = 1024;
  
  this.freqs = new Uint8Array(this.analyser.frequencyBinCount);
  this.times = new Uint8Array(this.analyser.frequencyBinCount);
  this.isPlaying = false;
  this.drawCounter = 0;
}

AudioVisualizer.prototype.startAnimation = function()
{
    this.isPlaying = true;
    // Start visualizer.
    requestAnimFrame(this.draw.bind(this));
}

AudioVisualizer.prototype.drawSpectrum = function(drawContext)
{
  this.analyser.smoothingTimeConstant = this.fft_smoothing;
  this.analyser.fftSize = this.fft_size;

  // Get the frequency data from the currently playing music
  this.analyser.getByteFrequencyData(this.freqs);

  var width = Math.floor(1/this.freqs.length, 10);

  drawContext.fillStyle = 'hsl(200, 100%, 50%)';
  // Draw the frequency domain chart.
  for (var i = 0; i < this.analyser.frequencyBinCount; i++) {
    var value = this.freqs[i];
    var percent = value / 256;
    var height = this.height * percent;
    var offset = this.height - height - 1;
    var barWidth = this.width/this.analyser.frequencyBinCount;
    drawContext.fillRect(i * barWidth, offset, barWidth, height);
  }
}

AudioVisualizer.prototype.draw = function()
{
  var canvas = document.querySelector('canvas');
  var drawContext = canvas.getContext('2d');
  canvas.width = this.width;
  canvas.height = this.height;
  
  this.drawSpectrum(drawContext);
  
  if ((this.drawCounter & 15) == 0) {
    this.analyser.getByteTimeDomainData(this.times);
  }
  
  // Draw the time domain chart.
  //drawContext.beginPath();
  drawContext.fillStyle = 'black';
  drawContext.moveTo(0, this.height/2);
  var barWidth = this.width/this.analyser.frequencyBinCount;
  for (var i = 0; i < this.analyser.frequencyBinCount; i++) {
    var value = this.times[i];
    var percent = value / 256;
    var height = this.height * percent;
    var ypos = this.height - height - 1;
    var xpos = i * barWidth;
    drawContext.lineTo(xpos, ypos);
  }
  //drawContext.closePath();
  drawContext.stroke();

  this.drawCounter += 1;
  
  if (this.isPlaying) {
    requestAnimFrame(this.draw.bind(this));
  }
}

AudioVisualizer.prototype.getFrequencyValue = function(freq) {
  var nyquist = audioContext.sampleRate/2;
  var index = Math.round(freq/nyquist * this.freqs.length);
  return this.freqs[index];
}
function initAudio()
{
    // Use audioContext from webaudio_tools.js
    if( audioContext )
    {
        oscillator = audioContext.createOscillator();
        fixOscillator(oscillator);
        oscillator.frequency.value = 440;
        amp = audioContext.createGain();
        amp.gain.value = 0;
    
        // Connect oscillator to amp and amp to the mixer of the audioContext.
        // This is like connecting cables between jacks on a modular synth.
        oscillator.connect(amp);
        amp.connect(audioContext.destination);
        oscillator.start(0);
        writeMessageToID( "soundStatus", "<p>Audio initialized.</p>");
    }
}

// Set the frequency of the oscillator and start it running.
function startTone( frequency )
{
    var now = audioContext.currentTime;
    
    oscillator.frequency.setValueAtTime(frequency, now);
    
    // Ramp up the gain so we can hear the sound.
    // We can ramp smoothly to the desired value.
    // First we should cancel any previous scheduled events that might interfere.
    amp.gain.cancelScheduledValues(now);
    // Anchor beginning of ramp at current value.
    amp.gain.setValueAtTime(amp.gain.value, now);
    amp.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.01);
    
    writeMessageToID( "soundStatus", "<p>Play tone at frequency = " + frequency  + "</p>");
}

function stopTone()
{
    var now = audioContext.currentTime;
    amp.gain.cancelScheduledValues(now);
    amp.gain.setValueAtTime(amp.gain.value, now);
    amp.gain.linearRampToValueAtTime(0.0, audioContext.currentTime + 1.0);
    writeMessageToID( "soundStatus", "<p>Stop tone.</p>");
}

// init once the page has finished loading.
window.onload = initAudio;

var freq = 500;

app.controller('recorderController', function($scope, $interval, $window) {
    $scope.recording = false;
    $scope.motion = [];
    $scope.startRecording = function() {
        if ($scope.recording === false) {
            $scope.recording = true;
            $scope.recordInterval = $interval(function() {
                stopTone();
                freq = freq + Math.round($scope.currentMotion.x*10) * 100;
                //freq = $scope.currentMotion.x*1000;
                startTone(freq)
                $scope.motion.push($scope.currentMotion);
                console.log($scope.currentMotion);
            }, 50);
        } else {
            $interval.cancel($scope.recordInterval);
            $scope.recording = false;
        }
    };
    $scope.currentMotion = [];
    angular.element($window).bind("devicemotion", function(event) {
        $scope.$apply(function(){
            $scope.currentMotion = event.accelerationIncludingGravity;
        })
        
        // console.log(event.accelerationIncludingGravity.x);
    });
});
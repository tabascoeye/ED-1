// Here is the starting point for your application code.
// All stuff below is just to show you how it works. You can delete all of it.

// Use new ES6 modules syntax for everything.
import os from 'os'; // native node.js module
import {
    remote
} from 'electron'; // native electron module
import jetpack from 'fs-jetpack'; // module loaded from npm
import {
    greet
} from './hello_world/hello_world'; // code authored by you in this project
import env from './env';

var app = remote.app;
var appDir = jetpack.cwd(app.getAppPath());
var WebMidi = require('webmidi');
global.WaveSurfer = require('wavesurfer.js');
require('wavesurfer.js/plugin/wavesurfer.regions.js');
require('wavesurfer.js/plugin/wavesurfer.timeline.js');
var wavesurfer;
var input = null;

// Holy crap! This is browser window with HTML and stuff, but I can read
// here files like it is node.js! Welcome to Electron world :)
console.log('The author of this app is:', appDir.read('package.json', 'json').author);

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('greet').innerHTML = greet();
    document.getElementById('platform-info').innerHTML = os.platform();
    document.getElementById('env-name').innerHTML = env.name;
    wavesurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: 'violet',
        progressColor: 'purple'
    });
    wavesurfer.load('../sample_test.wav');
    wavesurfer.on('ready', function() {
        var timeline = Object.create(WaveSurfer.Timeline);
        timeline.init({
            wavesurfer: wavesurfer,
            container: '#waveform-timeline'
        });
    });
    wavesurfer.on('ready', function() {
        // Enable creating regions by dragging
        wavesurfer.enableDragSelection({});

        // Add a couple of pre-defined regions
        wavesurfer.addRegion({
            id: 0,
            start: 0, // time in seconds
            end: 0.3, // time in seconds
            color: 'hsla(100, 100%, 30%, 0.1)'
        });

        wavesurfer.addRegion({
            id: 1,
            start: 0.5,
            end: 0.9,
            color: 'hsla(200, 100%, 30%, 0.1)'
        });

        wavesurfer.addRegion({
            id: 2,
            start: 1,
            end: 1.3,
            color: 'hsla(400, 100%, 30%, 0.1)'
        });
    });
    WebMidi.enable(function(err) {
        if (err) {
            console.log("WebMidi could not be enabled.", err);
        }
        input = WebMidi.getInputByName("OP-1 Midi Device");
        if (input != false) {
            input.addListener('noteon', "all",
                function(e) {
                    console.log("Received 'noteon' message (" + e.note.name + e.note.octave + ").");
                    if (wavesurfer.isPlaying()) {
                        wavesurfer.stop();
                    }
                    if (e.note.name == "F") {
                        wavesurfer.regions.list[0].play();
                    }
                    if (e.note.name == "G") {
                        wavesurfer.regions.list[1].play();
                    }
                    if (e.note.name == "A") {
                        wavesurfer.regions.list[2].play();
                    }
                    //wavesurfer.play();
                });
            input.addListener('noteoff', "all",
                function(e) {
                    console.log("Received 'noteff' message (" + e.note.name + e.note.octave + ").");
                    if (wavesurfer.isPlaying()) {
                        wavesurfer.stop();
                    }
                });
        }
        WebMidi.addListener('connected', function(e) {
            console.log("connected MIDI device: " + e.name);
            if (e.name == "OP-1 Midi Device" && input == false) {
                input = WebMidi.getInputByName("OP-1 Midi Device");
                input.addListener('noteon', "all",
                    function(e) {
                        console.log("Received 'noteon' message (" + e.note.name + e.note.octave + ").");
                        if (wavesurfer.isPlaying()) {
                            wavesurfer.stop();
                        }
                        if (e.note.name == "F") {
                            wavesurfer.regions.list[0].play();
                        }
                        if (e.note.name == "G") {
                            wavesurfer.regions.list[1].play();
                        }
                        if (e.note.name == "A") {
                            wavesurfer.regions.list[2].play();
                        }
                        //wavesurfer.play();
                    });
                input.addListener('noteoff', "all",
                    function(e) {
                        console.log("Received 'noteff' message (" + e.note.name + e.note.octave + ").");
                        if (wavesurfer.isPlaying()) {
                            wavesurfer.stop();
                        }
                    });
            }
        });
        WebMidi.addListener('disconnected', function(e) {
            console.log("disconnected MIDI device: " + e.name);
            if (e.name == "OP-1 Midi Device" && input != false) {
                input.removeListener();
                input = false;
            }
        });
    }, true);
});

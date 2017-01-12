// Here is the starting point for your application code.
// All stuff below is just to show you how it works. You can delete all of it.

// Use new ES6 modules syntax for everything.
import os from 'os'; // native node.js module
import { remote } from 'electron'; // native electron module
import jetpack from 'fs-jetpack'; // module loaded from npm
import { greet } from './hello_world/hello_world'; // code authored by you in this project
import env from './env';

console.log('Loaded environment variables:', env);

var app = remote.app;
var appDir = jetpack.cwd(app.getAppPath());
var WebMidi = require('webmidi');

// Holy crap! This is browser window with HTML and stuff, but I can read
// here files like it is node.js! Welcome to Electron world :)
console.log('The author of this app is:', appDir.read('package.json', 'json').author);

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('greet').innerHTML = greet();
    document.getElementById('platform-info').innerHTML = os.platform();
    document.getElementById('env-name').innerHTML = env.name;
});

WebMidi.enable(function (err) {
    if (err) {
        console.log("WebMidi could not be enabled.", err);
    }
    var input = WebMidi.getInputByName("OP-1 Midi Device");
    // Listen for a 'note on' message on all channels
    input.addListener('noteon', "all",
        function (e) {
            console.log("Received 'noteon' message (" + e.note.name + e.note.octave + ").");
        });
    input.addListener('controlchange', "all",
        function (e) {
            console.log("Received 'control' message (" + e.controller.name + e.controller.number + ", value:" + e.value + ").");
        });
}, true);


// CONNECTED events:
// WebMidi.addListener('connected', function(event) {console.log("received" + event.name)});
// TODO: use callback to get input from OP-1 (comes twice!), create callback for DISCONNECT

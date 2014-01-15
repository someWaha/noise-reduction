/**
 * Noise Reduction Tests
 * main.js
 *
 * Eric Schmidt 2014
 */

(function() {
    "use strict";
    
    // The sound source buffer
    var sourceBuffer;
    // The currently playing source node
    var source;
    // The noise reducer unit
    var reducer;
    // The level meter
    var meter;
    // The master gain
    var gain;
    // The spectrum analysers
    var analyser1;
    var analyser2;
    
    // Stores whether the audio is playing or not
    var playing = false;
    
    // Play the audio
    function play() {
        // Reset the meter & set playing to true
        meter.reset();
        playing = true;
        
        // Create source node, connect it to the audio graph, and start it
        source = audio.context.createBufferSource();
        source.buffer = sourceBuffer;
        source.connect(analyser1.node);
        source.start(0);
        getLevel();
    }
    
    // Measures & displays the level of the audio as well as the average level & deviation
    function getLevel() {
        // Get the data from the meter
        var measures = meter.measure();
        // Display the values
        document.getElementById("level").innerHTML = measures.level;
        document.getElementById("avglevel").innerHTML = measures.averageLevel;
        document.getElementById("deviation").innerHTML = measures.deviation;
        document.getElementById("avgdev").innerHTML = measures.averageDeviation;
        document.getElementById("devperlev").innerHTML = measures.averageDeviation/measures.averageLevel;
        // Intelligently set the threshold of the noise gate
        reducer.gate.threshold = measures.averageLevel-1.2*measures.averageDeviation;
        if(playing) requestAnimationFrame(getLevel);
    }
    
    // Stops the currently playing source node
    function stop() {
        source.stop(0);
        source.disconnect(0);
        playing = false;
    }
    
    // EVENT HANDLERS
    // Handles loading a file
    function onFileChosen(e) {
        // Disable the playback buttons during loading
        document.getElementById("btn_play").disabled = true;
        document.getElementById("btn_stop").disabled = true;
        // Set the source buffer to be that of the chosen file
        var file = e.target.files[0];
        audio.bufferFromFile(file, function(buffer) {
            sourceBuffer = buffer;
            document.getElementById("btn_play").disabled = false;
            document.getElementById("btn_stop").disabled = false;
        });
    }
    
    // Changes the gain when the slider is moved
    function onGainChanged(e) {
        gain.gain.value = parseFloat(e.target.value)/10;
    }
    
    // Toggles the use of the reducer
    function onReducerToggled(e) {
        var useReducer = document.getElementById("inp_useReducer").checked;
        reducer.bypass(!useReducer);
    }
    
    // Initialization function
    function init() {
        // Initialize the audio library
        audio.init();
        
        // Create the nodes
        reducer = new audio.NoiseReducer(1, 20);
        meter = new audio.Meter();
        gain = audio.context.createGain();
        analyser1 = new audio.SpectrumAnalyser(document.getElementById("canvas_before"));
        analyser2 = new audio.SpectrumAnalyser(document.getElementById("canvas_after"));
        
        // Create the audio graph: (source ->) analyser 1 -> gain -> reducer -> analyser 2 -> meter -> output
        analyser1.node.connect(gain);
        gain.connect(reducer.input);
        reducer.output.connect(analyser2.node);
        analyser2.node.connect(meter.node);
        meter.node.connect(audio.context.destination);
        
        // Add event handlers
        document.getElementById("inp_file").addEventListener("change", onFileChosen);
        document.getElementById("btn_play").addEventListener("click", play);
        document.getElementById("btn_stop").addEventListener("click", stop);
        document.getElementById("inp_gain").addEventListener("change", onGainChanged);
        document.getElementById("inp_useReducer").addEventListener("change", onReducerToggled);
    }
    
    // Run init when the page is loaded
    $(document).ready(init);
    
}());
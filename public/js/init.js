
   var constants =  {
      "intervals": {
          "Major": [2, 2, 1, 2, 2, 2, 1], "Natural Minor": [2, 1, 2, 2, 1, 2, 2], "Harmonic Minor": [2, 1, 2, 2, 1, 3, 1],
          "Pentatonic Major": [2, 2, 3, 2]
      },
      "defaultDuration": 1,
      "bpmConversion": 60000,
      "bpmConversionPlay": 10,
      "minBPM": 36,
      "maxBPM": 256,
      "defaultBPM": 100,
      "noteCount": 8,
      "measures": 2,
      "defaultMeasures": 2,
      "minMeasures": 1,
      "maxMeasures": 10
  }
      var canvasSize = 178
      //For the html sliders
      var bpm = constants.defaultBPM;
      var minBPM = constants.minBPM;
      var maxBPM = constants.maxBPM;
      var minMeasureCount = constants.minMeasures;
      var maxMeasureCount = constants.maxMeasures;

      //Toggles type of note ex. quarter note, eigth note
      var quarterOn = true;
      var eighthOn = true;
      var sixteenthOn = false;

      var quarterOnChange = document.getElementById('quarterOn');
      quarterOnChange.onchange = function(event){
          quarterOn = quarterOnChange.checked;
      } 
      var eighthOnChange = document.getElementById('eighthOn');
      eighthOnChange.onchange = function(event){
        eighthOn = eighthOnChange.checked;
        //   console.log(eighthOn);
      } 
      var sixteenthOnChange = document.getElementById('sixteenthOn');
      sixteenthOnChange.onchange = function(event){
        sixteenthOn = sixteenthOnChange.checked;
        // console.log(sixteenthOn);
      } 

      //How many measures will be created
      var measureCount = constants.defaultMeasures;

      var measureCountOnChange = document.getElementById('measure_range');
      measureCountOnChange.onchange = function(event){
          measureCount = measureCountOnChange.value;
      }

      var delay = 0;
      var velocity = 200;




      //Load in midi.js
      MIDI.loadPlugin({
          soundfontUrl: "assets/soundfont/",
          instrument: "acoustic_grand_piano",
          onsuccess: function() {
              MIDI.setVolume(0, 127);
          }
      });

        //vexflow
    VF = Vex.Flow;
    var div = document.getElementById("clef")
    var renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
    renderer.resize(200, 200);
    var context = renderer.getContext();

      //Array with all possible notes on a keyboard
      var keyboard = [];
      for (var octaveNum = 4; octaveNum <= 5; octaveNum++) {
           keyboard.push(
              {note: "C", octave: octaveNum, duration: constants.defaultDuration},
              {note: "C#", octave: octaveNum, duration: constants.defaultDuration},
              {note: "D", octave: octaveNum, duration: constants.defaultDuration},
              {note: "D#", octave: octaveNum, duration: constants.defaultDuration},
              {note: "E", octave: octaveNum, duration: constants.defaultDuration},
              {note: "F", octave: octaveNum, duration: constants.defaultDuration},
              {note: "F#", octave: octaveNum, duration: constants.defaultDuration},
              {note: "G", octave: octaveNum, duration: constants.defaultDuration},
              {note: "G#", octave: octaveNum, duration: constants.defaultDuration},
              {note: "A", octave: octaveNum, duration: constants.defaultDuration},
              {note: "A#", octave: octaveNum, duration: constants.defaultDuration},
              {note: "B", octave: octaveNum, duration: constants.defaultDuration})
      }

       //Automatic resize function for the Sheet Music (resize depends on amount of measures)
       var canvasResize = function(){
        if(measureCount <= 2){
            canvasSize = 178;
        }
        else {
            if(measureCount % 2 == 1) {
                var tempCount = measureCount + 1;
            }
            else{
                var tempCount = measureCount;
            }
             canvasSize = (tempCount * 61.75);
        }   
        // let clefHeight = document.getElementById("clef").style.height = "100px";
           renderer.resize(900, canvasSize);
        // console.log("Canvas size is" + canvasSize);
    };


// $(document).ready(function(){
//   $("#title").fadeIn();
// });

$(document).ready(function(){
  $('select').formSelect();
});

bpmSlider()
measureSlider()



var selectedKey = undefined; 
var selectedScale = undefined; 
var currentTimer = undefined;
var lowerCaseNotes = [];
var randomPlaylist = []; 
var exportMidiArr = [];

var scaleOnChange = document.getElementById("scaleSelect");
scaleOnChange.onchange = function(event){
    selectedScale = scaleOnChange.options[scaleOnChange.selectedIndex].text; 
}

var keyOnChange = document.getElementById("keyValue");
keyOnChange.onchange = function(event){
    selectedKey = keyOnChange.options[keyOnChange.selectedIndex].text;

}

var bpmOnChange = document.getElementById("bpm_range");
bpmOnChange.onchange = function(event){
    bpm = bpmOnChange.value;    
}

var randomize = function () {
  canvasResize();
  if (currentTimer != undefined) {
      stop();
  }

  if (`selectedKey` == undefined) {
      M.toast({html: 'Please select a key', displayLength: 2000});
  } else if (selectedScale == undefined) {
      M.toast({html: 'Please select a scale', displayLength: 2000})
  }
   else {
      randomPlaylist = [];
      var filteredKeyboard = filterKeyboard();
    
      lowerCaseNotes = [];
      exportMidiArr = [];
      for (var measureNum = 0; measureNum < measureCount; measureNum++) {
          var count = 0;
          var variableNoteLengths = getNoteLengths();
          var qOut = quarterOn;
          var eighthOut =eighthOn;
          while (count < 4) {
              var randomize = filteredKeyboard[Math.floor(filteredKeyboard.length * Math.random())];
              if (count > 3 && qOut) {
                  variableNoteLengths.pop();
                  qOut = false;
              }
              if (count > 3.5 && eighthOut) {
                  variableNoteLengths.pop();
                  eighthOut = false;
              }
              randomize.duration = variableNoteLengths[Math.floor(variableNoteLengths.length * Math.random())];
              count += randomize.duration;
            //   console.log('randomize.note: ' + randomize.note);
              var playNote = {
                  note: convertToMIDINote(randomize.note),
                  octave: randomize.octave,
                  duration: randomize.duration
              };
              var midiNote = {
                  note: randomize.note + randomize.octave,
                  duration: converttoMIDIDuration(randomize.duration)
              }
              randomPlaylist.push(playNote);
              exportMidiArr.push(midiNote);

              var lowercase = {
                  note: randomize.note.toLowerCase(),
                  octave: randomize.octave,
                  duration: randomize.duration
              };
              lowerCaseNotes.push(lowercase);
          }
      }
      midiCreate();
      drawNotes();
  }

};


//Have to translate note lengths into numbers for the API's
function getNoteLengths() {
    var noteLengths = [];
    if (sixteenthOn) {
        noteLengths.push(.25);
    }
    if (eighthOn) {
        noteLengths.push(.5);
    } 
    if (quarterOn) {
        noteLengths.push(1);
    }
    return noteLengths;
};



function filterKeyboard() {
    var filteredKeyboard = [];
    var index = 0;
    for (var i = 0; i < keyboard.length - 1; i++) {
        if (keyboard[i].note == selectedKey) {
            index = i;
            filteredKeyboard.push(keyboard[index]);
            break;
        }
    }
    var intervals = constants.intervals[selectedScale];

    for (i = 0; i < intervals.length; i++) {
        index += intervals[i];
        filteredKeyboard.push(keyboard[index]);
    }
    return filteredKeyboard;
};

 function playNote(i) {
    var midiNote = MIDI.keyToNote[i.note + i.octave];
    MIDI.noteOn(0, midiNote, velocity, delay);
    MIDI.noteOff(0, midiNote, delay + i.duration - 0.15);
};

 function stop() {
    if (currentTimer != undefined) {
        clearTimeout(currentTimer);
        currentTimer = undefined;
    }
};

function play() {
    if (randomPlaylist != undefined) {
        stop();
        recursivePlay(0);
    } else {
        Materialize.toast('Please generate notes by clicking randomize', 2500)
    }
};


function recursivePlay(index) {
    if (index < randomPlaylist.length) {
        if (index != 0) {
            currentTimer = setTimeout(function () {
                playNote(randomPlaylist[index]);
                recursivePlay(index + 1);
            }, randomPlaylist[index - 1].duration * (constants.bpmConversion / bpm));
        } else {
            playNote(randomPlaylist[index]);
            recursivePlay(index + 1);
        }
    } else {
        currentTimer = undefined;
        // console.log("End playing");
    }
};
   // VexFlow
   var VF = Vex.Flow;
   var notesArray = [];
      //Used to determine where to add new measures
      function newBar(x,y) {
        context = renderer.getContext();
        context.setFont("Arial", 10, "").setBackgroundFillStyle("#eed"); //font and bg-fill
        // Create a stave of width 435 at position x, y on the canvas.
        stave = new VF.Stave(x, y, 435);
        // Add a clef and time signature.
        // Connect it to the rendering context and draw!
        stave.setContext(context).draw();
        //for loop notes array. push into notes array.
    };


function convertToText(length) {
    switch (length) {
        case 1:
            return "q";
        case .5:
            return "8";
        case .25:
            return "16";
    }
    return "q";
};
function converttoMIDIDuration(length) {
    switch (length) {
        case 1:
            return "4";
        case .5:
            return "8";
        case .25:
            return "16";
    }
    return "4";
};

 function convertToMIDINote (originalNote) {
    switch (originalNote) {
        case "A#": return "Bb";
        case "C#": return "Db";
        case "D#": return "Eb";
        case "F#": return "Gb";
        case "G#": return "Ab";
        default: return originalNote;
    }
};



function drawNotes() {
    context.clear();
    context = renderer.getContext();
    context.setFont("Arial", 10, "").setBackgroundFillStyle("#eed"); //font and bg-fill
    // Create a stave of width 400 at position 10, 40 on the canvas.
    stave = new VF.Stave(10, 40, 435);
    // Add a clef and time signature.
    stave.addClef("treble").addTimeSignature("4/4");
    // Connect it to the rendering context and draw!
    stave.setContext(context).draw();
    pushBar = 0;
    newLine = 0;
    nextLine = 40;
    notesArray = [];
    firstCase = 0;
    var count = 0;
    for (var lowerCaseNote in lowerCaseNotes) {
        var lcn = lowerCaseNotes[lowerCaseNote];
        if (lcn.note.length > 1) {
            notesArray.push(new VF.StaveNote({
                clef: "treble",
                keys: [lcn.note + "/" + lcn.octave],
                duration: convertToText(lcn.duration)
            }).addAccidental(0, new VF.Accidental("#")));
        } else {
            notesArray.push(new VF.StaveNote({
                clef: "treble",
                keys: [lcn.note + "/" + lcn.octave],
                duration: convertToText(lcn.duration)
            }));
        }
        count += lcn.duration;
        // console.log(count);
        if (count >= 4) {
            // console.log("new bar!");
            var beams = VF.Beam.generateBeams(notesArray);
            VF.Formatter.FormatAndDraw(context, stave, notesArray);
            beams.forEach(function(beam) {
                beam.setContext(context).draw();
            });
            newLine +=1;
            notesArray = [];
            count = 0;

            //For the first bar only
            if (firstCase ==0){
                pushBar = 445;
                firstCase = 1;
            }
            else{
                pushBar += 435;
            }

            if (newLine == 2){
                newLine =0;
                nextLine += 105;
                pushBar = 10;
            }
            newBar(pushBar, nextLine);

        }
    }

};

function bpmSlider() {
  var rangeSlider = document.getElementById("bpm_range"); 
  var rangeOutput = document.getElementById("bpm_output"); 
  rangeOutput.innerHTML = rangeSlider.value; 
    
  rangeSlider.oninput = function() { 
    rangeOutput.innerHTML = this.value; 
  } 
}

function measureSlider() {
  var measureSlider = document.getElementById("measure_range"); 
  var measureOutput = document.getElementById("measure_output"); 
  measureOutput.innerHTML = measureSlider.value; 
    
  measureSlider.oninput = function() { 
    measureOutput.innerHTML = this.value; 
  } 
}



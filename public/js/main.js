window.midiCreate = function(){
    var MidiWriter = require('midi-writer-js');
    var notesConv = [];


    for (let i = 0; i  < exportMidiArr.length; i++){
        // console.log("exportMidiArray: " + exportMidiArr[i].note + exportMidiArr[i].duration);
        notesConv.push(new MidiWriter.NoteEvent({
            pitch: exportMidiArr[i].note,
            duration: exportMidiArr[i].duration
        }));
    }
     
    var track = new MidiWriter.Track();
    track.addEvent(notesConv, function(event, index){ return {sequential: true}; });
    var write = new MidiWriter.Writer(track);
    console.log(write.dataUri());
    document.getElementById("midiHref").href = write.dataUri();
}

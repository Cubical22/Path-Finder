let audioC = undefined;
let should_play_sounds = true; // toggleable through the menu on the web

function play_note(freq, type, dur = .2) { // called when showing the path or when moving the start or end cells
    if (audioC === undefined) { // only making the audio context once
        audioC = new (AudioContext || window.AudioContext || webkitAudioContext || window.webkitAudioContext)();
    }

    if (!should_play_sounds) // stopping the rest from running to avoid making sounds
        return;

    const osc = audioC.createOscillator(); // making the oscillator
    osc.frequency.value = freq;
    osc.start();
    osc.type = type;
    osc.stop(audioC.currentTime+dur)
    const node = audioC.createGain()
    node.gain.value = .4;
    node.gain.linearRampToValueAtTime(0, audioC.currentTime + dur);
    osc.connect(node);
    node.connect(audioC.destination);
}
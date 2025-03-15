open DomExtra

let audio = HtmlAudioElement.make ()
let () = audio |. HtmlAudioElement.setCrossOrigin `anonymous
let replayGainValue : float option ref = ref None
let skipping = ref false

type playerContext = {
  audioContext : WebAudio.AudioContext.t;
  replayGainNode : WebAudio.AudioNode.t;
  volumeNode : WebAudio.AudioNode.t;
}

let value : playerContext option ref = ref None

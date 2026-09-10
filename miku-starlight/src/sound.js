// Original procedural instrumental, 112 BPM. No sampled music or synthetic voice.
// Web Audio is only created after the listener deliberately enables accompaniment.
export function createMusic(){
 const bpm=112,stepDuration=60/bpm/4;let context=null,master=null,noise=null,enabled=false,visualTime=0,nextStep=0,offset=0;
 const midi=n=>440*2**((n-69)/12);
 function tone(freq,time,duration,type,volume){const osc=context.createOscillator(),gain=context.createGain();osc.type=type;osc.frequency.value=freq;gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(volume,time+.012);gain.gain.exponentialRampToValueAtTime(.001,time+duration);osc.connect(gain);gain.connect(master);osc.start(time);osc.stop(time+duration+.03);}
 function kick(time){const o=context.createOscillator(),g=context.createGain();o.frequency.setValueAtTime(135,time);o.frequency.exponentialRampToValueAtTime(43,time+.15);g.gain.setValueAtTime(.8,time);g.gain.exponentialRampToValueAtTime(.001,time+.32);o.connect(g);g.connect(master);o.start(time);o.stop(time+.34);}
 function percussion(time,hat){const n=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();n.buffer=noise;filter.type=hat?'highpass':'bandpass';filter.frequency.value=hat?8200:1800;gain.gain.setValueAtTime(hat?.12:.28,time);gain.gain.exponentialRampToValueAtTime(.001,time+(hat?.055:.14));n.connect(filter);filter.connect(gain);gain.connect(master);n.start(time);n.stop(time+.18);}
 function schedule(step,time){
  const s=step%16,bar=Math.floor(step/16)%4,roots=[38,41,34,36],root=roots[bar];
  if(s%4===0){kick(time);tone(midi(root),time,.21,'triangle',.37);}
  if(s===4||s===12)percussion(time,false);
  if(s%2===0)percussion(time,true);
  const melody=[[74,77,81,79,77,74,72,69],[77,81,84,81,79,77,76,72],[74,77,81,77,74,72,70,69],[72,76,79,81,79,76,74,72]][bar];
  if(s%2===0)tone(midi(melody[s/2]),time,.21,'sine',.24);
  if(s===0)for(const interval of [24,27,31])tone(midi(root+interval),time,1.40,'triangle',.055);
 }
 async function toggle(){
  if(!context){context=new (window.AudioContext||window.webkitAudioContext)();master=context.createGain();const compressor=context.createDynamicsCompressor();master.gain.value=0;master.connect(compressor);compressor.connect(context.destination);
   noise=context.createBuffer(1,context.sampleRate*.3,context.sampleRate);const data=noise.getChannelData(0);let seed=39;for(let i=0;i<data.length;i++){seed=(seed*1664525+1013904223)>>>0;data[i]=seed/4294967296*2-1;}
  }
  await context.resume();enabled=!enabled;master.gain.setTargetAtTime(enabled?.12:0,context.currentTime,.04);
  if(enabled){offset=context.currentTime-visualTime;nextStep=Math.ceil(visualTime/stepDuration);}
 }
 function update(elapsed){visualTime=elapsed;if(!enabled||!context)return;while(nextStep*stepDuration+offset<context.currentTime+.12){const time=nextStep*stepDuration+offset;if(time>=context.currentTime)schedule(nextStep,time);nextStep++;}}
 return{toggle,update,get enabled(){return enabled;},bpm};
}

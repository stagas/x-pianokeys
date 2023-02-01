/** @jsxImportSource minimal-view */

import { render } from 'minimal-view'

import { PianoKeys } from '../src'

document.body.innerHTML = /*html*/ `
<style>
html, body {
  width: 100%;
  height: 100%;
}
.piano {
  resize: both;
  overflow: hidden;
}
</style>
<div id="demo" style="display: flex; gap:20px"></div>
`
const audioContext = new AudioContext()
render(
  <>
    <div style="height:250px;width:50px">
    <PianoKeys
      halfOctaves={3}
      startHalfOctave={1}
      vertical
      audioContext={audioContext}
      onMidiEvent={() => { }}
    />
    </div>

    <div style="height:250px;width:50px">
    <PianoKeys
      halfOctaves={2}
      startHalfOctave={1}
      vertical
      audioContext={audioContext}
      onMidiEvent={() => { }}
    />
    </div>

    <div style="height:250px;width:50px">
    <PianoKeys
      halfOctaves={3}
      startHalfOctave={0}
      vertical
      audioContext={audioContext}
      onMidiEvent={() => { }}
    />
    </div>

    <div style="height:250px;width:50px">
    <PianoKeys
      halfOctaves={2}
      startHalfOctave={0}
      vertical
      audioContext={audioContext}
      onMidiEvent={() => { }}
    />
    </div>
  </>,
  document.getElementById('demo')!
)
// setTimeout(() => {
//   document.querySelector('x-piano')!.turnOnKey(2)
//   document.querySelector('x-piano')!.turnOnKey(5)
//   document.querySelector('x-piano')!.turnOnKey(3)
// }, 1000)
// <div class="piano" style="width:100px;height:350px;">
//   <x-piano vertical onmidimessage="console.log(event)"></x-piano>
// </div>

// for demo: requestAnimationFrame <- for shoty
// const pianos = document.querySelectorAll('x-piano') as NodeListOf<PianoKeysElement>
// let ivl = setInterval(() => {
//   const piano = pianos[Math.random() * pianos.length | 0]
//   const note = Math.random() * 20 | 0
//   piano.turnOnKey?.(note)
//   setTimeout(() => piano.turnOffKey?.(note), Math.random() * 1500)
// }, 50)
// setTimeout(() => {
//   clearInterval(ivl)
// }, 1000)

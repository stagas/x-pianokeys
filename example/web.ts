import { PianoKeysElement } from '../src'

customElements.define('x-piano', PianoKeysElement)

document.body.innerHTML = /*html*/ `
<style>
.piano {
  resize: both;
  overflow: hidden;
}
</style>
<div id="demo" class="piano" style="height:100px;width:350px;">
  <x-piano></x-piano>
</div>
<div class="piano" style="width:100px;height:350px;">
  <x-piano vertical onmidimessage="console.log(event)"></x-piano>
</div>
`

// for demo: requestAnimationFrame <- for shoty
// const pianos = document.querySelectorAll('x-piano') as NodeListOf<PianoKeysElement>
// setInterval(() => {
//   const piano = pianos[Math.random() * pianos.length | 0]
//   const note = Math.random() * 20 | 0
//   piano.turnOnKey?.(note)
//   setTimeout(() => piano.turnOffKey?.(note), Math.random() * 1500)
// }, 50)

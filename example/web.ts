import { PianoKeysElement } from '../src'

customElements.define('x-piano', PianoKeysElement)

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
<div id="demo" class="piano" style="height:100px;width:350px;">
  <x-piano invertcolors></x-piano>
</div>
`

setTimeout(() => {
  document.querySelector('x-piano')!.turnOnKey(2)
  document.querySelector('x-piano')!.turnOnKey(5)
  document.querySelector('x-piano')!.turnOnKey(3)
}, 1000)
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

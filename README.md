<h1>
x-pianokeys <a href="https://npmjs.org/package/x-pianokeys"><img src="https://img.shields.io/badge/npm-v1.0.1-F00.svg?colorA=000"/></a> <a href="src"><img src="https://img.shields.io/badge/loc-404-FFF.svg?colorA=000"/></a> <a href="https://cdn.jsdelivr.net/npm/x-pianokeys@1.0.1/dist/x-pianokeys.min.js"><img src="https://img.shields.io/badge/brotli-5.6K-333.svg?colorA=000"/></a> <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-F0B.svg?colorA=000"/></a>
</h1>

<p></p>

Web Component MIDI ready piano keys.

<h4>
<table><tr><td title="Triple click to select and copy paste">
<code>npm i x-pianokeys </code>
</td><td title="Triple click to select and copy paste">
<code>pnpm add x-pianokeys </code>
</td><td title="Triple click to select and copy paste">
<code>yarn add x-pianokeys</code>
</td></tr></table>
</h4>

## Examples

<details id="example$web" title="web" open><summary><span><a href="#example$web">#</a></span>  <code><strong>web</strong></code></summary>  <ul><p></p>  <a href="https://stagas.github.io/x-pianokeys/example/web.html"><img width="400" src="example/web.webp"></img>  <p><strong>Try it live</strong></p></a>    <details id="source$web" title="web source code" ><summary><span><a href="#source$web">#</a></span>  <code><strong>view source</strong></code></summary>  <a href="example/web.ts">example/web.ts</a>  <p>

```ts
import { PianoKeysElement } from 'x-pianokeys'

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
```

</p>
</details></ul></details>

## API

<p>  <details id="PianoKeysElement$1" title="Class" open><summary><span><a href="#PianoKeysElement$1">#</a></span>  <code><strong>PianoKeysElement</strong></code>    </summary>  <a href="src/x-pianokeys.tsx#L72">src/x-pianokeys.tsx#L72</a>  <ul>        <p>  <details id="constructor$12" title="Constructor" ><summary><span><a href="#constructor$12">#</a></span>  <code><strong>constructor</strong></code><em>()</em>    </summary>    <ul>    <p>  <details id="new PianoKeysElement$13" title="ConstructorSignature" ><summary><span><a href="#new PianoKeysElement$13">#</a></span>  <code><strong>new PianoKeysElement</strong></code><em>()</em>    </summary>    <ul><p><a href="#PianoKeysElement$1">PianoKeysElement</a></p>        </ul></details></p>    </ul></details><details id="blackHeight$20" title="Property" ><summary><span><a href="#blackHeight$20">#</a></span>  <code><strong>blackHeight</strong></code>  <span><span>&nbsp;=&nbsp;</span>  <code>67</code></span>   &ndash; Height of black keys <code>100</code>=full height</summary>  <a href="src/x-pianokeys.tsx#L79">src/x-pianokeys.tsx#L79</a>  <ul><p>number</p>        </ul></details><details id="keyWidth$21" title="Property" ><summary><span><a href="#keyWidth$21">#</a></span>  <code><strong>keyWidth</strong></code>  <span><span>&nbsp;=&nbsp;</span>  <code>27</code></span>   &ndash; Keys average width in pixels</summary>  <a href="src/x-pianokeys.tsx#L81">src/x-pianokeys.tsx#L81</a>  <ul><p>number</p>        </ul></details><details id="onmidimessage$19" title="Property" ><summary><span><a href="#onmidimessage$19">#</a></span>  <code><strong>onmidimessage</strong></code>    </summary>    <ul><p><span>EventHandler</span>&lt;<span>HTMLElement</span> &amp; <span>Root</span>, <span>MIDIMessageEvent</span>&gt;</p>        </ul></details><details id="startOctave$22" title="Property" ><summary><span><a href="#startOctave$22">#</a></span>  <code><strong>startOctave</strong></code>  <span><span>&nbsp;=&nbsp;</span>  <code>5</code></span>   &ndash; Leftmost octave</summary>  <a href="src/x-pianokeys.tsx#L83">src/x-pianokeys.tsx#L83</a>  <ul><p>number</p>        </ul></details><details id="vertical$23" title="Property" ><summary><span><a href="#vertical$23">#</a></span>  <code><strong>vertical</strong></code>  <span><span>&nbsp;=&nbsp;</span>  <code>false</code></span>   &ndash; Makes piano vertical</summary>  <a href="src/x-pianokeys.tsx#L85">src/x-pianokeys.tsx#L85</a>  <ul><p>boolean</p>        </ul></details></p></ul></details></p>

## Credits

- [mixter](https://npmjs.org/package/mixter) by [stagas](https://github.com/stagas) &ndash; A Web Components framework.

## Contributing

[Fork](https://github.com/stagas/x-pianokeys/fork) or [edit](https://github.dev/stagas/x-pianokeys) and submit a PR.

All contributions are welcome!

## License

<a href="LICENSE">MIT</a> &copy; 2022 [stagas](https://github.com/stagas)

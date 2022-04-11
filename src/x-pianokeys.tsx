/** @jsxImportSource mixter/jsx */
import { attrs, debounce, mixter, props, shadow, state } from 'mixter'
import { jsx, refs } from 'mixter/jsx'
import { midi } from './midi'

let isResizing = false

const style = /*css */ `
:host {
  --pressed-white: #e44;
  --pressed-black: #e44;
  --key-white: #ccc;
  --key-black: #111;
  position: relative;
  touch-action: none;
  display: flex;
  width: 100%;
  height: 100%;
}
[part='piano'] {
  position: relative;
  user-select: none;
  width: 100%;
  height: 100%;
}

.black {
  fill: url(#black-horizontal);
  filter: url(#drop-shadow-high);
}
.black.pressed {
  fill: url(#black-horizontal-pressed);
  filter: url(#drop-shadow-low) url(#black-pressed-color);
}
.black.vertical {
  fill: url(#black-vertical);
}
.black.vertical.pressed {
  fill: url(#black-vertical-pressed);
}

.white {
  fill: url(#white-horizontal);
}
.white.pressed {
  fill: url(#white-horizontal-pressed);
  filter: url(#inset-shadow) url(#white-pressed-color);
}
.white.vertical {
  fill: url(#white-vertical);
}
.white.vertical.pressed {
  fill: url(#white-vertical-pressed);
}

button {
  box-sizing: border-box;
  pointer-events: none;
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  position: absolute;
  top: 0;
  outline: none;
  background: none;
  color: #fff;
  caret-color: none;
  resize: none;
}`

export class PianoKeysElement extends mixter(
  HTMLElement,
  shadow(),
  midi(),
  attrs(
    class {
      /** Height of black keys `100`=full height */
      blackHeight = 67
      /** Keys average width in pixels */
      keyWidth = 27
      /** Leftmost octave */
      startOctave = 5
      /** Makes piano vertical */
      vertical = false
    }
  ),
  props(
    class {
      /** @private */
      halfOctaves = 2
      /** @private */
      numberOfKeys?: number
      /** @private */
      width?: number
      /** @private */
      keyboard?: SVGSVGElement
      /** @private */
      button?: HTMLButtonElement
      /** @private */
      turnOnKey?: (note: string | number) => void
      /** @private */
      turnOffKey?: (note: string | number) => void
      /** @private */
      onPointerEnter?: (e: PointerEvent & { currentTarget: SVGRectElement }) => void
      /** @private */
      onPointerLeave?: (e: PointerEvent & { currentTarget: SVGRectElement }) => void
      /** @private */
      onPointerUp?: () => void
      /** @private */
      onKeyDown?: (e: KeyboardEvent) => void
      /** @private */
      onKeyUp?: (e: KeyboardEvent) => void
      /** @private */
      onResize?: () => void
    }
  ),
  state<PianoKeysElement>(({ $, effect, reduce }) => {
    const { part, render } = jsx($)
    const { ref } = refs($)

    const getNote = (key: string) => {
      key = key.toLowerCase()
      let note = 'zsxdcvgbhnjm,l.;/\'\\'.indexOf(key)
      if (note < 0) {
        note = 'q2w3er5t6y7ui9o0p[=]'.indexOf(key)
        if (note >= 0) note += 12
        else return -1
      }
      return note
    }

    $.width = reduce(({ keyWidth, numberOfKeys }) => numberOfKeys * keyWidth)

    $.numberOfKeys = reduce(({ halfOctaves, vertical }) =>
      6 * halfOctaves + (
        halfOctaves % 2 === 0
          ? +!vertical
          : halfOctaves % 1 === 0
          ? -1
          : 1
      )
    )

    $.turnOnKey = reduce(({ host, keyboard, startOctave }) => (note => {
      if (isResizing) return
      const el = keyboard.querySelector(`[data-note="${note}"]`)
      if (el && el.classList.contains('pressed')) return
      host.sendMidi(0x90, 12 * startOctave + +note, 127)
      if (el) el.classList.add('pressed')
    }), _ => {})

    $.turnOffKey = reduce(({ host, keyboard, startOctave }) => (note => {
      const el = keyboard.querySelector(`[data-note="${note}"]`)
      if (el && !el.classList.contains('pressed')) return
      host.sendMidi(0x89, 12 * startOctave + +note, 0)
      if (el) el.classList.remove('pressed')
    }), _ => {})

    $.onPointerEnter = reduce(({ turnOnKey }) => (e => {
      const note = e.currentTarget.dataset.note
      if (note != null && e.buttons) {
        e.currentTarget.releasePointerCapture(e.pointerId)
        turnOnKey(note)
      }
    }))

    $.onPointerLeave = reduce(({ turnOffKey }) => (e => {
      const note = e.currentTarget.dataset.note
      if (note != null) turnOffKey(note)
    }))

    $.onPointerUp = reduce(({ button }) => (() => {
      button.focus()
    }), () => {})

    $.onKeyDown = reduce(({ turnOnKey }) => (e => {
      if (e.key === 'Tab') return
      e.preventDefault()
      const note = getNote(e.key)
      if (note >= 0) turnOnKey(note)
    }))

    $.onKeyUp = reduce(({ turnOffKey }) => (e => {
      if (e.key === 'Tab') return
      e.preventDefault()
      const note = getNote(e.key)
      if (note >= 0) turnOffKey(note)
    }))

    const stopResizing = debounce()(() => {
      isResizing = false
    }, 50)

    $.onResize = reduce(({ host, vertical, keyWidth, halfOctaves }) => (() => {
      isResizing = true
      stopResizing()
      const rect = host.getBoundingClientRect()
      const width = vertical ? rect.height : rect.width
      const newHalfOctaves = Math.round(width / keyWidth / 6) || halfOctaves
      if (newHalfOctaves !== halfOctaves) $.halfOctaves = newHalfOctaves
    }), () => {})

    effect(({ host, onResize }) => {
      const observer = new ResizeObserver(onResize)
      observer.observe(host)
      return () => observer.disconnect()
    })

    const Keys = part(({ numberOfKeys, keyWidth, blackHeight, vertical, onPointerEnter, onPointerLeave }) => {
      const b = []
      const w = []
      for (let i = 0; i < numberOfKeys; i++) {
        const k = i % 12
        const bw = 'wbwbwwbwbwbw'[k] === 'b'
        const nt = 'ccddeffggaab'[k]
        const lx = 'x    x      '[k] === 'x'
        let width = keyWidth + (bw ? 0 : keyWidth) + 1,
          height = bw ? blackHeight : 100,
          x = i * keyWidth - (lx || bw ? 0 : keyWidth * 0.5) - 1,
          y = 0
        if (vertical) {
          ;[width, height] = [height, width]
          ;[x, y] = [y, x]
        }
        const key = (
          <rect
            key={i}
            data-note={vertical ? numberOfKeys - i - 1 : i}
            class={`note key ${
              bw
                ? 'black'
                : 'white'
            } ${nt} ${
              vertical
                ? 'vertical'
                : ''
            } ${i % 4 === 1 ? '' : ''}`}
            width={width}
            height={height}
            x={x}
            y={y}
            onpointerdown={onPointerEnter}
            onpointermove={onPointerEnter}
            onpointerenter={onPointerEnter}
            onpointerleave={onPointerLeave}
            onpointerup={onPointerLeave}
          />
        )
        if (bw) b.push(key)
        else w.push(key)
      }
      return [...w, ...b]
    })

    render(({ width, vertical, onKeyDown, onKeyUp, onPointerUp }) => (
      <>
        <style>{style}</style>
        <button ref={ref.button} onkeydown={onKeyDown} onkeyup={onKeyUp}></button>
        <svg
          part="piano"
          ref={ref.keyboard}
          viewBox={vertical ? `0 0 100 ${width}` : `0 0 ${width} 100`}
          preserveAspectRatio="none"
          onpointerup={onPointerUp}
        >
          <defs>
            {/* https://css-tricks.com/adding-shadows-to-svg-icons-with-css-and-svg-filters/ */}
            <filter id="drop-shadow-high">
              <feDropShadow dx="1.2" dy="0.0" stdDeviation="1.5" flood-opacity="0.55" />
            </filter>
            <filter id="drop-shadow-low">
              <feDropShadow dx="0.7" dy="0.0" stdDeviation="0.5" flood-opacity="0.55" />
            </filter>

            <filter id="inset-shadow">
              {/* Shadow offset */}
              <feOffset
                dx="0.5"
                dy="3"
              />
              {/* Shadow blur */}
              <feGaussianBlur
                stdDeviation="2.5"
                result="offset-blur"
              />
              {/* Invert drop shadow to make an inset shadow */}
              <feComposite
                operator="out"
                in="SourceGraphic"
                in2="offset-blur"
                result="inverse"
              />
              {/* Cut colour inside shadow */}
              <feFlood
                flood-color="black"
                flood-opacity=".5"
                result="color"
              />
              <feComposite
                operator="in"
                in="color"
                in2="inverse"
                result="shadow"
              />
              {/* Placing shadow over element */}
              <feComposite
                operator="over"
                in="shadow"
                in2="SourceGraphic"
              />
            </filter>

            <filter id="black-pressed-color">
              <feColorMatrix type="hueRotate" result="hue" />
              <feFlood flood-color="rgba(50,30,205,0.45)" result="flood" />
              <feBlend mode="screen" in="hue" in2="flood" />
              <feComposite operator="in" in2="SourceGraphic" />
            </filter>

            <filter id="white-pressed-color">
              <feColorMatrix type="hueRotate" result="hue" />
              <feFlood flood-color="#36f" result="flood" />
              <feBlend mode="lighten" in="hue" in2="flood" />
              <feComposite operator="in" in2="SourceGraphic" />
            </filter>

            <BlackGradient kind="horizontal" x1="0" x2="0" y1="0" y2="1" />
            <BlackGradientPressed kind="horizontal" x1="0" x2="0" y1="0" y2="1" />
            <BlackGradient kind="vertical" x1="0" x2="1" y1="0" y2="0" />
            <BlackGradientPressed kind="vertical" x1="0" x2="1" y1="0" y2="0" />

            <WhiteGradient kind="horizontal" x1="0" x2="0" y1="0" y2="1" />
            <WhiteGradientPressed kind="horizontal" x1="0" x2="0" y1="0" y2="1" />
            <WhiteGradient kind="vertical" x1="0" x2="1" y1="0" y2="0" />
            <WhiteGradientPressed kind="vertical" x1="0" x2="1" y1="0" y2="0" />
          </defs>

          <Keys />
        </svg>
      </>
    ))
  })
) {}

const Stops = ({ colors }: { colors: [string, number][] }) =>
  colors.map(([c, p]) => <stop stop-color={c} offset={p + '%'} />)

const BlackGradient = (
  { kind, x1, x2, y1, y2 }: { kind: string; x1: string; x2: string; y1: string; y2: string },
) => (
  <linearGradient id={`black-${kind}`} x1={x1} x2={x2} y1={y1} y2={y2}>
    <Stops
      colors={[
        ['#000', 0],
        ['#111', 45],
        ['#666', 90],
        ['#fff', 90.8],
        ['#444', 91.15],
        ['#111', 100],
      ]}
    />
  </linearGradient>
)

const BlackGradientPressed = (
  { kind, x1, x2, y1, y2 }: { kind: string; x1: string; x2: string; y1: string; y2: string },
) => (
  <linearGradient id={`black-${kind}-pressed`} x1={x1} x2={x2} y1={y1} y2={y2}>
    <Stops
      colors={[
        ['#000', 0],
        ['#37a', 45],
        ['#59c', 93],
        ['#fff', 95.8],
        ['#444', 96.15],
        ['#111', 100],
      ]}
    />
  </linearGradient>
)

const WhiteGradient = (
  { kind, x1, x2, y1, y2 }: { kind: string; x1: string; x2: string; y1: string; y2: string },
) => (
  <linearGradient id={`white-${kind}`} x1={x1} x2={x2} y1={y1} y2={y2}>
    <Stops
      colors={[
        ['#666', 0],
        ['#bfbfbf', 3],
        ['#efefef', 15],
        ['#fff', 28],
        ['#fff', 35],
        ['#f1f1f1', 45],
        ['#e8e8e8', 60],
        ['#efefef', 65],
        ['#e8e8e8', 88],
        ['#f2f2f2', 93],
        ['#dadada', 93.5],
        ['#666', 94.5],
        ['#aaa', 95],
        ['#e2e2e2', 100],
      ]}
    />
  </linearGradient>
)

const WhiteGradientPressed = (
  { kind, x1, x2, y1, y2 }: { kind: string; x1: string; x2: string; y1: string; y2: string },
) => (
  <linearGradient id={`white-${kind}-pressed`} x1={x1} x2={x2} y1={y1} y2={y2}>
    <Stops
      colors={[
        ['#777', 0],
        ['#ccc', 4],
        ['#e0e0e0', 30],
        ['#f2f2f2', 78],
        ['#eee', 96],
        ['#777', 97],
        ['#aaa', 99],
      ]}
    />
  </linearGradient>
)

/** @jsxImportSource minimal-view */

import { element, queue, view, web } from 'minimal-view'

import { observe } from './observe'

import { MIDIMessageEvent } from 'webaudio-tools'

export type MidiEvents = {
  midimessage: WebMidi.MIDIMessageEvent
}

const midiMessageEvent = new MIDIMessageEvent('midimessage', {
  data: new Uint8Array([0, 0, 0]),
})

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

export const PianoKeys = web(view('piano-keys',
  class props {
    halfOctaves?= 2
    /** Height of black keys `100`=full height */
    blackHeight?= 71
    /** Keys average width in pixels */
    keyWidth?= 27
    /** Leftmost octave */
    startHalfOctave?= 5
    /** Makes piano vertical */
    vertical?= false
    /** Invert colors */
    invertColors?= false
    audioContext!: BaseAudioContext
    onMidiEvent!: (ev: WebMidi.MIDIMessageEvent) => void
  },
  class local {
    host = element

    rect?: DOMRect
    numberOfKeys?: number
    width?: number
    keyboard?: SVGSVGElement
    firstPressed = false
    button?: HTMLButtonElement

    keysView?: JSX.Element
    octaveText?: JSX.Element

    isResizing = false
  },
  function actions({ $, fns, fn }) {

    const pressed = new Set<number>()

    const stopResizing = queue.debounce(400)(() => {
      $.isResizing = false
    })

    return fns(new class actions {

      sendMidi(a: number, b: number, c: number) {
        if (!$.audioContext) {
          throw new Error('sendMidi is missing AudioContext')
        }
        midiMessageEvent.receivedTime = 0 //this.audioContext.currentTime * 1000
        midiMessageEvent.data[0] = a
        midiMessageEvent.data[1] = b
        midiMessageEvent.data[2] = c
        $.onMidiEvent(midiMessageEvent as WebMidi.MIDIMessageEvent)
      }


      turnOnKey = fn(({ host, keyboard, startHalfOctave }) => (note => {
        if ($.isResizing) return
        const el = keyboard.querySelector(`[data-note="${note}"]`)
        if (pressed.has(+note)) return
        pressed.add(+note)
        if (note == 0) $.firstPressed = true
        this.sendMidi(0x90, 6 * startHalfOctave + +note, 127)
        if (el) el.classList.add('pressed')
      }))

      turnOffKey = fn(({ host, keyboard, startHalfOctave }) => (note => {
        const el = keyboard.querySelector(`[data-note="${note}"]`)
        if (!pressed.has(+note)) return
        pressed.delete(+note)
        if (note == 0) $.firstPressed = false
        this.sendMidi(0x89, 12 * startHalfOctave + +note, 0)
        if (el) el.classList.remove('pressed')
      }))


      onPointerEnter = (e: PointerEvent & { currentTarget: SVGRectElement }) => {
        if (e.buttons > 1) return
        e.preventDefault()
        e.stopPropagation()
        const note = e.currentTarget.dataset.note
        if (note != null && e.buttons) {
          this.focus()
          e.currentTarget.releasePointerCapture(e.pointerId)
          this.turnOnKey(note)
        }
      }


      onPointerLeave = (e: PointerEvent & { currentTarget: SVGRectElement }) => {
        if (e.buttons > 1) return
        const note = e.currentTarget.dataset.note
        if (note != null) this.turnOffKey(note)
      }

      onPointerUp = (e: PointerEvent & { currentTarget: SVGRectElement }) => {
        if (e.buttons > 1) return
        this.focus()
      }


      onKeyDown = (e: KeyboardEvent) => {
        if (e.shiftKey) {
          if (e.key === 'ArrowRight') {
            e.preventDefault()
            $.startHalfOctave! += 2
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault()
            $.startHalfOctave! -= 2
          }
        }
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return
        if (e.key === 'Tab') return
        e.preventDefault()
        const note = getNote(e.key)
        if (note >= 0) this.turnOnKey(note)
      }

      onKeyUp = (e: KeyboardEvent) => {
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return
        if (e.key === 'Tab') return
        e.preventDefault()
        const note = getNote(e.key)
        if (note >= 0) this.turnOffKey(note)
      }

      onResize: ResizeObserverCallback = fn(
        ({ vertical, keyWidth, halfOctaves }) =>
          queue.throttle(50).first.last.not.next(([resizeEntry]) => {
            $.isResizing = true
            stopResizing()
            const rect = $.rect = resizeEntry.contentRect
            const width = vertical ? rect.height : rect.width
            const height = vertical ? rect.width : rect.height
            let kw = keyWidth
            if (vertical) {
              if (height < 60 && width < 200)
                kw *= 0.35
              else {
                if (width < 360) kw *= 0.64
                else if (width < 460) kw *= 0.77
                else if (width < 570) kw *= 0.8
              }
            } else {
              if (height < 60) {
                kw *= 0.45
                if (width < 200) kw *= 0.6
              } else {
                if (width < 280) kw *= 0.5
                else if (width < 340) kw *= 0.6
                else if (width < 380) kw *= 0.7
                else if (width < 520) kw *= 0.75
                else if (width < 570) kw *= 0.9
              }
            }
            let newHalfOctaves = Math.round(width / kw / 6) || halfOctaves
            if (newHalfOctaves === 1 && width > 30)
              newHalfOctaves = Math.round(width / (kw * 0.6) / 6) || halfOctaves
            if (newHalfOctaves !== halfOctaves) $.halfOctaves = newHalfOctaves
          })
      )

      focus = () => {
        $.button?.focus({ preventScroll: true })
      }

    })
  },
  function effects({ $, fx, deps, refs }) {
    fx(({ host, isResizing }) => {
      host.toggleAttribute('resizing', isResizing)
    })

    fx(({ keyWidth, numberOfKeys }) => {
      $.width = numberOfKeys * keyWidth
    })

    fx(({ halfOctaves, vertical, startHalfOctave }) => {
      const isExact = startHalfOctave % 2 === 0

      $.numberOfKeys = (6 * halfOctaves + (
        halfOctaves % 2 === 0
          ? +!vertical
          : halfOctaves % 1 === 0
            ? -1 + (isExact ? 0 : 2)
            : 1
      )
      )
    })

    fx(({ host, onResize }) =>
      observe.resize(host, onResize)
    )

    const keyRefs = new Map()

    fx(({ numberOfKeys, keyWidth, blackHeight, vertical, invertColors, startHalfOctave }) => {
      const b = []
      const w = []
      const blackKeyWidth = keyWidth + 1
      const whiteKeyWidth = blackKeyWidth + keyWidth
      const halfKeyWidth = keyWidth * 0.5
      const blackKeyExpand = 12
      const isExact = startHalfOctave % 2 === 0
      for (let i = 0; i < numberOfKeys; i++) {
        const k = (vertical ? numberOfKeys - i - 1 + (isExact ? 0 : 5) : i) % 12
        const bw = 'wbwbwwbwbwbw'[k] === 'b'
        const nt = 'ccddeffggaab'[k]
        const lx = vertical
          ? '    x      x'[k] === 'x'
          : 'x    x      '[k] === 'x'
        // const rx = '    x      x'[k] === 'x'
        let width, height, x, y = 0

        if (bw) {
          width = blackKeyWidth + blackKeyExpand
          height = blackHeight
          x = i * keyWidth - 1 - blackKeyExpand / 2
        } else {
          width = whiteKeyWidth
          height = 100
          x = i * keyWidth - (lx ? 0 : halfKeyWidth) - 1
        }
        if (vertical) {
          ;[width, height] = [height, width]
            ;[x, y] = [y, x]
        }
        const key = (
          <rect
            key={i}
            ref={{
              get current() {
                return null // keyRefs.get(i)
              },
              set current(el) {
                keyRefs.set(i, el)
              },
            }}
            data-note={vertical
              ? numberOfKeys - i - 1
              : i}
            class={`note ${(+bw ^ +invertColors)
              ? 'black'
              : 'white'
              } ${nt} ${vertical
                ? 'vertical'
                : ''
              } ${i % 4 === 1
                ? ''
                : ''
              }`}
            width={width | 0}
            height={height | 0}
            x={x | 0}
            y={y | 0}
            onpointerdown={$.onPointerEnter}
            onpointermove={$.onPointerEnter}
            onpointerenter={$.onPointerEnter}
            onpointerleave={$.onPointerLeave}
            onpointerup={$.onPointerLeave}
          />
        )
        if (bw) b.push(key)
        else w.push(key)
      }

      $.keysView = (
        <>
          <g>
            {w}
          </g>
          <g /* filter={isMobileAgent ? '' : 'url(#drop-shadow-high)'} */>
            {b}
          </g>
        </>
      )
    }
    )

    // fx(({ width, rect, vertical, firstPressed, keyWidth, startHalfOctave }) => {
    //   $.octaveText = <TextAlignCenter
    //     part="octave"
    //     class={firstPressed ? 'pressed' : ''}
    //     vertical={vertical}
    //     svgWidth={width}
    //     width={keyWidth * (rect[vertical ? 'width' : 'height'] < 70 ? 0.5 : 1) * 0.95}
    //     y={100 - 14.5 + (firstPressed ? 2.62 : 0)}
    //     fontSize={11}
    //   >
    //     C{startHalfOctave}
    //   </TextAlignCenter>
    // })

    $.css = /*css*/`
    & {
      --pressed-white: #e44;
      --pressed-black: #e44;
      --key-white: #ccc;
      --key-black: #111;
      contain: size layout style paint;
      position: relative;
      touch-action: none;
      display: inline-flex;
      width: 100%;
      height: 100%;
    }
    &([resizing]) {
      pointer-events: none;
    }
    [part=piano] {
      contain: size layout style paint;
      shape-rendering: optimizeSpeed;
      position: relative;
      user-select: none;
      width: 100%;
      height: 100%;
    }
    [part=octave] {
      contain: size layout style paint;
      pointer-events: none;
      font-family: sans-serif;
      font-weight: bold;
      fill: #b1b1b1;
      filter: drop-shadow(-0.5px -0.5px 1.5px rgba(255,255,255,.17));
    }
    [part=octave].pressed {
      fill: #a9a9f1;
      filter: drop-shadow(-0.5px -0.5px 1.5px rgba(225,225,255,.10));
    }
    .note {
      shape-rendering: optimizeSpeed;
    }

    &(:not([invertColors])) {
      .black {
        fill: url(#black-horizontal);
        filter: url(#drop-shadow-high);

        &.pressed {
          fill: url(#black-horizontal-pressed);
          filter: url(#black-pressed-color) url(#drop-shadow-low);
        }
        &.vertical {
          fill: url(#black-vertical);
          &.pressed {
            fill: url(#black-vertical-pressed);
          }
        }
      }
    }

    &([invertColors]) {
      .black {
        fill: url(#inverse-black-horizontal);
        filter: url(#drop-shadow-high);
        &.pressed {
          fill: url(#inverse-black-horizontal-pressed);
          filter: url(#inset-shadow) url(#black-pressed-color);
        }
        &.vertical {
          fill: url(#inverse-black-vertical);
          &.pressed {
            fill: url(#inverse-black-vertical-pressed);
          }
        }
      }
    }

    &(:not([invertColors])) {
      .white {
        fill: url(#white-horizontal);
        &.pressed {
          fill: url(#white-horizontal-pressed);
          filter: url(#inset-shadow) url(#white-pressed-color);
        }
        &.vertical {
          fill: url(#white-vertical);
          &.pressed {
            fill: url(#white-vertical-pressed);
          }
        }
      }
    }

    &([invertColors]) {
      .white {
        fill: url(#inverse-white-horizontal);
        &.pressed {
          fill: url(#inverse-white-horizontal-pressed);
          filter: url(#white-pressed-color) url(#drop-shadow-low);
        }
        &.vertical {
          fill: url(#inverse-white-vertical);
          &.pressed {
            fill: url(#inverse-white-vertical-pressed);
          }
        }
      }
    }

    button {
      contain: size layout style paint;
      box-sizing: border-box;

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
    }
    `

    fx(({ width, vertical, keysView }) => {
      $.view = <>
        <button ref={refs.button} onkeydown={$.onKeyDown} onkeyup={$.onKeyUp}></button>
        <svg
          part="piano"
          ref={refs.keyboard}
          viewBox={vertical ? `0 0 100 ${width | 0}` : `0 0 ${width | 0} 100`}
          preserveAspectRatio="none"
          onpointerup={$.onPointerUp as any}
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

            <InverseBlackGradient kind="horizontal" x1="0" x2="0" y1="0" y2="1" />
            <InverseBlackGradientPressed kind="horizontal" x1="0" x2="0" y1="0" y2="1" />
            <InverseBlackGradient kind="vertical" x1="0" x2="1" y1="0" y2="0" />
            <InverseBlackGradientPressed kind="vertical" x1="0" x2="1" y1="0" y2="0" />

            <WhiteGradient kind="horizontal" x1="0" x2="0" y1="0" y2="1" />
            <WhiteGradientPressed kind="horizontal" x1="0" x2="0" y1="0" y2="1" />
            <WhiteGradient kind="vertical" x1="0" x2="1" y1="0" y2="0" />
            <WhiteGradientPressed kind="vertical" x1="0" x2="1" y1="0" y2="0" />

            <InverseWhiteGradient kind="horizontal" x1="0" x2="0" y1="0" y2="1" />
            <InverseWhiteGradientPressed kind="horizontal" x1="0" x2="0" y1="0" y2="1" />
            <InverseWhiteGradient kind="vertical" x1="0" x2="1" y1="0" y2="0" />
            <InverseWhiteGradientPressed kind="vertical" x1="0" x2="1" y1="0" y2="0" />
          </defs>

          {keysView}
          {/* {octaveText} */}
        </svg>
      </>
    })
  }
))

// const TextAlignCenter = (
//   { part, class: className, vertical, fontSize, width, svgWidth, y, children }: {
//     part: string
//     class: string
//     vertical: boolean
//     fontSize: number
//     width: number
//     svgWidth: number
//     y: number
//     children?: any[]
//   },
// ) => (
//   <svg
//     x={vertical ? y - 7.5 : 0}
//     y={vertical ? svgWidth - width / 2 - 5 : y - 5}
//     part={part}
//     class={className}
//     width={vertical ? 15 : Math.max(20, width) - 5}
//     height={25}
//     viewBox="0 0 25 25"
//     preserveAspectRatio="none"
//   >
//     <text
//       x={5}
//       y={5}
//       font-size={fontSize || 'var(--font-size)'}
//       alignment-baseline="middle"
//     >
//       {children}
//     </text>
//   </svg>
// )

const Stops = ({ colors }: { colors: [string, number][] }) =>
  colors.map(([c, p]) => <stop stop-color={c} offset={p + '%'} />)

const BlackGradient = (
  { kind, x1, x2, y1, y2 }: { kind: string; x1: string; x2: string; y1: string; y2: string },
) => (
  <linearGradient id={`black-${kind}`} x1={x1} x2={x2} y1={y1} y2={y2}>
    <Stops
      colors={[
        ['#103', 0],
        ['#214', 45],
        ['#768', 90],
        ['#eef', 91],
        ['#647', 91.5],
        ['#214', 100],
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

const InverseBlackGradient = (
  { kind, x1, x2, y1, y2 }: { kind: string; x1: string; x2: string; y1: string; y2: string },
) => (
  <linearGradient id={`inverse-black-${kind}`} x1={x1} x2={x2} y1={y1} y2={y2}>
    <Stops
      colors={[
        ['#000', 0],
        ['#141414', 3],
        ['#1a1a1a', 20],
        ['#000', 29],
        ['#000', 35],
        ['#000', 45],
        ['#000', 60],
        ['#111', 79],
        ['#222', 93],
        ['#252525', 93.5],
        ['#191919', 94.5],
        ['#151515', 95],
        ['#000', 100],
      ]}
    />
  </linearGradient>
)

const InverseBlackGradientPressed = (
  { kind, x1, x2, y1, y2 }: { kind: string; x1: string; x2: string; y1: string; y2: string },
) => (
  <linearGradient id={`inverse-black-${kind}-pressed`} x1={x1} x2={x2} y1={y1} y2={y2}>
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
        ['#768', 0],
        ['#dacaef', 95],
        ['#657', 95.5],
        ['#657', 100],
        // ['#baf', 95],
        // ['#e2e2f2', 100],
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

const InverseWhiteGradient = (
  { kind, x1, x2, y1, y2 }: { kind: string; x1: string; x2: string; y1: string; y2: string },
) => (
  <linearGradient id={`inverse-white-${kind}`} x1={x1} x2={x2} y1={y1} y2={y2}>
    <Stops
      colors={[
        ['#888', 0],
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
        // ['#666', 94.5],
        // ['#aaa', 95],
        ['#aaa', 100],
      ]}
    />
  </linearGradient>
)

const InverseWhiteGradientPressed = (
  { kind, x1, x2, y1, y2 }: { kind: string; x1: string; x2: string; y1: string; y2: string },
) => (
  <linearGradient id={`inverse-white-${kind}-pressed`} x1={x1} x2={x2} y1={y1} y2={y2}>
    <Stops
      colors={[
        ['#ccc', 0],
        // ['#bfbfbf', 3],
        ['#fff', 8],
        // ['#fff', 75],
        ['#a0a0a0', 90],
        // ['#f2f2f2', 78],

        ['#999', 95],
        ['#aaa', 96.5],
        ['#666', 99],
      ]}
    />
  </linearGradient>
)

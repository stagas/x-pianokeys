import $ from 'sigl'

// TODO: this should be declared in types/global.d.ts but for
// some unknown reason it's not happening always.
// NOTE: if this is removed it doesn't compile
declare const MIDIMessageEvent: WebMidi.MIDIMessageEvent

export type MidiEvents = {
  midimessage: WebMidi.MIDIMessageEvent
}

export const midi = () => {
  if (typeof MIDIMessageEvent === 'undefined') {
    ;(globalThis as any).MIDIMessageEvent = class extends Event {
      constructor(public msg: string, public data: any) {
        super(msg)
      }
    }
  }

  const midiMessageEvent = new MIDIMessageEvent('midimessage', {
    data: new Uint8Array([0, 0, 0]),
  })

  return $.mixin(superclass =>
    class extends (superclass as $.Super<any, MidiEvents>) {
      audioContext?: BaseAudioContext

      sendMidi(a: number, b: number, c: number) {
        if (!this.audioContext) {
          throw new Error('sendMidi is missing AudioContext')
        }
        midiMessageEvent.receivedTime = 0 //this.audioContext.currentTime * 1000
        midiMessageEvent.data[0] = a
        midiMessageEvent.data[1] = b
        midiMessageEvent.data[2] = c
        this.dispatchEvent(midiMessageEvent)
      }
    }
  )
}

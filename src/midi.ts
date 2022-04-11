import { Class, events, InlineEventMap, Mixin, mixter } from 'mixter'

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

  return <T extends Mixin>(superclass: T) =>
    class extends mixter(superclass, events()) {
      sendMidi(a: number, b: number, c: number) {
        midiMessageEvent.data[0] = a
        midiMessageEvent.data[1] = b
        midiMessageEvent.data[2] = c
        this.dispatchEvent(midiMessageEvent)
      }
    } as unknown as
      & T
      & Class<
        & {
          /** @private */
          sendMidi(a: number, b: number, c: number): void
        }
        & InlineEventMap<T, { midimessage: WebMidi.MIDIMessageEvent }>
      >
}

// global types:

declare namespace WebMidi {
  declare interface MIDIMessageEvent {
    new(kind: string, payload?: { data: Uint8Array }): WebMidi.MIDIMessageEvent
  }
}

declare const MIDIMessageEvent: WebMidi.MIDIMessageEvent

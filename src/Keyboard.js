import React, { Component } from 'react';

import { Piano, KeyboardShortcuts, MidiNumbers } from 'react-piano';
import 'react-piano/dist/styles.css';

const firstNote = MidiNumbers.fromNote('c2')
const lastNote = MidiNumbers.fromNote('c6')
const keyboardShortcuts = KeyboardShortcuts.create({
   firstNote: firstNote,
   lastNote: lastNote,
   keyboardConfig: KeyboardShortcuts.HOME_ROW,
 })

class Keyboard extends Component {
  render() {
    return (
      <Piano noteRange={{ first: firstNote, last: lastNote }}
            playNote={(midiNumber) => this.props.noteOn(midiNumber)}
            stopNote={(midiNumber) => this.props.noteOff(midiNumber)}
            width={1000}
            keyboardShortcuts={keyboardShortcuts}/>
    )
  }
}

export default Keyboard

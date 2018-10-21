import React, { Component } from 'react';


class Keyboard extends Component {

  componentDidMount() {
    const keyboard = document.getElementById(this.props.controlId)
    keyboard.addEventListener('change', (event) => this.keyboardChange(event))
    keyboard.addEventListener('note', (event) => this.keyboardChange(event))

    if(window.webAudioControlsMidiManager) {
      console.log("Adding midilistener")
      window.webAudioControlsMidiManager.addMidiListener((event) => this.midiEvent(event))
    }
  }

  componentWillUnmount() {
    const keyboard = document.getElementById(this.props.controlId)
    keyboard.removeEventListener('change', (event) => this.keyboardChange(event))
    keyboard.removeEventListener('note', (event) => this.keyboardChange(event))
  }

  keyboardChange(event) {
    if(event.note) {
      if(event.note[0]) {
        this.props.noteOn(event.note[1])
      } else {
        this.props.noteOff(event.note[1])
      }
    } 
  }

  midiEvent(event) {
    var data = event.data
    var controlNumber = data[0]
    
    switch(controlNumber) {
      case 144: 
      this.props.noteOn(data[1])
        break
      case 128:
      this.props.noteOff(data[1])
        break
      default:
        console.log("Unhandled midi message", event)  
    }
    
  }

  render() {
    return (
        <webaudio-keyboard id={this.props.controlId} width="1000" height="120" min="48" keys="48" />
    )
  }
}

export default Keyboard

import React, { Component } from 'react';
import './App.css';
import FmSynth from './FmSynth'
import ModularSynth from './ModularSynth'

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      audioContext: undefined
    }
  }

  componentDidMount() {
    this.setState({
      audioContext: new (window.AudioContext || window.webkitAudioContext)()
    })
  }

  componentWillUnmount() {
    this.state.audioContext.close()
  }
/*
  simpleNoteOn(midiNumber) {
    const audioContext = this.state.audioContext
    const startTime = audioContext.currentTime

    const env = audioContext.createGain()
    env.gain.value = 0
    env.connect(audioContext.destination)
    env.gain.setTargetAtTime(this.state.overallGain, startTime, 0.1)

    const osc = audioContext.createOscillator()
    osc.frequency.value = Utils.toFreq(midiNumber)
    osc.connect(env)
    osc.start(audioContext.currentTime)
    this.state.currentNotes.set(midiNumber, {
      env: env,
      osc: osc
    })
    this.setState({
        currentNotes: this.state.currentNotes
    })
  }

  simpleNoteOff(midiNumber) {
    const endTime = audioContext.currentTime + 0.2

    const osc = this.state.currentNotes.get(midiNumber).osc
    const env = this.state.currentNotes.get(midiNumber).env
    env.gain.setTargetAtTime(0, endTime, 0.2)

    osc.stop(endTime + 1)
    this.state.currentNotes.delete(midiNumber)
    this.setState({
        currentNotes: this.state.currentNotes
    })
  }
*/
  render() {
    return (
      <ModularSynth audioContext={this.state.audioContext}/>
    )
  }
}

export default App;

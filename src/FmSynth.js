import React, { Component } from 'react';
import Utils from './Utils'
import Keyboard from './Keyboard'

class FmSynth extends Component {

  constructor(props) {
    super(props)
    this.state = {
      currentNotes: new Map(),
      overallGain: 1.0,
      modulatorRatio: 1.0
    }
  }

  handleChangeGain(event) {
    this.setState({overallGain: event.target.value});
  }

  handleChangeModulatorRatio(event) {
    this.setState({modulatorRatio: event.target.value});
  }

  fmNoteOn(midiNumber) {
    const audioContext = this.props.audioContext
    const startTime = audioContext.currentTime

    const env = audioContext.createGain()
    env.gain.value = 0
    env.connect(audioContext.destination)
    env.gain.setTargetAtTime(this.state.overallGain, startTime, 0.1)

    const modulator = audioContext.createOscillator()
    modulator.frequency.value = Utils.toFreq(midiNumber) * this.state.modulatorRatio

    const carrier = audioContext.createOscillator()
    carrier.frequency.value = Utils.toFreq(midiNumber)

    const modulatorGain = audioContext.createGain()
    modulatorGain.gain.value = 300
    modulatorGain.gain.setTargetAtTime(3000, startTime, 1)
    modulatorGain.gain.setTargetAtTime(300, startTime + 3, 2)

    modulator.connect(modulatorGain)
    modulatorGain.connect(carrier.frequency)
    carrier.connect(env)

    modulator.start(startTime)
    carrier.start(startTime)

    this.state.currentNotes.set(midiNumber, {
      env: env,
      carrier: carrier,
      modulator: modulator,
      modulatorGain: modulatorGain
    })
    this.setState({
        currentNotes: this.state.currentNotes
    })
  }

  fmNoteOff(midiNumber) {
    const audioContext = this.props.audioContext
    const endTime = audioContext.currentTime + 0.2

    const currentNote = this.state.currentNotes.get(midiNumber)
    const carrier = currentNote.carrier
    const env = currentNote.env
    const modulator = currentNote.modulator
    const modulatorGain = currentNote.modulatorGain

    modulatorGain.gain.setTargetAtTime(300, endTime, 0.2)
    env.gain.setTargetAtTime(0, endTime, 0.2)
    carrier.stop(endTime + 1)
    carrier.onended = () => {
      console.log("stopping", carrier)
      carrier.disconnect()
    }
    modulator.stop(endTime + 1)
    modulator.onended = () => {
      console.log("stopping", modulator)
      modulator.disconnect()
      env.disconnect()
      modulatorGain.disconnect()
    }
    this.state.currentNotes.delete(midiNumber)
    this.setState({
        currentNotes: this.state.currentNotes
    })
  }

  render() {
    return (
      <div>
        <h1>FM Synth</h1>
        <label>
          Gain {this.state.overallGain}: <input type="range" min="0.1" max="1.0" step="0.01" value={this.state.overallGain} onChange={(event) => this.handleChangeGain(event)} />
          Modulator ratio {this.state.modulatorRatio}: <input type="range" min="0.5" max="3.0" step="0.1" value={this.state.modulatorRatio} onChange={(event) => this.handleChangeModulatorRatio(event)} />
        </label>
        <hr/>

        <Keyboard noteOn={(midiNumber) => this.fmNoteOn(midiNumber)} noteOff={(midiNumber) => this.fmNoteOff(midiNumber)}/>

      </div>
    )
  }
}

export default FmSynth;

import React, { Component } from 'react';
import Utils from './Utils'
import Keyboard from './Keyboard'

const oscTypes = [
  "sine", "square", "sawtooth", "triangle"
]
class ModularSynth extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentNotes: new Map(),
      overallGain: 1.0,
      firstOscType: "square",
      firstFrequencyRatio: 1.0,
      secondOscType: "square",
      secondFrequencyRatio: 1.0
    }
  }

  randomFreq(baseFreq) {
    return (Math.random() * (1.01 - 0.99) + 0.99) * baseFreq
  }
  noteOn(midiNumber) {
    const audioContext = this.props.audioContext
    const startTime = audioContext.currentTime

    const env = audioContext.createGain()
    env.gain.value = 0
    env.connect(audioContext.destination)
    env.gain.setTargetAtTime(this.state.overallGain / 2, startTime, 0.1)

    const firstOscFreq = Utils.toFreq(midiNumber) * this.state.firstFrequencyRatio
    const firstOscillators = Array.from({length: 4}, () => this.randomFreq(firstOscFreq))
      .map((freq) => {
        const osc = audioContext.createOscillator()
        osc.type = this.state.firstOscType
        osc.frequency.value = freq
        osc.connect(env)
        osc.start(audioContext.currentTime)
        return osc
      });

      const secondOscFreq = Utils.toFreq(midiNumber) * this.state.secondFrequencyRatio
      const secondOscillators = Array.from({length: 4}, () => this.randomFreq(secondOscFreq))
        .map((freq) => {
          const osc = audioContext.createOscillator()
          osc.type = this.state.secondOscType
          osc.frequency.value = freq
          osc.connect(env)
          osc.start(audioContext.currentTime)
          return osc
        });

    this.state.currentNotes.set(midiNumber, {
      env: env,
      firstOscillators: firstOscillators,
      secondOscillators: secondOscillators,
    })
    this.setState({
      currentNotes: this.state.currentNotes
    })
  }

  noteOff(midiNumber) {
    const audioContext = this.props.audioContext
    const endTime = audioContext.currentTime + 0.2

    const firstOscillators = this.state.currentNotes.get(midiNumber).firstOscillators
    const secondOscillators = this.state.currentNotes.get(midiNumber).firstOscillators
    const env = this.state.currentNotes.get(midiNumber).env
    env.gain.setTargetAtTime(0, endTime, 0.2)

    firstOscillators.forEach((o) => {
      o.stop(endTime + 1)
      o.onended = () => {
        o.disconnect()
      }
    })
    secondOscillators.forEach((o) => {
      o.stop(endTime + 1)
      o.onended = () => {
        o.disconnect()
        env.disconnect()
      }
    })

    this.state.currentNotes.delete(midiNumber)
    this.setState({
        currentNotes: this.state.currentNotes
    })
  }

  handleChangeGain(event) {
    this.setState({overallGain: event.target.value});
  }

  handleChangeOscType(event, osc) {
    switch (osc) {
      case "first":
        this.setState({firstOscType: event.target.value});
        break;
      case "second":
        this.setState({secondOscType: event.target.value});
        break;
      default:
    }
  }

  handleChangeOscRatio(event, osc) {
    switch (osc) {
      case "first":
        this.setState({firstFrequencyRatio: event.target.value});
        break;
      case "second":
        this.setState({secondFrequencyRatio: event.target.value});
        break;
      default:
    }
  }

  render() {
    return (<div>
      <h1>Modular Synth</h1>
        Gain {this.state.overallGain}: <input type="range" min="0.1" max="1.0" step="0.01" value={this.state.overallGain} onChange={(event) => this.handleChangeGain(event)} />
      <hr/>
      Type: <select value={this.state.firstOscType} onChange={(event) => this.handleChangeOscType(event, "first")}>
              <option value="sine">Sine</option>
              <option value="square">Square</option>
              <option value="sawtooth">Sawtooth</option>
              <option value="triangle">Triangle</option>
            </select>
      Osc ratio {this.state.firstFrequencyRatio}: <input type="range" min="0.5" max="3.0" step="0.1" value={this.state.firstFrequencyRatio} onChange={(event) => this.handleChangeOscRatio(event, "first")} />
      <hr/>
      Type: <select value={this.state.secondOscType} onChange={(event) => this.handleChangeOscType(event, "second")}>
              <option value="sine">Sine</option>
              <option value="square">Square</option>
              <option value="sawtooth">Sawtooth</option>
              <option value="triangle">Triangle</option>
            </select>
      Osc ratio {this.state.secondFrequencyRatio}: <input type="range" min="0.5" max="3.0" step="0.1" value={this.state.secondFrequencyRatio} onChange={(event) => this.handleChangeOscRatio(event, "second")} />
      <hr/>
      <Keyboard controlId="modularkeyboard" noteOn={(midiNumber) => this.noteOn(midiNumber)} noteOff={(midiNumber) => this.noteOff(midiNumber)}/>
    </div>)
  }
}

export default ModularSynth;

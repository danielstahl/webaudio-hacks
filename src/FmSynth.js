import React, { Component } from 'react';
import Utils from './Utils'
import Keyboard from './Keyboard'

class FmSynth extends Component {

  constructor(props) {
    super(props)
    this.state = {
      currentNotes: new Map(),
      overallGain: 1.0,
      attack: 0.1,
      decay: 0.1,
      modulatorRatio: 1.0,
      modulatorAmount: 300
    }
  }


  componentDidMount() {
    const gain = document.getElementById('gainknob')
    gain.addEventListener('change', (event) => this.handleChangeGain(event))

    const attack = document.getElementById('attackknob')
    attack.addEventListener('change', (event) => this.handleChangeAttack(event))

    const decay = document.getElementById('decayknob')
    decay.addEventListener('change', (event) => this.handleChangeDecay(event))
    
    const modRatio = document.getElementById('modratioknob')
    modRatio.addEventListener('change', (event) => this.handleChangeModulatorRatio(event))

    const modAmount = document.getElementById('modamountknob')
    modAmount.addEventListener('change', (event) => this.handleChangeModulatorAmount(event))
  }

  componentWillUnmount() {
    const gain = document.getElementById('gainknob')
    gain.removeEventListener('change', (event) => this.handleChangeGain(event))

    const attack = document.getElementById('attackknob')
    attack.removeEventListener('change', (event) => this.handleChangeAttack(event))

    const decay = document.getElementById('decayknob')
    decay.removeEventListener('change', (event) => this.handleChangeDecay(event))

    const modRatio = document.getElementById('modratioknob')
    modRatio.removeEventListener('change', (event) => this.handleChangeModulatorRatio(event))

    const modAmount = document.getElementById('modamountknob')
    modAmount.removeEventListener('change', (event) => this.handleChangeModulatorAmount(event))
  }

  handleChangeGain(event) {
    this.setState({overallGain: event.target.value});
  }

  handleChangeAttack(event) {
    this.setState({attack: event.target.value});
  }

  handleChangeDecay(event) {
    this.setState({decay: event.target.value});
  }

  handleChangeModulatorRatio(event) {
    this.setState({modulatorRatio: event.target.value});
  }

  handleChangeModulatorAmount(event) {
    this.setState({modulatorAmount: event.target.value});
  }

  fmNoteOn(midiNumber) {
    const audioContext = this.props.audioContext
    const startTime = audioContext.currentTime

    const env = audioContext.createGain()
    env.gain.value = 0
    env.connect(audioContext.destination)
    env.gain.setTargetAtTime(this.state.overallGain, startTime, this.state.attack)

    const modulator = audioContext.createOscillator()
    modulator.frequency.value = Utils.toFreq(midiNumber) * this.state.modulatorRatio

    const carrier = audioContext.createOscillator()
    carrier.frequency.value = Utils.toFreq(midiNumber)

    const modulatorGain = audioContext.createGain()
    modulatorGain.gain.value = this.state.modulatorAmount

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

    const decay = this.state.decay
    env.gain.setTargetAtTime(0, endTime, decay)
    carrier.stop(endTime + (decay * 5))
    carrier.onended = () => {
      carrier.disconnect()
    }
    modulator.stop(endTime + (decay * 5))
    modulator.onended = () => {
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
        <div style={{position:'relative'}}>
          <webaudio-knob id="gainknob" min="0.1" max="1.0" step="0.01" value="1.0" defvalue="1.0" diameter="48" style={{position:'absolute',left:'50px',top:'20px'}}/>
          <webaudio-param link="gainknob" style={{position:'absolute',left:'60px',top:'75px'}}/>
          <span style={{position:'absolute',left:'60px',top:'100px'}}>Gain</span>

          <webaudio-knob id="attackknob" diameter="48" min="0.01" max="3.0" step="0.01" value="0.1" defvalue="0.1" style={{position:'absolute',left:'150px',top:'20px'}}></webaudio-knob>
          <webaudio-param link="attackknob" style={{position:'absolute',left:'160px',top:'75px'}}></webaudio-param>
          <span style={{position:'absolute',left:'150px',top:'100px'}}>Attack</span>

          <webaudio-knob id="decayknob" diameter="48" min="0.01" max="3.0" step="0.01" value="0.1" defvalue="0.1" style={{position:'absolute',left:'250px',top:'20px'}}></webaudio-knob>
          <webaudio-param link="decayknob" style={{position:'absolute',left:'260px',top:'75px'}}></webaudio-param>
          <span style={{position:'absolute',left:'250px',top:'100px'}}>Decay</span>

          <webaudio-knob id="modratioknob" diameter="48" min="0.5" max="3.0" step="0.1" value="1.0" defvalue="1.0" style={{position:'absolute',left:'350px',top:'20px'}}></webaudio-knob>
          <webaudio-param link="modratioknob" style={{position:'absolute',left:'360px',top:'75px'}}></webaudio-param>
          <span style={{position:'absolute',left:'330px',top:'100px'}}>Mod Ratio</span>

          <webaudio-knob id="modamountknob" diameter="48" min="30" max="5000" step="10" value="300" defvalue="300" style={{position:'absolute',left:'450px',top:'20px'}}></webaudio-knob>
          <webaudio-param link="modamountknob" style={{position:'absolute',left:'460px',top:'75px'}}></webaudio-param>
          <span style={{position:'absolute',left:'430px',top:'100px'}}>Mod Amount</span>

          <Keyboard controlId="fmkeyboard" noteOn={(midiNumber) => this.fmNoteOn(midiNumber)} noteOff={(midiNumber) => this.fmNoteOff(midiNumber)}/>
        </div>
        

      </div>
    )
  }
}

export default FmSynth;

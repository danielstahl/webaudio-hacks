import React, { Component } from 'react';
import Utils from './Utils'
import Keyboard from './Keyboard'
import Envelope from './Envelope'
import { Container, Row, Col } from 'reactstrap';
import { Card, CardBody, CardTitle } from 'reactstrap';

class FmSynth extends Component {

  constructor(props) {
    super(props)
    this.state = {
      currentNotes: new Map(),
      modulatorRatio: 1.0,
      modulatorPeak: 300,
      volumeEnvelope: {}
    }
  }


  componentDidMount() {
    
    const modRatio = document.getElementById('modratioknob')
    modRatio.addEventListener('change', (event) => this.handleChangeModulatorRatio(event))

    const modPeak = document.getElementById('modpeakknob')
    modPeak.addEventListener('change', (event) => this.handleChangeModulatorPeak(event))
  }

  componentWillUnmount() {

    const modRatio = document.getElementById('modratioknob')
    modRatio.removeEventListener('change', (event) => this.handleChangeModulatorRatio(event))

    const modPeak = document.getElementById('modpeakknob')
    modPeak.removeEventListener('change', (event) => this.handleChangeModulatorPeak(event))
  }

  handleChangeModulatorRatio(event) {
    this.setState({modulatorRatio: event.target.value});
  }

  handleChangeModulatorPeak(event) {
    this.setState({modulatorPeak: event.target.value});
  }

  handleChangeVolumeEnvelope(envelope) {
    this.setState({volumeEnvelope: envelope})
  }

  fmNoteOn(midiNumber) {
    const audioContext = this.props.audioContext
    const startTime = audioContext.currentTime

    const env = audioContext.createGain()
    
    env.gain.value= this.state.volumeEnvelope.minValue
    env.connect(audioContext.destination)
    env.gain.exponentialRampToValueAtTime(this.state.volumeEnvelope.peakValue, startTime + this.state.volumeEnvelope.attackTime)
    env.gain.exponentialRampToValueAtTime(this.state.volumeEnvelope.sustainValue, startTime + this.state.volumeEnvelope.attackTime + this.state.volumeEnvelope.decayTime)

    const modulator = audioContext.createOscillator()
    modulator.frequency.value = Utils.toFreq(midiNumber) * this.state.modulatorRatio

    const carrier = audioContext.createOscillator()
    carrier.frequency.value = Utils.toFreq(midiNumber)

    const modulatorGain = audioContext.createGain()
    modulatorGain.gain.value = this.state.modulatorPeak

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

    env.gain.cancelAndHoldAtTime(audioContext.currentTime)
    env.gain.setTargetAtTime(this.state.volumeEnvelope.minValue, audioContext.currentTime + 0.01, this.state.volumeEnvelope.releaseTime)

    const decay = this.state.volumeEnvelope.releaseTime
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

  /*
  AttackTime = time it takes env to go to max
  DecayTime = time it takes env to go to sustain
  SustainLevel = level on the sustain part
  PeakLevel = level on the peak of the envelope
  MiniLevel = level on the start of the envelope
  */ 
  render() {

    return (
      <div>
        <h1>FM Synth</h1>
        
        <Container>
          <Row className="align-items-center">
            
                        
            <Col className="text-center">
              <div><webaudio-knob id="modratioknob" diameter="48" min="0.25" max="3.0" step="0.05" value="1.0" defvalue="1.0"></webaudio-knob></div>
              <div><webaudio-param link="modratioknob"></webaudio-param></div>
              <span>Mod Ratio</span>
            </Col>
            
            <Envelope id="volume" min="0.01" max="2.0" step="0.01" title="Volume" changeEnvelope={(envelope) => this.handleChangeVolumeEnvelope(envelope)}/>
            
            <Card>
              <CardBody>
                <CardTitle>Mod Envelope</CardTitle>
                <Container>
                  <Row>
                    <Col className="text-center">
                        <div><webaudio-knob id="modpeakknob" diameter="32" min="30" max="5000" step="10" value="300" defvalue="300"></webaudio-knob></div>
                        <div><webaudio-param link="modpeakknob"/></div>
                        <span>Mod Peak</span>

                        <div><webaudio-knob id="modsustainknob" diameter="32" min="30" max="5000" step="10" value="300" defvalue="300"></webaudio-knob></div>
                        <div><webaudio-param link="modsustainknob"/></div>
                        <span>Mod Sustain</span>
                    </Col>

                    <Col className="text-center">

                      <div><webaudio-slider id="attackslider" direction="horz" height="18" min="0.01" max="3.0" step="0.01" value="0.01" defValue="0.01"/><webaudio-param link="attackslider"/></div>
                      <span>Attack</span>
                      <div><webaudio-slider id="decayslider" direction="horz" height="18" min="0.01" max="3.0" step="0.01" value="0.1" defValue="0.1"/><webaudio-param link="decayslider"/></div>
                      <span>Decay</span>
                      <div><webaudio-slider id="releaseslider" direction="horz" height="18" min="0.01" max="3.0" step="0.01" value="0.3" defValue="0.3"/><webaudio-param link="releaseslider"/></div>
                      <span>Release</span>
                    </Col>
                  </Row>
                </Container>    
              </CardBody>
            </Card>

          </Row>

    
          
          <Row>
            <Col sm={12}>
              <Keyboard controlId="fmkeyboard" noteOn={(midiNumber) => this.fmNoteOn(midiNumber)} noteOff={(midiNumber) => this.fmNoteOff(midiNumber)}/>
            </Col>
          </Row>    
        </Container>
      </div>
    )
  }
}

export default FmSynth;

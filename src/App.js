import React, { Component } from 'react';
import './App.css';
import FmSynth from './FmSynth'
import ModularSynth from './ModularSynth'

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      audioContext: undefined,
      synth: "fm"
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

  handleSynthType(event) {
    this.setState({synth: event.target.value});
  }

  render() {
    let synth;
    switch(this.state.synth) {
      case "modular":
        synth = (
          <ModularSynth audioContext={this.state.audioContext}/>
        )
        break
      case "fm":
      default:
        synth = (
          <FmSynth audioContext={this.state.audioContext}/>
        )
    }
    return (
      <div>
        Type: <select value={this.state.synth} onChange={(event) => this.handleSynthType(event)}>
              <option value="fm">FM Synth</option>
              <option value="modular">Modular Synth</option>
            </select>
        {synth}
      </div>
    )
  }
}

export default App;

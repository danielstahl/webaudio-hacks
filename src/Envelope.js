import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { Card, CardBody, CardTitle,} from 'reactstrap';

const controllers = {
    minimum: {
        id: 'minimumknob',
        state: 'minValue'
    },
    peak: {
        id: 'peakknob',
        state: 'peakValue'
    },
    sustain: {
        id: 'sustainknob',
        state: 'sustainValue'
    },
    attack: {
        id: 'attackslider',
        state: 'attackTime'
    },
    decay: {
        id: 'decayslider',
        state: 'decayTime'
    },
    release: {
        id: 'releaseslider',
        state: 'releaseTime'
    }
}

class Envelope extends Component {

    constructor(props) {
        super(props)
        this.state = {
            minValue: 0.01,
            peakValue: 0.01,
            sustainValue: 0.01,
            attackTime: 0.01,
            decayTime: 0.1,
            releaseTime: 0.1
        }
    }
    componentDidMount() {
        Object.keys(controllers).forEach(controllerKey => {
            const controller = document.getElementById(this.props.id + controllers[controllerKey].id)
            controller.addEventListener('change', (event) => this.handleChangeValue(event, controllers[controllerKey].state))
        })
        this.props.changeEnvelope(this.getCurrentEnvelope())
    }

    componentWillUnmount() {
        Object.keys(controllers).forEach(controllerKey => {
            const controller = document.getElementById(this.props.id + controllers[controllerKey].id)
            controller.removeEventListener('change', (event) => this.handleChangeValue(event, controllers[controllerKey].state))
        })
    }

    getCurrentEnvelope() {
        var envelope = {}
        Object.keys(controllers).forEach(controllerKey =>{
            envelope[controllers[controllerKey].state] = this.state[controllers[controllerKey].state]
        })
        return envelope
    }

    getControllerId(controller) {
        return this.props.id + controllers[controller].id
    }

    handleChangeValue(event, property) {
        var changedState = {}
        changedState[property] = event.target.value
        this.setState(changedState)
        this.props.changeEnvelope(this.getCurrentEnvelope())
    }

    render() {
        return (
            <Card>
              <CardBody>
                <CardTitle>{this.props.title}</CardTitle>
                <Container>
                  <Row>
                    <Col className="text-center">
                        <div><webaudio-knob id={this.getControllerId('minimum')} diameter="32" min={this.props.min} max={this.props.max} step={this.props.step} value={this.props.min} defvalue={this.props.min}></webaudio-knob></div>
                        <div><webaudio-param link={this.getControllerId('minimum')}/></div>
                        <span>Minimum</span>

                        <div><webaudio-knob id={this.getControllerId('peak')} diameter="32" min={this.props.min} max={this.props.max} step={this.props.step} value={this.props.min} defvalue={this.props.min}></webaudio-knob></div>
                        <div><webaudio-param link={this.getControllerId('peak')}/></div>
                        <span>Peak</span>

                        <div><webaudio-knob id={this.getControllerId('sustain')} diameter="32" min={this.props.min} max={this.props.max} step={this.props.step} value={this.props.min} defvalue={this.props.min}></webaudio-knob></div>
                        <div><webaudio-param link={this.getControllerId('sustain')}/></div>
                        <span>Sustain</span>
                    </Col>

                    <Col className="text-center">
                      <div><webaudio-slider id={this.getControllerId('attack')} direction="horz" height="18" min="0.01" max="3.0" step="0.01"/><webaudio-param link={this.getControllerId('attack')} /></div>
                      <span>Attack</span>
                      <div><webaudio-slider id={this.getControllerId('decay')} direction="horz" height="18" min="0.01" max="3.0" step="0.01"/><webaudio-param link={this.getControllerId('decay')}/></div>
                      <span>Decay</span>
                      <div><webaudio-slider id={this.getControllerId('release')} direction="horz" height="18" min="0.01" max="3.0" step="0.01"/><webaudio-param link={this.getControllerId('release')}/></div>
                      <span>Release</span>
                    </Col>
                  </Row>
                </Container>    
              </CardBody>
            </Card>
        )    
    }
}

export default Envelope
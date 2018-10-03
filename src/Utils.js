const tuning = 440

class Utils {
  static toFreq(midiNumber) {
    return Math.pow(2, (midiNumber - 69) / 12) * tuning
  }
}

export default Utils

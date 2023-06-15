module.exports = class Template {
  constructor (party) {
    this._party = party
  }

  get party () {
    return this._party
  }

  async open (party, opts) {
    throw new Error('not implemented!')
  }

  async commit (party, opts) {
    throw new Error('not implemented!')
  }

  async abort () {
    throw new Error('not implemented!')
  }
}

module.exports = class Template {
    constructor(party) {
        this._party = party
    }

    get party() {
        return this._party
    }

    open() {
        throw new Error('not implemented!')
    }

    commit() {
        throw new Error('not implemented!')
    }


}
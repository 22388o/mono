const Adaptor = module.exports
const Playnet = require('./playnet')

Adaptor.normalize = function (adaptor, props) {
    switch(adaptor) {
        case 'playnet':
            return Playnet.normalize(props)
            break
        default:
            return {}
            }
}



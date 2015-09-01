var _ = require('lodash')
    ;
module.exports = function () {
    return {
        terms: _.range(100).map(function() {
            return {
                name: faker.lorem.words(faker.random.number({min: 1, max: 3}))
            };
        })
    }
}

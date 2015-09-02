var _ = require('lodash'),
    faker = require('faker')
    ;
module.exports = function () {
    return {
        terms: _.range(100).map(function(idx) {
            return {
                id: idx+1,
                name: faker.lorem.words(faker.random.number({min: 1, max: 3})).join(' ')
            };
        })
    }
}

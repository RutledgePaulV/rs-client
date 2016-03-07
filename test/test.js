const it = require("mocha/lib/mocha.js").it;
const describe = require("mocha/lib/mocha.js").describe;
const chai = require("chai"), expect = chai.expect;
const api = require('../../rs-client');



var exchange = new api.GrandExchange();

describe('getAllItemsForCategories', function() {

    this.timeout(3000);

    it('works', function (done) {
        return exchange.getAllItemsForSearchTermsInCategories(['rune'], ['1']).then(function(results) {

            var items = results.map(result => result.name);

            expect(items).to.deep.equal([
                "Rune brutal",
                "Rune dart",
                "Rune javelin",
                "Rune knife",
                "Rune throwing axe"
            ]);

            done();

        }).catch(function() {
            throw new Error("Failed");
        });
    });


});

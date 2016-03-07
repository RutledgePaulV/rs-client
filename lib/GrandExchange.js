'use strict';

const CachingClient = require('./CachingClient');
const Promise = require('promise');

class GrandExchange extends CachingClient {

    constructor() {
        super('http://services.runescape.com/m=itemdb_rs/api/catalogue');
        this.pageSize = 12;
    }

    static getCategories() {
        return new Promise(function (resolve) {
            return resolve([
                'Miscellaneous',
                'Ammo',
                'Arrows',
                'Bolts',
                'Construction materials',
                'Construction projects',
                'Cooking ingredients',
                'Costumes',
                'Crafting materials',
                'Familiars',
                'Farming produce',
                'Fletching materials',
                'Food and drink',
                'Herblore materials',
                'Hunting equipment',
                'Hunting produce',
                'Jewellery',
                'Mage armour',
                'Mage weapons',
                'Melee armour - low level',
                'Melee armour - mid level',
                'Melee armour - high level',
                'Melee weapons - low level',
                'Melee weapons - mid level',
                'Melee weapons - high level',
                'Mining and smithing',
                'Potions',
                'Prayer armour',
                'Prayer materials',
                'Range armour',
                'Range weapons',
                'Runecrafting',
                'Runes, Spells and Teleports',
                'Seeds',
                'Summoning scrolls',
                'Tools and containers',
                'Woodcutting product',
                'Pocket items'
            ]);
        })
    }


    getCategoryDetail(id) {
        return this._get('/category.json', {category: id.toString()});
    }


    getAllItemsForCategories(categories) {
        var that = this;
        return new Promise(function (resolve, reject) {
            Promise.all(categories.map(cat => that._getAllItemsForCategory(cat))).then(function (results) {
                resolve(results.reduce((previous, current) => previous.concat(current), []));
            }).catch(reject);
        });
    }

    getAllItemsForSearchTerms(terms) {
        var that = this;
        return new Promise(function (resolve, reject) {
            GrandExchange.getCategories().then(function (categories) {
                var categoryIds = categories.map((_, id) => id);
                Promise.all(terms.map(term => that._getAllItemsForSearchTermInCategories(term, categoryIds))).then(function (results) {
                    resolve(results.reduce((previous, current) => previous.concat(current), []));
                }).catch(reject);
            });
        });
    }

    getAllItemsForSearchTermsInCategories(terms, categories) {
        var that = this;

        return new Promise(function (resolve, reject) {

            Promise.all(categories.map(cat => new Promise(function (resolve, reject) {

                that.getCategoryDetail(cat).then(function (result) {
                    resolve({id: cat, result: result});
                }).catch(reject);

            }))).then(function (categoryDetails) {

                var termsAgainstCategoriesWithMatches = terms.map(term => {

                    var matchingCategories = categoryDetails.filter(category => (category.result.alpha || [])
                        .find(alpha => (alpha.letter || '') === term.charAt(0)) !== undefined)
                        .map(category => category.id);

                    return {term: term, categories: matchingCategories};
                });

                Promise.all(termsAgainstCategoriesWithMatches.map(match =>
                    that._getAllItemsForSearchTermInCategories(match.term, match.categories))).then(function (results) {
                    resolve(results.reduce((previous, current) => previous.concat(current), []));
                }).catch(reject);
            });

        });
    }


    _searchTermWithinCategory(id, term) {

        var that = this;

        var propagate = function (page, agg, resolver, rejecter) {
            that._searchTermWithinCategoryForPage(id, term, page).then(function (result) {
                if (result) {
                    agg = agg.concat(result);
                    if (result.length >= that.pageSize) {
                        propagate(page + 1, agg, resolver, rejecter);
                    } else {
                        resolver(agg);
                    }
                } else {
                    resolver(agg);
                }
            }).catch(rejecter);
        };

        return new Promise(function (resolve, reject) {
            that.getCategoryDetail(id).then(function (result) {
                if ((result.alpha || []).find(entry => entry.letter === term.charAt(0)) !== undefined) {
                    propagate(1, [], resolve, reject);
                } else {
                    resolve([]);
                }
            }).catch(reject);
        });

    }

    _searchTermWithinCategoryForPage(id, term, page) {
        var that = this;
        return new Promise(function (resolve, reject) {
            return that._get('/items.json', {
                category: id.toString(),
                alpha: term.toString(),
                page: page.toString()
            }).then(function (result) {
                resolve(result.items || []);
            }).catch(reject);
        });
    }


    _getAllItemsForCategory(id) {

        var that = this;

        return new Promise(function (resolve, reject) {

            that.getCategoryDetail(id).then(function (result) {

                var nonEmptyLetters = (result.alpha || [])
                    .filter(entry => entry.items > 0).map(entry => entry.letter)
                    .filter(entry => entry != false);

                Promise.all(nonEmptyLetters.map(letter =>
                    that._searchTermWithinCategory(id, letter))).then(function (results) {
                    resolve(results.reduce((previous, current) => previous.concat(current || []), []));
                }).catch(reject);

            });

        });

    }

    _getAllItemsForSearchTermInCategories(term, categories) {
        var that = this;
        return new Promise(function (resolve, reject) {
            Promise.all(categories.map(id => that._searchTermWithinCategory(id, term))).then(function (results) {
                resolve(results.reduce((previous, current) => previous.concat(current), []));
            }).catch(reject);
        });
    }


}


module.exports = GrandExchange;
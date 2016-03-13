[![Build Status](https://travis-ci.org/RutledgePaulV/rs-client.svg?branch=master)](https://travis-ci.org/RutledgePaulV/rs-client)

# rs-client
A simple runescape api client with built-in caching.


### Installation
```bash
npm install --save rs-client
```

### Usage
```javascript
const api = require('rs-client');
const expect = require('chai').expect;

var exchange = new api.GrandExchange();

var ammoCategory = 1;

exchange.getAllItemsForSearchTermsInCategories(['rune'], [ammoCategory]).then(function(results) {
    
    var expected = [ "Rune brutal", "Rune dart", "Rune javelin", "Rune knife", "Rune throwing axe" ];
    
    var items = results.map(result => result.name);
    
    expect(items).to.deep.equal(expected);
    
};
```
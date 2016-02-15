var money = require('./money.js');
var assert = require('assert');

describe('money', function () {

  var cases = {
    0: '0',
    1: '0.01',
    10: '0.1',
    12: '0.12',
    123: '1.23',
    12300: '123',
    12310: '123.1',
    12312: '123.12',
    12312312: '123,123.12',
    1212312312: '12,123,123.12',
  };

  describe('.format', function () {
    it('should format money', function () {
      for (var cents in cases) {
        var yuan = cases[cents];
        assert.equal(money.format(cents), yuan);
      }
    });
  });

  describe('.parse', function () {
    it('should parse money', function () {
      for (var cents in cases) {
        var yuan = cases[cents];
        assert.equal(money.parse(yuan), cents);
      }
    });
  });

});

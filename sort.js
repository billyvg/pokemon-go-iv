'use strict';
const Long = require('long');
const _ = require('lodash');

const Sort = {
  CreationTime(v) {
    const ms = v && v.creation_time_ms;
    return ms && new Long(ms.low, ms.high, ms.unsigned).toString()
  },

  Iv(v) {
    let i = 0;
    let sum = 0;
    _.forEach(['individual_attack', 'individual_defense', 'individual_stamina'], (key) => {
      if (typeof v[key] !== 'undefined') {
        sum += v[key];
        i++;
      }
    });

    return sum / i;
  }
};

module.exports = Sort;

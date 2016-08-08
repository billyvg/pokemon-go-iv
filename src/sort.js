import Long from 'long';
import _ from 'lodash';

export default {
  recent(items) {
    return _.reverse(
      _.sortBy(items, (v) => {
        const ms = v && v.creation_time_ms;
        return ms && new Long(ms.low, ms.high, ms.unsigned).toString();
      })
    );
  },

  iv(items) {
    return _.reverse(
      _.sortBy(items, (v) => {
        let i = 0;
        let sum = 0;
        _.forEach(['individual_attack', 'individual_defense', 'individual_stamina'], (key) => {
          sum += v[key] || 0;
          i++;
        });

        return sum / i;
      })
    );
  },

  id(items) {
    return _.sortBy(
      _.sortBy(items, (v) => -v.cp),
      (v) => v.pokemon_id
    );
  },

  name(items) {
    return _.sortBy(
      _.sortBy(items, (v) => -v.cp),
      (v) => v.name
    );
  },

  cp(items) {
    return _.sortBy(items, (v) => -v.cp);
  },

  maxCP(items) {
    return _.sortBy(items, (v) => -v.maxCP);
  },
};

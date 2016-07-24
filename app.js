'use strict';

const PgoApi = require('pokemon-go-node-api');
const _ = require('lodash');

const pgo = new PgoApi.Pokeio();

class Pokemon {
  constructor(auth, location) {
    this.auth = auth;
    this.location = location;
    this.connected = false;
  }

  set location(location) {
    if (typeof location === 'string') {
      this._location = {
        type: 'name',
        name: location,
      };
    }
  }

  get location() {
    return this._location;
  }

  connect(cb) {
    pgo.init(this.auth.username, this.auth.password, this.location, this.auth.provider, cb);
  }

  static getIv(items, sort) {
    const FIELDS = [
      'pokemon_id',
      'cp',
      'stamina',
      'height_kg',
      'individual_attack',
      'individual_defense',
      'individual_stamina',
      'creation_time_ms',
    ];

    const sortedItems = _.chain(items).map((item) => {
      if (item && item.inventory_item_data && item.inventory_item_data.pokemon) {
        return _.pick(item.inventory_item_data.pokemon, FIELDS);
      }
    }).compact().sortBy(sort);

    return sortedItems;
  }

  getInventory() {
    return new Promise((resolve, reject) => {
      this.connect(() =>
        pgo.GetInventory((err, resp) => {
          if (err) {
            reject(err);
          } else {
            if (resp && resp.inventory_delta && resp.inventory_delta.inventory_items) {
              const items = resp.inventory_delta.inventory_items;
              resolve(items);
            }
          }
        })
      );
    });

  }
}

module.exports = Pokemon;

'use strict';
const PogoBuf = require('pogobuf');
const _ = require('lodash');

const PTCLogin = PogoBuf.PTCLogin;
const GoogleLogin = PogoBuf.GoogleLogin;
const Client = PogoBuf.Client;

class Pokemon {
  constructor(auth) {
    this.auth = auth;
    this.connected = false;
    this.client = new Client();
  }

  login() {
    const authLib = this.auth.provider === 'google' ? new GoogleLogin() : new PTCLogin();

    return authLib.login(this.auth.username, this.auth.password).then((token) => {
console.log('...', token);
      this.client.setAuthInfo(this.auth.provider, token);
      this.authed = token;
      return this.client.init();
    });
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
    return this.login().then(() => {
      return this.client.getInventory();
    }).then((inventory) => {
console.log(inventory);
      if (inventory.inventory_delta && inventory.inventory_delta.inventory_items) {
        const filtered = inventory.inventory_delta.inventory_items.filter((item) => {
          return item.inventory_item_data.pokemon_data && item.inventory_item_data.pokemon_data.pokemon_id;
        }).map((item) => {
          const pokemon = item.inventory_item_data.pokemon_data;
//const meta = POKEMON_META[pokemon.pokemon_id - 1];
//return _.extend({}, pokemon, calculateCP(pokemon));
        });

        return filtered;
      }
    });
  }
}

module.exports = Pokemon;

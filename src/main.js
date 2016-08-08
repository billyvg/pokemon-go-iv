import _ from 'lodash';
import POKEMON_META from './pokemons';
import { calculateCP } from './calculations';

import {
  PTCLogin,
  GoogleLogin,
  Client,
} from 'pogobuf';

class Pokemon {
  constructor(auth) {
    this.auth = auth;
    this.connected = false;
    this.client = new Client();
  }

  login() {
    const authLib = this.auth.provider === 'google' ? new GoogleLogin() : new PTCLogin();

    return authLib.login(this.auth.username, this.auth.password).then((token) => {
      this.client.setAuthInfo(this.auth.provider, token);
      this.authed = token;
      return this.client.init();
    }).catch((err) => {
      console.error('Could not login', err);
    });
  }

  getInventory() {
    return this.login().then(() => {
      return this.client.getInventory();
    }).then((inventory) => {
      if (inventory.inventory_delta && inventory.inventory_delta.inventory_items) {
        const filtered = inventory.inventory_delta.inventory_items.filter((item) => {
          return item.inventory_item_data.pokemon_data && item.inventory_item_data.pokemon_data.pokemon_id;
        }).map((item) => {
          const pokemon = item.inventory_item_data.pokemon_data;
          const meta = POKEMON_META[pokemon.pokemon_id - 1];
          return {
            ...pokemon,
            ...calculateCP(pokemon),
            ...meta,
          };
        });

        return filtered;
      }
    });
  }
}

export default Pokemon;

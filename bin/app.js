#! /usr/bin/env node
'use strict';

const Pokemon = require('pokemon-go-node-api');
const _ = require('lodash');
const Long = require('long');
const fs = require('fs');
const process = require('process');
const argv = require('minimist')(process.argv.slice(2));


const pgo = new Pokemon.Pokeio();

if (argv.h || argv.help) {
  console.log('Usage: ');
  console.log('pokemon-go-iv -u <username> -p <password> -a ptc|google [-s time|iv] [--cache]');
  process.exit();
}

const username = argv.u || process.env.PGO_USERNAME;
const password = argv.p || process.env.PGO_PASSWORD;

if (!username || !password) {
  console.error('Username and password required (-u and -p)');
  process.exit(1);
}

const provider = argv.a || process.env.PGO_PROVIDER || 'ptc';
const sort = argv.s || 'time';
const useCache = argv.cache || false;

const location = {
  type: 'name',
  name: 'San Francisco, CA',
};

function parseInventory(items) {
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

  const creationTimeSort = (v) => {
    const ms = v && v.creation_time_ms;
    return ms && new Long(ms.low, ms.high, ms.unsigned).toString()
  };

  const IVSort = (v) => {
    let i = 0;
    let sum = 0;
    _.forEach(['individual_attack', 'individual_defense', 'individual_stamina'], (key) => {
      if (typeof v[key] !== 'undefined') {
        sum += v[key];
        i++;
      }
    });

    return sum / i;
  };

  const sortToUse = sort === 'time' ? creationTimeSort : IVSort;

  const sortedItems = _.chain(items).map((item) => {
    if (item && item.inventory_item_data && item.inventory_item_data.pokemon) {
      //console.log(JSON.stringify(item.inventory_item_data.pokemon, null, 2));
      return _.pick(item.inventory_item_data.pokemon, FIELDS);
    }
  }).compact().sortBy(sortToUse);

  console.log(JSON.stringify(sortedItems, null, 2));
}

const FILE = './response.json';
if (useCache && fs.existsSync(FILE)) {
  parseInventory(JSON.parse(fs.readFileSync(FILE)));
} else {
  pgo.init(username, password, location, provider, (err) => {
    if (err) throw err;

    pgo.GetInventory((err, resp) => {
      if (resp && resp.inventory_delta && resp.inventory_delta.inventory_items) {
        const items = resp.inventory_delta.inventory_items;
        fs.writeFileSync(FILE, JSON.stringify(items, null, 2));
        parseInventory(items);
      }
    });
  })
}

#! /usr/bin/env node
'use strict';
require('babel-register')({
  ignore: false,
  only: /pokemon-go-iv\/src/
});

const _ = require('lodash');
const fs = require('fs');
const process = require('process');

const argv = require('minimist')(process.argv.slice(2));
const Pokemon = require('../src/main').default;
const Sort = require('../src/sort').default;

const sortKeys = Object.keys(Sort).map(sort => sort);

if (argv.h || argv.help) {
  console.log('Usage: ');
  console.log(`pokemon-go-iv -u <username> -p <password> -a ptc|google [-s ${sortKeys.join('|')}] [--cache]`);
  process.exit();
}

const username = argv.u || process.env.PGO_USERNAME;
const password = argv.p || process.env.PGO_PASSWORD;

if (!username || !password) {
  console.error('Username and password required (-u and -p)');
  process.exit(1);
}

const provider = argv.a || process.env.PGO_PROVIDER || 'ptc';
const sort = argv.s || 'recent';
const useCache = argv.cache || false;

const FILE = './response.json';

const getItems = () => {
  if (useCache && fs.existsSync(FILE)) {
    return new Promise((resolve, reject) => {
      resolve(JSON.parse(fs.readFileSync(FILE)));
    });
  } else {
    const pokemon = new Pokemon({
      username, password, provider,
    });

    return pokemon.getInventory();
  }
};

getItems().then((items) => {
  const FIELDS = [
    'name',
    'pokemon_id',
    'cp',
    'stamina',
    'maxCP',
    'height_m',
    'weight_kg',
    'individual_attack',
    'individual_defense',
    'individual_stamina',
  ];

  let sorter;
  if (Sort[sort]) {
    sorter = Sort[sort];
  } else {
    sorter = Sort.recent;
  }

  const sortedItems = Sort[sort](items);

  console.log(
    JSON.stringify(
      sortedItems.map((item) => _.pick(item, FIELDS)), null, 2
    )
  );

  process.exit();
}).catch((err) => {
  console.error(err);
  process.exit(1);
})

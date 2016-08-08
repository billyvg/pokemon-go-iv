#! /usr/bin/env node
'use strict';
const fs = require('fs');
const process = require('process');

const argv = require('minimist')(process.argv.slice(2));
const Pokemon = require('../app.js');
const Sort = require('../sort.js');

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
  let sorter;
  if (sort === 'time') {
    sorter = Sort.CreationTime;
  } else {
    sorter = Sort.Iv;
  }

  const sortedIvs = Pokemon.getIv(items, sorter);

  console.log(JSON.stringify(sortedIvs, null, 2));
  process.exit();
}).catch((err) => {
  console.error(err);
  process.exit(1);
})

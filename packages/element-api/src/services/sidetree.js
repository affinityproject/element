const element = require('@transmute/element-lib');
const { firestore } = require('./firebase');
const ElementFirestoreAdapter = require('./element-adapter-firestore');

const { getBaseConfig } = require('../config');

const config = getBaseConfig();

const blockchain = element.blockchain.ethereum.configure({
  mnemonic: config.ethereum.mnemonic,
  hdPath: "m/44'/60'/0'/0/0",
  providerUrl: config.ethereum.provider_url,
  anchorContractAddress: config.ethereum.anchor_contract_address,
});

const db = new ElementFirestoreAdapter({
  firestore,
});
const storage = new element.adapters.storage.StorageManager(
  db,
  element.storage.ipfs.configure({
    multiaddr: config.ipfs.multiaddr,
  }),
  {
    autoPersist: false,
    retryIntervalSeconds: 5,
  },
);

const serviceBus = new element.adapters.serviceBus.ElementNanoBusAdapter();

const sidetree = new element.Sidetree({
  blockchain,
  storage,
  serviceBus,
  db,
  config: {
    BATCH_INTERVAL_SECONDS: parseInt(
      config.sidetree.batch_interval_in_seconds,
      10,
    ),
    BAD_STORAGE_HASH_DELAY_SECONDS: parseInt(
      config.sidetree.bad_storage_hash_delay_in_seconds,
      10,
    ),
    VERBOSITY: parseInt(config.sidetree.verbosity, 10),
  },
});

module.exports = sidetree;

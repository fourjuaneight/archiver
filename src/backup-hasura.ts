import { backupRecords } from './helpers/backupRecords';
import { queryHasuraBackup } from './helpers/hasuraData';

import { Fields, Shelf } from './models/archive';

/**
 * Save Hasura lists data to local JSON files.
 * @function
 * @async
 *
 * @param {string} list database list
 * @param {Fields[] | Shelf[]} data database data
 * @return {void}
 */
const backup = async (
  list: string,
  data: Fields[] | Shelf[]
): Promise<void> => {
  try {
    await backupRecords(list, data);
  } catch (error) {
    throw new Error(`(backup):\n${error}`);
  }
};

(async () => {
  try {
    const queryData = await queryHasuraBackup();
    const operations = Object.keys(queryData).map(list =>
      backup(list, queryData[list])
    );

    await Promise.all(operations);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();

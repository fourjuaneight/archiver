import chalk from 'chalk';

import { addFiletoRecord } from './helpers/addFiletoRecord';
import { mutateHasuraData, queryHasuraBookmarks } from './helpers/hasuraData';

import { Fields } from './models/archive';

/**
 * Archive media to B2 and update record on Hasura.
 * @function
 * @async
 *
 * @param {string} list table name
 * @param {Fields[]} fields archive to archive and update
 * @return {void}
 */
const archiveRecord = async (list: string, fields: Fields[]): Promise<void> => {
  for (const field of fields) {
    const updatedRecord = await addFiletoRecord(list, field);
    await mutateHasuraData(`bookmarks_${list}`, [updatedRecord]);
  }
};

/**
 * Clean table records and run bookmarks archive.
 * Only updates records with no archive file.
 * @function
 * @async
 *
 * @param {{ [key: string]: Fields[] }} data bookmarks
 * @param {string} list table name
 * @returns {void}
 */
const backupRecord = async (
  data: { [key: string]: Fields[] },
  list: string
): Promise<void> => {
  const filteredRecords = data[list].filter(field => !field.archive);

  if (filteredRecords.length > 0) {
    await archiveRecord(list, filteredRecords);
  } else {
    console.info(chalk.yellow('[INFO]'), `No records to update in ${list}.`);
  }
};

(async () => {
  try {
    const bookmarks = await queryHasuraBookmarks();
    const backups = Object.keys(bookmarks)
      .filter(list => list !== 'tweets')
      .map(list => backupRecord(bookmarks, list));

    await Promise.all(backups);

    process.exit(0);
  } catch (error) {
    console.error(chalk.red('[ERROR]'), error);
    process.exit(1);
  }
})();

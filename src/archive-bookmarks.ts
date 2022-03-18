import chalk from 'chalk';

import { addFiletoRecord } from './helpers/addFiletoRecord';
import { getRecords, updateBookmark } from './helpers/getBookmarks';

import { List, Record } from './models/archive';

/**
 * Archive media to B2 and update record on Airtable.
 * @function
 * @async
 *
 * @param {string} list table name
 * @param {Record[]} records archive to archive and update
 * @return {void}
 */
const archiveRecord = async (
  list: string,
  records: Record[]
): Promise<void> => {
  for (const record of records) {
    const updatedRecord = await addFiletoRecord(list, record);
    await updateBookmark(list, updatedRecord);
  }
};

/**
 * Clean table records and run bookmarks archive.
 * Only updates records with no archive file.
 * @function
 * @async
 *
 * @param {List} data bookmarks
 * @param {string} list table name
 * @returns {void}
 */
const backupRecord = async (data: List, list: string): Promise<void> => {
  const filteredRecords = data[list].filter(record => !record.fields.archive);

  if (filteredRecords.length > 0) {
    const cleanRecords = filteredRecords.map(record => ({
      id: record.id,
      fields: record.fields,
    }));

    await archiveRecord(list, cleanRecords);
  } else {
    console.info(chalk.yellow('[INFO]'), `No records to update in ${list}.`);
  }
};

(async () => {
  try {
    const bookmarks = await getRecords();
    const backups = Object.keys(bookmarks).map(list =>
      backupRecord(bookmarks, list)
    );

    await Promise.all(backups);

    process.exit(0);
  } catch (error) {
    console.error(chalk.red('[ERROR]'), error);
    process.exit(1);
  }
})();

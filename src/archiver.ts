import chalk from 'chalk';

import addFiletoRecord from './addFiletoRecord';
import { getRecords, updateBookmark } from './getBookmarks';

import { Record } from './types';

/**
 * Archive media to B2 and update record on Airtable.
 * @function
 *
 * @param {string} list table name
 * @param {Record[]} records archive to archive and update
 * @return {Promise<void>}
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

(async () => {
  try {
    const bookmarks = await getRecords();

    // update bookmarks missing file archive
    for (const list of Object.keys(bookmarks)) {
      // update only those that do not have a file archive
      const cleanRecords = bookmarks[list]
        .filter(record => !record.fields.archive)
        .map(record => ({
          id: record.id,
          fields: record.fields,
        }));

      if (cleanRecords.length > 0) {
        await archiveRecord(list, cleanRecords);
      } else {
        console.info(
          chalk.yellow('[INFO]'),
          `No records to update in ${list}.`
        );
      }
    }
  } catch (error) {
    console.error(chalk.red('[ERROR]'), error);
    throw new Error(error);
  }
})();

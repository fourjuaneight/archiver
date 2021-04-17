import addFiletoRecord from './addFiletoRecord';
import uploadToB2 from './addFiletoRecord';
import {
  baseQueries,
  getBookmarksWithOffset,
  getRecords,
  updateBookmark,
} from './getBookmarks';

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
  for (let record of records) {
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
      const cleanRecords = bookmarks[list].filter(
        record => !record.fields.archive
      );

      if (cleanRecords.length > 0) {
        await archiveRecord(list, cleanRecords);
      } else {
        console.info(`No records to update in ${list}.`);
      }
    }
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
})();

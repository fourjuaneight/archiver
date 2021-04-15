import addFiletoRecord from './addFiletoRecord';
import uploadToB2 from './addFiletoRecord';
import {
  baseQueries,
  getBookmarksWithOffset,
  updateBookmarks,
} from './getBookmarks';

import { Record } from './types';

(async () => {
  const bookmarksList = Object.keys(baseQueries.Bookmarks);

  try {
    // Get latest bookmarks
    for (const list of bookmarksList) {
      await getBookmarksWithOffset('Bookmarks', list);
    }

    // Update bookmarks missing file archive
    for (const list of bookmarksList) {
      // update only those that do not have a file
      const cleanList = baseQueries.Bookmarks[list].filter(
        record => !record.fields.file
      );

      if (cleanList > 0) {
        await addFiletoRecord(list, cleanList);
        await updateBookmarks(list, cleanList);
      } else {
        console.info(`No records to update in ${list}.`);
      }
    }
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
})();

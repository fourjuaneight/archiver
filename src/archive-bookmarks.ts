import { addFiletoRecord } from './helpers/addFiletoRecord';
import { queryHasuraBookmarks, updateHasuraData } from './helpers/hasuraData';
import { Fields } from './models/archive';
import logger from './util/logger';
import { toCapitalized } from './util/toCapitalized';

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
    const { archive, id } = await addFiletoRecord(toCapitalized(list), field);
    const data = { archive: archive as string };
    const redordId = id as string;

    await updateHasuraData(`bookmarks_${list}`, redordId, data);
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
    logger.info(`No records to update in ${list}.`);
  }
};

(async () => {
  try {
    const bookmarks = await queryHasuraBookmarks();
    const backups = Object.keys(bookmarks)
      .filter(list => list !== 'tweets')
      .map(list => backupRecord(bookmarks, list));

    await Promise.all(backups);
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
})();

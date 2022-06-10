import { uploadToB2 } from './uploadContentB2';

import { Fields, Shelf } from '../models/archive';

/**
 * Saves Hasura record response to a local JSON file.
 * @function
 * @async
 *
 * @param {string} list database list
 * @param {Fields[] | Shelf[]} records record object
 * @return {string} B2 backup link
 */
export const backupRecords = async (
  list: string,
  records: Fields[] | Shelf[]
): Promise<string> => {
  const table: string = list.toLowerCase();

  try {
    const buffer = Buffer.from(JSON.stringify(records, undefined, 2), 'utf8');
    const backupLink = await uploadToB2(
      buffer,
      `Archive/${table}.json`,
      'application/json'
    );

    return backupLink;
  } catch (error) {
    throw new Error(
      `(backupRecords) - Backig up '${table}.json' to B2: \n ${error}`
    );
  }
};

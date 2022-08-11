import { BackupData } from '../models/archive';
import { uploadToB2 } from './uploadContentB2';

/**
 * Saves Hasura record response to a local JSON file.
 * @function
 * @async
 *
 * @param {string} list database list
 * @param {BackupData} records record object
 * @return {string} B2 backup link
 */
export const backupRecords = async (
  list: string,
  records: BackupData
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
    throw new Error(`[backupRecords][${table}]: ${error}`);
  }
};

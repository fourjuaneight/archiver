import uploadToB2 from './uploadContentB2';

import { Fields, Record } from '../models/airtable';

/**
 * Saves Airtable record response to a local JSON file.
 * @function
 *
 * @param {Records[]} records record object
 * @param {string} base Airtable database
 * @param {string} list database list
 * @return {Promise<string>} B2 backup link
 */
const backupRecords = async (
  records: Record[],
  base: string,
  list: string
): Promise<string> => {
  const fields: Fields[] = records.map((record: Record) => record.fields);
  const table: string = list.toLowerCase();

  try {
    const date = new Date();
    const iso = new Date(date - date.getTimezoneOffset() * 60000)
      .toISOString()
      .substring(0, 10);
    const buffer = Buffer.from(JSON.stringify(fields, undefined, 2), 'utf8');
    const backupLink = await uploadToB2(
      buffer,
      `Archive/${base}/${table}-${iso}.json`,
      'application/json'
    );

    return backupLink;
  } catch (error) {
    throw new Error(`Backig up '${base}/${table}.json' to B2: \n ${error}`);
  }
};

export default backupRecords;

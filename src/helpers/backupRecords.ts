import chalk from 'chalk';

import uploadToB2 from './uploadContentB2';
import { BKWebFields, Record } from '../models/airtable';

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
  let fields = [];
  fields = records.map((record: Record) => record.fields);

  const category: string = base.toLowerCase();
  const table: string = list.toLowerCase();
  const filter = [
    table === 'articles',
    table === 'comics',
    table === 'podcasts',
    table === 'videos',
  ].includes(true);

  if (category === 'bookmarks' && filter) {
    console.info(
      chalk.cyan('[WORKING]'),
      'Removing archive link from Bookmarks.'
    );

    fields = fields.map(bkRecord => {
      const data = bkRecord as BKWebFields;

      return {
        title: data.title,
        creator: data.creator,
        url: data.url,
        tags: data.tags,
      };
    });
  }

  try {
    const buffer = Buffer.from(fields, 'utf8');
    const backupLink = await uploadToB2(
      buffer,
      `Archive/${base}/${table}.json`,
      'application/json'
    );

    return backupLink;
  } catch (error) {
    throw new Error(`Backig up '${base}/${table}.json' to B2: \n ${error}`);
  }
};

export default backupRecords;

import chalk from 'chalk';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

import { AirtableResp, Bases, List, Record } from './types';

dotenv.config();

const AIRTABLE_API = process.env.AIRTABLE_API;
const AIRTABLE_BOOKMARKS_ENDPOINT = process.env.AIRTABLE_BOOKMARKS_ENDPOINT;

export const baseQueries: Bases = {
  Bookmarks: {
    Articles: [],
    Comics: [],
    Podcasts: [],
    Videos: [],
  },
};

/**
 * Chunk list of records into array of arrays.
 * @function
 *
 * @param array list of records
 * @param size amount to chunk by
 * @returns {Record[][]} chunked list of records
 */
export const chunkRecords = (array: Record[], size: number): Record[][] => {
  if (array.length <= size) {
    return [array];
  }

  return [array.slice(0, size), ...chunkRecords(array.slice(size), size)];
};

/**
 * Get bookmarks list from Airtable.
 * Request can be recursive is there is more than 100 records.
 * docs: https://airtable.com/appjsUcLH0oo4HHAq/api/docs#curl/table:articles:list
 * @function
 *
 * @param {string} base Airtable database
 * @param {string} list database list
 * @param {[string]} offset param to request remainding records
 * @return {Promise<AirtableResp >}
 */
export const getBookmarksWithOffset = async (
  base: string,
  list: string,
  offset?: string
): Promise<AirtableResp> => {
  const config = {
    headers: {
      Authorization: `Bearer ${AIRTABLE_API}`,
      'Content-Type': 'application/json',
    },
  };
  const url = offset
    ? `${AIRTABLE_BOOKMARKS_ENDPOINT}/${list}?offset=${offset}`
    : `${AIRTABLE_BOOKMARKS_ENDPOINT}/${list}`;

  try {
    return fetch(url, config)
      .then(response => response.json())
      .then((airtableRes: AirtableResp) => {
        baseQueries[base][list] = [
          ...baseQueries[base][list],
          ...airtableRes.records,
        ];

        if (airtableRes.offset) {
          return getBookmarksWithOffset(base, list, airtableRes.offset);
        } else {
          return airtableRes;
        }
      });
  } catch (error) {
    throw new Error(`Error getting books for ${base} - ${list}: \n ${error}`);
  }
};

/**
 * Get Airtable records for all Bookmark tables.
 * @function
 *
 * @returns {Promise<List>} bookmark records
 */
export const getRecords = async (): Promise<List> => {
  const bookmarksList = Object.keys(baseQueries.Bookmarks);

  console.info(chalk.yellow('[INFO]'), `Getting ${base} records.`);

  // get latest bookmarks
  for (const list of bookmarksList) {
    await getBookmarksWithOffset('Bookmarks', list);
  }

  return baseQueries.Bookmarks;
};

/**
 * Update records in list.
 * docs: https://airtable.com/appjsUcLH0oo4HHAq/api/docs#curl/table:articles:update
 * @function
 *
 * @param {string} list database list
 * @param {Record} record clean record not yet archived
 * @returns {Promise<void>}
 */
export const updateBookmark = async (
  list: string,
  record: Record
): Promise<void> => {
  const config = {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${AIRTABLE_API}`,
      'Content-Type': 'application/json',
    },
  };
  const url = `${AIRTABLE_BOOKMARKS_ENDPOINT}/${list}`;

  try {
    const body: AirtableResp = {
      records: [record],
    };
    const updatedConfig = {
      ...config,
      body: JSON.stringify(body),
    };
    const response = await fetch(url, updatedConfig);
    const results: AirtableResp = await response.json();

    console.info(
      chalk.green('[SUCCESS]'),
      `${list} record updated:`,
      results.records[0].fields.title
    );
  } catch (error) {
    throw new Error(
      `Error updating record for ${list} - ${record.fields.title}: \n ${error}`
    );
  }
};

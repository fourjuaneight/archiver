import chalk from 'chalk';
import dotenv from 'dotenv';
import fetch from 'isomorphic-fetch';

import { AirtableResp, Bases, List, Record } from '../models/archive';

dotenv.config();

const { AIRTABLE_API, AIRTABLE_BOOKMARKS_ENDPOINT } = process.env;

export const baseQueries: Bases = {
  Bookmarks: {
    Articles: [],
    Comics: [],
    Podcasts: [],
    Reddits: [],
    Tweets: [],
    Videos: [],
  },
};

/**
 * Get bookmarks list from Airtable.
 * Request can be recursive is there is more than 100 records.
 * docs: https://airtable.com/appjsUcLH0oo4HHAq/api/docs#curl/table:articles:list
 * @function
 * @async
 *
 * @param {string} base Airtable database
 * @param {string} list database list
 * @param {[string]} offset param to request remainding records
 * @return {AirtableResp}
 */
export const getBookmarksWithOffset = async (
  base: string,
  list: string,
  offset?: string
): Promise<AirtableResp> => {
  const options = {
    headers: {
      Authorization: `Bearer ${AIRTABLE_API}`,
      'Content-Type': 'application/json',
    },
  };
  const url = offset
    ? `${AIRTABLE_BOOKMARKS_ENDPOINT}/${list}?offset=${offset}`
    : `${AIRTABLE_BOOKMARKS_ENDPOINT}/${list}`;

  try {
    return fetch(url, options)
      .then(response => response.json())
      .then((airtableRes: AirtableResp) => {
        baseQueries[base][list] = [
          ...baseQueries[base][list],
          ...airtableRes.records,
        ];

        if (airtableRes.offset) {
          return getBookmarksWithOffset(base, list, airtableRes.offset);
        }

        return airtableRes;
      });
  } catch (error) {
    throw new Error(`Getting books for ${base} - ${list}: \n ${error}`);
  }
};

/**
 * Get Airtable records for all Bookmark tables.
 * @function
 * @async
 *
 * @returns {List} bookmark records
 */
export const getRecords = async (): Promise<List> => {
  const bookmarksList = Object.keys(baseQueries.Bookmarks);

  // get latest bookmarks
  for (const list of bookmarksList) {
    await getBookmarksWithOffset('Bookmarks', list);
  }

  return baseQueries.Bookmarks;
};

/**
 * Update records in list.
 * @function
 * @async
 *
 * @param {string} list database list
 * @param {Record} record clean record not yet archived
 * @returns {void}
 */
export const updateBookmarks = async (
  list: string,
  records: Record[]
): Promise<void> => {
  const options = {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${AIRTABLE_API}`,
      'Content-Type': 'application/json',
    },
  };
  const url = `${AIRTABLE_BOOKMARKS_ENDPOINT}/${list}`;

  try {
    const body: AirtableResp = {
      records,
    };
    const updatedOptions = {
      ...options,
      body: JSON.stringify(body),
    };
    const response = await fetch(url, updatedOptions);
    const results: AirtableResp = await response.json();

    if (results.records?.length === 0) {
      console.info(chalk.green('[INFO]'), `No records updated for ${list}`);
    }

    console.info(chalk.green('[SUCCESS]'), `${list} records updated`);
  } catch (error) {
    throw new Error(`Updating records for ${list}: \n ${error}`);
  }
};

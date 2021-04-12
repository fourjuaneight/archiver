import fetch from 'node-fetch';
import dotenv from 'dotenv';

import { AirtableResp, Bases, Record } from './types';

dotenv.config();

const AIRTABLE_API = process.env.AIRTABLE_API;
const AIRTABLE_BOOKMARKS_ENDPOINT = process.env.AIRTABLE_BOOKMARKS_ENDPOINT;

const baseQueries: Bases = {
  Bookmarks: {
    Articles: [],
    Comics: [],
    Podcasts: [],
    Tweets: [],
    Videos: [],
  },
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
      .then((response: Response) => response.json())
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
    console.error(error);
    throw new Error(error);
    return error;
  }
};

/**
 * Update records in list.
 * docs: https://airtable.com/appjsUcLH0oo4HHAq/api/docs#curl/table:articles:update
 * @function
 *
 * @param {string} list database list
 * @param {Record[]} data records to update
 * @returns {Promise<Record[]>} updated records
 */
export const updateBookmarks = async (
  list: string,
  data: Record[]
): Promise<Record[]> => {
  const body: AirtableResp = {
    records: data,
  };
  const config = {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${AIRTABLE_API}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };
  const url = `${AIRTABLE_BOOKMARKS_ENDPOINT}/${list}`;

  try {
    const response = await fetch(url, config);
    const results: AirtableResp = await response.json();

    return results.records;
  } catch (error) {
    console.error(error);
    throw new Error(error);
    return error;
  }
};

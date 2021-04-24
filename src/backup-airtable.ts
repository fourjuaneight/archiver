import chalk from 'chalk';
import dotenv from 'dotenv';
import fetch from 'isomorphic-fetch';

import backupRecords from './helpers/backupRecords';

import { AirtableResp, Bases, Endpoints } from './models/airtable';

dotenv.config();

// Match table queries
const baseQueries: Bases = {
  Bookmarks: {
    Articles: [],
    Comics: [],
    Podcasts: [],
    Tweets: [],
    Videos: [],
  },
  Favorites: {
    Anime: [],
    Books: [],
    Movies: [],
    Shows: [],
    Games: [],
  },
  Media: {
    Books: [],
    Games: [],
    Movies: [],
    Shows: [],
    Tweets: [],
  },
  Records: {
    Clients: [],
    Jobs: [],
    Podcasts: [],
    RSS: [],
  },
};
const bookmarksList = Object.keys(baseQueries.Bookmarks);
const favoritesList = Object.keys(baseQueries.Favorites);
const mediaList = Object.keys(baseQueries.Media);
const recordsList = Object.keys(baseQueries.Records);

// Base endpoints
const endpoints: Endpoints = {
  Bookmarks: process.env.AIRTABLE_BOOKMARKS_ENDPOINT ?? '',
  Favorites: process.env.AIRTABLE_FAVORITES_ENDPOINT ?? '',
  Media: process.env.AIRTABLE_MEDIA_ENDPOINT ?? '',
  Records: process.env.AIRTABLE_RECORDS_ENDPOINT ?? '',
};

/**
 * Get bookmarks list from Airtable.
 * Request can be recursive is there is more than 100 records.
 * @function
 *
 * @param {string} base Airtable database
 * @param {string} list database list
 * @param {[string]} offset param to request remainding records
 * @return {Promise<AirtableResp >}
 */
const getBookmarksWithOffset = (
  base: string,
  list: string,
  offset?: string
): Promise<AirtableResp> => {
  const atOpts: RequestInit = {
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_API}`,
      'Content-Type': 'application/json',
    },
  };
  const url = offset
    ? `${endpoints[base]}/${list}?offset=${offset}`
    : `${endpoints[base]}/${list}`;

  try {
    return fetch(url, atOpts)
      .then((response: Response) => response.json())
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
 * Save Airtable lists to local JSON files.
 * @function
 *
 * @param {string} base Airtable database
 * @param {string} list database list
 * @return {Promise<void>}
 */
const backup = async (base: string, list: string): Promise<void> => {
  try {
    await getBookmarksWithOffset(base, list);
    await backupRecords(baseQueries[base][list], base, list);
  } catch (error) {
    console.error(chalk.red('[ERROR]'), error);
    process.exit(1);
  }
};

(async () => {
  // Get all items from table and save them locally
  for (const list of bookmarksList) {
    await backup('Bookmarks', list);
  }

  for (const list of favoritesList) {
    await backup('Favorites', list);
  }

  for (const list of mediaList) {
    await backup('Media', list);
  }

  for (const list of recordsList) {
    await backup('Records', list);
  }
})();

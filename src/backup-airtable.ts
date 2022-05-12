import chalk from 'chalk';
import dotenv from 'dotenv';
import fetch from 'isomorphic-fetch';

import { backupRecords } from './helpers/backupRecords';

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
  Development: {
    GitHub: [],
    StackExchange: [],
  },
  Feeds: {
    Podcasts: [],
    Websites: [],
    YouTube: [],
  },
  Media: {
    Books: [],
    Games: [],
    Movies: [],
    Shows: [],
    Shelf: [],
    Tweets: [],
  },
  Records: {
    Clients: [],
    Jobs: [],
  },
};
const bookmarksList = Object.keys(baseQueries.Bookmarks);
const developmentList = Object.keys(baseQueries.Development);
const feedsList = Object.keys(baseQueries.Feeds);
const mediaList = Object.keys(baseQueries.Media);
const recordsList = Object.keys(baseQueries.Records);

// Base endpoints
const endpoints: Endpoints = {
  Bookmarks: process.env.AIRTABLE_BOOKMARKS_ENDPOINT ?? '',
  Development: process.env.AIRTABLE_DEVELOPMENT_ENDPOINT ?? '',
  Feeds: process.env.AIRTABLE_FEEDS_ENDPOINT ?? '',
  Media: process.env.AIRTABLE_MEDIA_ENDPOINT ?? '',
  Records: process.env.AIRTABLE_RECORDS_ENDPOINT ?? '',
};

/**
 * Get bookmarks list from Airtable.
 * Request can be recursive is there is more than 100 records.
 * @function
 * @async
 *
 * @param {string} base Airtable database
 * @param {string} list database list
 * @param {[string]} offset param to request remainding records
 * @return {AirtableResp}
 */
const getBookmarksWithOffset = (
  base: string,
  list: string,
  offset?: string
): Promise<AirtableResp> => {
  const options: RequestInit = {
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_API}`,
      'Content-Type': 'application/json',
    },
  };
  const url = offset
    ? `${endpoints[base]}/${list}?offset=${offset}`
    : `${endpoints[base]}/${list}`;

  try {
    return fetch(url, options)
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
 * @async
 *
 * @param {string} base Airtable database
 * @param {string} list database list
 * @return {void}
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
  const bookmarks = bookmarksList.map(list => backup('Bookmarks', list));
  const development = developmentList.map(list => backup('Development', list));
  const feeds = feedsList.map(list => backup('Feeds', list));
  const media = mediaList.map(list => backup('Media', list));
  const records = recordsList.map(list => backup('Records', list));
  const backups = [bookmarks, development, feeds, media, records].flat();

  await Promise.all(backups);
})();

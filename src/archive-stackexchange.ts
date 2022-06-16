/* eslint-disable camelcase */
import chalk from 'chalk';
import dotenv from 'dotenv';
import fetch from 'isomorphic-fetch';

import {
  BookmarkTagsResponse,
  StackExchangeData,
  StackExchangeResponse,
} from './models/stackexchange';
import {
  insertHasuraData,
  queryHasuraStackExchange,
} from './helpers/hasuraData';

dotenv.config();

const { BOOKMARKS_API_KEY, STACKEXCHANGE_USER_ID } = process.env;
const sites = ['askubuntu', 'dba', 'serverfault', 'stackoverflow', 'superuser'];

// get tags from Bookmarks API
const getBookmarkTags = async (): Promise<string[]> => {
  try {
    const request = await fetch('https://bookmarks.villela.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Key: `${BOOKMARKS_API_KEY}`,
      },
      body: JSON.stringify({
        type: 'Tags',
        tagList: 'stackexchange',
      }),
    });
    const response: BookmarkTagsResponse = await request.json();
    const tagsArray = response.tags;

    return tagsArray;
  } catch (error) {
    throw new Error(`(getBookmarkTags):\n${error}`);
  }
};

/**
 * Get question details via StckExchange API.
 * Docs: https://api.stackexchange.com/docs/questions-by-ids
 * @function
 * @async
 *
 * @param {string} userId
 * @param {string} siteName
 * @returns {Promise<StackExchangeData>} title, questionurl, and answer url
 */
const getUserFavQuestions = async (
  userId: string,
  siteName: string
): Promise<StackExchangeData[]> => {
  try {
    const endpoint = `https://api.stackexchange.com/2.3/users/${userId}/favorites?order=desc&sort=added&site=${siteName}`;
    const request = await fetch(endpoint);
    const response: StackExchangeResponse = await request.json();
    const bkTags = await getBookmarkTags();

    const decodeHtmlCharCodes = (str: string): string =>
      str.replace(/(&#(\d+);)/g, (match, capture, charCode) =>
        String.fromCharCode(charCode)
      );

    if (response.items?.length === 0) {
      console.info(
        chalk.yellow('[INFO]'),
        `(${siteName}) - No new questions found.`
      );

      return [];
    }

    return response.items.map(item => {
      const title = decodeHtmlCharCodes(item.title).replace(/&quot;/g, '"');
      const tags = item.tags.filter(tag => bkTags.find(bkTag => bkTag === tag));
      const siteUrl =
        siteName === 'dba'
          ? `https://${siteName}.stackexchange.com`
          : `https://${siteName}.com`;

      return {
        title,
        question: `${siteUrl}/q/${item.question_id}`,
        answer: item.is_answered
          ? `${siteUrl}/a/${item.accepted_answer_id}`
          : '',
        tags,
      };
    });
  } catch (error) {
    throw new Error(`(getUserFavQuestions):\n${error}`);
  }
};

// Upload latest StackExchange questions to Hasura table.
(async () => {
  try {
    // get formatted tweets
    const currQs = await queryHasuraStackExchange();
    const favQsBySite = sites.map(site =>
      getUserFavQuestions(`${STACKEXCHANGE_USER_ID}`, site)
    );
    const favQs = await Promise.all(favQsBySite);
    const favQsFlat = favQs.flat();
    const newQs = favQsFlat.filter(
      newQ => !currQs.find(currQ => currQ.question === newQ.question)
    );

    // upload each individually
    if (newQs && newQs.length > 0) {
      await insertHasuraData('development_stack_exchange', newQs);
    } else {
      console.info(chalk.yellow('[INFO]'), 'No new questions to upload.');
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();

/* eslint-disable camelcase */
import dotenv from 'dotenv';
import fetch from 'isomorphic-fetch';

import {
  insertHasuraData,
  queryHasuraStackExchange,
} from './helpers/hasuraData';
import {
  MetaResponse,
  StackExchangeData,
  StackExchangeResponse,
} from './models/stackexchange';
import logger from './util/logger';

dotenv.config();

const { META_API_KEY, STACKEXCHANGE_USER_ID } = process.env;
const sites = ['askubuntu', 'dba', 'serverfault', 'stackoverflow', 'superuser'];

// get tags from Bookmarks API
const getTags = async (): Promise<string[]> => {
  try {
    const request = await fetch('https://meta.villela.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Key: `${META_API_KEY}`,
      },
      body: JSON.stringify({
        type: 'Query',
        table: 'tags',
        data: {
          schema: 'development',
          table: 'stack_exchange',
        },
      }),
    });
    const response: MetaResponse = await request.json();
    const tagsArray = response.items.map(item => item.name);

    return tagsArray;
  } catch (error) {
    throw new Error(`[getTags]: ${error}`);
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
    const bkTags = await getTags();

    const decodeHtmlCharCodes = (str: string): string =>
      str.replace(/(&#(\d+);)/g, (match, capture, charCode) =>
        String.fromCharCode(charCode)
      );

    if (response.items?.length === 0) {
      logger.info(
        `[archive-stackexchange] [getUserFavQuestions] [${siteName}]: No new questions found.`
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
    throw new Error(`[getUserFavQuestions]: ${error}`);
  }
};

// Upload latest StackExchange questions to Hasura table.
(async () => {
  try {
    // get formatted questions
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
      logger.info('[archive-stackexchange]: No new questions to upload.');
    }
  } catch (error) {
    logger.error(`[archive-stackexchange] ${error}`);
    process.exit(1);
  }
})();

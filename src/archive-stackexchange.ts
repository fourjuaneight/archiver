/* eslint-disable camelcase */
import chalk from 'chalk';
import dotenv from 'dotenv';
import fetch from 'isomorphic-fetch';

import {
  AirtableResp,
  BookmarkTagsResponse,
  StackExchangeData,
  StackExchangeResponse,
} from './models/stackexchange';
import { uploadStackExchangeQuestion } from './helpers/uploadStackExchangeQuestion';

dotenv.config();

const {
  AIRTABLE_API,
  AIRTABLE_DEVELOPMENT_ENDPOINT,
  BOOKMARKS_API_KEY,
  STACKEXCHANGE_USER_ID,
} = process.env;
const data: { [key: string]: StackExchangeData[] } = { current: [] };
const sites = ['askubuntu', 'serverfault', 'stackoverflow', 'superuser'];

/**
 * Get bookmarks list from Airtable.
 * Request can be recursive is there is more than 100 records.
 * @function
 * @async
 *
 * @param {[string]} offset param to request remainding records
 * @return {AirtableResp}
 */
const getQuestionsWithOffset = async (
  offset?: string
): Promise<AirtableResp> => {
  const options = {
    headers: {
      Authorization: `Bearer ${AIRTABLE_API}`,
      'Content-Type': 'application/json',
    },
  };
  const url = offset
    ? `${AIRTABLE_DEVELOPMENT_ENDPOINT}/StackExchange?offset=${offset}`
    : `${AIRTABLE_DEVELOPMENT_ENDPOINT}/StackExchange`;

  try {
    return fetch(url, options)
      .then(response => response.json())
      .then((airtableRes: AirtableResp) => {
        const fields = airtableRes.records.map(record => record.fields);

        data.current = [...data.current, ...fields];

        if (airtableRes.offset) {
          return getQuestionsWithOffset(airtableRes.offset);
        }

        return airtableRes;
      });
  } catch (error) {
    throw new Error(
      `Getting books for Development - StackExchange: \n ${error}`
    );
  }
};

// get current airtable stackexchange questions
const getCurrentQuestions = async (): Promise<StackExchangeData[]> => {
  try {
    await getQuestionsWithOffset();

    return data.current;
  } catch (error) {
    throw new Error(error);
  }
};

// get tags from Bookmarks API
const getBookmarkTags = async (): Promise<string[]> => {
  try {
    const request = await fetch('https://bookmarks.villela.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: `${BOOKMARKS_API_KEY}`,
        table: 'Tags',
        tagList: 'stackexchange',
      }),
    });
    const response: BookmarkTagsResponse = await request.json();
    const tagsArray = response.tags;

    return tagsArray;
  } catch (error) {
    throw new Error(`Getting Bookmark tags: \n ${error}`);
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

      return {
        title,
        question: `https://${siteName}.com/q/${item.question_id}`,
        answer: item.is_answered
          ? `https://${siteName}.com/a/${item.accepted_answer_id}`
          : '',
        tags,
      };
    });
  } catch (error) {
    throw new Error(`Getting StackExchange details: \n ${error}`);
  }
};

// Upload latest StackExchange questions to Airtable base.
(async () => {
  try {
    // get formatted tweets
    const currQs = await getCurrentQuestions();
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
      const questionsBackup = newQs.map(newQ =>
        uploadStackExchangeQuestion(newQ)
      );

      await Promise.all(questionsBackup);
    } else {
      console.info(chalk.yellow('[INFO]'), 'No new questions to upload.');
    }
  } catch (error) {
    console.error(chalk.red('[ERROR]'), error);
    process.exit(1);
  }
})();

import chalk from 'chalk';
import dotenv from 'dotenv';
import fetch from 'isomorphic-fetch';

import { AirtableError, AirtableResp, LatestTweetFmt } from '../models/twitter';

dotenv.config();

const { AIRTABLE_API, AIRTABLE_MEDIA_ENDPOINT } = process.env;

/**
 * Upload tweet object to Airtable
 * @function
 * @async
 *
 * @param {LatestTweetFmt} tweet formatted tweet to upload
 * @return {void}
 */
export const uploadTweets = async (tweet: LatestTweetFmt): Promise<void> => {
  const options: RequestInit = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${AIRTABLE_API}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      records: [
        {
          fields: {
            ...tweet,
          },
        },
      ],
    }),
  };

  try {
    const response: Response = await fetch(
      `${AIRTABLE_MEDIA_ENDPOINT}/Tweets`,
      options
    );
    const results: any = await response.json();

    if (results.records) {
      console.info(
        chalk.green('[SUCCESS]'),
        `Tweets saved to Airtable - ${(results as AirtableResp).records[0].id}.`
      );
    } else if (results.errors) {
      throw new Error(
        `Uploading tweets to Airtable: \n ${
          (results as AirtableError).errors[0].message
        }`
      );
    }
  } catch (error) {
    throw new Error(`Uploading tweets to Airtable: \n ${error}`);
  }
};

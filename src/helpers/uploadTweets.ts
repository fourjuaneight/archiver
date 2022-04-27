import chalk from 'chalk';
import dotenv from 'dotenv';
import fetch from 'isomorphic-fetch';

import {
  AirtableError,
  AirtableResp,
  Fields,
  LatestTweetFmt,
} from '../models/twitter';

dotenv.config();

const { AIRTABLE_API, AIRTABLE_MEDIA_ENDPOINT } = process.env;
const data: { archive: Fields[] } = { archive: [] };

/**
 * Get tweets from Airtable
 * @function
 * @async
 *
 * @param {[string]} offset param to request remainding records
 * @return {void}
 */
const getAirtableTweetsWithOffset = async (
  offset?: string
): Promise<AirtableResp> => {
  const options = {
    headers: {
      Authorization: `Bearer ${AIRTABLE_API}`,
      'Content-Type': 'application/json',
    },
  };
  const url = offset
    ? `${AIRTABLE_MEDIA_ENDPOINT}/Tweets?offset=${offset}`
    : `${AIRTABLE_MEDIA_ENDPOINT}/Tweets`;

  try {
    return fetch(url, options)
      .then(response => response.json())
      .then((airtableRes: AirtableResp) => {
        const fields = airtableRes.records.map(record => record.fields);

        data.archive = [...data.archive, ...fields];

        if (airtableRes.offset) {
          return getAirtableTweetsWithOffset(airtableRes.offset);
        }

        return airtableRes;
      });
  } catch (error) {
    throw new Error(`Getting archived tweets: \n ${error}`);
  }
};

export const getArchive = async (): Promise<Fields[]> => {
  try {
    await getAirtableTweetsWithOffset();

    return data.archive;
  } catch (error) {
    throw new Error(error);
  }
};

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

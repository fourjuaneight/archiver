import chalk from 'chalk';
import dotenv from 'dotenv';
import fetch from 'isomorphic-fetch';

import {
  AirtableError,
  AirtableResp,
  StackExchangeData,
} from '../models/stackexchange';

dotenv.config();

const { AIRTABLE_API, AIRTABLE_DEVELOPMENT_ENDPOINT } = process.env;

/**
 * Upload saved Stack Exchange question to Airtable
 * @function
 * @async
 *
 * @param {StackExchangeData} question formatted stack exchange data
 * @return {void}
 */
export const uploadStackExchangeQuestion = async (
  question: StackExchangeData
): Promise<void> => {
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
            ...question,
          },
        },
      ],
    }),
  };

  try {
    const response: Response = await fetch(
      `${AIRTABLE_DEVELOPMENT_ENDPOINT}/StackExchange`,
      options
    );
    const results: any = await response.json();

    if (results.records) {
      console.info(
        chalk.green('[SUCCESS]'),
        `Question saved to Airtable - "${
          (results as AirtableResp).records[0].fields.title
        }"`
      );
    } else if (results.errors) {
      throw new Error(
        `Uploading question to Airtable: \n ${
          (results as AirtableError).errors[0].message
        }`
      );
    }
  } catch (error) {
    throw new Error(`Uploading question to Airtable: \n ${error}`);
  }
};

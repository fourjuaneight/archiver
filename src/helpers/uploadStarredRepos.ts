import chalk from 'chalk';
import dotenv from 'dotenv';
import fetch from 'isomorphic-fetch';

import { AirtableError, AirtableResp, CleanRepo } from '../models/github';

dotenv.config();

const { AIRTABLE_API, AIRTABLE_DEVELOPMENT_ENDPOINT } = process.env;

/**
 * Upload starred repo object to Airtable
 * @function
 * @async
 *
 * @param {CleanRepo} repo formatted tweet to upload
 * @return {void}
 */
const uploadStarredRepos = async (repo: CleanRepo): Promise<void> => {
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
            ...repo,
          },
        },
      ],
    }),
  };

  try {
    const response: Response = await fetch(
      `${AIRTABLE_DEVELOPMENT_ENDPOINT}/GitHub`,
      options
    );
    const results: any = await response.json();

    if (results.records) {
      console.info(
        chalk.green('[SUCCESS]'),
        `Repo saved to Airtable - ${
          (results as AirtableResp).records[0].fields.repository
        }.`
      );
    } else if (results.errors) {
      throw new Error(
        `Uploading repos to Airtable: \n ${
          (results as AirtableError).errors[0].message
        }`
      );
    }
  } catch (error) {
    throw new Error(`Uploading repos to Airtable: \n ${error}`);
  }
};

export default uploadStarredRepos;

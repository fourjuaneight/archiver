import chalk from 'chalk';
import dotenv from 'dotenv';
import fetch from 'isomorphic-fetch';

import { AirtableResp, CleanRepo } from '../models/github';

dotenv.config();

const { AIRTABLE_API, AIRTABLE_BOOKMARKS_ENDPOINT } = process.env;

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
      `${AIRTABLE_BOOKMARKS_ENDPOINT}/GitHub`,
      options
    );
    const results: AirtableResp = await response.json();

    console.info(
      chalk.green('[SUCCESS]'),
      `Repo saved to Airtable - ${results.records[0].fields.repository}.`
    );
  } catch (error) {
    throw new Error(`Uploading repos to Airtable: \n ${error}`);
  }
};

export default uploadStarredRepos;

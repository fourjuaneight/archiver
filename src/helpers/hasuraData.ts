import dotenv from 'dotenv';
import fetch from 'isomorphic-fetch';

import { Fields, HasuraTWQueryResp } from '../models/twitter';
import { HasuraErrors, HasuraMutationResp } from '../models/hasura';

dotenv.config();

const { HASURA_ADMIN_SECRET, HASURA_ENDPOINT } = process.env;

const objToQueryString = (obj: { [key: string]: any }) =>
  Object.keys(obj).map(key => {
    const value = obj[key];
    const fmtValue =
      typeof value === 'string'
        ? `"${value
            .replace(/\\/g, '')
            .replace(/"/g, '\\"')
            .replace(/\n/g, '\\n')}"`
        : Array.isArray(value)
        ? `"${value.join(',')}"`
        : value;

    return `${key}: ${fmtValue}`;
  });

export const mutateHasuraData = async (
  list: string,
  records: { [key: string]: any }[]
): Promise<void> => {
  const query = `
    mutation {
      insert_${list}(objects: [
        ${records.map(data => `{${objToQueryString(data)}}`).join(',')}
      ]) {
        returning {
          id
        }
      }
    }
  `;

  try {
    const request = await fetch(`${HASURA_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hasura-Admin-Secret': `${HASURA_ADMIN_SECRET}`,
      },
      body: JSON.stringify({ query }),
    });
    const response: HasuraMutationResp | HasuraErrors = await request.json();

    if (response.errors) {
      const { errors } = response as HasuraErrors;

      throw new Error(
        `(mutateHasuraData) ${list}: \n ${errors
          .map(err => `${err.extensions.path}: ${err.message}`)
          .join('\n')} \n ${query}`
      );
    }
  } catch (error) {
    throw new Error(`(mutateHasuraData) - ${list}: \n ${error}`);
  }
};

export const queryHasuraTweets = async (env: ContextValue) => {
  const query = `
    {
      media_tweets(order_by: {date: desc}) {
        date
        tweet
        url
      }
    }
  `;

  try {
    const request = await fetch(`${env.HASURA_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hasura-Admin-Secret': `${env.HASURA_ADMIN_SECRET}`,
      },
      body: JSON.stringify({ query }),
    });
    const response: HasuraTWQueryResp | HasuraErrors = await request.json();

    if (response.errors) {
      const { errors } = response as HasuraErrors;

      throw new Error(
        `(queryHasuraTweets) ${list}: \n ${errors
          .map(err => `${err.extensions.path}: ${err.message}`)
          .join('\n')} \n ${query}`
      );
    }

    const tweets = (response as HasuraTWQueryResp).data.media_tweets;
    const tweetsWithId: Fields[] = tweets.map(tweet => ({
      ...tweet,
      id: tweet.url.split('/').pop(),
    }));

    return tweetsWithId;
  } catch (error) {
    throw new Error(`(queryHasuraTweets) - ${list}: \n ${error}`);
  }
};

import chalk from 'chalk';
import dotenv from 'dotenv';
import fetch from 'isomorphic-fetch';

import { emojiUnicode } from '../util/emojiUnicode';
import { expandShortLink } from './expandShortLink';

import {
  LatestTweet,
  LatestTweetFmt,
  TwitterResponse,
} from '../models/twitter';

dotenv.config();

let tweets: LatestTweet[] = [];
const { TWEET_TOKEN, TWEET_USER_ID } = process.env;

/**
 * Get the lastest Tweets from the last 24 hours.
 * Docs: https://developer.twitter.com/en/docs/twitter-api/tweets/timelines/api-reference/get-users-id-tweets#tab2
 * @function
 * @async
 *
 * @param {[string]} pagination offset pagination token
 * @return {TwitterResponse} request response with list of tweets
 */
const latestTweets = (pagination?: string): Promise<TwitterResponse> => {
  const firstDay: string = '2019-03-01T00:00:00.000Z';
  const twtOpts: RequestInit = {
    headers: {
      Authorization: `Bearer ${TWEET_TOKEN}`,
      'Content-Type': 'application/json',
    },
  };
  const params: string = pagination
    ? `max_results=100&tweet.fields=created_at&start_time=${firstDay}&pagination_token=${pagination}`
    : `max_results=100&tweet.fields=created_at&start_time=${firstDay}`;

  try {
    return fetch(
      `https://api.twitter.com/2/users/${TWEET_USER_ID}/tweets?${params}`,
      twtOpts
    )
      .then((response: Response) => response.json())
      .then((twitterResponse: TwitterResponse) => {
        if (twitterResponse.data) {
          tweets = [...tweets, ...twitterResponse.data];
        }

        if (twitterResponse.meta.result_count === 100) {
          return latestTweets(twitterResponse.meta.next_token);
        }

        return twitterResponse;
      });
  } catch (error) {
    throw new Error(`Getting latest tweets: \n ${error}`);
  }
};

/**
 * Extract relevate parts of Twitter response and create formatted object.
 * @function
 *
 * @param {LatestTweet[]} rawTweets raw tweet object array from Twitter API response
 * @return {LatestTweetFmt[]} formatted tweet object array; tweet (emojis converted), ISO date, url
 */
const formatTweets = (rawTweets: LatestTweet[]): LatestTweetFmt[] => {
  const formatted: LatestTweetFmt[] = rawTweets.map((twt: LatestTweet) => ({
    tweet: emojiUnicode(twt.text),
    date: twt.created_at,
    url: `https://twitter.com/fourjuaneight/status/${twt.id}`,
  }));

  return formatted;
};

/**
 * Expand shortened links in tweet body.
 * @function
 * @async
 *
 * @param {LatestTweetFmt[]} fmtTweets formatted tweet object array
 * @return {LatestTweetFmt[]} formatted tweet object array; links expanded
 */
const expandTweets = (
  fmtTweets: LatestTweetFmt[]
): Promise<LatestTweetFmt[]> => {
  const expanded = fmtTweets.map(async (twt: LatestTweetFmt) => ({
    ...twt,
    tweet: await expandShortLink(
      twt.tweet,
      /(https:\/\/t.co\/[a-zA-z0-9]+)/g
    ).then((result: string) => result),
  }));

  return Promise.all(expanded);
};

/**
 * Get latest tweets from Twitter API, formatted.
 * @function
 * @async
 *
 * @return {LatestTweetFmt[]} { tweet, date, url }
 */
export const latest = async (): Promise<LatestTweetFmt[] | null> => {
  try {
    await latestTweets();

    console.info(chalk.green('[SUCCESS]'), 'Latest tweets retrieved.');

    if (tweets.length > 0) {
      const lastFmt: LatestTweetFmt[] = await formatTweets(tweets);
      const lastExp: LatestTweetFmt[] = await expandTweets(lastFmt);

      return lastExp;
    }

    return null;
  } catch (error) {
    throw new Error(`Formatting latest tweets: \n ${error}`);
  }
};

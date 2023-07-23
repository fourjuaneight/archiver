/* eslint-disable camelcase */
import { subDays } from 'date-fns';
import dotenv from 'dotenv';
import fetch from 'isomorphic-fetch';

import { LatestTweet, TwitterResponse } from './models/twitter';
import logger from './util/logger';

interface RawTweet extends LatestTweet {
  edit_history_tweet_ids: string[];
  public_metrics: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
  };
}

dotenv.config();

let tweets: RawTweet[] = [];
const { TWEET_TOKEN } = process.env;

// DOCS: https://developer.twitter.com/en/docs/twitter-api/tweets/timelines/api-reference/get-users-id-tweets#tab2
const latestTweets = (
  userID: string,
  pagination?: string
): Promise<TwitterResponse> => {
  const start: string = subDays(new Date(), 30).toISOString();
  const twtOpts: RequestInit = {
    headers: {
      Authorization: `Bearer ${TWEET_TOKEN}`,
      'Content-Type': 'application/json',
    },
  };
  const baseParam = `max_results=100&tweet.fields=public_metrics,created_at&exclude=retweets,replies&start_time=${start}`;
  const params: string = pagination
    ? `${baseParam}&pagination_token=${pagination}`
    : baseParam;

  try {
    return fetch(
      `https://api.twitter.com/2/users/${userID}/tweets?${params}`,
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
    throw new Error(`[latestTweets]: ${error}`);
  }
};

export const latest = async (userID: string): Promise<LatestTweet[]> => {
  try {
    await latestTweets(userID);

    logger.info('[latest]: Latest tweets retrieved.');

    if (tweets?.length > 0) {
      const rankedTweets = tweets
        .sort((a, b) =>
          a.public_metrics.like_count < b.public_metrics.like_count
            ? 1
            : a.public_metrics.like_count > b.public_metrics.like_count
            ? -1
            : 0
        )
        .map(({ id, text, created_at }) => ({
          id,
          text: text.replace(/(https:\/\/t.co\/[a-zA-z0-9]+)/g, ''),
          created_at,
        }))
        .filter(twt => !twt.text.includes('LIVE'));

      return rankedTweets;
    }

    throw new Error(`[latest]: no tweets found.`);
  } catch (error) {
    throw new Error(`[latest]: ${error}`);
  }
};

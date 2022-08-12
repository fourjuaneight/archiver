import dotenv from 'dotenv';
import fetch from 'isomorphic-fetch';

import {
  LatestTweet,
  LatestTweetFmt,
  TwitterFeed,
  TwitterList,
  TwitterListResp,
  TwitterResponse,
  TwitterUserResp,
} from '../models/twitter';
import { arrayDiff } from '../util/arrayDiff';
import { emojiUnicode } from '../util/emojiUnicode';
import logger from '../util/logger';
import { expandShortLink } from './expandShortLink';

dotenv.config();

let tweets: LatestTweet[] = [];
const { TWEET_TOKEN, TWEET_USER_ID } = process.env;

/**
 * Get user lists.
 * Docs: https://developer.twitter.com/en/docs/twitter-api/lists/list-lookup/api-reference/get-users-id-owned_lists
 * @function
 * @async
 *
 * @return {TwitterList[]}
 */
const twitterLists = async (): Promise<TwitterList[]> => {
  try {
    const request = await fetch(
      `https://api.twitter.com/2/users/${TWEET_USER_ID}/owned_lists`,
      {
        headers: {
          Authorization: `Bearer ${TWEET_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const { data }: TwitterListResp = await request.json();

    if (data?.length === 0) {
      throw new Error('No lists found.');
    }

    return data;
  } catch (error) {
    throw new Error(`[twitterLists]: ${error}`);
  }
};

/**
 * Get list members.
 * Docs: https://developer.twitter.com/en/docs/twitter-api/lists/list-members/api-reference/get-lists-id-members
 * @function
 * @async
 *
 * @param {TwitterList} listID
 * @return {TwitterFeed[]}
 */
const listMembers = async (list: TwitterList): Promise<TwitterFeed[]> => {
  try {
    const request = await fetch(
      `https://api.twitter.com/2/lists/${list.id}/members?user.fields=name,username,description`,
      {
        headers: {
          Authorization: `Bearer ${TWEET_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const { data }: TwitterUserResp = await request.json();

    if (data?.length === 0) {
      throw new Error('No list members found.');
    }

    return data.map<TwitterFeed>(user => ({
      ...user,
      description: user.description || null,
      username: `@${user.username}`,
      list: list.name,
      url: `https://twitter.com/${user.username}`,
    }));
  } catch (error) {
    throw new Error(`[listMembers]: ${error}`);
  }
};

/**
 * Get user follows.
 * Docs: https://developer.twitter.com/en/docs/twitter-api/users/follows/api-reference/get-users-id-following
 * @function
 * @async
 *
 * @return {TwitterFeed[]}
 */
const userFollows = async (): Promise<TwitterFeed[]> => {
  try {
    const request = await fetch(
      `https://api.twitter.com/2/users/${TWEET_USER_ID}/following?user.fields=name,username,description`,
      {
        headers: {
          Authorization: `Bearer ${TWEET_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const { data }: TwitterUserResp = await request.json();

    if (data?.length === 0) {
      throw new Error('No list members found.');
    }

    return data.map<TwitterFeed>(user => ({
      ...user,
      description: user.description || null,
      username: `@${user.username}`,
      list: '',
      url: `https://twitter.com/${user.username}`,
    }));
  } catch (error) {
    throw new Error(`[userFollows]: ${error}`);
  }
};

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
    throw new Error(`[latestTweets]: ${error}`);
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
 * Get latest user list members from Twitter API, formatted.
 * @function
 * @async
 *
 * @return {TwitterFeed[]}
 */
export const feed = async (): Promise<TwitterFeed[]> => {
  try {
    const following = await userFollows();
    const lists = await twitterLists();
    const members = await Promise.all(lists.map(list => listMembers(list)));
    const allMembersFlat = members.flat();
    const memberDiff = arrayDiff(
      following,
      allMembersFlat,
      'username'
    ) as TwitterFeed[];

    if (memberDiff.length) {
      logger.info(
        `[twitterData] [feed]: ${memberDiff.length} users found not in lists.`
      );
    }

    return allMembersFlat.map<TwitterFeed>(user => {
      // removes id prop
      const { id, ...rest } = user;

      return rest;
    });
  } catch (error) {
    throw new Error(`[twitterData - feed]: ${error}`);
  }
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

    logger.info('[twitterData] [latest]: Latest tweets retrieved.');

    if (tweets?.length > 0) {
      const lastFmt: LatestTweetFmt[] = await formatTweets(tweets);
      const lastExp: LatestTweetFmt[] = await expandTweets(lastFmt);

      return lastExp;
    }

    return null;
  } catch (error) {
    throw new Error(`[twitterData - latest]: ${error}`);
  }
};

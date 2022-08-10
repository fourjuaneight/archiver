import dotenv from 'dotenv';
import fetch from 'isomorphic-fetch';

import { HasuraBackupQueryResp, HasuraBKQueryResp } from '../models/archive';
import { HasuraErrors } from '../models/hasura';
import { HasuraSEQueryResp } from '../models/stackexchange';
import {
  Fields,
  HasuraTWFeedQueryResp,
  HasuraTWQueryResp,
} from '../models/twitter';

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
        ? `"{${value.join(',')}}"`
        : value;

    return `${key}: ${fmtValue}`;
  });

export const insertHasuraData = async (
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
    const response = await request.json();

    if (response.errors) {
      const { errors } = response as HasuraErrors;

      throw new Error(
        `(insertHasuraData) ${list}:\n${errors
          .map(err => `${err.extensions.path}: ${err.message}`)
          .join('\n')}\n${query}`
      );
    }
  } catch (error) {
    throw new Error(`(insertHasuraData) - ${list}:\n${error}`);
  }
};

export const updateHasuraData = async (
  list: string,
  id: string,
  data: { [key: string]: any }
): Promise<void> => {
  const query = `
    mutation {
      update_${list}(
        where: {id: {_eq: "${id}"}},
        _set: {${objToQueryString(data)}}
      ) {
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
    const response = await request.json();

    if (response.errors) {
      const { errors } = response as HasuraErrors;

      throw new Error(
        `(updateHasuraData) ${list}:\n${errors
          .map(err => `${err.extensions.path}: ${err.message}`)
          .join('\n')}\n${query}`
      );
    }
  } catch (error) {
    throw new Error(`(updateHasuraData) - ${list}:\n${error}`);
  }
};

export const queryHasuraBackup = async () => {
  const query = `
    {
      meta_categories {
        name
        table
        schema
      }
      meta_genres {
        name
        table
        schema
      }
      meta_platforms {
        name
        table
        schema
      }
      meta_tags {
        name
        table
        schema
      }
      bookmarks_articles {
        archive
        author
        dead
        site
        tags
        title
        url
      }
      bookmarks_comics {
        archive
        creator
        dead
        tags
        title
        url
      }
      bookmarks_podcasts {
        archive
        creator
        dead
        tags
        title
        url
      }
      bookmarks_reddits {
        archive
        content
        dead
        subreddit
        tags
        title
        url
      }
      bookmarks_tweets {
        dead
        tags
        tweet
        url
        user
      }
      bookmarks_videos {
        archive
        creator
        dead
        tags
        title
        url
      }
      feeds_podcasts {
        title
        category
        url
        rss
      }
      feeds_reddit {
        name
        description
        url
      }
      feeds_twitter {
        name
        username
        description
        list
        url
      }
      feeds_websites {
        title
        category
        url
        rss
      }
      feeds_youtube {
        title
        category
        url
        rss
      }
      media_books {
        title
        author
        genre
      }
      media_games {
        title
        studio
        genre
        platform
      }
      media_movies {
        title
        director
        genre
      }
      media_music {
        title
        artist
        album
        genre
        year
      }
      media_mtg {
        name
        colors
        type
        oracle_text
        flavor_text
        set
        set_name
        rarity
        collector_number
        artist
        image
        back
      }
      media_shows {
        title
        director
        genre
      }
      media_shelf {
        category
        comments
        completed
        cover
        creator
        genre
        name
        rating
      }
      records_bookstores {
        name
        location
        url
      }
      records_clients {
        name
        company
        stack
        start
        end
      }
      records_jobs {
        company
        position
        start
        end
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
    const response = await request.json();

    if (response.errors) {
      const { errors } = response as HasuraErrors;

      throw new Error(
        `(queryHasuraBackup):\n${errors
          .map(err => `${err.extensions.path}: ${err.message}`)
          .join('\n')}\n${query}`
      );
    }

    return (response as HasuraBackupQueryResp).data;
  } catch (error) {
    throw new Error(`(queryHasuraBackup):\n${error}`);
  }
};

export const queryHasuraBookmarks = async () => {
  const query = `
    {
      articles: bookmarks_articles(order_by: {title: asc}) {
        archive
        author
        dead
        id
        site
        tags
        title
        url
      }
      comics: bookmarks_comics(order_by: {title: asc}) {
        archive
        creator
        dead
        id
        tags
        title
        url
      }
      podcasts: bookmarks_podcasts(order_by: {title: asc}) {
        archive
        creator
        dead
        id
        tags
        title
        url
      }
      reddits: bookmarks_reddits(order_by: {title: asc}) {
        archive
        content
        dead
        id
        subreddit
        tags
        title
        url
      }
      tweets: bookmarks_tweets(order_by: {tweet: asc}) {
        dead
        id
        tags
        tweet
        url
        user
      }
      videos: bookmarks_videos(order_by: {title: asc}) {
        archive
        creator
        dead
        id
        tags
        title
        url
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
    const response = await request.json();

    if (response.errors) {
      const { errors } = response as HasuraErrors;

      throw new Error(
        `(queryHasuraBookmarks):\n${errors
          .map(err => `${err.extensions.path}: ${err.message}`)
          .join('\n')}\n${query}`
      );
    }

    return (response as HasuraBKQueryResp).data;
  } catch (error) {
    throw new Error(`(queryHasuraBookmarks):\n${error}`);
  }
};

export const queryHasuraStackExchange = async () => {
  const query = `
    {
      development_stack_exchange {
        title
        question
        answer
        tags
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
    const response = await request.json();

    if (response.errors) {
      const { errors } = response as HasuraErrors;

      throw new Error(
        `(queryHasuraStackExchange):\n${errors
          .map(err => `${err.extensions.path}: ${err.message}`)
          .join('\n')}\n${query}`
      );
    }

    return (response as HasuraSEQueryResp).data.development_stack_exchange;
  } catch (error) {
    throw new Error(`(queryHasuraStackExchange):\n${error}`);
  }
};

export const queryHasuraTweets = async () => {
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
    const request = await fetch(`${HASURA_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hasura-Admin-Secret': `${HASURA_ADMIN_SECRET}`,
      },
      body: JSON.stringify({ query }),
    });
    const response = await request.json();

    if (response.errors) {
      const { errors } = response as HasuraErrors;

      throw new Error(
        `(queryHasuraTweets):\n${errors
          .map(err => `${err.extensions.path}: ${err.message}`)
          .join('\n')}\n${query}`
      );
    }

    const tweets = (response as HasuraTWQueryResp).data.media_tweets;
    const tweetsWithId: Fields[] = tweets.map(tweet => ({
      ...tweet,
      id: tweet.url.split('/').pop(),
    }));

    return tweetsWithId;
  } catch (error) {
    throw new Error(`(queryHasuraTweets):\n${error}`);
  }
};

export const queryHasuraTwitterFeed = async () => {
  const query = `
    {
      feeds_twitter(order_by: {name: asc}) {
        name
        username
        description
        list
        url
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
    const response = await request.json();

    if (response.errors) {
      const { errors } = response as HasuraErrors;

      throw new Error(
        `(queryHasuraTwitterFeed):\n${errors
          .map(err => `${err.extensions.path}: ${err.message}`)
          .join('\n')}\n${query}`
      );
    }

    const feed = (response as HasuraTWFeedQueryResp).data.feeds_twitter;

    return feed;
  } catch (error) {
    throw new Error(`(queryHasuraTwitterFeed):\n${error}`);
  }
};

import dotenv from 'dotenv';
import fetch from 'isomorphic-fetch';

import { HasuraBackupQueryResp, HasuraBKQueryResp } from '../models/archive';
import { HasuraErrors, HasuraMangaFeedQueryResp } from '../models/hasura';
import { HasuraSEQueryResp } from '../models/stackexchange';

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

    if (request.status !== 200) {
      throw new Error(`[fetch]: ${request.status} - ${request.statusText}`);
    }

    const response = await request.json();

    if (response.errors) {
      const { errors } = response as HasuraErrors;

      throw new Error(
        `[query] [${list}]: ${errors
          .map(err => `${err.extensions.path}: ${err.message}`)
          .join('\n')}\n${query}`
      );
    }
  } catch (error) {
    throw new Error(`[insertHasuraData] [${list}]: ${error}`);
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

    if (request.status !== 200) {
      throw new Error(`[fetch]: ${request.status} - ${request.statusText}`);
    }

    const response = await request.json();

    if (response.errors) {
      const { errors } = response as HasuraErrors;

      throw new Error(
        `[query] [${list}]: ${errors
          .map(err => `${err.extensions.path}: ${err.message}`)
          .join('\n')}\n${query}`
      );
    }
  } catch (error) {
    throw new Error(`[updateHasuraData] [${list}]: ${error}`);
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

    if (request.status !== 200) {
      throw new Error(`[fetch]: ${request.status} - ${request.statusText}`);
    }

    const response = await request.json();

    if (response.errors) {
      const { errors } = response as HasuraErrors;

      throw new Error(
        `[query]: ${errors
          .map(err => `${err.extensions.path}: ${err.message}`)
          .join('\n')}\n${query}`
      );
    }

    return (response as HasuraBackupQueryResp).data;
  } catch (error) {
    throw new Error(`[queryHasuraBackup]: ${error}`);
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

    if (request.status !== 200) {
      throw new Error(`[fetch]: ${request.status} - ${request.statusText}`);
    }

    const response = await request.json();

    if (response.errors) {
      const { errors } = response as HasuraErrors;

      throw new Error(
        `[query]: ${errors
          .map(err => `${err.extensions.path}: ${err.message}`)
          .join('\n')}\n${query}`
      );
    }

    return (response as HasuraBKQueryResp).data;
  } catch (error) {
    throw new Error(`[queryHasuraBookmarks]: ${error}`);
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

    if (request.status !== 200) {
      throw new Error(`[fetch]: ${request.status} - ${request.statusText}`);
    }

    const response = await request.json();

    if (response.errors) {
      const { errors } = response as HasuraErrors;

      throw new Error(
        `[query]: ${errors
          .map(err => `${err.extensions.path}: ${err.message}`)
          .join('\n')}\n${query}`
      );
    }

    return (response as HasuraSEQueryResp).data.development_stack_exchange;
  } catch (error) {
    throw new Error(`[queryHasuraStackExchange]: ${error}`);
  }
};

export const queryHasuraMangaFeed = async () => {
  const query = `
    {
      feeds_manga(order_by: {title: asc}) {
        title
        author
        mangadex_id
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

    if (request.status !== 200) {
      throw new Error(`[fetch]: ${request.status} - ${request.statusText}`);
    }

    const response = await request.json();

    if (response.errors) {
      const { errors } = response as HasuraErrors;

      throw new Error(
        `[query]: ${errors
          .map(err => `${err.extensions.path}: ${err.message}`)
          .join('\n')}\n${query}`
      );
    }

    const feed = (response as HasuraMangaFeedQueryResp).data.feeds_manga;

    return feed;
  } catch (error) {
    throw new Error(`[queryHasuraMangaFeed]: ${error}`);
  }
};

import dotenv from 'dotenv';
import fetch from 'isomorphic-fetch';

import { AirtableResp, Fields, List } from '../models/airtable';
import { HasuraErrors, HasuraMutationResp } from '../models/hasura';

dotenv.config();

const {
  AIRTABLE_API,
  AIRTABLE_BOOKMARKS_ENDPOINT,
  AIRTABLE_DEVELOPMENT_ENDPOINT,
  AIRTABLE_FEEDS_ENDPOINT,
  AIRTABLE_MEDIA_ENDPOINT,
  AIRTABLE_RECORDS_ENDPOINT,
  HASURA_ADMIN_SECRET,
  HASURA_ENDPOINT,
} = process.env;
const endpoints: { [key: string]: string } = {
  Bookmarks: `${AIRTABLE_BOOKMARKS_ENDPOINT}`,
  Development: `${AIRTABLE_DEVELOPMENT_ENDPOINT}`,
  Feeds: `${AIRTABLE_FEEDS_ENDPOINT}`,
  Media: `${AIRTABLE_MEDIA_ENDPOINT}`,
  Records: `${AIRTABLE_RECORDS_ENDPOINT}`,
};
const srcData: { [key: string]: List } = {
  Bookmarks: {
    Articles: [],
    Comics: [],
    Podcasts: [],
    Reddits: [],
    Tweets: [],
    Videos: [],
  },
  Development: {
    GitHub: [],
    StackExchange: [],
  },
  Feeds: {
    Podcasts: [],
    Websites: [],
    YouTube: [],
  },
  Media: {
    Books: [],
    Games: [],
    Movies: [],
    Shows: [],
    Shelf: [],
    Tweets: [],
  },
  Records: {
    Bookstores: [],
    Clients: [],
    Jobs: [],
  },
};
const distData: { [key: string]: Fields[] } = {
  bookmarks_articles: [],
  bookmarks_comics: [],
  bookmarks_podcasts: [],
  bookmarks_reddits: [],
  bookmarks_tweets: [],
  bookmarks_videos: [],
  development_github: [],
  development_stack_exchange: [],
  feeds_podcasts: [],
  feeds_websites: [],
  feeds_youtube: [],
  media_books: [],
  media_games: [],
  media_movies: [],
  media_shelf: [],
  media_shows: [],
  media_tweets: [],
  records_bookstores: [],
  records_clients: [],
  records_jobs: [],
};
const distDataMap: { [key: string]: string } = {
  'Bookmarks:Articles': 'bookmarks_articles',
  'Bookmarks:Comics': 'bookmarks_comics',
  'Bookmarks:Podcasts': 'bookmarks_podcasts',
  'Bookmarks:Reddits': 'bookmarks_reddits',
  'Bookmarks:Tweets': 'bookmarks_tweets',
  'Bookmarks:Videos': 'bookmarks_videos',
  'Development:GitHub': 'development_github',
  'Development:StackExchange': 'development_stack_exchange',
  'Feeds:Podcasts': 'feeds_podcasts',
  'Feeds:Websites': 'feeds_websites',
  'Feeds:YouTube': 'feeds_youtube',
  'Media:Books': 'media_books',
  'Media:Games': 'media_games',
  'Media:Movies': 'media_movies',
  'Media:Shelf': 'media_shelf',
  'Media:Shows': 'media_shows',
  'Media:Tweets': 'media_tweets',
  'Records:Bookstores': 'records_bookstores',
  'Records:Clients': 'records_clients',
  'Records:Jobs': 'records_jobs',
};

const getAirtableDataWithOffset = async (
  base: string,
  list: string,
  offset?: string
): Promise<AirtableResp> => {
  const options = {
    headers: {
      Authorization: `Bearer ${AIRTABLE_API}`,
      'Content-Type': 'application/json',
    },
  };
  const url = offset
    ? `${endpoints[base]}/${list}?offset=${offset}`
    : `${endpoints[base]}/${list}`;

  try {
    return fetch(url, options)
      .then(response => response.json())
      .then((airtableRes: AirtableResp) => {
        const newRecords = airtableRes.records || [];
        srcData[base][list] = [...srcData[base][list], ...newRecords];

        if (airtableRes.offset) {
          return getAirtableDataWithOffset(base, list, airtableRes.offset);
        }

        return airtableRes;
      });
  } catch (error) {
    throw new Error(`(getAirtableDataWithOffset) ${base}:${list}: \n ${error}`);
  }
};

const getRecords = async () => {
  try {
    const bases = Object.keys(srcData);

    for (const base of bases) {
      const lists = Object.keys(srcData[base]);

      await Promise.all(
        lists.map(list => getAirtableDataWithOffset(base, list))
      );
    }

    return srcData;
  } catch (error) {
    throw new Error(`(getRecords): \n ${error}`);
  }
};

const cleanFields = (fields: Fields): Fields => {
  const updatedFields: { [key: string]: any } = fields;

  Object.keys(fields).forEach(field => {
    switch (true) {
      case field === 'status':
        Object.assign(updatedFields, {
          dead: updatedFields[field] === 'dead',
        });
        delete updatedFields.status;
        break;
      case field === 'cover':
        updatedFields.cover = '';
        break;
      default:
        break;
    }
  });

  return updatedFields as Fields;
};

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

const saveHasuraData = async (
  list: string,
  records: Fields[]
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
        `(saveHasuraData) ${list}: \n ${errors
          .map(err => `${err.extensions.path}: ${err.message}`)
          .join('\n')} \n ${query}`
      );
    }
  } catch (error) {
    throw new Error(`(saveHasuraData) - ${list}: \n ${error}`);
  }
};

(async () => {
  try {
    const airtableData = await getRecords();

    Object.keys(airtableData).forEach(base => {
      Object.keys(airtableData[base]).forEach(list => {
        const tableName = distDataMap[`${base}:${list}`];
        const newData: Fields[] = airtableData[base][list].map(record =>
          base === 'Bookmarks' ? cleanFields(record.fields) : record.fields
        );

        distData[tableName] = newData;
      });
    });

    for (const list of Object.keys(distData)) {
      await saveHasuraData(list, distData[list]);
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();

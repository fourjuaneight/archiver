import uploadToB2 from './uploadContentB2';
import { getArticle, getMedia, getYTVid } from './getContent';
import { baseQueries } from './getBookmarks';
import { Record } from './types';

const bookmarksList = Object.keys(baseQueries.Bookmarks);

/**
 * Determine media type and get buffer data.
 * @function
 *
 * @param {string} url media endpoint
 * @param {string} type media type
 * @returns {Promise<Buffer>} media buffer
 */
const getData = async (url: string, type: string): Promise<Buffer> => {
  switch (true) {
    case type === 'articles':
      return getArticle(url);
    case type === 'videos':
      return getYTVid(url);
    default:
      return getMedia(url);
  }
};

/**
 * Get Airtable bookmarks, archive media, then update record.
 * @function
 *
 * @param {string} list database list
 * @param {Record} record record to update
 * @returns {Promise<Record>} updated record
 */
const addFiletoRecord = async (
  list: string,
  record: Record
): Promise<Record> => {
  const name: string = (record.fields.title as string).replace(' ', '_');
  const type: string = list.toLowerCase();

  try {
    const data = await getData(record.fields.url, type);
    const publicUlr = await uploadToB2(data, `Bookmarks/${list}/${name}`);

    return {
      ...record,
      file: publicUlr,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export default addFiletoRecord;

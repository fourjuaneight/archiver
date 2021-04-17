import uploadToB2 from './uploadContentB2';
import { getArticle, getMedia, getYTVid } from './getContent';
import { baseQueries } from './getBookmarks';
import { Record } from './types';

/**
 * Determine media type and get buffer data.
 * @function
 *
 * @param {string} title media name
 * @param {string} url media endpoint
 * @param {string} type media type
 * @returns {Promise<Buffer>} media buffer
 */
const getData = async (
  name: string,
  url: string,
  type: string
): Promise<Buffer> => {
  switch (true) {
    case type === 'articles':
      return getArticle(name, url);
    case type === 'comics':
      return getArticle(name, url);
    case type === 'videos':
      return getYTVid(name, url);
    default:
      return getMedia(name, url);
  }
};

/**
 * Get Airtable bookmarks, archive media, then update record.
 * @function
 *
 * @param {string} list database list
 * @param {Record} record record to archive
 * @returns {Promise<Record>} updated record
 */
const addFiletoRecord = async (
  list: string,
  record: Record
): Promise<Record> => {
  const type: string = list.toLowerCase();

  try {
    const name: string = record.fields.title
      .replace(/\.\s/g, '-')
      .replace(/,\s/g, '-')
      .replace(/:\s/g, '-')
      .replace(/\s-\s/g, '-')
      .replace(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/g, '')
      .replace(/\s/g, '_');
    const data = await getData(record.fields.title, record.fields.url, type);
    const publicUlr = await uploadToB2(data, `Bookmarks/${list}/${name}`);

    return {
      ...record,
      fields: {
        ...record.fields,
        archive: publicUlr,
      },
    };
    console.info('Record updated:', record.fields.title);
  } catch (error) {
    throw new Error(
      `Error uploading file for ${list} - ${record.fields.title}:`,
      error
    );
  }
};

export default addFiletoRecord;

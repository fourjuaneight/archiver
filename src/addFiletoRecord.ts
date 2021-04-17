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
 * @param {Record[]} records records to archive
 * @returns {Promise<Record[]>} updated record
 */
const addFiletoRecord = async (
  list: string,
  records: Record[]
): Promise<Record[]> => {
  const type: string = list.toLowerCase();
  const updatedRecords: any[] = [];

  for (let item of records) {
    try {
      const name: string = (item.fields.title as string).replace(' ', '_');
      const data = await getData(item.fields.url, type);
      const publicUlr = await uploadToB2(data, `Bookmarks/${list}/${name}`);

      updatedRecords.push({
        ...item,
        fields: {
          ...item.fields,
          file: publicUlr,
        },
      });
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  } catch (error) {
    throw new Error(
      `Error uploading file for ${list} - ${record.fields.title}:`,
      error
    );
  }

  return updatedRecords as Record[];
};

export default addFiletoRecord;

import chalk from 'chalk';
import uploadToB2 from './uploadContentB2';
import { getArticle, getMedia, getYTVid } from './getContent';
import { baseQueries } from './getBookmarks';
import { FileTypes, Record } from './types';

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
  const fileType: FileTypes = {
    articles: { file: 'html', mime: 'text/html' },
    comics: { file: 'html', mime: 'text/html' },
    podcasts: { file: 'mp3', mime: 'audio/mpeg' },
    videos: { file: 'mp4', mime: 'video/mp4' },
  };

  try {
    const name: string = record.fields.title
      .replace(/\.\s/g, '-')
      .replace(/,\s/g, '-')
      .replace(/\s::\s/g, '-')
      .replace(/\s:\s/g, '-')
      .replace(/:\s/g, '-')
      .replace(/\s-\s/g, '-')
      .replace(/\s–\s/g, '-')
      .replace(/\s—\s/g, '-')
      .replace(/[-|\\]+/g, '-')
      .replace(/\s&\s/g, 'and')
      .replace(/[!@#$%^*()+=\[\]{};'’:"”,\.<>\/?]+/g, '')
      .replace(/\s/g, '_')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    const data = await getData(record.fields.title, record.fields.url, type);
    const publicUlr = await uploadToB2(
      data,
      `Bookmarks/${list}/${name}.${fileType[type].file}`,
      fileType[type].mime
    );

    console.info(
      chalk.green('[SUCCESS]'),
      'Record updated:',
      record.fields.title
    );

    return {
      ...record,
      fields: {
        ...record.fields,
        archive: publicUlr,
      },
    };
  } catch (error) {
    throw new Error(
      `Uploading file for ${list} - ${record.fields.title}: \n ${error}`
    );
  }
};

export default addFiletoRecord;

import chalk from 'chalk';

import uploadToB2 from './uploadContentB2';
import { FileTypes, Record } from './types';
import { fileNameFmt, getData } from './util';

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
  const imgType: string =
    list === 'Comics'
      ? record.fields.url.replace(/^.*(png|jpg|jpeg|gif)$/g, '$1')
      : '';
  // docs: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
  const type: string = list.toLowerCase();
  const fileType: FileTypes = {
    articles: { file: 'md', mime: 'text/markdown' },
    comics: { file: imgType, mime: `image/${imgType}` },
    podcasts: { file: 'mp3', mime: 'audio/mpeg' },
    videos: { file: 'mp4', mime: 'video/mp4' },
  };

  try {
    const fileName = fileNameFmt(record.fields.title);
    const data = await getData(record.fields.title, record.fields.url, type);
    const publicUlr = await uploadToB2(
      data,
      `Bookmarks/${list}/${fileName}.${fileType[type].file}`,
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

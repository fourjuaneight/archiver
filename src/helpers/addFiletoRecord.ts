import { fileNameFmt } from '../util/fileNameFmt';
import { getContent } from './getContent';
import { uploadToB2 } from './uploadContentB2';

import { FileTypes, Record } from '../models/archive';

/**
 * Get Airtable bookmarks, archive media, then update record.
 * @function
 * @async
 *
 * @param {string} list database list
 * @param {Record} record record to archive
 * @returns {Record} updated record
 */
export const addFiletoRecord = async (
  list: string,
  record: Record
): Promise<Record> => {
  const imgType: string =
    list === 'Comics'
      ? record.fields.url.replace(/^.*(png|jpg|jpeg|webp|gif)$/g, '$1')
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
    const data = await getContent(record.fields.title, record.fields.url, type);
    const publicUlr = await uploadToB2(
      data,
      `Bookmarks/${list}/${fileName}.${fileType[type].file}`,
      fileType[type].mime
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

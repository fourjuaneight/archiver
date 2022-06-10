import { fileNameFmt } from '../util/fileNameFmt';
import { getContent } from './getContent';
import { uploadToB2 } from './uploadContentB2';

import { Fields, FileTypes } from '../models/archive';

/**
 * Get Hasura bookmarks, archive media, then update record.
 * @function
 * @async
 *
 * @param {string} list database list
 * @param {Fields} fields record to archive
 * @returns {Fields} updated record
 */
export const addFiletoRecord = async (
  list: string,
  fields: Fields
): Promise<Fields> => {
  const dataUrl = list === 'Reddits' ? (fields.content as string) : fields.url;
  const imgMatch = new RegExp(/^.*(png|jpg|jpeg|webp|gif)$/, 'ig');
  const imgType = dataUrl.replace(imgMatch, '$1');
  const isImg = dataUrl.match(imgMatch);

  // docs: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
  const type: string = list.toLowerCase();
  const fileType: FileTypes = {
    articles: { file: 'md', mime: 'text/markdown' },
    comics: { file: imgType, mime: `image/${imgType}` },
    podcasts: { file: 'mp3', mime: 'audio/mpeg' },
    reddits: {
      file: isImg ? imgType : 'mp4',
      mime: isImg ? `image/${imgType}` : 'video/mp4',
    },
    videos: { file: 'mp4', mime: 'video/mp4' },
  };

  try {
    const fileName = fileNameFmt(fields.title);
    const data = await getContent(fields.title, dataUrl, type);
    const publicUlr = await uploadToB2(
      data,
      `Bookmarks/${list}/${fileName}.${fileType[type].file}`,
      fileType[type].mime
    );

    return {
      ...fields,
      archive: publicUlr,
    };
  } catch (error) {
    throw new Error(`(addFiletoRecord) ${list} - ${fields.title}:\n${error}`);
  }
};

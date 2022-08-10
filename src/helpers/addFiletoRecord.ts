import { Fields, FileTypes } from '../models/archive';
import { fileNameFmt } from '../util/fileNameFmt';
import { getContent } from './getContent';
import { uploadToB2 } from './uploadContentB2';

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
  const type: string = list.toLowerCase();
  const isReddit = list === 'Reddits';
  const dataUrl = isReddit ? (fields.content as string) : fields.url;
  const imgMatch = new RegExp(/^.*(png|jpg|jpeg|webp|gif)$/, 'ig');
  const vidMatch = new RegExp(/^.*(mp4|mov)$/, 'ig');
  const isImg = dataUrl.match(imgMatch);
  const isVid = dataUrl.match(vidMatch);
  let mediaType: string | null = null;

  // find media type
  switch (true) {
    case Boolean(isImg):
      mediaType = dataUrl.replace(imgMatch, '$1');
      break;
    case Boolean(isVid):
      mediaType = dataUrl.replace(vidMatch, '$1');
      break;
    default:
      break;
  }

  // docs: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
  const fileType: FileTypes = {
    articles: { file: 'md', mime: 'text/markdown' },
    comics: { file: mediaType, mime: `image/${mediaType}` },
    podcasts: { file: 'mp3', mime: 'audio/mpeg' },
    reddits: {
      file: mediaType,
      mime: `${isImg ? 'image' : 'video'}/${mediaType}`,
    },
    videos: { file: 'mp4', mime: 'video/mp4' },
  };

  try {
    if (isReddit && !mediaType) {
      return {
        ...fields,
        archive: '',
      };
    }

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

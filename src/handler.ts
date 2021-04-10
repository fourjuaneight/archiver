import uploadToB2 from './uploadContentB2';
import { getArticle, getMedia, getYTVid } from './getContent';
import { CFReqBody } from './types';

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
    case type === 'article':
      return getArticle(url);
    case type === 'video':
      return getYTVid(url);
    default:
      return getMedia(url);
  }
};

/**
 * Get and upload media data to B2.
 * @function
 *
 * @param request request data
 * @returns {Promise<Response>} operation response
 */
const handler = async (request: Request): Promise<Response> => {
  const eventBody: CFReqBody = request.body;

  try {
    const data = await getData(eventBody.url, eventBody.type);
    const publicUlr = await uploadToB2(
      data,
      `Bookmarks/${eventBody.base}/${eventBody.name}`
    );

    return new Response(
      { url: publicUlr },
      {
        headers: {
          'content-type': 'application/json;charset=UTF-8',
        },
      }
    );
  } catch (error) {
    console.error(error);

    return new Response(
      { error },
      {
        headers: {
          'content-type': 'application/json;charset=UTF-8',
        },
      }
    );
  }
};

export default handler;

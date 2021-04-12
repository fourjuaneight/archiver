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
 * docs: https://developers.cloudflare.com/workers/get-started/guide#5-write-code
 * @function
 *
 * @param request request data
 * @returns {Promise<Response>} operation response
 */
const handler = async (request: Request): Promise<Response> => {
  const eventBody: CFReqBody = await request.json();

  try {
    const data = await getData(eventBody.url, eventBody.type);
    const publicUlr = await uploadToB2(
      data,
      `Bookmarks/${eventBody.base}/${eventBody.name}`
    );
    const json = JSON.stringify({ url: publicUlr }, null, 2);

    return new Response(json, {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    });
  } catch (error) {
    const json = JSON.stringify({ error }, null, 2);
    console.error(error);

    return new Response(json, {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    });
  }
};

export default handler;

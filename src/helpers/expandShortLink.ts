import fetch from 'isomorphic-fetch';

import logger from '../util/logger';

/**
 * Expand shortend URLs.
 * @function
 * @async
 *
 * @param {string} url shortned url string
 * @returns {string} expanded URL
 */
const expandLinks = async (url: string): Promise<string> => {
  try {
    const response: Response = await fetch(url);

    if (response.status !== 200 || !response.url) {
      logger.info(
        `[expandShortLink] [expandLinks] [${url}]: Unable to expand.`,
        {
          code: response.status,
          type: response.type,
          text: response.statusText,
        }
      );

      return url;
    }

    return response.url;
  } catch (error) {
    logger.error(`[expandLinks] [${url}]: ${error}`);

    return url;
  }
};

/**
 * Get expanded URLs.
 * @function
 * @async
 *
 * @param {string} str string to replace
 * @param {RegExp} regex pattern to match
 * @returns {string} list of expanded URLs from str
 */
export const expandShortLink = async (
  str: string,
  regex: RegExp
): Promise<string> => {
  const promises: Promise<string>[] = [];
  const pattern = new RegExp(regex);

  // eslint-disable-next-line no-unused-vars
  str.replace(pattern, (match, ...args) => {
    const promise = expandLinks(match);
    promises.push(promise);

    return match;
  });

  const data: string[] = await Promise.all(promises);
  const replacer = () => data.shift() ?? '';

  return str.replace(regex, replacer);
};

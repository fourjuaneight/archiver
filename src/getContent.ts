import fetch from 'node-fetch';
import ytdl from 'ytdl-core';
import TurndownService from 'turndown';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { Readable } from 'stream';

const turndownService = new TurndownService();

/**
 * Get Markdown version of article from url.
 * @function
 *
 * @param {string} url article url
 * @returns {Promise<Buffer>} markdown article
 */
export const getArticle = async (url: string): Promise<Buffer> => {
  // get doc
  const response = await fetch(url);
  const data = await response.text();
  // generate article
  const doc = new JSDOM(data, { url });
  const reader = new Readability(doc.window.document);
  const article = reader.parse();
  // convert to MD
  const markdown = turndownService.turndown(article?.content ?? '');
  // convert to buffer
  const buffer = Buffer.from(markdown, 'utf8');

  return buffer;
};

/**
 * Get media file from source url.
 * @function
 *
 * @param {string} url file url
 * @returns {Promise<Buffer>} file buffer
 */
export const getMedia = async (url: string): Promise<Buffer> => {
  // get file
  const response = await fetch(url);
  const data = await response.buffer();

  return data;
};

/**
 * Get YouTube file from url.
 * @function
 *
 * @param {string} url video link
 * @returns {Promise<Buffer>} file buffer
 */
export const getYTVid = async (url: string): Promise<Buffer> => {
  /**
   * Create buffer from readable stream.
   * @function
   *
   * @param {Readable} stream
   * @returns {Promise<Buffer>} video buffer
   */
  const createBuffer = async (stream: Readable): Promise<Buffer> => {
    const chunks = [];

    for await (let chunk of stream) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  };
  // get file
  const data = ytdl(url);
  // convert to buffer
  const buffer = await createBuffer(data);

  return buffer;
};

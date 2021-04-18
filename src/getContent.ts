import chalk from 'chalk';
import fetch from 'isomorphic-fetch';
import ytdl from 'ytdl-core';
import TurndownService from 'turndown';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

import { createBuffer } from './util';

const turndownService = new TurndownService();

/**
 * Get Markdown version of article from url.
 * @function
 *
 * @param {string} name article name
 * @param {string} url article url
 * @returns {Promise<Buffer>} markdown article
 */
export const getArticle = async (
  name: string,
  url: string
): Promise<Buffer> => {
  console.info(chalk.yellow('[INFO]'), `Downloading '${name}' archive file.`);

  try {
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
  } catch (error) {
    throw new Error(`Getting article for ${name}: \n ${error}`);
  }
};

/**
 * Get media file from source url.
 * @function
 *
 * @param {string} name file name
 * @param {string} url file url
 * @returns {Promise<Buffer>} file buffer
 */
export const getMedia = async (name: string, url: string): Promise<Buffer> => {
  console.info(chalk.yellow('[INFO]'), `Downloading '${name}' archive file.`);

  try {
    // get file
    const response = await fetch(url);
    const data = await response.arrayBuffer();

    return Buffer.from(data);
  } catch (error) {
    throw new Error(`Getting media for ${name}: \n ${error}`);
  }
};

/**
 * Get YouTube file from url.
 * @function
 *
 * @param {string} name video name
 * @param {string} url video url
 * @returns {Promise<Buffer>} file buffer
 */
export const getYTVid = async (name: string, url: string): Promise<Buffer> => {
  console.info(chalk.yellow('[INFO]'), `Downloading '${name}' archive file.`);

  try {
    // get file
    const data = ytdl(url);
    // convert to buffer
    const buffer = await createBuffer(data);

    return buffer;
  } catch (error) {
    throw new Error(`Getting video for ${name}: \n ${error}`);
  }
};

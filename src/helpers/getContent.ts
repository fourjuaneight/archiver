import { Readability } from '@mozilla/readability';
import { readFileSync } from 'fs';
import fetch from 'isomorphic-fetch';
import { JSDOM, VirtualConsole } from 'jsdom';
import TurndownService from 'turndown';

import { deleteFiles } from '../util/deleteFile';
import { fileNameFmt } from '../util/fileNameFmt';
import { ytdl } from '../util/ytdl';

const turndownService = new TurndownService();

/**
 * Get Markdown version of article from url.
 * @function
 * @async
 *
 * @param {string} name article name
 * @param {string} url article url
 * @returns {Buffer} markdown article
 */
export const getArticle = async (
  name: string,
  url: string
): Promise<Buffer> => {
  const virtualConsole = new VirtualConsole();
  virtualConsole.sendTo(console, { omitJSDOMErrors: true });

  const removeEls = (doc: Document, selectors: string[]) => {
    selectors.forEach(selector => {
      const els = doc.querySelectorAll(selector);

      if (els.length > 0) {
        els.forEach(el => {
          el.remove();
        });
      }
    });

    return doc;
  };

  try {
    // get doc
    const response = await fetch(url);
    const data = await response.text();
    // generate article
    const dom = new JSDOM(data, {
      pretendToBeVisual: true,
      runScripts: 'dangerously',
      url,
      virtualConsole,
    });
    const { document } = dom.window;
    // remove element
    const cleanDoc = removeEls(document, [
      // WIRED
      'div.newsletter-subscribe-form',
      "div[class^='RecircMostPopularContiner']",
      'div[data-attr-viewport-monitor]',
      "div[class^='NewsletterSubscribeFormWrapper']",
      'div[data-testid="NewsletterSubscribeFormWrapper"]',
      "div[class^='GenericCalloutWrapper']",
      'div[data-testid="GenericCallout"]',
      "aside[class^='Sidebar']",
      'aside[data-testid="SidebarEmbed"]',
      "div[class^='ContributorsWrapper']",
      'div[data-testid="Contributors"]',
      // The Atlantic
      "p[class^='ArticleRelatedContentLink']",
      "div[class^='ArticleRelatedContentModule']",
      "div[class^='ArticleBooksModule']",
      // Ars Technica
      'div.gallery',
      'div.story-sidebar',
    ]);

    // add document to Readability
    const reader = new Readability(cleanDoc);
    const article = reader.parse();
    const toDom = new JSDOM(article?.content as string);
    const { document: newDom } = toDom.window;

    // cleanup article
    turndownService.remove(['figure', 'img', 'picture', 'video', 'iframe']);

    // convert to MD
    const markdown = turndownService.turndown(newDom);
    let cleanMD = markdown.replace(/([‘’]+)/g, `'`).replace(/([“”]+)/g, `"`);

    if (url.includes('wired')) {
      cleanMD = cleanMD.replace(/\n\*\s\*\s\*.*/gs, '');
    }

    const finalMD = `# ${name}\n\n${cleanMD}`;
    // convert to buffer
    // const buffer = Buffer.from(finalMD, 'utf8');

    return finalMD;
  } catch (error) {
    throw new Error(`[getArticle][${name}]: ${error}`);
  }
};

/**
 * Get media file from source url.
 * @function
 * @async
 *
 * @param {string} name file name
 * @param {string} url file url
 * @returns {Buffer} file buffer
 */
export const getMedia = async (name: string, url: string): Promise<Buffer> => {
  try {
    // get file
    const response = await fetch(url);
    const data = await response.arrayBuffer();

    return Buffer.from(data);
  } catch (error) {
    throw new Error(`[getMedia][${name}]: ${error}`);
  }
};

/**
 * Get YouTube file from url.
 * @function
 * @async
 *
 * @param {string} name video name
 * @param {string} url video url
 * @returns {Buffer} file buffer
 */
export const getYTVid = async (name: string, url: string): Promise<Buffer> => {
  const fileName = fileNameFmt(name);
  const filePath = `output-${fileName}.mp4`;

  try {
    // get media
    await ytdl(url, filePath);

    // get buffer from saved file
    const buffer = readFileSync(filePath);

    // cleanup temp files
    await deleteFiles([filePath]);

    return buffer;
  } catch (error) {
    throw new Error(`[getYTVid][${name}]: ${error}`);
  }
};

/**
 * Determine media type and get buffer data.
 * @function
 * @async
 *
 * @param {string} title media name
 * @param {string} url media endpoint
 * @param {string} type media type
 * @returns {Buffer} media buffer
 */
export const getContent = async (
  name: string,
  url: string,
  type: string
): Promise<Buffer> => {
  switch (true) {
    case type === 'articles':
      return getArticle(name, url);
    case type === 'videos':
      return getYTVid(name, url);
    default:
      return getMedia(name, url);
  }
};

import fetch from 'isomorphic-fetch';
import ytdl from 'ytdl-core';
import TurndownService from 'turndown';
import { JSDOM, VirtualConsole } from 'jsdom';
import { Readability } from '@mozilla/readability';

import { bufferToFile } from '../util/bufferToFile';
import { deleteFiles } from '../util/deleteFile';
import { fileNameFmt } from '../util/fileNameFmt';
import { muxAVfiles } from '../util/muxAVfiles';
import { streamToBuffer } from '../util/streamToBuffer';

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
          doc.parentNode?.removeChild(el);
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
      "div[class^='NewsletterSubscribeFormWrapper']",
      "div[class^='GenericCalloutWrapper']",
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

    // cleanup article
    turndownService.remove(['figure', 'img', 'picture', 'video', 'iframe']);

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
    throw new Error(`Getting media for ${name}: \n ${error}`);
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
  const filePaths = {
    audio: `audio-${fileName}.mp4`,
    video: `video-${fileName}.mp4`,
    output: `output-${fileName}.mp4`,
  };

  try {
    // get media
    const audio = ytdl(url, {
      filter: 'audioonly',
      quality: 'highestaudio',
    });
    const video = ytdl(url, {
      filter: 'videoonly',
      quality: 'highestvideo',
    });
    // convert to buffers
    const audioBuffer = await streamToBuffer(audio);
    const videoBuffer = await streamToBuffer(video);

    // save as files
    await bufferToFile(audioBuffer, `audio-${fileName}.mp4`);
    await bufferToFile(videoBuffer, `video-${fileName}.mp4`);

    // combine files
    const buffer = await muxAVfiles(
      filePaths.audio,
      filePaths.video,
      filePaths.output
    );

    // cleanup temp files
    await deleteFiles([filePaths.audio, filePaths.video, filePaths.output]);

    return buffer;
  } catch (error) {
    throw new Error(`Getting video for '${name}': \n ${error}`);
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

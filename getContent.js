import fetch from "node-fetch";
import ytdl from "ytdl-core";
import TurndownService from "turndown";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

const turndownService = new TurndownService();

/**
 * Get Markdown version of article from url.
 * @function
 *
 * @param {string} url article url
 * @returns {Buffer} markdown article
 */
export const getArticle = async (url) => {
  // get doc
  const response = await fetch(url);
  const data = await response.text();
  // generate article
  const doc = new JSDOM(data, { url });
  const reader = new Readability(doc.window.document);
  const article = reader.parse();
  // convert to MD
  const markdown = turndownService.turndown(article.content);
  // convert to buffer
  const buffer = Buffer.from(markdown, "utf8");

  return buffer;
};

/**
 * Get media file from source url.
 * @function
 *
 * @param {string} url file url
 * @returns {Buffer} file buffer
 */
export const getMedia = async (url) => {
  // get file
  const response = await fetch(url);
  const data = await response.blob();
  // convert to buffer
  const arrayBuffer = await data.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer, "binary");

  return buffer;
};

/**
 * Get YouTube file from url.
 * @function
 *
 * @param {string} url video link
 * @returns {Buffer} file buffer
 */
export const getYTVid = async (url) => {
  /**
   * Create buffer from readable stream.
   * @function
   * 
   * @param {ReadableStream} stream 
   * @returns {Buffer} video buffer
   */
  const createBuffer = async (stream) => {
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

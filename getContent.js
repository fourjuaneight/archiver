const fetch = require("node-fetch");
const TurndownService = require("turndown");
const { JSDOM } = require("jsdom");
const { Readability } = require("@mozilla/readability");

const turndownService = new TurndownService();

/**
 * Get Markdown version of article from url.
 * @function
 *
 * @param {string} url article url
 * @returns {Buffer} markdown article
 */
const getArticle = async (url) => {
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
const getMedia = async (url) => {
  // get file
  const response = await fetch(url);
  const data = await response.blob();
  // convert to buffer
  const arrayBuffer = await data.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer, "binary");

  return buffer;
};

exports.getArticle = getArticle;
exports.getMedia = getMedia;

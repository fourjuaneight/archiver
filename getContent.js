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
  const buffer = new Buffer(markdown, "utf8");

  return buffer;
};

/**
 * Get image file from comic url.
 * @function
 *
 * @param {string} url comic url
 * @returns {Buffer} file buffer
 */
const getImage = async (url) => {
  const response = await fetch(url);
  const data = await response.blob();
  const buffer = new Buffer(data, "binary");

  return buffer;
};

exports.getArticle = getArticle;
exports.getImage = getImage;

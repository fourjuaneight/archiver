// Match unicode and convert to emoji code
const range = new RegExp(
  /[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}\u{200d}]/gu
);

/**
 * Get the unicode code of an emoji in base 16.
 * @function
 *
 * @param {string} emojiString the string containing emoji characters
 * @returns {string} the unicode code
 */
const convertEmoji = (emojiString: string): string => {
  let comp: string | number;

  if (emojiString.length === 1) {
    comp = emojiString.charCodeAt(0);
  }

  comp =
    (emojiString.charCodeAt(0) - 0xd800) * 0x400 +
    (emojiString.charCodeAt(1) - 0xdc00) +
    0x10000;

  if (comp < 0) {
    comp = emojiString.charCodeAt(0);
  }

  // get the unicode code of an emoji in base 16
  comp = `U+${comp.toString(16)}`;

  return comp;
};

/**
 * Takes a string and replaces unicode
 * @function
 *
 * @param {string} tweet tweet string with emojies
 * @return {string} tweet with unicode emojies
 */
const emojiUnicode = (tweet: string): string =>
  tweet.replace(range, (p1: string) => `${convertEmoji(p1)}`);

export default emojiUnicode;

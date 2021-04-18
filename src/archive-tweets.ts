import chalk from 'chalk';

import latest from './helpers/latestTweets';
import uploadTweets from './helpers/uploadTweets';

import { LatestTweetFmt } from './models/twitter';

// Upload latest tweets to Airtable base.
(async () => {
  try {
    // get formatted tweets
    const tweets: LatestTweetFmt[] | null = await latest();

    // upload each individually
    if (tweets && tweets.length > 0) {
      for (const tweet of tweets) {
        try {
          const upload = await uploadTweets(tweet);

          // post Airtable ID to console when uploaded
          console.info(chalk.green('[SUCCESS]'), `Tweet uploaded: ${upload}.`);
        } catch (error) {
          console.error(chalk.red('[ERROR]'), error);
          throw new Error(error);
        }
      }
    } else {
      console.info(chalk.yellow('[INFO]'), 'No new tweets to upload.');
    }
  } catch (error) {
    console.error(chalk.red('[ERROR]'), error);
    throw new Error(error);
  }
})();

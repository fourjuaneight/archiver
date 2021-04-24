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
      const tweetsBackup = tweets.map(tweet => uploadTweets(tweet));

      await Promise.all(tweetsBackup);
    } else {
      console.info(chalk.yellow('[INFO]'), 'No new tweets to upload.');
    }
  } catch (error) {
    console.error(chalk.red('[ERROR]'), error);
    process.exit(1);
  }
})();

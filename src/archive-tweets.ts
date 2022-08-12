import { insertHasuraData, queryHasuraTweets } from './helpers/hasuraData';
import { latest } from './helpers/twitterData';
import { LatestTweetFmt } from './models/twitter';
import logger from './util/logger';

// Upload latest tweets to Hasura table.
(async () => {
  try {
    // get formatted tweets
    const tweets: LatestTweetFmt[] | null = await latest();
    const archivedTweets = await queryHasuraTweets();
    const tweetsToArchive = tweets
      ? tweets.filter(
          tweet =>
            !archivedTweets.find(
              archivedTweet => archivedTweet.url === tweet.url
            )
        )
      : [];

    // upload each individually
    if (tweetsToArchive.length > 0) {
      await insertHasuraData('media_tweets', tweetsToArchive);
    } else {
      logger.info('[archive-tweets]: No new tweets to upload.');
    }
  } catch (error) {
    logger.error(`[archive-tweets] ${error}`);
    process.exit(1);
  }
})();

import chalk from 'chalk';

import { feed } from './helpers/twitterData';
import { insertHasuraData, queryHasuraTwitterFeed } from './helpers/hasuraData';

(async () => {
  try {
    // get formatted twitter feed
    const twitterFeed = await feed();
    const archivedTwitterFeed = await queryHasuraTwitterFeed();
    const twitterFeedToArchive = twitterFeed
      ? twitterFeed.filter(
          newItem =>
            !archivedTwitterFeed.find(
              exItem => exItem.username === newItem.username
            )
        )
      : [];

    // upload each individually
    if (twitterFeedToArchive.length > 0) {
      await insertHasuraData('feeds_twitter', twitterFeedToArchive);
    } else {
      console.info(
        chalk.yellow('[INFO]'),
        'No new Twitter accounts to upload.'
      );
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();

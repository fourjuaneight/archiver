import chalk from 'chalk';
import fetch from 'isomorphic-fetch';

import { queryHasuraBookmarks, updateHasuraData } from './helpers/hasuraData';

import { Fields } from './models/archive';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

// check for dead links
const deadLinks = async (url: string): Promise<boolean> => {
  try {
    const response: Response = await fetch(url);

    if (response.status === 404) {
      return true;
    }

    return false;
  } catch (error) {
    console.error(chalk.red('[ERROR]'), `(deadLinks) - '${url}':\n${error}`);

    return true;
  }
};

const updateRecords = async (
  category: string,
  fields: Fields[]
): Promise<void> => {
  try {
    const checked = fields.map(async field => {
      const { url, ...rest } = field;
      const isDead = await deadLinks(url);

      return {
        ...rest,
        url,
        dead: isDead,
      };
    });
    const updated = await Promise.all(checked);
    const deadFound = updated.filter(({ dead }) => dead);

    if (deadFound.length > 0) {
      console.info(
        chalk.yellow('[INFO]'),
        `${deadFound.length} dead links found in ${category}`,
        deadFound.map(({ url }) => url)
      );

      const operations = deadFound.map(({ dead, id }) =>
        updateHasuraData(`bookmarks_${category}`, id as string, { dead })
      );

      await Promise.all(operations);
    } else {
      console.info(
        chalk.yellow('[INFO]'),
        `No dead links found in ${category}`
      );
    }
  } catch (error) {
    throw new Error(`(updateRecords) ${category}:\n${error}`);
  }
};

(async () => {
  try {
    const records = await queryHasuraBookmarks();

    await updateRecords('articles', records.articles);
    await updateRecords('comics', records.comics);
    await updateRecords('podcasts', records.podcasts);
    await updateRecords('reddits', records.reddits);
    await updateRecords('tweets', records.tweets);
    await updateRecords('videos', records.videos);

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();

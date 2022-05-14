import chalk from 'chalk';
import fetch from 'isomorphic-fetch';

import { queryHasuraBookmarks, updateHasuraData } from './helpers/hasuraData';

import { Fields } from './models/archive';

// check for dead links
const deadLinks = async (url: string): Promise<boolean> => {
  try {
    const response: Response = await fetch(url);

    if (response.status === 404) {
      return true;
    }

    return false;
  } catch (error) {
    console.error(
      chalk.red('[ERROR]'),
      `Testing dead link for '${url}': \n ${error}`
    );

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
    const deadFound = updated.filter(record => record.fields.status === 'dead');

    if (deadFound.length > 0) {
      console.info(
        chalk.yellow('[INFO]'),
        `${deadFound.length} dead links found in ${category}`,
        deadFound.map(record => record.fields.url)
      );

      const operations = updated.map(({ dead, id }) =>
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
    throw new Error(`Updating Bookmarks for ${category}: \n ${error}`);
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
  } catch (error) {
    console.error(chalk.red('[ERROR]'), error);
    process.exit(1);
  }
})();

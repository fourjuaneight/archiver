import chalk from 'chalk';
import fetch from 'isomorphic-fetch';

import { getRecords, updateBookmarks } from './helpers/getBookmarks';
import { FieldStatus, Record } from './models/archive';

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
  records: Record[]
): Promise<void> => {
  try {
    const checked = records.map(async record => {
      const { url, ...rest } = record.fields;
      const isDead = await deadLinks(url);

      return {
        ...record,
        fields: {
          ...rest,
          url,
          status: (isDead ? 'dead' : 'alive') as FieldStatus,
        },
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

      await updateBookmarks(category, updated as Record[]);
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
    const records = await getRecords();

    await updateRecords('Articles', records.Articles);
    await updateRecords('Comics', records.Comics);
    await updateRecords('Podcasts', records.Podcasts);
    await updateRecords('Reddits', records.Reddits);
    await updateRecords('Tweets', records.Tweets);
    await updateRecords('Videos', records.Videos);
  } catch (error) {
    console.error(chalk.red('[ERROR]'), error);
    process.exit(1);
  }
})();
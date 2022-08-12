/* eslint-disable no-underscore-dangle */
import { promises } from 'fs';

import logger from './util/logger';

const { readFile, writeFile } = promises;

interface Album {
  _allowSync: string;
  _librarySectionID: string;
  _librarySectionTitle: string;
  _librarySectionUUID: string;
  _ratingKey: string;
  _key: string;
  _parentRatingKey: string;
  _guid: string;
  _parentGuid: string;
  _studio: string;
  _type: string;
  _title: string;
  _titleSort: string;
  _parentKey: string;
  _parentTitle: string;
  _summary: string;
  _index: string;
  _rating: string;
  _skipCount: string;
  _year: string;
  _thumb: string;
  _art: string;
  _parentThumb: string;
  _originallyAvailableAt: string;
  _leafCount: string;
  _addedAt: string;
  _updatedAt: string;
  _loudnessAnalysisVersion: string;
  Genre: {
    _tag: string;
  }[];
  Director: {
    _tag: string;
  }[];
}

interface Track {
  Media: {
    Part: {
      _id: string;
      _key: string;
      _duration: string;
      _file: string;
      _size: string;
      _container: string;
      _hasThumbnail: string;
    };
    _id: string;
    _duration: string;
    _bitrate: string;
    _audioChannels: string;
    _audioCodec: string;
    _container: string;
  };
  _ratingKey: string;
  _key: string;
  _parentRatingKey: string;
  _grandparentRatingKey: string;
  _guid: string;
  _parentGuid: string;
  _grandparentGuid: string;
  _type: string;
  _title: string;
  _grandparentKey: string;
  _parentKey: string;
  _grandparentTitle: string;
  _parentTitle: string;
  _summary: string;
  _index: string;
  _parentIndex: string;
  _ratingCount: string;
  _userRating: string;
  _viewCount: string;
  _skipCount: string;
  _lastViewedAt: string;
  _lastRatedAt: string;
  _parentYear: string;
  _thumb: string;
  _parentThumb: string;
  _grandparentThumb: string;
  _duration: string;
  _addedAt: string;
  _updatedAt: string;
}

interface Music {
  title: string;
  artist: string;
  album: string;
  genre: string;
  year: string;
}

const data = async () => {
  try {
    const tracks = await readFile('./tracks.json', 'utf8');
    const albums = await readFile('./albums.json', 'utf8');
    const tracksList: Track[] = JSON.parse(tracks).MediaContainer.Track;
    const albumsList: Album[] = JSON.parse(albums).MediaContainer.Directory;
    const music: Music[] = tracksList.map(item => {
      const albumGenre = albumsList.find(
        album => album._guid === item._parentGuid
      )?.Genre?.[0]?._tag;

      return {
        title: item._title,
        artist: item._grandparentTitle,
        album: item._parentTitle,
        genre: albumGenre ?? '',
        year: item._parentYear,
      };
    });

    return music;
  } catch (error) {
    throw new Error(`[data]: ${error}`);
  }
};

(async () => {
  try {
    const music = await data();
    const json = JSON.stringify(music, null, 2);

    await writeFile('./music.json', json);
  } catch (error) {
    logger.error(`[archive-plex-music] ${error}`);
    process.exit(1);
  }
})();

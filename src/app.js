import express from 'express';
import axios from 'axios';
import db from './db';
import { saveData, handler, converter, notFound } from './utils';

const app = express();

// routes
// I could've made a folder for the routes but
// it's too simple so I like to keep it like that :)

app.get('/', (req, res) => {
  const info = {
    apiName: 'Lemonlabs interview task',
    routes: [
      {
        url: '/api/hashtag?hashtag=name',
        description: 'Trigger the fetching work',
      },
      {
        url: '/api/hashtags/:hashtag',
        description: 'Show results saved for a hashtag',
      },
      {
        url: '/api/tweets/:hashtag',
        description: 'List all tweets in this hashtag',
      },
    ],
  };

  return res.json({ info });
});

app.get('/api/hashtag', async (req, res, next) => {
  try {
    const { hashtag } = req.query;
    // if the user didn't supplay a hashtag
    if (!hashtag) {
      return res.status(400).json('Please provide a twitter hashtag!');
    }

    // check if hashtag was searched before
    const tweets = await db.findTweetsByHashtag(hashtag);
    const hashtagUrl = `/api/hashtags/${hashtag}`;
    if (tweets.length > 0) {
      return res.json(`hashtag exsists on ${hashtagUrl}`);
    }

    const query = `%23${hashtag}&result_type=mixed`;
    const response = await axios.get(
      `https://api.twitter.com/1.1/search/tweets.json?q=${query}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TWITTER_API_TOKEN}`,
        },
      },
    );
    await saveData(response.data.statuses, hashtag);
    return res.json(`Done! and it's on ${hashtagUrl}`);
  } catch (error) {
    return next(error);
  }
});

app.get('/api/hashtags/:hashtag', async (req, res, next) => {
  try {
    const { hashtag } = req.params;
    const topTweets = await db.getTopFiveTweets(hashtag);
    const topFollowed = await db.getTopFiveFollowed(hashtag);
    const topMentioned = await db.getTopFiveMentioned(hashtag);
    return res.json({ topTweets, topFollowed, topMentioned });
  } catch (error) {
    return next(error);
  }
});

app.get('/api/tweets/:hashtag', async (req, res, next) => {
  try {
    const { hashtag } = req.params;
    const tweets = await db.findTweetsByHashtag(hashtag);
    return res.json({ tweets });
  } catch (error) {
    return next(error);
  }
});

app.use(converter);
app.use(handler);
app.use(notFound);

export default app;

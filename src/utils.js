import axios from 'axios';
import db from './db';

const getUser = async (twitterId, screenName) => {
  console.log(process.env.TWITTER_API_TOKEN);
  const response = await axios.get(
    `https://api.twitter.com/1.1/users/show.json?user_id=${twitterId}&screen_name=${screenName}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TWITTER_API_TOKEN}`,
      },
    },
  );
  return response.data;
};

export const saveData = async (tweets, hashtag) => {
  /* eslint-disable no-restricted-syntax */
  /* eslint-disable no-await-in-loop */
  try {
    for (const tweet of tweets) {
      console.log(tweet);
      await db.query(
        `INSERT INTO tweets
      (username, user_followers_count, retweets_count, tweet_id, hashtag)
      VALUES (?,?,?,?,?)`,
        [
          tweet.user.screen_name,
          tweet.user.followers_count,
          tweet.retweet_count,
          tweet.id,
          hashtag,
        ],
      );
    }

    for (const tweet of tweets) {
      const mentions = tweet.entities.user_mentions;
      for (const mention of mentions) {
        const user = await getUser(mention.id, mention.screen_name);
        console.log('mention: ', mention);
        console.log('user: ', user);
        await db.query(
          `INSERT INTO user_mentions
      (username, twitter_id, hashtag, followers_count)
      VALUES (?,?,?,?)`,
          [user.screen_name, user.id, hashtag, user.followers_count],
        );
      }
    }
  } catch (error) {
    throw new Error(error);
  }
};
export const handler = (err, req, res, next) => {
  const response = {
    code: err.status,
    message: err.message,
    errors: err.errors,
    type: err.type,
    stack: err.stack,
  };

  res.status(err.status || 500);
  return res.json(response);
};

export const converter = (err, req, res, next) => {
  let convertedError = err;
  if (err.sql) {
    convertedError.status = 500;
    convertedError.type = 'Database error';
  } else {
    convertedError.status = 500;
    convertedError.type = 'Operation error';
  }
  return handler(convertedError, req, res);
};

export const notFound = (req, res) => {
  const error = {};
  error.status = 404;
  error.message = 'Not found';
  error.type = 'Resource error';
  return handler(error, req, res);
};

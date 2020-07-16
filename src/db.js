import mysql from 'mysql';

const { env } = process;

class Database {
  constructor() {
    this.connection = mysql.createConnection({
      host: env.DB_HOST,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
    });

    this.connection.connect((err) => {
      if (err) {
        console.error(`error connecting: ${err}`);
        return;
      }
      console.log('connected to the db');
      this.init();
    });
  }

  init() {
    const tweets = `
    CREATE TABLE if not exists tweets(
    id INT AUTO_INCREMENT PRIMARY KEY, 
    username VARCHAR(255) NOT NULL, 
    user_followers_count INT NOT NULL, 
    retweets_count INT NOT NULL,
    tweet_id BIGINT NOT NULL,
    hashtag VARCHAR(255) NOT NULL
  );
    `;
    const mentions = `
     CREATE TABLE if not exists user_mentions(
    id INT AUTO_INCREMENT PRIMARY KEY, 
    username VARCHAR(255) NOT NULL,
    twitter_id BIGINT NOT NULL,
    hashtag VARCHAR(255) NOT NULL,
    followers_count INT NOT NULL
  );
   `;

    this.connection.query(tweets, (err, row) => {
      if (err) throw new Error(err);
      console.log('Tweets table was iniliazed');
    });
    this.connection.query(mentions, (err, row) => {
      if (err) throw new Error(err);
      console.log('User mentions table was iniliazed');
    });
  }

  query(sql, args) {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, args, (err, rows) => {
        if (err) return reject(err);
        return resolve(rows);
      });
    });
  }

  findTweetsByHashtag(hashtag) {
    return new Promise((resolve, reject) => {
      this.connection.query(
        'SELECT * FROM `tweets` WHERE `hashtag`= ?',
        [hashtag],
        (err, rows) => {
          if (err) return reject(err);
          return resolve(rows);
        },
      );
    });
  }

  getTopFiveTweets(hashtag) {
    return new Promise((resolve, reject) => {
      this.connection.query(
        'SELECT * FROM `tweets` WHERE `hashtag`= ? ORDER BY retweets_count DESC LIMIT 5;',
        [hashtag],
        (err, rows) => {
          if (err) return reject(err);
          return resolve(rows);
        },
      );
    });
  }

  getTopFiveFollowed(hashtag) {
    return new Promise((resolve, reject) => {
      this.connection.query(
        'SELECT username, user_followers_count FROM `tweets` WHERE `hashtag`= ? ORDER BY user_followers_count DESC LIMIT 5;',
        [hashtag],
        (err, rows) => {
          if (err) return reject(err);
          return resolve(rows);
        },
      );
    });
  }

  getTopFiveMentioned(hashtag) {
    return new Promise((resolve, reject) => {
      this.connection.query(
        'SELECT username, followers_count, twitter_id FROM `user_mentions` WHERE `hashtag`= ? ORDER BY followers_count DESC LIMIT 5;',
        [hashtag],
        (err, rows) => {
          if (err) return reject(err);
          return resolve(rows);
        },
      );
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.connection.end((err) => {
        if (err) return reject(err);
        return resolve();
      });
    });
  }
}

export default new Database();

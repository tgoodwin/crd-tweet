import { useState, useContext } from 'react';
import { useQuery } from '@vlcn.io/react';
import { Ctx } from './ctx';
import { nanoid } from "nanoid";

import { SessionContext } from './App';

export type Tweet = {
  id: string;
  user_id: string;
  text: string;
  created_at: string;
  username: string;
};

type TimelineView = "all" | "following";

const Tweets = ({ ctx }: { ctx: Ctx; }) => {
  const userId = useContext(SessionContext);
  const [ newText, setNewText ] = useState("");

  const [ view, setView ] = useState<TimelineView>("all");

  const submitTweet = (userId: string) => {
    const date = new Date();
    ctx.db.exec("INSERT INTO tweets VALUES (?, ?, ?, ?)", [
      nanoid(),
      userId,
      newText.trim(),
      date.toISOString()
    ]);
    setNewText("");
  };

  const deleteTweet = (tweetId: string) => {
    ctx.db.exec("DELETE FROM tweets WHERE id = ?", [ tweetId ]);
  };

  const createFollow = (userId: string, followerId: string) => {
    ctx.db.exec("INSERT OR REPLACE INTO follows VALUES (?, ?, ?, 0)", [ nanoid(), userId, followerId ]);
  };

  const removeFollow = (userId: string, followerId: string) => {
    ctx.db.exec("UPDATE follows SET is_deleted=1 WHERE user_id = ? and follower_id = ?", [ userId, followerId ]);
  };

  const likeTweet = (userId: string, tweetId: string) => {
    ctx.db.exec("INSERT OR REPLACE INTO likes VALUES (?, ?, ?, ?)", [nanoid(), userId, tweetId, 0]);
  }

  const unlikeTweet = (userId: string, tweetId: string) => {
    ctx.db.exec("UPDATE likes SET is_deleted=1 WHERE user_id = ? and tweet_id = ?", [userId, tweetId]);
  }

  const allTweets: Tweet[] = useQuery<Tweet>(
    ctx,
    "SELECT t.*, u.username FROM tweets t JOIN users u on t.user_id = u.id ORDER BY created_at DESC",
  ).data;

  const followFeed: Tweet[] = useQuery<Tweet>(
    ctx,
    `SELECT t.*, u.username
    FROM tweets t
    JOIN users u on t.user_id = u.id
    WHERE user_id in (
      SELECT user_id
      FROM follows
      WHERE follower_id = ? AND is_deleted=0
    )
    ORDER BY t.created_at DESC`,
    [ userId ]
  ).data;

  // track who the current user is currently following
  const following: string[] = useQuery<{ user_id: string; }>(
    ctx, "SELECT DISTINCT user_id FROM follows where follower_id = ? and is_deleted=0", [ userId ]
  ).data.map(e => e.user_id);

  const TweetView = ({ tweet }: { tweet: Tweet; }) => {
    const isFollowing = following.includes(tweet.user_id);
    const followCb = isFollowing ? removeFollow : createFollow;
    const likingUsers: string[] = useQuery<{ user_id: string }>(
      ctx, "SELECT user_id FROM likes WHERE tweet_id = ? and is_deleted=0", [tweet.id]
    ).data.map(e => e.user_id);
    const liked = likingUsers.includes(userId);
    const likeCb = liked ? unlikeTweet : likeTweet;

    const f = (
      <a onClick={() => followCb(tweet.user_id, userId)}>({isFollowing ? 'following' : 'follow'})</a>
    );
    const dateFmt = new Date(tweet.created_at).toLocaleDateString('en', {
      // year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
    return (
      <div className="tweet">
        <div className="tweet-header">
          <span><b>{tweet.username}</b> {userId !== tweet.user_id && f}</span>
          <span>{dateFmt}</span>
        </div>
        <div className="tweet-header">
          <p className="tweet-text">{tweet.text}</p>
          {userId === tweet.user_id &&
            <a onClick={() => deleteTweet(tweet.id)}>[x]</a>
          }
        </div>
        <div className="tweet-header">
          Likes: {likingUsers.length}
          <a onClick={() => likeCb(userId, tweet.id)}>{liked ? 'unlike':'like'}</a>
        </div>
      </div>
    );
  };

  return (
    <div className="tweet-container">
      <div className="tweet-header">
        These are the tweets
        <button onClick={() => view === "all" ? setView("following") : setView("all")}>
          Viewing: {view}
        </button>
      </div>
      <p className="tweet-header">
        <input
          size={30}
          type="text"
          className="tweet-input"
          placeholder="Whats your tweet?"
          autoFocus
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
        />
        <button
          className="submit-btn"
          onClick={() => submitTweet(userId)}>
          Tweet it
        </button>
      </p>
      <div>
        {
          (view == "all" ? allTweets : followFeed)
            .map(t => (<TweetView key={t.id} tweet={t} />))
        }
      </div>
    </div>
  );
};

export default Tweets;

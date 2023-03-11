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
      newText,
      date.toISOString()
    ]);
    setNewText("");
  };

  const deleteTweet = (tweetId: string) => {
    ctx.db.exec("DELETE FROM tweets WHERE id = ?", [ tweetId ]);
  };

  const createFollow = (userId: string, followerId: string) => {
    ctx.db.exec("INSERT INTO follows VALUES (?, ?, ?, 0)", [ nanoid(), userId, followerId ]);
  };

  const removeFollow = (userId: string, followerId: string) => {
    ctx.db.exec("UPDATE follows SET is_deleted=1 WHERE user_id = ? and follower_id = ?", [ userId, followerId ]);
  };

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
    const f = (
      <a onClick={() => followCb(tweet.user_id, userId)}>({isFollowing ? 'following' : 'follow'})</a>
    );
    const dateFmt = new Date(tweet.created_at).toLocaleDateString('en', {
      year: 'numeric',
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
          <h4>{tweet.text}</h4>
          {userId === tweet.user_id && <a onClick={() => deleteTweet(tweet.id)}>[x]</a>}
        </div>
      </div>
    );
  };

  return (
    <div>
      <input
        type="text"
        className="tweet-input"
        placeholder="whats the tweet?"
        autoFocus
        value={newText}
        onChange={(e) => setNewText(e.target.value)}
      />
      <button
        className="submit-btn"
        onClick={() => submitTweet(userId)}>
        Tweet
      </button>
      <p className="tweet-header">
        These are the tweets
        <button onClick={() => view === "all" ? setView("following") : setView("all")}>
          Viewing: {view}
        </button>
      </p>
      <div className="tweet-container">
        {
          (view == "all" ? allTweets : followFeed)
            .map(t => (<TweetView key={t.id} tweet={t} />))
        }
      </div>
    </div>
  );
};

export default Tweets;

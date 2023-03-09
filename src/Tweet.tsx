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
};

const TweetView = ({ tweet }: { tweet: Tweet; }) => {
  return (
    <div>
      {tweet.user_id} : {tweet.text}
    </div>
  );
};

type TimelineView = "all" | "following";

const Tweets = ({ ctx }:{ ctx: Ctx }) => {
  const userId = useContext(SessionContext);
  const [ newText, setNewText ] = useState("");

  const [ view, setView ] = useState<TimelineView>("all");

  const submitTweet = (userId: string) => {
    ctx.db.exec("INSERT INTO tweets VALUES (?, ?, ?, ?)", [
      nanoid(),
      userId,
      newText,
      Date.now().toString()
    ]);
    setNewText("");
  };

  // TODO filter for only people we follow
  const allTweets: Tweet[] = useQuery<Tweet>(
    ctx,
    "SELECT * FROM tweets ORDER BY created_at DESC",
  ).data;

  const followFeed: Tweet[] = useQuery<Tweet>(
    ctx,
    "SELECT t.* from tweets t JOIN follows f on t.user_id = f.user_id where f.follower_id = ? ORDER BY created_at DESC", [userId]
  ).data;

  return (
    <div className="tweet-container">
      <input
        type="text"
        className="tweet-input"
        placeholder="whats the tweet?"
        autoFocus
        value={newText}
        onChange={(e) => setNewText(e.target.value)}
      />
      <button className="submit-btn" disabled={userId == ""} onClick={() => submitTweet(userId)}>
        Tweet
      </button>
      <div className="card">
        <button onClick={() => view === "all" ? setView("following") : setView("all")}>
          View: {view}
        </button>
        <p>
          These are the tweets
        </p>
        <ul>
          {
            (view == "all" ? allTweets : followFeed)
              .map(t => (<TweetView key={t.id} tweet={t} />))
          }
        </ul>
      </div>
    </div>
  )
}

export default Tweets;

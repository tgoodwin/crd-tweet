import { useState } from 'react'
import { useQuery } from '@vlcn.io/react';
import { Ctx } from './ctx';
import { nanoid } from "nanoid";

import Peers from './Peers'
import './App.css'

type Tweet = {
  id: string;
  user_id: string;
  text: string;
  created_at: string;
}

const TweetView = ({ tweet }: { tweet: Tweet }) => {
  return (
    <div>
      {tweet.user_id} : {tweet.text}
    </div>
  )
}


function App({ ctx }: { ctx: Ctx }) {
  const [newText, setNewText] = useState("");

  const submitTweet = () => {
    ctx.db.exec("INSERT INTO tweets VALUES (?, ?, ?, ?)", [
      nanoid(),
      "USERNAME",
      newText,
      Date.now().toString()
    ]);
    setNewText("");
  };

  // TODO filter for only people we follow
  const timeline: Tweet[] = useQuery<Tweet>(
    ctx,
    "SELECT * FROM tweets ORDER BY created_at DESC",
  ).data;

  return (
    <div className="App">
    <div>
      PeerID: {ctx.siteid}
    </div>
      <Peers ctx={ctx} />
      <h1>CRDTWEET</h1>
      <input
        type="text"
        className="tweet-input"
        placeholder="whats the tweet?"
        autoFocus
        value={newText}
        onChange={(e) => setNewText(e.target.value)}
      />
      <button className="submit-btn" onClick={submitTweet}>
        Tweet
      </button>
      <div className="card">
        <p>
          These are the tweets
        </p>
        <ul>
          {timeline.map(t => (<TweetView key={t.id} tweet={t} />))}
        </ul>
      </div>
    </div>
  )
}

export default App

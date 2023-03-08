import { useState } from 'react'
import { useQuery } from '@vlcn.io/react';
import { Ctx } from './ctx';
import { nanoid } from "nanoid";

import './App.css'

type Tweet = {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}


function App({ ctx }: { ctx: Ctx }) {
  // const [count, setCount] = useState(0)
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

  const [tweets, setTweets] = useState("");
  const query = async () => {
    const r = await ctx.db.execA("SELECT * FROM tweets ORDER BY created_at DESC");
    setTweets(`${r}`);
  }

  // TODO filter for only people we follow
  const timeline: readonly Tweet[] = useQuery<Tweet>(
    ctx,
    "SELECT * FROM tweets ORDER BY created_at DESC"
  ).data;

  return (
    <div className="App">
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
        <button onClick={query}>
          count is {tweets}
        </button>
        <p>
          These are the tweets
        </p>
        <ul className="timeline">
          <div>
            {`${timeline}`}
          </div>
        </ul>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App

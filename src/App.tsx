import { useState, createContext } from 'react';
import { useQuery } from '@vlcn.io/react';
import { Ctx } from './ctx';
import { nanoid } from "nanoid";

import Peers from './Peers';
import './App.css';

export const SessionContext = createContext<string>("");

type Tweet = {
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


function App({ ctx }: { ctx: Ctx; }) {
  const [ userId, setUserId ] = useState("");
  const [ signupUsername, setSignupUsername ] = useState("");
  const [ loginUsername, setLoginUsername ] = useState("");

  const [ newText, setNewText ] = useState("");

  const createUser = async (username: string) => {
    await ctx.db.exec("INSERT INTO users VALUES (?, ?, ?)", [
      nanoid(),
      username,
      ctx.siteid
    ]);

    const e = await ctx.db.execA("select id from users where username = ?", [ username ]);

    setUserId(e[ 0 ][ 0 ]);
  };

  const logIn = async (username: string) => {
    const e = await ctx.db.execA("select id from users where username = ?", [ username ]);
    if (e.length == 0) {
      alert(`username ${username} not found`);
    }
    await ctx.db.exec("UPDATE USER SET site_id = ? WHERE username = ?",
      [ ctx.siteid, username ]);

    setUserId(e[ 0 ][ 0 ]);
  };



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
      <div className="session">
        <h2>sign up:</h2>
        <input
          type="text"
          placeholder="username"
          value={signupUsername}
          onChange={(e) => setSignupUsername(e.target.value)}
        />
        <button onClick={() => createUser(signupUsername)} >Sign up</button>
        <h2>or log in:</h2>
        <input
          type="text"
          placeholder="username"
          value={loginUsername}
          onChange={(e) => setLoginUsername(e.target.value)}
        />
        <button onClick={() => logIn(loginUsername)} >Log in</button>
      </div>
      <h1>CRDTWEET</h1>
      <p>{userId == ""
        ? 'need to log in to tweet'
        : `current user: ${userId}`
      }
      </p>
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
        <p>
          These are the tweets
        </p>
        <ul>
          {timeline.map(t => (<TweetView key={t.id} tweet={t} />))}
        </ul>
      </div>
    </div>
  );
}

export default App;

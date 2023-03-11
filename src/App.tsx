import { useState, createContext } from 'react';
import { Ctx } from './ctx';
import { nanoid } from "nanoid";

import Peers from './Peers';
import Tweets from './Tweet';
import './App.css';

export const SessionContext = createContext<string>("");

function Form({ btnText, onClick }: { btnText: string, onClick: (_: string) => void; }) {
  const [ value, setValue ] = useState("");
  const handler = () => {
    onClick(value);
    setValue("");
  };
  return (
    <div>
      <input
        type="text"
        placeholder="username"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button onClick={handler}>{btnText}</button>
    </div>
  );
}

function App({ ctx }: { ctx: Ctx; }) {
  const [ userId, setUserId ] = useState("");
  // not attempting to enforce uniqueness on username
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
    await ctx.db.exec("UPDATE users SET site_id = ? WHERE username = ?",
      [ ctx.siteid, username ]);

    setUserId(e[ 0 ][ 0 ]);
  };

  const preAuth = (
    <div className="session">
      <h2>sign up:</h2>
      <Form onClick={createUser} btnText="Sign up" />
      <h2>Or log in</h2>
      <Form onClick={logIn} btnText="Log in" />
    </div>
  );

  const postAuth = (
    <div>
      <div className="peers">
        <p>current user: {userId}</p>
        <button onClick={() => setUserId("")}>Log out</button>
      </div>
      <Peers ctx={ctx} />
      <Tweets ctx={ctx} />
    </div>
  );

  return (
    <div className="App">
      <SessionContext.Provider value={userId}>
        <h1>CRDTWEET</h1>
        Peer ID: {ctx.siteid}
        {userId === "" ? preAuth : postAuth}
      </SessionContext.Provider>
    </div>
  );
}

export default App;

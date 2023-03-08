import { useState } from 'react'
import { Ctx } from './ctx';
import { nanoid } from "nanoid";

import './App.css'

function App({ ctx }: { ctx: Ctx }) {
  const [count, setCount] = useState(0)
  const [newText, setNewText] = useState("");

  const submitTweet = () => {
    ctx.db.exec("INSERT INTO tweets VALUES (?, ?, ?, ?)", [
      nanoid(),
      "USERNAME",
      newText,
      Date.now().toString()
    ]);
    setNewText("");
  }

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
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR!
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App

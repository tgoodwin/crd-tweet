import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

import sqliteWasm from "@vlcn.io/wa-crsqlite";
import tblrx from "@vlcn.io/rx-tbl";
import wasmUrl from "@vlcn.io/wa-crsqlite/wa-sqlite-async.wasm?url";


async function main() {
  const sqlite = await sqliteWasm(() => wasmUrl);
  const db = await sqlite.open("crd-tweet-db");
  (window as any).db = db;

  // create schemas
  await db.exec(
    "CREATE TABLE IF NOT EXISTS users(id primary key, username, bio, email)"
  );
  await db.exec(
    "CREATE TABLE IF NOT EXISTS tweets (id primary key, user_id, text, created_at)"
  );
  await db.exec(
    "CREATE TABLE IF NOT EXISTS likes (id primary key, post_id, user_id, created_at)"
  );

  // set them up as CRRs
  await db.exec("SELECT crsql_as_crr('users')");
  await db.exec("SELECT crsql_as_crr('tweets')");
  await db.exec("SELECT crsql_as_crr('likes')");

  window.onbeforeunload = () => {
    db.close();
  }

  const rx = await tblrx(db);
  const ctx = {
    db: db,
    rx: rx,
  };

  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <App ctx={ctx} />
    </React.StrictMode>,
  );
};

main();


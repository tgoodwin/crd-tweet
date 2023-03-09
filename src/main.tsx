import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

import sqliteWasm from "@vlcn.io/wa-crsqlite";
import tblrx from "@vlcn.io/rx-tbl";
import wasmUrl from "@vlcn.io/wa-crsqlite/wa-sqlite-async.wasm?url";
import { wdbRtc } from "@vlcn.io/sync-p2p";

import { stringify as uuidStringify } from "uuid";


async function main(): Promise<void> {
  const sqlite = await sqliteWasm(() => wasmUrl);
  // pass a filename to open to use persistent brower storage
  const db = await sqlite.open();

  // useful for debugging via the console
  (window as any).db = db;

  // create schemas
  await db.exec(
    "CREATE TABLE IF NOT EXISTS users(id primary key, username, site_id)"
  );
  await db.exec(
    "CREATE TABLE IF NOT EXISTS tweets (id primary key, user_id, text, created_at)"
  );
  // await db.exec(
  //   "CREATE TABLE IF NOT EXISTS likes (id primary key, post_id, user_id, created_at)"
  // );

  // set them up as CRRs
  await db.exec("SELECT crsql_as_crr('users')");
  await db.exec("SELECT crsql_as_crr('tweets')");
  // await db.exec("SELECT crsql_as_crr('likes')");

  const r = await db.execA("SELECT crsql_siteid()");
  const siteid = uuidStringify(r[0][0])

  window.onbeforeunload = () => {
    db.close();
  }

  const rx = await tblrx(db);
  const rtc = await wdbRtc(
    db,
    window.location.hostname === "localhost"
      ? {
        host: "localhost",
        port: 9000,
        path: "/examples",
      }
      : undefined
  );
;
  const ctx = {
    db: db,
    siteid: siteid,
    rx: rx,
    rtc: rtc
  };

  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <App ctx={ctx} />
  );
};

main();


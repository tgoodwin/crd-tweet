import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

import sqliteWasm from "@vlcn.io/wa-crsqlite";
import tblrx from "@vlcn.io/rx-tbl";
import wasmUrl from "@vlcn.io/wa-crsqlite/wa-sqlite-async.wasm?url";
import { wdbRtc } from "@vlcn.io/sync-p2p";

import { stringify as uuidStringify } from "uuid";

const DB_IN_MEMORY = undefined;
const DB_PERSISTENT = "crd-tweet-1"

async function main(dbName: string | undefined): Promise<void> {
  const sqlite = await sqliteWasm(() => wasmUrl);
  // pass a filename to open to use persistent brower storage
  const db = await sqlite.open(dbName);

  // useful for debugging via the console
  (window as any).db = db;

  // create schemas
  await db.exec(
    "CREATE TABLE IF NOT EXISTS users(id primary key, username, site_id)"
  );
  await db.exec(
    "CREATE TABLE IF NOT EXISTS tweets (id primary key, user_id, text, created_at)"
  );

  await db.exec(
    // use an is_deleted column to support un-deletions
    // since the table is implemented as a remove-wins set
    "CREATE TABLE IF NOT EXISTS follows (id primary key, user_id, follower_id, is_deleted)"
  );
  // await db.exec(
  //   "CREATE TABLE IF NOT EXISTS likes (id primary key, post_id, user_id, created_at)"
  // );

  // set them up as CRRs
  await db.exec("SELECT crsql_as_crr('users')");
  await db.exec("SELECT crsql_as_crr('tweets')");
  await db.exec("SELECT crsql_as_crr('follows')");

  const r = await db.execA("SELECT crsql_siteid()");
  const siteid = uuidStringify(r[0][0]);

  // bootstrap some test data
  if (!dbName) {
    await db.execMany([
      `INSERT INTO users VALUES ('u-1', 'user-1', 'site-1');`,
      "INSERT INTO users VALUES ('u-2', 'user-2', 'site-1');",
      "INSERT INTO users VALUES ('u-3', 'user-3', 'site-1');",

      "INSERT INTO tweets VALUES ('t-1', 'u-1', 'test message', '0000');",
      "INSERT INTO tweets VALUES ('t-2', 'u-1', 'another message', '0001');",
      "INSERT INTO tweets VALUES ('t-3', 'u-2', 'first tweet', '0002');",

      // user 2 follows user 1
      "INSERT INTO follows VALUES ('f-1', 'u-1', 'u-2', 0);",
      // user 3 follows user 2
      "INSERT INTO follows VALUES ('f-2', 'u-2', 'u-3', 0);",
    ]);
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

  window.onbeforeunload = () => {
    rtc.dispose();
    db.close();
  }
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

main(DB_PERSISTENT);


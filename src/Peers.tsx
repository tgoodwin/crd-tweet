import { useState, useEffect, useContext } from "react";
import { useQuery } from '@vlcn.io/react';
import { Ctx } from "./ctx.js";
import { SessionContext } from './App';

export default function Peers({ ctx }: { ctx: Ctx; }) {
  const [ peerId, setPeerId ] = useState<string>("");
  const [ pending, setPending ] = useState<string[]>([]);
  const [ established, setEstablished ] = useState<string[]>([]);

  const userId = useContext(SessionContext);


  const followSites: string[] = useQuery<{ site_id: string }>(
    ctx,
    `SELECT site_id
    FROM users WHERE id IN (
      SELECT user_id
      FROM follows
      WHERE follower_id = ? AND is_deleted=0
    )`, [ userId ],
  ).data.map(r => r.site_id);
  followSites
    .filter(site => !(pending.includes(site) || established.includes(site) || site == ctx.siteid))
    .map(site => ctx.rtc.connectTo(site));

  useEffect(() => {
    const cleanup = ctx.rtc.onConnectionsChanged((pending, established) => {
      console.log("conns changes");
      setPending(pending);
      setEstablished(established);
    });
    return () => {
      cleanup();
    };
  }, [ ctx.rtc ]);
  return (
    <div className="tweet-container">
      <p>
        Local Peer ID: {ctx.siteid}
      </p>
      <div className="tweet-header">
        <input
          size={30}
          type="text"
          placeholder="Remote Peer ID"
          onChange={(e) => setPeerId(e.target.value)}
          value={peerId}
        ></input>
        <button
          href="#"
          disabled={peerId.length == 0}
          onClick={() => {
            ctx.rtc.connectTo(peerId);
          }}
        >
          Connect
        </button>
      </div>
      <div className="peers">
        <ul className="pending">
          Pending
          {pending.map((p) => (
            <li id={p} key={p}>{p.substring(0, 8)}</li>
          ))}
        </ul>
        <ul className="established">
          Established
          {established.map((p) => (
            <li id={p} key={p}>{p.substring(0, 8)}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

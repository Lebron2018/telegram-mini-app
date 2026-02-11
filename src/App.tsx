import { useEffect, useState } from "react";
import { tg, isTelegram, getUser, expand } from "./telegram";

export default function App() {
  const [balance, setBalance] = useState<number>(0);
  const user = getUser();

  useEffect(() => {
    if (isTelegram()) {
      tg.ready();
      tg.expand();
    }

    const saved = localStorage.getItem("balance");
    if (saved) setBalance(Number(saved));
  }, []);

  if (!isTelegram()) {
    return (
      <div className="container">
        <h2>Running outside Telegram (dev mode)</h2>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Welcome</h1>

      <div className="card">
        <div><b>Username:</b> @{user?.username || "unknown"}</div>
        <div><b>User ID:</b> {user?.id}</div>
      </div>

      <div className="card">
        <h3>Balance</h3>
        <div>{balance} TON</div>
      </div>

      <div className="card muted">
        Wallet connect — coming soon
      </div>

      <button onClick={expand}>Expand</button>
    </div>
  );
}

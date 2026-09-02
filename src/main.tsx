import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function App() {
  return (
    <main className="shell">
      <p className="eyebrow">KALPA SELECTION</p>
      <h1>曲選びを、<br />もっと軽やかに。</h1>
      <p className="lead">
        曲一覧・フィルタリング・ランダム選出をまとめる小さなアプリを準備しています。
      </p>
      <div className="status" role="status">
        <span aria-hidden="true" />
        GitHub Pages ready
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);


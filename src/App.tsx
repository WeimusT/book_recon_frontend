// src/App.tsx
import { FormEvent, useState } from "react";
import "./App.css";
import type { RecommendationResponse } from "./types";

const API_BASE_URL = "http://localhost:8000"; // change if needed

function App() {
  const [userId, setUserId] = useState("");
  const [k, setK] = useState<number>(10);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [statusType, setStatusType] = useState<"info" | "error">("info");
  const [data, setData] = useState<RecommendationResponse | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const trimmedUserId = userId.trim();
    if (!trimmedUserId) {
      setStatus("Please enter a user ID.");
      setStatusType("error");
      return;
    }

    setLoading(true);
    setStatus("Calling /recommend…");
    setStatusType("info");
    setData(null);

    try {
      const params = new URLSearchParams({
        user_id: trimmedUserId,
        k: String(k),
      });

      const response = await fetch(`${API_BASE_URL}/recommend?${params.toString()}`);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(
          `API error (${response.status}): ${text || response.statusText}`,
        );
      }

      const json = (await response.json()) as RecommendationResponse;
      setData(json);
      setStatus("Done.");
      setStatusType("info");
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Unknown error calling API.";
      setStatus(message);
      setStatusType("error");
    } finally {
      setLoading(false);
    }
  }

  const recommendations = data?.recommended_items ?? [];

  return (
    <div className="page">
      <div className="app">
        <header className="app-header">
          <div>
            <div className="app-title">Book Recommendation</div>
            <div className="app-subtitle">
              Query <code>/recommend</code> with a user id and <code>k</code>.
            </div>
          </div>
          <span className="pill">Demo</span>
        </header>

        <form id="recommend-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="user-id">User ID</label>
            <input
              id="user-id"
              type="text"
              placeholder="e.g. A30TK6U7DNS82R"
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="k">Top K</label>
            <input
              id="k"
              type="number"
              min={1}
              max={100}
              required
              value={k}
              onChange={(e) => setK(Number(e.target.value) || 1)}
            />
          </div>

          <div>
            <button id="submit-btn" type="submit" disabled={loading}>
              <span id="btn-label">
                {loading ? "Querying…" : "Get Recommendations"}
              </span>
            </button>
          </div>
        </form>

        <div
          id="status"
          className={`status ${statusType === "error" ? "error" : "info"}`}
        >
          {status}
        </div>

        {data && (
          <section className="results" id="results">
            <div className="results-header">
              <div className="results-title">
                Recommendations for{" "}
                <span id="results-user-id">{data.user_id}</span>
              </div>
              <div className="results-meta">
                Returned{" "}
                <span id="results-count">{recommendations.length}</span> items
              </div>
            </div>

            <ul className="recommendations" id="recommendations-list">
              {recommendations.length === 0 ? (
                <li>No recommendations returned.</li>
              ) : (
                recommendations.map((itemId, idx) => (
                  <li key={itemId}>
                    #{idx + 1} {itemId}
                  </li>
                ))
              )}
            </ul>

            <div className="raw-json">
              <strong>Raw response</strong>
              <pre id="raw-json">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default App;
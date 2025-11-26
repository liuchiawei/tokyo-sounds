"use client";

/* Lyria Debug Panel
 * 
 * This component displays the status and weights of the Lyria Generative Proximity Audio.
 * Do NOT ship to prod!
 *
*/

interface LyriaDebugPanelProps {
  status: string;
  error?: string | null;
  weights: { id: string; prompt: string; weight: number; distance: number }[];
}

export function LyriaDebugPanel({ status, error, weights }: LyriaDebugPanelProps) {
  return (
    <div style={{
      position: "fixed",
      top: "10px",
      right: "10px",
      background: "rgba(0, 0, 0, 0.85)",
      color: "white",
      padding: "15px",
      borderRadius: "8px",
      fontFamily: "monospace",
      fontSize: "11px",
      maxWidth: "400px",
      maxHeight: "80vh",
      overflowY: "auto",
      zIndex: 10000,
    }}>
      <h3 style={{ margin: "0 0 10px 0", fontSize: "14px" }}>Lyria Proximity Audio</h3>

      <div style={{ marginBottom: "10px", paddingBottom: "10px", borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
        <div><strong>Status:</strong> {status}</div>
        {error && <div style={{ color: "#ff6b6b" }}><strong>Error:</strong> {error}</div>}
      </div>

      <div>
        <strong>Building Proximity Weights:</strong>
        <div style={{ marginTop: "5px" }}>
          {weights.length > 0 ? (
            weights.map((item) => (
              <div
                key={item.id}
                style={{
                  marginBottom: "8px",
                  padding: "6px",
                  background: item.weight > 0 ? "rgba(76, 175, 80, 0.2)" : "rgba(255,255,255,0.05)",
                  borderRadius: "4px",
                  borderLeft: item.weight > 0 ? "3px solid #4CAF50" : "3px solid transparent"
                }}
              >
                <div style={{ fontSize: "10px", color: "#aaa" }}>{item.id}</div>
                <div style={{ marginTop: "2px" }}>{item.prompt}</div>
                <div style={{ marginTop: "4px", display: "flex", justifyContent: "space-between" }}>
                  <span>
                    Weight: <strong style={{ color: item.weight > 0 ? "#4CAF50" : "#666" }}>
                      {item.weight.toFixed(3)}
                    </strong>
                  </span>
                  <span style={{ color: "#888" }}>
                    Distance: {item.distance.toFixed(1)}m
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ color: "#888", fontStyle: "italic" }}>No buildings in range</div>
          )}
        </div>
      </div>
    </div>
  );
}

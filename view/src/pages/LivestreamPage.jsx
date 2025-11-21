import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function LivestreamPage() {
  const { slug } = useParams();
  const location = useLocation();
  const stream = location.state?.stream;

  const fallbackData = {
    title: `Livestream: ${slug.replace(/([A-Z])/g, " $1")}`,
    videoId: "dQw4w9WgXcQ",
    live: false,
  };

  const current = stream || fallbackData;

  // --- WebSocket State ---
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // --- Setup WebSocket connection ---
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000"); // port must match server
    setSocket(ws);

    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };

    return () => ws.close();
  }, []);

  // --- Send a message ---
  const sendMessage = (e) => {
    e.preventDefault();
    if (input.trim() && socket?.readyState === WebSocket.OPEN) {
      socket.send(input);
      setInput("");
    }
  };

  return (
    <section className="text-center">
      <h2 className="fw-bold mb-4">{current.title}</h2>

      <div className="ratio ratio-16x9 mb-3">
        <iframe
          src={`https://www.youtube.com/embed/${current.videoId}`}
          title={current.title}
          allowFullScreen
        ></iframe>
      </div>

      {current.live ? (
        <span className="badge bg-danger mb-3">LIVE</span>
      ) : (
        <span className="badge bg-secondary mb-3">Replay</span>
      )}

      <p>Enjoy the livestream or replay for {current.title}!</p>

      {/* ---- Chat UI ---- */}
      <div className="mt-4 mx-auto" style={{ maxWidth: "500px", textAlign: "left" }}>
        <form onSubmit={sendMessage} className="d-flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Your message"
            className="form-control"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="btn btn-primary">Send</button>
        </form>

        <ul className="list-group">
          {messages.map((msg, index) => (
            <li key={index} className="list-group-item">
              {msg}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

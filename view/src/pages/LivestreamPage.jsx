import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function LivestreamPage() {
  const { slug } = useParams();
  const location = useLocation();
  const match = location.state?.match;

  const videoId = match?.videoId || match?.streamUrl || "dQw4w9WgXcQ";
  const title = match 
    ? `${match.teamA?.name || 'Team A'} vs ${match.teamB?.name || 'Team B'}`
    : `Livestream: ${slug}`;
  const isLive = match?.isLive || false;


  //WebSocket State
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  //Setup WebSocket connection
  useEffect(() => {
  const ws = new WebSocket(`ws://localhost:4000/chat/${slug}`); //unique per livestream
  setSocket(ws);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.slug === slug) {
      setMessages((prev) => [...prev, data.message]);
    }
  };

  return () => ws.close();
}, [slug]);  //re-connect if slug changes

  //Send a message
 const sendMessage = (e) => {
  e.preventDefault();
  if (input.trim() && socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ slug, message: input }));
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

      {/*Chat UI*/}
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

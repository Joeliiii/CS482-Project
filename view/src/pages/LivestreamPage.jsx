import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function LivestreamPage() {
  const { slug } = useParams();
  const location = useLocation();
  const match = location.state?.match;

  //WebSocket State
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const [hasSetUsername, setHasSetUsername] = useState(false);

   // Get video data from match
  const streamType = match?.streamType || "youtube";
  const videoId = match?.videoId || match?.streamUrl || "EoVTttvKfRs";
  const title = match 
    ? `${match.teamA || 'Team A'} vs ${match.teamB || 'Team B'}`
    : `Livestream: ${slug}`;
  const isLive = match?.isLive || false;


  //Setup WebSocket connection
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:4000/chat/${slug}`); //unique per livestream
    setSocket(ws);

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.slug === slug) {
      setMessages((prev) => [...prev, data.message]);
    }
    };
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

  return () => ws.close();
}, [slug]);  //re-connect if slug changes

  //Send a message
 const sendMessage = (e) => {
  e.preventDefault();
  if(!hasSetUsername && username.trim()) {
      setHasSetUsername(true);
      return;
    }
  if (input.trim() && socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ slug, username: username || 'Anonymous', message: input }));
    setInput("");
  }
};

const renderEmbed = () => {
    if (streamType === "twitch") {
      return (
        <iframe
          src={`https://player.twitch.tv/?channel=${videoId}&parent=localhost`}
          title={title}
          allowFullScreen
          className="w-100 h-100"
        ></iframe>
      );
    } else {
      return (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=0`}
          title={title}
          allowFullScreen
          className="w-100 h-100"
        ></iframe>
      );
    }
  };

  return (
    <div className="container-fluid px-0">
      <div className="row g-0">
        {/* Video Player - Left Side */}
        <div className="col-lg-9 bg-black">
          <div className="p-3">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h2 className="fw-bold mb-1">{title}</h2>
                {isLive ? (
                  <span className="badge bg-danger">LIVE</span>
                ) : (
                  <span className="badge bg-secondary">Replay</span>
                )}
              </div>
            </div>

            {/* Video Container */}
            <div className="ratio ratio-16x9 bg-dark">
              {renderEmbed()}
            </div>
          </div>
        </div>

        {/* Chat - Right Side */}
        <div className="col-lg-3 bg-dark border-start border-secondary">
          <div className="d-flex flex-column" style={{ height: '100vh' }}>
            {/* Chat Header */}
            <div className="p-3 border-bottom border-secondary">
              <h5 className="mb-0">Live Chat</h5>
            </div>

            {/* Messages Area */}
            <div className="flex-grow-1 overflow-auto p-3" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              {messages.length === 0 ? (
                <p className="text-secondary small">No messages yet. Be the first!</p>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className="mb-3">
                    <strong className="text-ybt">{msg.username}:</strong>
                    <span className="text-light ms-2">{msg.message}</span>
                  </div>
                ))
              )}
            </div>

            {/* Chat Input */}
            <div className="p-3 border-top border-secondary">
              {!hasSetUsername ? (
                <form onSubmit={sendMessage}>
                  <input
                    type="text"
                    placeholder="Enter your username"
                    className="form-control mb-2 bg-dark text-light"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn bg-ybt w-100">Set Username</button>
                </form>
              ) : (
                <>
                <div className="text-secondary small mb-2">Chatting as: <strong className="text-ybt">{username}</strong></div>
                <form onSubmit={sendMessage} className="d-flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="form-control bg-dark text-light border-secondary"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn bg-ybt">Send</button>
                </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <div
        style={{
          textAlign: "center",
          color: "white",
          padding: "40px",
          borderRadius: "10px",
          background: "rgba(0, 0, 0, 0.1)",
        }}
      >
        <h1 style={{ marginBottom: "10px", fontSize: "32px" }}>
          🎤 Telegram Transcriber Bot
        </h1>
        <p style={{ fontSize: "18px", marginBottom: "20px" }}>
          Active and listening on Telegram
        </p>
        <p style={{ fontSize: "14px", opacity: "0.8" }}>
          Send your bot an audio file on Telegram to transcribe it to Persian text.
        </p>
      </div>
    </div>
  );
}

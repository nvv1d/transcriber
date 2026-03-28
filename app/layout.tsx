export const metadata = {
  title: "Telegram Transcriber Bot",
  description: "Audio transcription bot for Telegram",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

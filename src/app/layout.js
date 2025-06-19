// src/app/layout.js

import './globals.css';

export const metadata = {
  title: "Chat em Tempo Real",
  description: "Criado com Next.js, Node.js e Socket.IO",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  );
}
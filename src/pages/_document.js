import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="it">
      <Head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Urbanova - Piattaforma per la gestione di progetti immobiliari" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 
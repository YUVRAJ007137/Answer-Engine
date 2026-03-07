import "./globals.css";

export const metadata = {
  title: "Answer Engine — AI Assignment Solver",
  description:
    "Upload assignment questions and receive detailed, handwriting-ready answers powered by AI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem("answer-engine-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);})();`,
          }}
        />
      </head>
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}

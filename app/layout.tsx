export const metadata = {
  title: "Fort Collins Xeriscape Design Tool",
  description: "MVP demo — generate a landscape concept with a budget slider."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, Arial, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}

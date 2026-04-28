export async function GET() {
  return new Response(
`User-agent: *
Allow: /

Sitemap: https://gomotorsco.com.co/sitemap.xml
`,
    {
      headers: {
        "content-type": "text/plain",
      },
    }
  );
}

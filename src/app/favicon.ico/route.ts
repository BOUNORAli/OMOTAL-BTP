export function GET() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" rx="14" fill="#12355b"/>
    <path d="M16 43h32v6H16zM20 24h8v16h-8zM31 16h13v24H31z" fill="#fff"/>
    <path d="M16 43h32" stroke="#f97316" stroke-width="5" stroke-linecap="round"/>
  </svg>`;

  return new Response(svg, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": "image/svg+xml",
    },
  });
}

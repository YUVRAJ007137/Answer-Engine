// Force dynamic rendering so /chat/[id] is always served on Vercel (avoids 404 on direct load or refresh)
export const dynamic = "force-dynamic";
export const dynamicParams = true;

export default function ChatIdLayout({ children }) {
  return children;
}

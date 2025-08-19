// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-3xl font-bold">Slime Invadors</h1>
      
      <Link
        href="/play"
        className="px-4 py-2 bg-white border-2 border-black font-mono hover:bg-gray-100 inline-block"
      >
        Start Game
      </Link>
    </main>
  );
}

"use client";
import Link from "next/link";
import Game from "@/components/game/Game";

export default function PlayPage() {
  return (
    <div className="relative min-h-screen bg-black">
      <Game />
    </div>
  );
}

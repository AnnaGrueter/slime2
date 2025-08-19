"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { MenuBar } from "@/components/MenuBar";
import HighscoreBoard from "@/components/HighscoreBoard";

// ===== GAME CONSTANTS =====
const W = 842;
const H = 520;
const ABOUT_SCALE = 0.8;
const HELP_SCALE = 0.75;
const INTRO_SCALE = 0.75;
const ENEMIES_SCALE = 0.75;
const BOARD_SCALE = 0.25;
const ENTRY_SCALE = 0.25;
const GAMEOVER_SCALE = 0.5;
const HS_ENTRY_SCALE = 0.50;

// Panel button positioning
type PanelId = "about" | "intro" | "help" | "enemies";
const PANEL_BUTTON_OFFSETS: Record<PanelId, { bottom: number; left?: number; right?: number }> = {
  about:   { bottom: 48, right: 100 },
  intro:   { bottom: 18, right: 250 },
  help:    { bottom: 28, right: 250 },
  enemies: { bottom: 48, right: 440 },
};

// Player
const PLAYER_W = 50;
const PLAYER_H = 50;
const PLAYER_Y = H - PLAYER_H - 78; // 15% up from bottom

// Bullets
const BULLET_W = 15;
const BULLET_H = 20;
const BULLET_SPEED = 12;
const FIRE_RATE = 150; // ms between shots

// Enemies
const ENEMY_W = 40;
const ENEMY_H = 40;
const MAX_ENEMIES = 6;

// Drops
const DROP_W = 12;
const DROP_H = 12;
const DROP_SPEED = 2.5;

// Score/Lives
const SCORE_PER_SLIME = 10;
const START_SCORE = 0;
const START_LIVES = 3;

// Types
type Bullet = { x: number; y: number; id: number };
type Enemy = {
  x: number;
  y: number;
  id: number;
  vx: number;
  vy: number;
  zigzagTimer: number;
  zigzagDirection: number;
  nextDropAt: number; // rAF time (performance.now())
};

type Drop = { x: number; y: number; id: number };
type HighScoreEntry = { name: string; score: number };

// High score entry state
type HighScoreEntryState = {
  show: boolean;
  score: number;
  name: string;
};

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const lastShotRef = useRef<number>(0);
  const nextEnemyIdRef = useRef<number>(1);
  const nextBulletIdRef = useRef<number>(1);
  const nextDropIdRef = useRef<number>(1);
  const enemySpawnTimerRef = useRef<number>(0);
  const audioEnabledRef = useRef<boolean>(false);

  // Game state
  const [playerX, setPlayerX] = useState(W / 2 - PLAYER_W / 2);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [drops, setDrops] = useState<Drop[]>([]);
  const [shooting, setShooting] = useState(false);
  const [score, setScore] = useState(START_SCORE);
  const [lives, setLives] = useState(START_LIVES);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [gameOverShown, setGameOverShown] = useState(false);

  // UI state
  const [soundOn, setSoundOn] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [panel, setPanel] = useState<"about" | "intro" | "help" | "enemies" | null>(null);

  // Image-only panels (booleans)
  const [showAbout, setShowAbout] = useState(false);
  const [showIntroduction, setShowIntroduction] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showEnemies, setShowEnemies] = useState(false);

  // Derived "any panel open?" + which panel
  const activePanel: PanelId | null =
    showAbout ? "about" :
    showIntroduction ? "intro" :
    showHelp ? "help" :
    showEnemies ? "enemies" : null;

  // High Scores
  const [showHighScores, setShowHighScores] = useState(false);
  const [highScores, setHighScores] = useState<HighScoreEntry[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('slimeinvaders:highscores');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.warn('Failed to parse saved high scores');
        }
      }
    }
    return Array.from({ length: 10 }, () => ({ name: "Nobody", score: 0 }));
  });

  // High Score Entry
  const [highScoreEntry, setHighScoreEntry] = useState<HighScoreEntryState>({
    show: false,
    score: 0,
    name: ''
  });

  // Assets
  const [assets, setAssets] = useState<{ [key: string]: HTMLImageElement }>({});
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  // Sound
  const playSound = useCallback((soundPath: string) => {
    // Block sounds if muted, paused, menu/panel open, or before first interaction
    if (!audioEnabledRef.current || !soundOn || isPaused || activePanel !== null || menuOpen) return;
    try {
      const audio = new Audio(soundPath);
      audio.volume = 0.3;
      audio.play().catch((e) => console.warn("Audio play failed:", e));
    } catch (e) {
      console.warn("Audio creation failed:", e);
    }
  }, [soundOn, isPaused, activePanel, menuOpen]);

  // Enable audio on first user interaction
  useEffect(() => {
    const enableAudio = () => {
      audioEnabledRef.current = true;
      document.removeEventListener("mousedown", enableAudio);
      document.removeEventListener("keydown", enableAudio);
    };
    document.addEventListener("mousedown", enableAudio);
    document.addEventListener("keydown", enableAudio);
    return () => {
      document.removeEventListener("mousedown", enableAudio);
      document.removeEventListener("keydown", enableAudio);
    };
  }, []);

  // Pause/resume with spacebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsPaused((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Level scaling
  const getMaxEnemiesForLevel = (currentLevel: number) =>
    Math.min(1 + currentLevel, MAX_ENEMIES);

  const getSpawnDelayForLevel = (currentLevel: number) =>
    Math.max(3000, 9250 - currentLevel * 1250);

  const getDropFrequencyForLevel = (currentLevel: number) => {
    const baseMin = Math.max(1500, 4000 - currentLevel * 500);
    const baseMax = Math.max(3000, 7000 - currentLevel * 1000);
    return { min: baseMin, max: baseMax };
  };

  // Load assets
  useEffect(() => {
    const assetPaths = {
      player: "/components/art/game/sprites/shooter.png",
      bullet: "/components/art/game/sprites/bullet.png",
      slime: "/components/art/game/sprites/slime.png",
      drop: "/components/art/game/sprites/slime_drop.png",
      background: "/components/art/game/backgrounds/main_hud.png",
    };

    const loaded: { [k: string]: HTMLImageElement } = {};
    let loadCount = 0;
    const total = Object.keys(assetPaths).length;

    Object.entries(assetPaths).forEach(([key, path]) => {
      const img = new Image();
      img.onload = () => {
        loaded[key] = img;
        loadCount++;
        if (loadCount === total) {
          setAssets(loaded);
          setAssetsLoaded(true);
        }
      };
      img.src = path;
    });
  }, []);

  // Create enemy
  const createEnemy = useCallback((currentLevel: number): Enemy => {
    const dropFreq = getDropFrequencyForLevel(currentLevel);
    const now = performance.now();
    const nextIn = dropFreq.min + Math.random() * (dropFreq.max - dropFreq.min);

    return {
      x: Math.random() * (W - ENEMY_W),
      y: -ENEMY_H,
      id: nextEnemyIdRef.current++,
      vx: (Math.random() - 0.5) * 2.0,
      vy: 0.3 + Math.random() * 0.4,
      zigzagTimer: 0,
      zigzagDirection: Math.random() > 0.5 ? 1 : -1,
      nextDropAt: now + nextIn,
    };
  }, []);

  // Init enemies on start/reset
  useEffect(() => {
    if (!assetsLoaded || gameOver) return;
    setEnemies([]);
    enemySpawnTimerRef.current = 0;
  }, [assetsLoaded, gameOver]);

  // Mouse movement -> player X
  useEffect(() => {
    if (gameOver || isPaused || activePanel !== null || menuOpen || highScoreEntry.show) return;
    const handleMouseMove = (e: MouseEvent) => {
      const bounds = canvasRef.current?.getBoundingClientRect();
      if (!bounds) return;
      let x = e.clientX - bounds.left - PLAYER_W / 2;
      x = Math.max(0, Math.min(W - PLAYER_W, x));
      setPlayerX(x);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [gameOver, isPaused, activePanel, menuOpen, highScoreEntry.show]);

  // Shooting controls
  useEffect(() => {
    if (gameOver || isPaused || activePanel !== null || menuOpen || highScoreEntry.show) return;
    const down = () => setShooting(true);
    const up = () => setShooting(false);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
    };
  }, [gameOver, isPaused, activePanel, menuOpen, highScoreEntry.show]);

  // AABB collision
  const checkCollision = (
    r1: { x: number; y: number; w: number; h: number },
    r2: { x: number; y: number; w: number; h: number }
  ) =>
    r1.x < r2.x + r2.w &&
    r1.x + r1.w > r2.x &&
    r1.y < r2.y + r2.h &&
    r1.y + r1.h > r2.y;

  // Main loop
  useEffect(() => {
    if (!assetsLoaded || gameOver || isPaused || activePanel !== null || menuOpen || highScoreEntry.show) return;

    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    const loop = (t: number) => {
      // clear
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, W, H);

      // background (smooth)
      if (assets.background) {
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(assets.background, 0, 0, W, H);
        ctx.imageSmoothingEnabled = false;
      }

      // shooting
      if (shooting && t - lastShotRef.current > FIRE_RATE) {
        playSound("/components/sfx/shoot.wav");
        setBullets((prev) => [
          ...prev,
          { x: playerX + PLAYER_W / 2 - BULLET_W / 2, y: PLAYER_Y, id: nextBulletIdRef.current++ },
        ]);
        lastShotRef.current = t;
      }

      // bullets
      setBullets((prev) =>
        prev
          .map((b) => ({ ...b, y: b.y - BULLET_SPEED }))
          .filter((b) => b.y > -BULLET_H)
      );

      // enemies
      setEnemies((prev) =>
        prev.map((enemy) => {
          const e = { ...enemy };
          e.zigzagTimer += 16;
          if (e.zigzagTimer > 2000 + Math.random() * 1000) {
            e.zigzagTimer = 0;
            e.zigzagDirection *= -1;
            const hs = 0.8 + Math.random() * 0.4;
            e.vx = e.zigzagDirection * hs;
            if (e.y < H * 0.7) {
              if (Math.random() < 0.8) e.vy = Math.max(0.15, Math.min(0.35, e.vy + Math.random() * 0.05));
            } else {
              if (Math.random() < 0.6) e.vy = Math.max(0.05, Math.min(0.25, e.vy - Math.random() * 0.05));
            }
          }
          e.x += e.vx;
          e.y += e.vy;

          if (e.x <= 0 || e.x >= W - ENEMY_W) {
            e.vx *= -0.8;
            e.x = Math.max(0, Math.min(W - ENEMY_W, e.x));
            e.vy = Math.max(0.1, Math.min(0.4, e.vy));
          }

          if (e.y > H) {
            if (Math.random() > 0.5) {
              e.y = -ENEMY_H;
              e.x = Math.random() * (W - ENEMY_W);
              e.vx = (Math.random() - 0.5) * 1.5;
              e.vy = 0.15 + Math.random() * 0.15;
            } else {
              e.y = H - ENEMY_H;
              e.vy = -Math.abs(e.vy) * 0.4;
            }
          }

          // Random drop spawning (use rAF time consistently)
          const dropFreq = getDropFrequencyForLevel(level);
          if (t >= e.nextDropAt) {
            // spawn one drop
            setDrops(prev => [
              ...prev,
              {
                x: e.x + ENEMY_W / 2 - DROP_W / 2,
                y: e.y + ENEMY_H,
                id: nextDropIdRef.current++,
              },
            ]);

            // schedule the next one
            const nextIn = dropFreq.min + Math.random() * (dropFreq.max - dropFreq.min);
            e.nextDropAt = t + nextIn;
          }

          return e;
        })
      );

      // drops
      setDrops((prev) =>
        prev
          .map((d) => ({ ...d, y: d.y + DROP_SPEED }))
          .filter((d) => d.y < H + DROP_H)
      );

      // bullet vs enemy
      setBullets((prevBullets) => {
        const remainingBullets = [...prevBullets];
        setEnemies((prevEnemies) => {
          const remainingEnemies = [...prevEnemies];
          prevBullets.forEach((b) => {
            prevEnemies.forEach((e, ei) => {
              if (
                checkCollision(
                  { x: b.x, y: b.y, w: BULLET_W, h: BULLET_H },
                  { x: e.x, y: e.y, w: ENEMY_W, h: ENEMY_H }
                )
              ) {
                const bi = remainingBullets.findIndex((x) => x.id === b.id);
                if (bi !== -1) remainingBullets.splice(bi, 1);

                if (remainingEnemies[ei]) {
                  playSound("/components/sfx/explosion.wav");
                  remainingEnemies.splice(ei, 1);
                  setScore((prev) => prev + SCORE_PER_SLIME);

                  const newScore = score + SCORE_PER_SLIME;
                  const newLevel = Math.min(5, Math.floor(newScore / 100) + 1);
                  if (newLevel > level) setLevel(newLevel);

                  enemySpawnTimerRef.current = 0;
                }
              }
            });
          });
          return remainingEnemies;
        });
        return remainingBullets;
      });

      // spawn control
      const maxEnemies = getMaxEnemiesForLevel(level);
      const spawnDelay = getSpawnDelayForLevel(level);
      enemySpawnTimerRef.current += 16;
      if (enemies.length < maxEnemies && enemySpawnTimerRef.current >= spawnDelay) {
        setEnemies((cur) => [...cur, createEnemy(level)]);
        enemySpawnTimerRef.current = 0;
      }

      // enemy vs player
      enemies.forEach((enemy) => {
        if (checkCollision(
          { x: enemy.x, y: enemy.y, w: ENEMY_W, h: ENEMY_H },
          { x: playerX, y: PLAYER_Y, w: PLAYER_W, h: PLAYER_H }
        )) {
          setLives(prev => {
            const next = prev - 1;
            if (next <= 0) setGameOver(true);
            return next;
          });
          playSound('/components/sfx/player_hit.wav');
        }
      });

      // drop vs player
      setDrops((prevDrops) => {
        const rd = [...prevDrops];
        prevDrops.forEach((d, i) => {
          if (checkCollision({ x: d.x, y: d.y, w: DROP_W, h: DROP_H }, { x: playerX, y: PLAYER_Y, w: PLAYER_W, h: PLAYER_H })) {
            rd.splice(i, 1);
            setLives((prev) => {
              const nl = prev - 1;
              if (nl <= 0) setGameOver(true);
              return nl;
            });
          }
        });
        return rd;
      });

      // draw enemies
      enemies.forEach((e) => assets.slime && ctx.drawImage(assets.slime, e.x, e.y, ENEMY_W, ENEMY_H));

      // draw bullets
      bullets.forEach((b) => assets.bullet && ctx.drawImage(assets.bullet, b.x, b.y, BULLET_W, BULLET_H));

      // draw drops
      drops.forEach((d) => assets.drop && ctx.drawImage(assets.drop, d.x, d.y, DROP_W, DROP_H));

      // draw player
      if (assets.player) {
        ctx.drawImage(assets.player, playerX, PLAYER_Y, PLAYER_W, PLAYER_H);
      }

      if (!gameOver) {
        gameLoopRef.current = requestAnimationFrame(loop);
      }
    };

    gameLoopRef.current = requestAnimationFrame(loop);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [assetsLoaded, gameOver, isPaused, activePanel, menuOpen, shooting, playerX, bullets, enemies, drops, score, level, lives, assets, createEnemy, playSound, highScoreEntry.show]);

  // Reset game
  const resetGame = () => {
    setScore(START_SCORE);
    setLives(START_LIVES);
    setLevel(1);
    setGameOver(false);
    setGameOverShown(false);
    setIsPaused(false);
    // close any panels
    setShowAbout(false);
    setShowIntroduction(false);
    setShowHelp(false);
    setShowEnemies(false);
    setHighScoreEntry({ show: false, score: 0, name: '' });
    setBullets([]);
    setDrops([]);
    setEnemies([]);
    setShooting(false);
    setPlayerX(W / 2 - PLAYER_W / 2);
    nextEnemyIdRef.current = 1;
    nextBulletIdRef.current = 1;
    nextDropIdRef.current = 1;
    lastShotRef.current = 0;
  };

  // Panel handlers (openers + generic closer)
  const handleAbout = () => setShowAbout(true);
  const handleIntroduction = () => setShowIntroduction(true);
  const handleHelp = () => setShowHelp(true);
  const handleShowEnemies = () => setShowEnemies(true);
  const handleClosePanel = () => {
    if (showAbout) setShowAbout(false);
    else if (showIntroduction) setShowIntroduction(false);
    else if (showHelp) setShowHelp(false);
    else if (showEnemies) setShowEnemies(false);
  };

  // High scores handlers
  const handleShowHighScores = () => setShowHighScores(true);
  const handleCloseHighScores = () => setShowHighScores(false);
  const handleClearHighScores = () => {
    const cleared = Array.from({ length: 10 }, () => ({ name: "Nobody", score: 0 }));
    setHighScores(cleared);
    if (typeof window !== 'undefined') {
      localStorage.setItem('slimeinvaders:highscores', JSON.stringify(cleared));
    }
  };

  // Check if score qualifies for high score list
  const qualifiesForHighScore = (score: number) => {
    return highScores.length < 10 || score > highScores[highScores.length - 1].score;
  };

  // Handle game over
  useEffect(() => {
    if (gameOver && !gameOverShown) {
      setGameOverShown(true);
      playSound("/components/sfx/gameover.wav");
      
      // Check if score qualifies for high score entry
      if (qualifiesForHighScore(score)) {
        const savedName = typeof window !== 'undefined' ? 
          localStorage.getItem('slimeinvaders:name') || '' : '';
        setHighScoreEntry({
          show: true,
          score: score,
          name: savedName
        });
      }
    }
  }, [gameOver, gameOverShown, score, playSound, qualifiesForHighScore]);

  // High score entry handlers
  const handleHighScoreEntryOk = () => {
    const newEntry = { name: highScoreEntry.name || 'Anonymous', score: highScoreEntry.score };
    const newHighScores = [...highScores, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    
    setHighScores(newHighScores);
    setHighScoreEntry({ show: false, score: 0, name: '' });
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('slimeinvaders:highscores', JSON.stringify(newHighScores));
      localStorage.setItem('slimeinvaders:name', highScoreEntry.name);
    }
    
    setShowHighScores(true);
  };

  const handleHighScoreEntryCancel = () => {
    setHighScoreEntry({ show: false, score: 0, name: '' });
    setShowHighScores(true);
  };

  // Panel keyboard controls
  useEffect(() => {
    if (activePanel === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "Escape") {
        e.preventDefault();
        handleClosePanel();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activePanel]);

  // Compute OK button style
  let okButtonStyle: React.CSSProperties | undefined;
  if (activePanel) {
    const cfg = PANEL_BUTTON_OFFSETS[activePanel] ?? { bottom: 18 };
    okButtonStyle = { bottom: cfg.bottom } as React.CSSProperties;
    if (typeof cfg.left === "number") okButtonStyle.left = cfg.left;
    else if (typeof cfg.right === "number") okButtonStyle.right = cfg.right;
    else {
      okButtonStyle.left = "50%";
      okButtonStyle.transform = "translateX(-50%)";
    }
  }

  if (!assetsLoaded) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-white">
        <div className="text-xl font-mono">Loading assets...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      {/* Game Container */}
      <div className="relative" style={{ width: W }}>
        {/* Menu Bar */}
        <div style={{ width: W }}>
          <MenuBar
            onMenuStateChange={setMenuOpen}
            onNewGame={resetGame}
            onToggleSound={() => setSoundOn((p) => !p)}
            onTogglePause={() => setIsPaused((p) => !p)}
            onShowAbout={handleAbout}
            onShowIntroduction={handleIntroduction}
            onShowHelp={handleHelp}
            onShowEnemies={handleShowEnemies}
            onShowHighScores={handleShowHighScores}
            onClearHighScores={handleClearHighScores}
            soundOn={soundOn}
            isPaused={isPaused}
          />
        </div>

        {/* Game Canvas */}
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="pixelated block"
          style={{ imageRendering: "pixelated" }}
        />

        {/* Score/Lives/Level overlay on right panel */}
        <div className="absolute top-0 left-0 pointer-events-none">
          <div className="font-mono text-black font-bold text-lg" style={{ position: "absolute", left: "755px", top: "90px" }}>
            {score}
          </div>
          <div className="font-mono text-black font-bold text-lg" style={{ position: "absolute", left: "755px", top: "170px" }}>
            {lives}
          </div>
          <div className="font-mono text-black font-bold text-lg" style={{ position: "absolute", left: "755px", top: "250px" }}>
            {level}
          </div>
        </div>

        {/* Game Over Overlay */}
        {gameOver && !highScoreEntry.show && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center">
            <div className="text-white text-center mb-8">
              <img
                src="/components/art/ui/gameover.png"
                alt="Game Over"
                className="pixelated mb-4"
                style={{ 
                  width: Math.round(W * GAMEOVER_SCALE),
                  imageRendering: 'pixelated'
                }}
              />
              <button
                onClick={resetGame}
                className="px-6 py-2 bg-white text-black font-mono font-bold hover:bg-gray-200 transition-colors"
              >
                Play Again
              </button>
            </div>
          </div>
        )}

        {/* High Score Entry Overlay */}
        {highScoreEntry.show && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="relative">
              <img
                src="/components/art/ui/highscore_entry.png"
                alt="High Score Entry"
                className="pixelated"
                style={{ 
                  width: Math.round(W * HS_ENTRY_SCALE),
                  imageRendering: 'pixelated'
                }}
              />
              
              {/* Input overlay */}
              <input
                type="text"
                value={highScoreEntry.name}
                onChange={(e) => setHighScoreEntry(prev => ({ ...prev, name: e.target.value }))}
                className="absolute font-mono text-black bg-transparent border-none outline-none text-center"
                style={{
                  left: '50%',
                  top: '45%',
                  transform: 'translateX(-50%)',
                  width: '200px',
                  fontSize: '16px'
                }}
                maxLength={20}
                autoFocus
              />
              
              {/* OK Button */}
              <button
                onClick={handleHighScoreEntryOk}
                className="absolute px-8 py-1 bg-white border-2 border-black font-mono text-sm font-bold hover:bg-gray-100"
                style={{
                  left: '35%',
                  bottom: '25%',
                  transform: 'translateX(-50%)'
                }}
              >
                OK
              </button>
              
              {/* Cancel Button */}
              <button
                onClick={handleHighScoreEntryCancel}
                className="absolute px-6 py-1 bg-white border-2 border-black font-mono text-sm font-bold hover:bg-gray-100"
                style={{
                  right: '35%',
                  bottom: '25%',
                  transform: 'translateX(50%)'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Image Panels (single overlay driven by activePanel) */}
      {activePanel && (
        <div
          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleClosePanel}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            {activePanel === "about" && (
              <img
                src="/components/art/ui/about.png"
                alt="About Slimeinvaders"
                className="h-auto pixelated"
                style={{ width: Math.round(W * ABOUT_SCALE), imageRendering: "pixelated" }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                  e.currentTarget.nextElementSibling!.setAttribute("style", "display:block");
                }}
              />
            )}
            {activePanel === "intro" && (
              <img
                src="/components/art/ui/introduction.png"
                alt="Introduction"
                className="h-auto pixelated"
                style={{ width: Math.round(W * INTRO_SCALE), imageRendering: "pixelated" }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                  e.currentTarget.nextElementSibling!.setAttribute("style", "display:block");
                }}
              />
            )}
            {activePanel === "help" && (
              <img
                src="/components/art/ui/help.png"
                alt="Help"
                className="h-auto pixelated"
                style={{ width: Math.round(W * HELP_SCALE), imageRendering: "pixelated" }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                  e.currentTarget.nextElementSibling!.setAttribute("style", "display:block");
                }}
              />
            )}
            {activePanel === "enemies" && (
              <img
                src="/components/art/ui/show_enemies.png"
                alt="Show Enemies"
                className="max-w-full h-auto pixelated"
                style={{ width: Math.round(W * ENEMIES_SCALE), imageRendering: "pixelated" }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                  e.currentTarget.nextElementSibling!.setAttribute("style", "display:block");
                }}
              />
            )}

            {/* Fallback text */}
            <div className="hidden bg-white border-4 border-black p-8 font-mono text-center">
              <p className="text-lg font-bold mb-4">Missing Image</p>
              <p>Image not found</p>
            </div>

            {/* OK Button overlay */}
            <button
              onClick={handleClosePanel}
              className="absolute px-12 py-1 bg-white border-2 border-black font-mono text-sm font-bold hover:bg-gray-100 shadow-lg"
              style={okButtonStyle}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* High Scores Modal */}
      {showHighScores && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
          <HighscoreBoard 
            scores={highScores} 
            onClose={handleCloseHighScores}
            className="pixelated"
           // style={{ transform: `scale(${BOARD_SCALE})`, transformOrigin: "top left" }}
            style={{ 
              width: Math.round(W * BOARD_SCALE),
             height: Math.round(H * BOARD_SCALE), // maintain aspect ratio
              imageRendering: 'pixelated'
            }}
          />
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 text-white font-mono text-sm text-center max-w-2xl p-4">
        <p>Move mouse to control ship • Click and hold to shoot • Avoid slimes and their drops!</p>
      </div>
    </div>
  );
}

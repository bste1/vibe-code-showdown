import { useState, useEffect, useRef, useCallback } from "react";
import { supabase, fetchAllRows, withRetry } from "./supabase";

/* ─── DATA ─────────────────────────────────────────────────────── */
const CATEGORIES = [
  {
    id: "c1",
    icon: "01",
    name: "Work Eliminator",
    desc: "Reduces time spent on any routine task",
    guide:
      "Does this app meaningfully cut down repetitive, manual, or boring work?",
    rubric: [
      "1 – Barely saves any time",
      "2 – Minor time saver",
      "3 – Noticeable reduction in a task",
      "4 – Eliminates a real workflow step",
      "5 – This thing replaces hours of work",
    ],
  },
  {
    id: "c2",
    icon: "02",
    name: "Ease of Use",
    desc: "Intuitive, simple, frictionless",
    guide:
      "Could anyone on the team pick this up and use it without a tutorial?",
    rubric: [
      "1 – Confusing, unclear what to do",
      "2 – Some friction, needs guidance",
      "3 – Gets there, a few rough edges",
      "4 – Pretty smooth, minor confusion",
      "5 – Open it and just get it immediately",
    ],
  },
  {
    id: "c3",
    icon: "03",
    name: "Readiness",
    desc: "Can be used right now, delivers value immediately",
    guide:
      "Is this production-ready today? Can you get value from it on first use?",
    rubric: [
      "1 – Concept only, not usable",
      "2 – Works but needs major polish",
      "3 – Usable with some setup",
      "4 – Ready with minor tweaks",
      "5 – Ship it today, zero excuses",
    ],
  },
  {
    id: "c4",
    icon: "04",
    name: "Completeness",
    desc: "Covers edge cases & good surface area",
    guide:
      "Does it handle the weird stuff? Errors, edge inputs, real-world messiness?",
    rubric: [
      "1 – Happy path only, breaks easily",
      "2 – Handles a few cases",
      "3 – Decent coverage, some gaps",
      "4 – Most edge cases handled well",
      "5 – Thoughtfully covers the full surface",
    ],
  },
  {
    id: "c5",
    icon: "05",
    name: "Importance",
    desc: "Quality of the problem being solved",
    guide:
      "Does this actually matter? Is the problem real, painful, and worth solving?",
    rubric: [
      "1 – Solves a non-problem",
      "2 – Nice to have at best",
      "3 – Real problem, moderate impact",
      "4 – Important problem, high value",
      "5 – This is a must-solve for the team",
    ],
  },
];

const CEO_NAME = "Ben";

const INITIAL_PEOPLE = [
  "Andrea",
  "Andrew",
  "David",
  "JR",
  "Jonah",
  "Mildred",
  "Sam",
  "Sandra",
  "Taylor",
  "Arron",
  "Don",
  "Drixter",
  "Evan",
  "Jennifer",
  "Mischa",
  "Paul",
  "Ren",
  "Rod",
  "Rosie",
];

const DEFAULT_PENALTIES = {
  "Sam": "3 Roasted Lizards (unflavored with skin still attached) + Cheesy part of yogurt",
  "Jonah": "1 lb of Blue Cheese",
  "Rosie": "1 Tarantula — cooked (unflavored, unfried, still hairy)",
  "David": "1 Tarantula — cooked (unflavored, unfried, still hairy)",
  "Evan": "1 lb of Fish Eyes with level 5 spice (served room temp)",
  "Andrew": "1 Tarantula (unflavored, unfried, still hairy), 1 lb of Blue Cheese, 3 Roasted Lizards, and 1 lb of Fish Eyes with level 5 spice",
  "Taylor": "2 XL raw purple onions",
  "Sandra": "1 Tarantula — cooked (unflavored, unfried, still hairy)",
  "Mischa": "1 Frog (boiled, unflavored, no sauce, not skinned)",
  "Andrea": "1 Frog (boiled, unflavored, no sauce, not skinned)",
  "Drixter": "Balut",
  "Paul": "Balut",
  "Mildred": "1 Frog (boiled, unflavored, no sauce, not skinned)",
};

// Tenkara palette — restrained blueprint system: blue tints + clay, black text
const AVATAR_COLORS = [
  "#8FA0FF",
  "#FFFAD0",
  "#6E84FF",
  "#C7CEFF",
  "#5B73FF",
  "#E6E2C0",
  "#A8B4FF",
  "#7C8FFF",
  "#9AA8FF",
  "#B9C2FF",
  "#6478F5",
  "#D6DBFF",
  "#8294FF",
  "#EFEAC4",
  "#7184FF",
  "#AEB9FF",
  "#5F77F5",
  "#CDD4FF",
  "#9DABFF",
  "#7E91FF",
];

const SAD_QUOTES = [
  '"Every legend has a humble beginning… or something."',
  '"It\'s not losing, it\'s \'aggressive learning.\'"',
  '"On the bright side, someone had to go last."',
  '"First is just last backwards... wait, no."',
  '"The real treasure was the bugs we shipped along the way."',
];

const WINNER_TITLES = [
  "THE TENKARA VIP WINNER",
];

function initials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ─── CONFETTI (massive version) ─────────────────────────────── */
function Confetti({ active }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const colors = ["#0011FF","#FFFAD0","#2D4BFF","#8FA0FF","#FFFFFF","#5B73FF","#C7CEFF","#0011FF","#E6E2C0","#6E84FF"];
    const makePiece = () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 12,
      vy: Math.random() * 4 + 2,
      r: Math.random() * 12 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.4,
      type: Math.floor(Math.random() * 4),
      wobble: Math.random() * 10,
      wobbleSpeed: Math.random() * 0.1 + 0.03,
    });
    const pieces = Array.from({ length: 500 }, makePiece);
    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;
      pieces.forEach((p, i) => {
        p.wobble += p.wobbleSpeed;
        ctx.save();
        ctx.translate(p.x + Math.sin(p.wobble) * 3, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = Math.min(1, Math.max(0, 1 - (p.y - canvas.height + 100) / 100));
        ctx.fillStyle = p.color;
        if (p.type === 0) { ctx.fillRect(-p.r/2, -p.r/2, p.r, p.r * 0.5); }
        else if (p.type === 1) { ctx.beginPath(); ctx.arc(0, 0, p.r/2, 0, Math.PI * 2); ctx.fill(); }
        else if (p.type === 2) { ctx.fillRect(-p.r/2, -1, p.r, 3); }
        else {
          ctx.beginPath();
          for (let j = 0; j < 5; j++) {
            const a = (j * 4 * Math.PI) / 5 - Math.PI / 2;
            ctx[j === 0 ? "moveTo" : "lineTo"](Math.cos(a) * p.r * 0.5, Math.sin(a) * p.r * 0.5);
          }
          ctx.closePath(); ctx.fill();
        }
        ctx.restore();
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04;
        p.vx *= 0.995;
        p.angle += p.spin;
        if (p.y > canvas.height + 50) {
          Object.assign(pieces[i], makePiece());
          pieces[i].y = -20 - Math.random() * 50;
        }
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [active]);
  if (!active) return null;
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999 }} />;
}

/* ─── COUNTDOWN REVEAL (dramatic 3-2-1 with fizzle dissolve) ── */
function CountdownReveal({ onComplete, label }) {
  const [stage, setStage] = useState("label");
  const [num, setNum] = useState(3);
  const [fizzle, setFizzle] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const seq = [
      () => setStage("counting"),
      () => setNum(3),
      2000,
      () => setNum(2),
      2000,
      () => setNum(1),
      2000,
      () => { setStage("fizzle"); setFizzle(true); },
      1200,
      () => onComplete(),
    ];
    let i = 0;
    const next = () => {
      if (i >= seq.length) return;
      const step = seq[i];
      i++;
      if (typeof step === "function") { step(); next(); }
      else { timerRef.current = setTimeout(next, step); }
    };
    timerRef.current = setTimeout(next, 800);
    return () => clearTimeout(timerRef.current);
  }, [onComplete]);

  if (stage === "label") {
    return (
      <div style={{ padding: 60, textAlign: "center" }}>
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: 4, color: "rgba(255,215,0,0.6)", textTransform: "uppercase", animation: "pulse 1.5s ease-in-out infinite" }}>{label}</div>
      </div>
    );
  }

  if (stage === "fizzle") {
    return (
      <div style={{ position: "relative", padding: 60, textAlign: "center", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(circle, rgba(0,17,255,0.35) 0%, transparent 70%)",
          animation: "fireworkBurst 1s ease-out forwards",
        }} />
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: 48, fontWeight: 700, letterSpacing: 10,
          background: "linear-gradient(90deg, #0011FF, #FFFAD0, #0011FF)",
          backgroundSize: "200%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          animation: "textShine 1s linear infinite",
          textShadow: "none",
        }}>REVEAL</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 50, textAlign: "center", position: "relative" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, letterSpacing: 4, color: "rgba(255,250,208,0.3)", textTransform: "uppercase", marginBottom: 16 }}>{label}</div>
      <div key={num} style={{
        fontFamily: "var(--font-mono)",
        fontSize: 160, fontWeight: 700, lineHeight: 1,
        color: "transparent",
        background: `linear-gradient(180deg, #FFFAD0, ${num === 1 ? "#0011FF" : num === 2 ? "#8FA0FF" : "#FFFAD0"})`,
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        animation: "bounceIn 0.5s ease",
        filter: `drop-shadow(0 0 ${60 - num * 15}px rgba(0,17,255,${0.4 + (3 - num) * 0.2}))`,
      }}>{num}</div>
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(circle, rgba(0,17,255,${0.05 + (3 - num) * 0.05}) 0%, transparent 60%)`,
      }} />
    </div>
  );
}

/* ─── SYSTEM CELEBRATION (rising brand marks) ────────────────── */
function UnicornCelebration({ active }) {
  if (!active) return null;
  const palette = ["#0011FF", "#FFFAD0", "#2D4BFF", "#8FA0FF"];
  const marks = Array.from({ length: 22 }, (_, i) => ({
    kind: i % 3, // 0 square, 1 chevron, 2 ring
    color: palette[i % palette.length],
    left: Math.random() * 100,
    delay: Math.random() * 3,
    dur: 2.5 + Math.random() * 3,
    size: 10 + Math.random() * 16,
  }));
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9998,
        overflow: "hidden",
      }}
    >
      {marks.map((m, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${m.left}%`,
            bottom: -60,
            animation: `floatUp ${m.dur}s ease-out ${m.delay}s infinite`,
          }}
        >
          {m.kind === 1 ? (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: m.size,
                fontWeight: 700,
                color: m.color,
              }}
            >
              &gt;&gt;
            </span>
          ) : (
            <div
              style={{
                width: m.size,
                height: m.size,
                background: m.kind === 0 ? m.color : "transparent",
                border: m.kind === 2 ? `2px solid ${m.color}` : "none",
                borderRadius: m.kind === 2 ? "50%" : 0,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── RAIN EFFECT (sad last-place reveal) ────────────────────── */
function SadRain({ active }) {
  if (!active) return null;
  const drops = Array.from({ length: 40 }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 2,
    dur: 0.5 + Math.random() * 1,
  }));
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9997,
        overflow: "hidden",
      }}
    >
      {drops.map((d, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${d.left}%`,
            top: -20,
            width: 1,
            height: 18,
            background: "rgba(143,160,255,0.5)",
            opacity: 0.4,
            animation: `floatUp ${d.dur}s linear ${d.delay}s infinite reverse`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── TICKER (industrial signage marquee) ─────────────────────── */
function Ticker() {
  const seg =
    "TENKARA TALENT SHOW   //   EDITION 02   //   VIBE CODE SHOWDOWN   //   FIELD TESTED   //   ALL SYSTEMS ACTIVE   //   ";
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: "#0011FF",
        borderBottom: "1px solid rgba(255,250,208,0.25)",
        overflow: "hidden",
        height: 28,
        display: "flex",
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          whiteSpace: "nowrap",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 2,
          color: "#FFFAD0",
          animation: "marquee 32s linear infinite",
        }}
      >
        {seg.repeat(6)}
      </div>
    </div>
  );
}

/* ─── STAR BG ───────────────────────────────────────────────────── */
function StarBg() {
  return (
    <>
      <Ticker />
      <div
        style={{
          position: "fixed",
          inset: 0,
          overflow: "hidden",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <div className="tk-grid" />
        <div className="tk-halftone" />
        {/* Oversized chevron motif, right edge */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: -40,
            transform: "translateY(-50%)",
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            fontSize: 220,
            lineHeight: 0.8,
            color: "rgba(0,17,255,0.06)",
            letterSpacing: -20,
            userSelect: "none",
          }}
        >
          &gt;&gt;
        </div>
        {/* Vertical wordmark watermark, left edge */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: -10,
            transform: "translateY(-50%) rotate(180deg)",
            writingMode: "vertical-rl",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            letterSpacing: 8,
            color: "rgba(255,250,208,0.12)",
            textTransform: "uppercase",
            userSelect: "none",
          }}
        >
          Automation Dept. — Field Tested — 2149821-083
        </div>
        {/* Corner registration / serial annotations */}
        <div
          style={{
            position: "absolute",
            top: 38,
            right: 16,
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: 1.5,
            color: "rgba(0,17,255,0.65)",
            textAlign: "right",
            lineHeight: 1.6,
          }}
        >
          STATUS: LIVE<br />
          V 2.40 · FIELD&nbsp;TESTED
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 14,
            left: 16,
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: 1.5,
            color: "rgba(255,250,208,0.28)",
          }}
        >
          EVERY VALUE HAS INTENT — NOTHING IS DECORATIVE
        </div>
        {/* Crop marks */}
        <div style={{ position: "absolute", top: 34, left: 12, width: 14, height: 14, borderLeft: "1px solid rgba(255,250,208,0.25)", borderTop: "1px solid rgba(255,250,208,0.25)" }} />
        <div style={{ position: "absolute", bottom: 12, right: 12, width: 14, height: 14, borderRight: "1px solid rgba(255,250,208,0.25)", borderBottom: "1px solid rgba(255,250,208,0.25)" }} />
      </div>
    </>
  );
}

/* ─── TENKARA LOGO (infinity / knot mark + wordmark) ─────────── */
function TenkaraLogo({ size = 28, showWordmark = true, color = "#FFFAD0" }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <svg
        width={size * 1.7}
        height={size}
        viewBox="0 0 100 60"
        fill="none"
        style={{ display: "block" }}
      >
        <circle cx="34" cy="30" r="20" stroke="#0011FF" strokeWidth="9" />
        <circle cx="66" cy="30" r="20" stroke={color} strokeWidth="9" />
      </svg>
      {showWordmark && (
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: size * 0.92,
            fontWeight: 500,
            color,
            letterSpacing: "-0.5px",
          }}
        >
          Tenkara
        </span>
      )}
    </div>
  );
}

/* ─── Small technical mono tag, Tenkara-style ────────────────── */
function TechTag({ children, color = "#0011FF" }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        letterSpacing: 2,
        textTransform: "uppercase",
        color,
        border: `1px solid ${color}`,
        borderRadius: 3,
        padding: "3px 8px",
        display: "inline-block",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

/* ─── LOCK SCREEN (confidential voting) ──────────────────────── */
function LockScreen({ voterName, onUnlock }) {
  const [code, setCode] = useState("");
  const expected = voterName.split(" ")[0].toLowerCase();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.92)",
        backdropFilter: "blur(20px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <TenkaraLogo size={28} />
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 3, color: "#0011FF" }}>CONFIDENTIAL — IDENTITY CHECK</span>
      <h2
        style={{
          color: "#FFFAD0",
          fontWeight: 500,
          fontSize: 28,
          fontFamily: "var(--font-display)",
        }}
      >
        Confidential Ballot
      </h2>
      <p
        style={{
          color: "rgba(255,255,255,0.5)",
          fontSize: 15,
          textAlign: "center",
          maxWidth: 360,
          lineHeight: 1.5,
          fontFamily: "'Trebuchet MS', sans-serif",
        }}
      >
        Your votes are private. Nobody can see your scores.
        <br />
        Type your <strong style={{ color: "#4ECDC4" }}>first name</strong> to
        confirm it's you.
      </p>
      <input
        autoFocus
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={(e) => {
          if (
            e.key === "Enter" &&
            code.trim().toLowerCase() === expected
          )
            onUnlock();
        }}
        placeholder="Your first name…"
        style={{
          background: "rgba(255,255,255,0.08)",
          border: "2px solid rgba(255,255,255,0.2)",
          borderRadius: 14,
          padding: "14px 20px",
          color: "#fff",
          fontFamily: "'Trebuchet MS', sans-serif",
          fontSize: 18,
          textAlign: "center",
          width: 260,
          outline: "none",
        }}
      />
      <button
        onClick={() => {
          if (code.trim().toLowerCase() === expected) onUnlock();
        }}
        style={{
          background: "linear-gradient(135deg, #4ECDC4, #45B7D1)",
          color: "#000",
          border: "none",
          borderRadius: 14,
          padding: "12px 40px",
          fontWeight: 800,
          fontSize: 16,
          cursor: "pointer",
          fontFamily: "'Trebuchet MS', sans-serif",
        }}
      >
        Unlock &amp; Vote
      </button>
    </div>
  );
}

/* ─── SCRATCH CARD CANVAS ────────────────────────────────────── */
function ScratchCard({ width, height, onComplete, children, color = "gold" }) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const doneRef = useRef(false);

  const palette = {
    gold: { c1: "#b8860b", c2: "#ffd700", c3: "#daa520", sparkle: "#fff8dc" },
    silver: { c1: "#708090", c2: "#c0c0c0", c3: "#a9a9a9", sparkle: "#f0f0f0" },
    bronze: { c1: "#8b4513", c2: "#cd7f32", c3: "#a0522d", sparkle: "#ffe4c4" },
  };
  const pal = palette[color] || palette.gold;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;

    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, pal.c1);
    grad.addColorStop(0.3, pal.c2);
    grad.addColorStop(0.5, pal.c3);
    grad.addColorStop(0.7, pal.c2);
    grad.addColorStop(1, pal.c1);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 80; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = Math.random() * 3 + 1;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.4 + 0.1})`;
      ctx.fill();
    }

    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.font = `bold ${Math.min(20, width / 22)}px "Space Mono", monospace`;
    ctx.textAlign = "center";
    ctx.fillText("SCRATCH TO REVEAL", width / 2, height / 2 + 8);
    ctx.font = `${Math.min(12, width / 36)}px "Space Mono", monospace`;
    ctx.fillText(">>>>>>>", width / 2, height / 2 + 30);

    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1;
    ctx.setLineDash([8, 8]);
    ctx.strokeRect(12, 12, width - 24, height - 24);
    ctx.setLineDash([]);
  }, [width, height, pal]);

  const scratch = useCallback(
    (x, y) => {
      const canvas = canvasRef.current;
      if (!canvas || doneRef.current) return;
      const ctx = canvas.getContext("2d");
      ctx.globalCompositeOperation = "destination-out";
      const r = 32;
      const radGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
      radGrad.addColorStop(0, "rgba(0,0,0,1)");
      radGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let cleared = 0;
      for (let i = 3; i < imageData.data.length; i += 4) {
        if (imageData.data[i] === 0) cleared++;
      }
      const pct = cleared / (imageData.data.length / 4);
      if (pct > 0.35 && !doneRef.current) {
        doneRef.current = true;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onComplete();
      }
    },
    [onComplete]
  );

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * width,
      y: ((clientY - rect.top) / rect.height) * height,
    };
  };

  return (
    <div style={{ position: "relative", width: "100%", height, borderRadius: 16, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        {children}
      </div>
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", cursor: "crosshair", borderRadius: 16, touchAction: "none" }}
        onMouseDown={(e) => { isDrawing.current = true; scratch(getPos(e).x, getPos(e).y); }}
        onMouseMove={(e) => { if (isDrawing.current) scratch(getPos(e).x, getPos(e).y); }}
        onMouseUp={() => (isDrawing.current = false)}
        onMouseLeave={() => (isDrawing.current = false)}
        onTouchStart={(e) => { e.preventDefault(); isDrawing.current = true; scratch(getPos(e).x, getPos(e).y); }}
        onTouchMove={(e) => { e.preventDefault(); if (isDrawing.current) scratch(getPos(e).x, getPos(e).y); }}
        onTouchEnd={() => (isDrawing.current = false)}
      />
    </div>
  );
}

/* ─── SPIN WHEEL ─────────────────────────────────────────────── */
function SpinWheel({ names, onComplete }) {
  const canvasRef = useRef(null);
  const [orderedNames, setOrderedNames] = useState([]);
  const [remaining, setRemaining] = useState(names);
  const [spinning, setSpinning] = useState(false);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [selectedName, setSelectedName] = useState(null);
  const [done, setDone] = useState(false);
  const angleRef = useRef(0);
  const animRef = useRef(null);

  const colors = [
    "#8FA0FF", "#FFFAD0", "#6E84FF", "#C7CEFF", "#5B73FF",
    "#E6E2C0", "#A8B4FF", "#7C8FFF", "#9AA8FF", "#B9C2FF",
    "#6478F5", "#D6DBFF", "#8294FF", "#EFEAC4", "#7184FF",
    "#AEB9FF", "#5F77F5", "#CDD4FF", "#9DABFF", "#7E91FF",
  ];

  useEffect(() => {
    if (remaining.length > 0 && !spinning && !selectedName) {
      const timer = setTimeout(() => spinOnce(), orderedNames.length === 0 ? 500 : 1200);
      return () => clearTimeout(timer);
    }
    if (remaining.length === 0 && !spinning && !done) {
      setDone(true);
      setTimeout(() => onComplete(orderedNames), 1500);
    }
  }, [remaining, spinning, selectedName, orderedNames, done]);

  function drawWheel(ctx, w, h, items, angle) {
    const cx = w / 2, cy = h / 2, r = Math.min(cx, cy) - 20;
    ctx.clearRect(0, 0, w, h);

    if (items.length === 0) return;
    const sliceAngle = (2 * Math.PI) / items.length;

    items.forEach((name, i) => {
      const start = angle + i * sliceAngle;
      const end = start + sliceAngle;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + sliceAngle / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#000";
      ctx.font = `bold ${Math.min(16, 200 / items.length)}px "Space Mono", monospace`;
      ctx.fillText(name, r - 14, 5);
      ctx.restore();
    });

    // pointer
    ctx.beginPath();
    ctx.moveTo(cx + r + 5, cy);
    ctx.lineTo(cx + r + 25, cy - 12);
    ctx.lineTo(cx + r + 25, cy + 12);
    ctx.closePath();
    ctx.fillStyle = "#0011FF";
    ctx.fill();
    ctx.strokeStyle = "#FFFAD0";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function spinOnce() {
    if (remaining.length === 0) return;
    setSpinning(true);
    setSelectedName(null);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;

    const totalSpins = 3 + Math.random() * 3;
    const targetAngle = angleRef.current + totalSpins * 2 * Math.PI + Math.random() * 2 * Math.PI;
    const duration = 2500 + Math.random() * 1000;
    const startTime = Date.now();
    const startAngle = angleRef.current;

    function animate() {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      const angle = startAngle + (targetAngle - startAngle) * ease;
      angleRef.current = angle;

      drawWheel(ctx, w, h, remaining, angle);

      if (t < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        const sliceAngle = (2 * Math.PI) / remaining.length;
        const normalizedAngle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const pointerAngle = (2 * Math.PI - normalizedAngle) % (2 * Math.PI);
        const idx = Math.floor(pointerAngle / sliceAngle) % remaining.length;
        const picked = remaining[idx];

        setSelectedName(picked);
        setSpinning(false);

        setTimeout(() => {
          setOrderedNames((prev) => [...prev, picked]);
          setRemaining((prev) => prev.filter((n) => n !== picked));
          setSelectedName(null);
        }, 800);
      }
    }
    animate();
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 500;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");
    drawWheel(ctx, 500, 500, remaining, angleRef.current);
  }, [remaining]);

  useEffect(() => {
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
      <canvas
        ref={canvasRef}
        style={{ width: 400, height: 400, borderRadius: "50%", boxShadow: "0 0 60px rgba(255,230,109,0.3)" }}
      />

      {selectedName && (
        <div style={{
          fontSize: 28, fontWeight: 900, color: "#FFE66D",
          animation: "slideInUp 0.4s ease", textAlign: "center",
        }}>
          #{orderedNames.length + 1}: {selectedName}
        </div>
      )}

      {orderedNames.length > 0 && (
        <div style={{
          display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", maxWidth: 500,
        }}>
          {orderedNames.map((n, i) => (
            <div key={n} style={{
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 10, padding: "6px 12px", fontSize: 13, color: "#fff",
            }}>
              <strong style={{ color: "#FFE66D" }}>#{i + 1}</strong> {n}
            </div>
          ))}
        </div>
      )}

      {done && (
        <div style={{ fontSize: 20, fontWeight: 900, color: "#4ECDC4", animation: "slideInUp 0.5s ease" }}>
          Order locked in! Starting voting...
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN APP — Round-based: one candidate at a time, everyone votes together
═══════════════════════════════════════════════════════════════ */
export default function VibeShowdown() {
  const [phase, setPhase] = useState("loading");
  const [people, setPeople] = useState(INITIAL_PEOPLE);
  const [addName, setAddName] = useState("");
  const [penalties, setPenalties] = useState(DEFAULT_PENALTIES);
  const [editingPenalty, setEditingPenalty] = useState(null);
  const [penaltyDraft, setPenaltyDraft] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isCeo, setIsCeo] = useState(false);

  const [voterOrder, setVoterOrder] = useState([]);
  const [presentationOrder, setPresentationOrder] = useState([]);

  const [sessionLocked, setSessionLocked] = useState(false);

  const [activeVoter, setActiveVoter] = useState(null);
  const [doneVoters, setDoneVoters] = useState(new Set());
  const [claimedVoters, setClaimedVoters] = useState(new Set());
  const [showLock, setShowLock] = useState(false);
  const [pendingVoter, setPendingVoter] = useState(null);

  // Round-based voting
  const [currentRound, setCurrentRound] = useState(0);
  const [roundScores, setRoundScores] = useState({});
  const [myVoteSubmitted, setMyVoteSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [voteError, setVoteError] = useState(null);
  const [roundVoteCount, setRoundVoteCount] = useState(0);
  const [roundVotedNames, setRoundVotedNames] = useState(new Set());
  const [totalVoters, setTotalVoters] = useState(0);

  const [results, setResults] = useState([]);
  const [revealed, setRevealed] = useState([]);
  const [revealingIdx, setRevealingIdx] = useState(-1);
  const [allRevealed, setAllRevealed] = useState(false);
  const [prizePhase, setPrizePhase] = useState(0); // 0=not started, 1=show button, 2=scratching 1st, 3=revealed 1st, 4=scratching 2nd, 5=revealed 2nd, 6=scratching 3rd, 7=revealed 3rd
  const [confetti, setConfetti] = useState(false);
  const [unicorns, setUnicorns] = useState(false);
  const [sadRain, setSadRain] = useState(false);
  const [autoRevealing, setAutoRevealing] = useState(false);

  const subscriptionRef = useRef(null);
  const sessionSubRef = useRef(null);
  const votesSubRef = useRef(null);
  const voteCountDebounceRef = useRef(null);
  const votePollRef = useRef(null);
  const claimsPollRef = useRef(null);

  const participants = people.filter((p) => p !== CEO_NAME);
  const allVoters = [...people, ...(people.includes(CEO_NAME) ? [] : [CEO_NAME])];
  const pendingVoters = voterOrder.filter(
    (p) => !doneVoters.has(p) && !claimedVoters.has(p)
  );

  const currentCandidate = presentationOrder[currentRound] || null;
  const isLastRound = currentRound >= presentationOrder.length - 1;
  const allRoundVotesIn = totalVoters > 0 && roundVoteCount >= totalVoters;

  /* ── On mount: check URL for ?s=sessionId, restore voter from localStorage ── */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("s");
    if (sid) {
      loadSession(sid);
    } else {
      const savedCeo = localStorage.getItem("vibe_ceo_session");
      if (savedCeo) {
        try {
          const { sessionId: savedSid } = JSON.parse(savedCeo);
          if (savedSid) {
            const url = new URL(window.location);
            url.searchParams.set("s", savedSid);
            window.history.replaceState({}, "", url);
            setIsCeo(true);
            loadSession(savedSid);
            return;
          }
        } catch (_) {}
      }
      setIsCeo(true);
      setPhase("setup");
    }
  }, []);

  async function loadSession(sid) {
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sid)
      .single();
    if (error || !data) {
      console.error("Session not found", error);
      setIsCeo(true);
      setPhase("setup");
      return;
    }
    setSessionId(sid);
    setPeople(data.participants);
    setVoterOrder(data.voter_order);
    setPresentationOrder(data.presentation_order || []);
    setCurrentRound(data.current_round || 0);
    setSessionLocked(data.locked || false);
    await loadClaims(sid);
    subscribeToClaims(sid);
    subscribeToSession(sid);

    // Restore voter identity from localStorage
    const saved = localStorage.getItem(`vibe_voter_${sid}`);
    if (saved) {
      const { voterName, isCeo: wasCeo } = JSON.parse(saved);
      const { data: claimRows } = await supabase
        .from("claims")
        .select("voter_name")
        .eq("session_id", sid)
        .eq("voter_name", voterName);
      if (claimRows && claimRows.length > 0) {
        setActiveVoter(voterName);
        if (wasCeo) setIsCeo(true);
        // Check if already voted this round
        if (data.presentation_order && data.presentation_order.length > 0) {
          const currentCand = data.presentation_order[data.current_round || 0];
          if (currentCand) {
            const { data: myVotes } = await supabase
              .from("votes")
              .select("id")
              .eq("session_id", sid)
              .eq("voter_name", voterName)
              .eq("participant_name", currentCand)
              .limit(1);
            if (myVotes && myVotes.length > 0) {
              setMyVoteSubmitted(true);
            }
          }
          setPhase("voting");
          return;
        }
      }
    }

    if (data.presentation_order && data.presentation_order.length > 0) {
      setPhase("login");
    } else {
      setPhase(data.phase || "login");
    }
  }

  async function loadClaims(sid) {
    const { data } = await supabase
      .from("claims")
      .select("voter_name, status")
      .eq("session_id", sid);
    if (!data) return;
    const claimed = new Set();
    const done = new Set();
    data.forEach((c) => {
      claimed.add(c.voter_name);
      if (c.status === "done") done.add(c.voter_name);
    });
    setClaimedVoters(claimed);
    setDoneVoters(done);
  }

  function subscribeToClaims(sid) {
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
    }
    const channel = supabase
      .channel(`claims-${sid}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "claims", filter: `session_id=eq.${sid}` },
        () => loadClaims(sid)
      )
      .subscribe();
    subscriptionRef.current = channel;
  }

  function subscribeToSession(sid) {
    if (sessionSubRef.current) {
      supabase.removeChannel(sessionSubRef.current);
    }
    const channel = supabase
      .channel(`session-${sid}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "sessions", filter: `id=eq.${sid}` },
        (payload) => {
          const row = payload.new;
          if (row.locked != null) setSessionLocked(row.locked);
          if (row.current_round != null) {
            setCurrentRound(row.current_round);
            setMyVoteSubmitted(false);
            setRoundScores({});
            setVoteError(null);
          }
          if (row.presentation_order && row.presentation_order.length > 0) {
            setPresentationOrder(row.presentation_order);
          }
          if (row.phase === "results") {
            setPhase((prev) => prev !== "results" ? "voter-done" : prev);
          }
        }
      )
      .subscribe();
    sessionSubRef.current = channel;
  }

  function subscribeToVotes(sid, candidateName) {
    if (votesSubRef.current) {
      supabase.removeChannel(votesSubRef.current);
    }
    loadRoundVoteCount(sid, candidateName);
    const channel = supabase
      .channel(`votes-${sid}-${candidateName}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "votes", filter: `session_id=eq.${sid}` },
        () => {
          // Debounce: a single submit fires 5 INSERTs; many voters at once
          // would otherwise trigger a query storm on every connected device.
          if (voteCountDebounceRef.current) clearTimeout(voteCountDebounceRef.current);
          voteCountDebounceRef.current = setTimeout(
            () => loadRoundVoteCount(sid, candidateName),
            500
          );
        }
      )
      .subscribe();
    votesSubRef.current = channel;
  }

  async function loadRoundVoteCount(sid, candidateName) {
    const { data } = await supabase
      .from("votes")
      .select("voter_name")
      .eq("session_id", sid)
      .eq("participant_name", candidateName);
    if (!data) return;
    const uniqueVoters = new Set(data.map((v) => v.voter_name));
    setRoundVoteCount(uniqueVoters.size);
    setRoundVotedNames(uniqueVoters);
  }

  useEffect(() => {
    return () => {
      if (subscriptionRef.current) supabase.removeChannel(subscriptionRef.current);
      if (sessionSubRef.current) supabase.removeChannel(sessionSubRef.current);
      if (votesSubRef.current) supabase.removeChannel(votesSubRef.current);
      if (votePollRef.current) clearInterval(votePollRef.current);
      if (claimsPollRef.current) clearInterval(claimsPollRef.current);
    };
  }, []);

  // Polling fallback for the claim/join count during login, so the CEO sees an
  // accurate "joined" tally before locking even under a burst of 40 joins.
  useEffect(() => {
    if ((phase === "login" || phase === "setup") && sessionId) {
      if (claimsPollRef.current) clearInterval(claimsPollRef.current);
      claimsPollRef.current = setInterval(() => loadClaims(sessionId), 4000);
      return () => {
        if (claimsPollRef.current) clearInterval(claimsPollRef.current);
      };
    }
  }, [phase, sessionId]);

  // Auto-transition to voting when presentation_order is set and voter has claimed
  useEffect(() => {
    if (phase === "login" && activeVoter && presentationOrder.length > 0) {
      setPhase("voting");
    }
  }, [phase, activeVoter, presentationOrder]);

  // When round changes or voting starts, subscribe to votes and check if already voted
  useEffect(() => {
    if (phase === "voting" && sessionId && currentCandidate) {
      const votersForCandidate = voterOrder.filter((p) => p !== currentCandidate);
      setTotalVoters(votersForCandidate.length);
      subscribeToVotes(sessionId, currentCandidate);

      if (activeVoter) {
        supabase
          .from("votes")
          .select("id")
          .eq("session_id", sessionId)
          .eq("voter_name", activeVoter)
          .eq("participant_name", currentCandidate)
          .limit(1)
          .then(({ data }) => {
            setMyVoteSubmitted(data && data.length > 0);
          });
      }

      // Polling fallback: at 40 concurrent voters, Supabase realtime can
      // throttle/drop postgres_changes events. Poll the live count every 3s
      // so the CEO's "X of Y voted" gauge stays accurate regardless.
      if (votePollRef.current) clearInterval(votePollRef.current);
      votePollRef.current = setInterval(() => {
        loadRoundVoteCount(sessionId, currentCandidate);
      }, 3000);
      return () => {
        if (votePollRef.current) clearInterval(votePollRef.current);
      };
    }
  }, [phase, sessionId, currentRound, currentCandidate]);

  /* ── CEO: Start the show ── */
  async function startShow() {
    if (people.length < 2) return;
    const allNames = [...people, ...(people.includes(CEO_NAME) ? [] : [CEO_NAME])];
    const vOrder = shuffle(allNames);
    setVoterOrder(vOrder);

    const { data, error } = await supabase
      .from("sessions")
      .insert({
        phase: "login",
        participants: allNames,
        presentation_order: [],
        voter_order: vOrder,
        current_round: 0,
        locked: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create session", error);
      return;
    }
    const sid = data.id;
    setSessionId(sid);
    setIsCeo(true);
    setCurrentRound(0);
    setSessionLocked(false);
    const url = new URL(window.location);
    url.searchParams.set("s", sid);
    window.history.replaceState({}, "", url);
    localStorage.setItem("vibe_ceo_session", JSON.stringify({ sessionId: sid }));
    subscribeToClaims(sid);
    subscribeToSession(sid);
    setPhase("login");
  }

  async function lockNamesAndRevealPrizes() {
    if (!sessionId) return;
    await supabase
      .from("sessions")
      .update({ locked: true })
      .eq("id", sessionId);
    setSessionLocked(true);
    setPrizePhase(1);
    setPhase("prizes");
  }

  function startSpinFromPrizes() {
    setPhase("spin");
  }

  async function onWheelComplete(orderedNames) {
    setPresentationOrder(orderedNames);
    setCurrentRound(0);
    setMyVoteSubmitted(false);
    setRoundScores({});
    setRoundVoteCount(0);
    setRoundVotedNames(new Set());
    await supabase
      .from("sessions")
      .update({ presentation_order: orderedNames, current_round: 0, phase: "voting" })
      .eq("id", sessionId);
    setPhase("voting");
  }

  async function requestVoting(voter) {
    setPendingVoter(voter);
    setShowLock(true);
  }

  async function unlockAndVote() {
    setShowLock(false);
    const voter = pendingVoter;

    const { error } = await withRetry(() =>
      supabase.from("claims").insert({
        session_id: sessionId,
        voter_name: voter,
        status: "claimed",
      })
    );

    if (error) {
      if (error.code === "23505") {
        alert(`${voter} has already been claimed by someone else!`);
        return;
      }
      console.error("Claim failed", error);
      alert("Couldn't join — check your connection and try again.");
      return;
    }

    setClaimedVoters((prev) => new Set([...prev, voter]));
    setActiveVoter(voter);
    setRoundScores({});
    setMyVoteSubmitted(false);

    // Persist identity so refresh doesn't log out
    localStorage.setItem(`vibe_voter_${sessionId}`, JSON.stringify({ voterName: voter, isCeo }));

    if (presentationOrder.length > 0) {
      setPhase("voting");
    }
  }

  function setScore(catId, val) {
    setRoundScores((prev) => ({ ...prev, [catId]: val }));
  }

  async function submitRoundVote() {
    const voter = activeVoter;
    const candidate = currentCandidate;
    if (!voter || !candidate || submitting) return;

    const rows = CATEGORIES.map((cat) => ({
      session_id: sessionId,
      voter_name: voter,
      participant_name: candidate,
      category_id: cat.id,
      score: roundScores[cat.id],
      is_ceo: isCeo,
    }));

    setSubmitting(true);
    setVoteError(null);

    // Retry on transient failures so votes don't silently vanish under load.
    const { error } = await withRetry(() =>
      supabase.from("votes").upsert(rows, {
        onConflict: "session_id,voter_name,participant_name,category_id",
      })
    );

    if (error) {
      console.error("Vote write failed", error);
      setSubmitting(false);
      setVoteError("Your vote didn't go through. Tap to try again.");
      return;
    }

    setSubmitting(false);
    setMyVoteSubmitted(true);
    setRoundScores({});
  }

  async function advanceRound() {
    if (!sessionId) return;
    const nextRound = currentRound + 1;
    await supabase
      .from("sessions")
      .update({ current_round: nextRound })
      .eq("id", sessionId);
    setCurrentRound(nextRound);
    setMyVoteSubmitted(false);
    setRoundScores({});
    setRoundVoteCount(0);
    setRoundVotedNames(new Set());
  }

  async function calculateAndReveal() {
    let allVoteRows;
    try {
      // Page past the 1000-row cap so large sessions tally every vote.
      allVoteRows = await fetchAllRows("votes", (q) =>
        q.eq("session_id", sessionId)
      );
    } catch (e) {
      console.error("Failed to load votes for results", e);
      alert("Couldn't load all votes — check your connection and try again.");
      return;
    }

    if (!allVoteRows) return;

    // Index every row once: O(N) instead of nested find/filter scans.
    // At 40 voters (~7,800 rows) the naive version did tens of millions of
    // comparisons and could freeze the CEO screen on reveal.
    const ceoIndex = {}; // participant -> { catId: score }
    const teamIndex = {}; // participant -> { voter -> { catId: score } }
    for (const v of allVoteRows) {
      if (v.is_ceo) {
        (ceoIndex[v.participant_name] ||= {})[v.category_id] = v.score;
      } else {
        const byVoter = (teamIndex[v.participant_name] ||= {});
        (byVoter[v.voter_name] ||= {})[v.category_id] = v.score;
      }
    }

    const scored = participants.map((p) => {
      const ceoForP = ceoIndex[p] || {};
      const ceoTotal = CATEGORIES.reduce((s, c) => s + (ceoForP[c.id] || 0), 0);

      const voterMap = teamIndex[p] || {};
      const voterNames = Object.keys(voterMap);

      const catMeans = CATEGORIES.map((cat) => {
        const vals = voterNames
          .map((vn) => voterMap[vn][cat.id])
          .filter((v) => v != null);
        if (!vals.length) return 0;
        return vals.reduce((a, b) => a + b, 0) / vals.length;
      });
      const teamRaw = catMeans.reduce((a, b) => a + b, 0);

      const voterAudit = voterNames.map((vn) => {
        const scores = {};
        let total = 0;
        CATEGORIES.forEach((cat) => {
          const sc = voterMap[vn][cat.id] || 0;
          scores[cat.id] = sc;
          total += sc;
        });
        return { name: vn, scores, total };
      });

      return {
        name: p,
        ceoTotal: Math.round(ceoTotal * 10) / 10,
        teamTotal: Math.round(teamRaw * 10) / 10,
        total: Math.round((ceoTotal + teamRaw) * 10) / 10,
        catBreakdown: CATEGORIES.map((cat, i) => ({
          id: cat.id, icon: cat.icon, name: cat.name,
          ceo: ceoForP[cat.id] || 0,
          team: Math.round(catMeans[i] * 10) / 10,
        })),
        voterAudit,
        ceoBreakdown: ceoForP,
      };
    });
    scored.sort((a, b) => b.total - a.total);
    setResults(scored);
    setRevealed(Array(scored.length).fill(false));
    setRevealingIdx(-1);
    setPhase("results");
    await supabase.from("sessions").update({ phase: "results" }).eq("id", sessionId);
  }

  function revealSlot(idx) {
    setRevealed((prev) => {
      const next = [...prev];
      next[idx] = true;
      return next;
    });
    const isLast = idx === results.length - 1;
    const isFirst = idx === 0;
    if (isLast) {
      setSadRain(true);
      setTimeout(() => setSadRain(false), 4000);
    }
    if (isFirst) {
      setConfetti(true);
      setUnicorns(true);
      setTimeout(() => {
        setConfetti(false);
        setUnicorns(false);
      }, 7000);
    }
    const allNowRevealed = revealed.every((r, i) => (i === idx ? true : r));
    if (allNowRevealed) {
      setAllRevealed(true);
      setConfetti(true);
      setUnicorns(true);
      setTimeout(() => {
        setConfetti(false);
        setUnicorns(false);
      }, 7000);
    }
  }

  function triggerAutoReveal() {
    setAutoRevealing(true);
    const total = results.length;
    let i = total - 1;
    const revealOne = (idx) => {
      setTimeout(
        () => {
          revealSlot(idx);
          setRevealingIdx(idx);
          if (idx > 0) {
            revealOne(idx - 1);
          } else {
            setAllRevealed(true);
            setAutoRevealing(false);
            setConfetti(true);
            setUnicorns(true);
            setTimeout(() => {
              setConfetti(false);
              setUnicorns(false);
            }, 7000);
          }
        },
        idx === total - 1 ? 500 : 2000
      );
    };
    revealOne(i);
  }

  /* ── Current round voting state ── */
  const roundComplete = CATEGORIES.every((c) => roundScores[c.id] != null);
  const roundTotal = CATEGORIES.reduce((s, c) => s + (roundScores[c.id] || 0), 0);

  function resetShow() {
    if (!window.confirm("Reset the show? This ends the current session for everyone.")) return;
    if (subscriptionRef.current) supabase.removeChannel(subscriptionRef.current);
    if (sessionSubRef.current) supabase.removeChannel(sessionSubRef.current);
    if (votesSubRef.current) supabase.removeChannel(votesSubRef.current);
    localStorage.removeItem("vibe_ceo_session");
    if (sessionId) localStorage.removeItem(`vibe_voter_${sessionId}`);
    setSessionId(null);
    setActiveVoter(null);
    setIsCeo(true);
    setSessionLocked(false);
    const url = new URL(window.location);
    url.searchParams.delete("s");
    window.history.replaceState({}, "", url);
    setPhase("setup");
    setDoneVoters(new Set());
    setClaimedVoters(new Set());
    setCurrentRound(0);
    setRoundScores({});
    setMyVoteSubmitted(false);
    setRoundVoteCount(0);
    setRoundVotedNames(new Set());
    setResults([]);
    setRevealed([]);
    setAllRevealed(false);
    setVoterOrder([]);
    setPresentationOrder([]);
    setAutoRevealing(false);
    setRevealingIdx(-1);
  }

  const ceoResetBtn = isCeo && phase !== "setup" ? (
    <button
      onClick={resetShow}
      style={{
        position: "fixed", top: 12, right: 12, zIndex: 10000,
        background: "rgba(255,50,50,0.15)", border: "1px solid rgba(255,50,50,0.3)",
        borderRadius: 10, padding: "6px 14px", cursor: "pointer",
        color: "rgba(255,100,100,0.7)", fontSize: 11, fontWeight: 700,
        fontFamily: "'Trebuchet MS', sans-serif", letterSpacing: 0.5,
        backdropFilter: "blur(8px)", transition: "all 0.2s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,50,50,0.3)"; e.currentTarget.style.color = "#fff"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,50,50,0.15)"; e.currentTarget.style.color = "rgba(255,100,100,0.7)"; }}
    >
      Reset
    </button>
  ) : null;

  /* ─── STYLES ─────────────────────────────────────────────────── */
  const S = {
    root: {
      minHeight: "100vh",
      background:
        "radial-gradient(ellipse 100% 80% at 50% -10%, #0a1033 0%, #060608 55%, #050505 100%)",
      fontFamily: "var(--font-body)",
      color: "#FFFAD0",
      position: "relative",
      overflow: "hidden",
    },
    page: {
      position: "relative",
      zIndex: 1,
      maxWidth: 1100,
      margin: "0 auto",
      padding: "52px 24px 40px",
    },
    title: {
      fontFamily: "var(--font-display)",
      color: "#FFFAD0",
      fontWeight: 500,
      letterSpacing: "-1px",
      lineHeight: 0.95,
    },
    card: (color = "rgba(255,250,208,0.04)") => ({
      background: color,
      border: "1px solid rgba(0,17,255,0.45)",
      borderRadius: 6,
      padding: 24,
      backdropFilter: "blur(8px)",
      boxShadow: "inset 0 1px 0 rgba(255,250,208,0.04)",
    }),
    btn: (bg = "#0011FF", color = "#FFFAD0") => ({
      background: bg,
      color,
      border: "1px solid rgba(255,250,208,0.18)",
      borderRadius: 4,
      padding: "14px 32px",
      fontWeight: 700,
      fontSize: 14,
      cursor: "pointer",
      fontFamily: "var(--font-mono)",
      letterSpacing: 1,
      textTransform: "uppercase",
      transition: "transform 0.15s, box-shadow 0.15s, filter 0.15s",
      boxShadow: "0 4px 24px rgba(0,17,255,0.25)",
    }),
    label: {
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 2,
      color: "#FFFAD0",
      background: "#0011FF",
      textTransform: "uppercase",
      marginBottom: 12,
      padding: "4px 9px",
      borderRadius: 3,
      display: "inline-block",
      fontFamily: "var(--font-mono)",
    },
  };

  /* ═══════════════════════════════════════════════════════════════
     PHASE: LOADING
  ═══════════════════════════════════════════════════════════════ */
  if (phase === "loading")
    return (
      <div style={S.root}>
        <StarBg />
        {ceoResetBtn}
        <div
          style={{
            ...S.page,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "80vh",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <TenkaraLogo size={34} />
          <h1 style={{ ...S.title, fontSize: 32, margin: 0 }}>
            Initializing…
          </h1>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 2, color: "rgba(0,17,255,0.7)" }}>
            STATUS: CONNECTING TO FIELD
          </span>
        </div>
      </div>
    );

  /* ═══════════════════════════════════════════════════════════════
     PHASE: SETUP
  ═══════════════════════════════════════════════════════════════ */
  if (phase === "setup")
    return (
      <div style={S.root}>

        <StarBg />
        {ceoResetBtn}
        <div style={S.page}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
              <TenkaraLogo size={30} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <TechTag>Automation Dept. · Edition 02 · Field Tested</TechTag>
            </div>
            <h1 style={{ ...S.title, fontSize: 92, margin: "0 0 4px", lineHeight: 0.88 }}>
              Tenkara
            </h1>
            <div
              style={{
                display: "inline-block",
                background: "#0011FF",
                color: "#FFFAD0",
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                fontSize: 26,
                letterSpacing: 10,
                textTransform: "uppercase",
                padding: "8px 20px 8px 30px",
                margin: "4px 0 18px",
                boxShadow: "0 8px 32px rgba(0,17,255,0.4)",
              }}
            >
              Talent&nbsp;Show
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                color: "rgba(0,17,255,0.6)",
                letterSpacing: 4,
                fontSize: 16,
                margin: "0 0 10px",
              }}
            >
              &gt;&gt;&gt;&gt;&gt;&gt;&gt;
            </div>
            <p
              style={{
                color: "rgba(255,250,208,0.6)",
                fontSize: 13,
                margin: 0,
                fontFamily: "var(--font-mono)",
                letterSpacing: 2,
              }}
            >
              FIELD-TESTED JUDGING — FIVE CATEGORIES — ONE WINNER
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 28,
            }}
          >
            {/* Left: Participants */}
            <div style={S.card()}>
              <span style={S.label}>
                Participants & Voters ({people.length})
              </span>
              <p
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 13,
                  marginTop: 0,
                  marginBottom: 16,
                }}
              >
                Everyone on this list votes AND has their app judged. Voting
                order is randomized. Ben Stern (CEO) votes last.
              </p>

              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <input
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && addName.trim()) {
                      setPeople((p) => [...p, addName.trim()]);
                      setAddName("");
                    }
                  }}
                  placeholder="Add a name…"
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 10,
                    padding: "10px 14px",
                    color: "#fff",
                    fontFamily: "inherit",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
                <button
                  onClick={() => {
                    if (addName.trim()) {
                      setPeople((p) => [...p, addName.trim()]);
                      setAddName("");
                    }
                  }}
                  style={{ ...S.btn(), padding: "10px 18px", fontSize: 18 }}
                >
                  +
                </button>
              </div>

              <div style={{ maxHeight: 400, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
                {people.map((p, i) => {
                  const hasPenalty = !!penalties[p];
                  const isEditing = editingPenalty === p;
                  return (
                    <div key={i}>
                      <div
                        style={{
                          display: "flex", alignItems: "center", gap: 8,
                          background: isEditing ? "rgba(255,107,107,0.1)" : "rgba(255,255,255,0.06)",
                          border: `1px solid ${isEditing ? "rgba(255,107,107,0.3)" : "rgba(255,255,255,0.1)"}`,
                          borderRadius: 14, padding: "8px 12px 8px 8px", fontSize: 13,
                          cursor: "pointer", transition: "all 0.15s",
                        }}
                        onDoubleClick={() => { setEditingPenalty(p); setPenaltyDraft(penalties[p] || ""); }}
                        title={hasPenalty ? `Penalty: ${penalties[p]}` : "Double-click to add penalty"}
                      >
                        <div style={{
                          width: 24, height: 24, borderRadius: "50%",
                          background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 9, fontWeight: 900, color: "#000", flexShrink: 0,
                        }}>{initials(p)}</div>
                        <span style={{ color: "#fff", flex: 1 }}>{p}</span>
                        <div style={{
                          width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                          background: hasPenalty ? "#FF6B6B" : "rgba(255,255,255,0.15)",
                          boxShadow: hasPenalty ? "0 0 6px rgba(255,107,107,0.5)" : "none",
                        }} title={hasPenalty ? "Penalty assigned" : "No penalty"} />
                        <span onClick={(e) => { e.stopPropagation(); setPeople((prev) => prev.filter((_, j) => j !== i)); }}
                          style={{ cursor: "pointer", color: "rgba(255,255,255,0.3)", fontWeight: 700, lineHeight: 1, fontSize: 16 }}>×</span>
                      </div>
                      {hasPenalty && !isEditing && (
                        <div style={{ fontSize: 11, color: "rgba(255,107,107,0.5)", padding: "2px 0 0 36px", fontStyle: "italic" }}>
                          {penalties[p]}
                        </div>
                      )}
                      {isEditing && (
                        <div style={{ display: "flex", gap: 6, padding: "6px 0 0 36px" }}>
                          <input
                            autoFocus
                            value={penaltyDraft}
                            onChange={(e) => setPenaltyDraft(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                setPenalties((prev) => ({ ...prev, [p]: penaltyDraft.trim() || undefined }));
                                if (!penaltyDraft.trim()) setPenalties((prev) => { const n = { ...prev }; delete n[p]; return n; });
                                setEditingPenalty(null);
                              }
                              if (e.key === "Escape") setEditingPenalty(null);
                            }}
                            placeholder="Type penalty... (Enter to save, Esc to cancel)"
                            style={{
                              flex: 1, background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.2)",
                              borderRadius: 8, padding: "6px 10px", color: "#FF6B6B", fontFamily: "inherit",
                              fontSize: 12, outline: "none",
                            }}
                          />
                          <button onClick={() => {
                            if (penaltyDraft.trim()) setPenalties((prev) => ({ ...prev, [p]: penaltyDraft.trim() }));
                            else setPenalties((prev) => { const n = { ...prev }; delete n[p]; return n; });
                            setEditingPenalty(null);
                          }} style={{ ...S.btn("rgba(255,107,107,0.2)", "#FF6B6B"), padding: "4px 12px", fontSize: 11 }}>Save</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
                <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#FF6B6B", marginRight: 4, verticalAlign: "middle" }} /> = penalty assigned.
                Double-click a name to add/edit penalty.
              </div>
            </div>

            {/* Right: Rubric */}
            <div style={S.card()}>
              <span style={S.label}>Scoring Rubric — 50 Points Total</span>
              <div
                style={{
                  background: "rgba(0,17,255,0.08)",
                  border: "1px solid rgba(0,17,255,0.3)",
                  borderRadius: 6,
                  padding: "10px 14px",
                  marginBottom: 16,
                  fontSize: 13,
                  color: "rgba(255,250,208,0.7)",
                }}
              >
                <strong style={{ color: "#FFFAD0" }}>Ben (CEO):</strong> 1–5
                per category = up to{" "}
                <strong style={{ color: "#FFFAD0" }}>25 pts</strong>
                <br />
                <strong style={{ color: "#2D4BFF" }}>Team:</strong> Everyone
                votes 1–5, scores averaged = up to{" "}
                <strong style={{ color: "#2D4BFF" }}>25 pts</strong>
                <br />
                <strong style={{ color: "#fff" }}>
                  Max total: 50 pts per participant
                </strong>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {CATEGORIES.map((cat) => (
                  <div
                    key={cat.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: 4,
                      padding: "12px 14px",
                      borderLeft: "2px solid #0011FF",
                    }}
                  >
                    <div
                      style={{
                        flexShrink: 0,
                        width: 34,
                        height: 34,
                        background: "#0011FF",
                        color: "#FFFAD0",
                        fontFamily: "var(--font-mono)",
                        fontWeight: 700,
                        fontSize: 14,
                        borderRadius: 3,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {cat.icon}
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          color: "#FFFAD0",
                          fontSize: 14,
                          marginBottom: 2,
                        }}
                      >
                        {cat.name}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "rgba(255,250,208,0.5)",
                        }}
                      >
                        {cat.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 32 }}>
            <button
              onClick={startShow}
              style={{
                ...S.btn(),
                fontSize: 20,
                padding: "18px 56px",
                boxShadow: "0 6px 32px rgba(0,17,255,0.4)",
              }}
            >
              Start the Show
            </button>
            {people.length < 2 && (
              <p
                style={{
                  color: "#FF6B6B",
                  fontSize: 13,
                  marginTop: 12,
                }}
              >
                Need at least 2 participants
              </p>
            )}
          </div>
        </div>
      </div>
    );

  /* ═══════════════════════════════════════════════════════════════
     PHASE: LOGIN — Claim your name
  ═══════════════════════════════════════════════════════════════ */
  if (phase === "login") {
    const claimedCount = claimedVoters.size;
    const ceoHasClaimed = isCeo && activeVoter != null;
    const canLock = ceoHasClaimed && claimedCount >= 2 && !sessionLocked;

    return (
      <div style={S.root}>
        <StarBg />
        {ceoResetBtn}
        {showLock && pendingVoter && (
          <LockScreen voterName={pendingVoter} onUnlock={unlockAndVote} />
        )}
        <div style={S.page}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <TenkaraLogo size={24} />
            </div>
            <div style={{ marginBottom: 12 }}><TechTag>Tenkara Talent Show · Edition 02</TechTag></div>
            <h1 style={{ ...S.title, fontSize: 48, margin: "0 0 8px" }}>
              Claim Your Name
            </h1>
            <p style={{ color: "rgba(255,250,208,0.5)", fontSize: 13, margin: 0, fontFamily: "var(--font-mono)", letterSpacing: 1 }}>
              {sessionLocked
                ? "NAMES LOCKED — AWAITING PRESENTATION ORDER…"
                : "TAP YOUR NAME TO JOIN THE SESSION"}
            </p>
            <div style={{ marginTop: 16, display: "inline-flex", gap: 24, background: "rgba(0,17,255,0.08)", border: "1px solid rgba(0,17,255,0.25)", borderRadius: 6, padding: "10px 20px", fontSize: 13, fontFamily: "var(--font-mono)", letterSpacing: 1 }}>
              <span style={{ color: "#8FA0FF", display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#0011FF", display: "inline-block" }} /><strong>{claimedCount}</strong> JOINED
              </span>
              <span style={{ color: "rgba(255,250,208,0.4)", display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", border: "1px solid rgba(255,250,208,0.4)", display: "inline-block" }} /><strong>{voterOrder.length - claimedCount}</strong> UNCLAIMED
              </span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, maxWidth: 860, margin: "0 auto" }}>
            {voterOrder.map((p) => {
              const claimed = claimedVoters.has(p);
              const lockedOut = sessionLocked && !claimed;
              const disabled = claimed || lockedOut;
              const i = people.indexOf(p);
              const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
              const isCeoName = p === CEO_NAME;
              return (
                <button key={p} onClick={() => !disabled && requestVoting(p)} disabled={disabled}
                  style={{
                    background: disabled
                      ? "rgba(255,255,255,0.04)"
                      : isCeoName
                        ? "linear-gradient(135deg, rgba(255,250,208,0.16), rgba(255,250,208,0.06))"
                        : `linear-gradient(135deg, ${color}22, ${color}11)`,
                    border: claimed
                      ? isCeoName ? "1px solid rgba(255,250,208,0.5)" : "1px dashed rgba(0,17,255,0.4)"
                      : lockedOut ? "1px solid rgba(255,255,255,0.07)"
                      : isCeoName ? "1px solid rgba(255,250,208,0.6)" : `1px solid ${color}66`,
                    borderRadius: 6, padding: "18px 14px", cursor: disabled ? "default" : "pointer",
                    textAlign: "center", transition: "transform 0.15s, box-shadow 0.15s",
                    opacity: disabled ? (claimed ? 0.7 : 0.5) : 1, fontFamily: "inherit",
                    boxShadow: isCeoName && !disabled ? "0 0 20px rgba(255,250,208,0.15)" : "none",
                  }}
                  onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%",
                    background: claimed
                      ? isCeoName ? "rgba(255,250,208,0.25)" : "rgba(0,17,255,0.2)"
                      : lockedOut ? "rgba(255,255,255,0.06)"
                      : isCeoName ? "#FFFAD0" : color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 10px", fontSize: isCeoName ? 13 : 18, fontWeight: 900,
                    fontFamily: isCeoName ? "var(--font-mono)" : "var(--font-body)",
                    color: disabled ? (isCeoName && claimed ? "rgba(255,250,208,0.6)" : "rgba(255,255,255,0.3)") : "#000",
                    boxShadow: isCeoName && !disabled ? "0 4px 16px rgba(255,250,208,0.3)" : disabled ? "none" : `0 4px 16px ${color}66`,
                  }}>
                    {lockedOut ? "—" : isCeoName ? "CEO" : initials(p)}
                  </div>
                  <div style={{ color: isCeoName ? (disabled ? "rgba(255,250,208,0.5)" : "#FFFAD0") : (disabled ? "rgba(255,255,255,0.3)" : "#fff"), fontWeight: 700, fontSize: 14, fontFamily: "var(--font-body)" }}>
                    {p}{isCeoName ? " — CEO" : ""}
                  </div>
                  <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: 1, color: claimed ? (isCeoName ? "#FFFAD0" : "#8FA0FF") : lockedOut ? "#FF0202" : "rgba(255,250,208,0.35)", marginTop: 6, textTransform: "uppercase" }}>
                    {claimed ? (isCeoName ? "CEO Joined" : "Joined") : lockedOut ? "Locked out" : isCeoName ? "Tap to join (CEO)" : "Tap to join"}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Share link (CEO only) */}
          {isCeo && sessionId && (
            <div style={{ maxWidth: 860, margin: "20px auto", ...S.card("rgba(0,17,255,0.06)"), display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ color: "#8FA0FF", fontWeight: 700, fontSize: 12, fontFamily: "var(--font-mono)", letterSpacing: 1, textTransform: "uppercase" }}>Share link with voters</span>
              <code style={{ flex: 1, background: "rgba(0,0,0,0.3)", borderRadius: 4, padding: "8px 12px", color: "#FFFAD0", fontSize: 13, wordBreak: "break-all", cursor: "pointer", fontFamily: "var(--font-mono)" }}
                onClick={() => navigator.clipboard.writeText(window.location.href)} title="Click to copy">
                {window.location.href}
              </code>
              <button onClick={() => navigator.clipboard.writeText(window.location.href)}
                style={{ ...S.btn("rgba(0,17,255,0.3)", "#fff"), padding: "8px 16px", fontSize: 13 }}>Copy</button>
            </div>
          )}

          {/* CEO hint to claim first */}
          {isCeo && !activeVoter && !sessionLocked && (
            <div style={{ textAlign: "center", marginTop: 20 }}>
              <p style={{ color: "#FFFAD0", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: 1, textTransform: "uppercase" }}>
                Claim your own name first, then lock names &amp; spin the wheel
              </p>
            </div>
          )}

          {/* CEO Lock & Reveal Prizes button */}
          {canLock && (
            <div style={{ textAlign: "center", marginTop: 20 }}>
              <button onClick={lockNamesAndRevealPrizes}
                style={{ ...S.btn(), fontSize: 18, padding: "18px 48px", boxShadow: "0 6px 32px rgba(0,17,255,0.4)", animation: "pulse 2s ease-in-out infinite" }}>
                Lock Names &amp; Reveal Prizes ({claimedCount} joined)
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     PHASE: PRIZES — Reveal prizes before spinning (CEO scratches)
  ═══════════════════════════════════════════════════════════════ */
  if (phase === "prizes") {
    const cardBase = { borderRadius: 24, overflow: "hidden", backdropFilter: "blur(12px)" };
    const iconBox = (bg) => ({ width: 56, height: 56, borderRadius: 16, background: bg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" });

    return (
      <div style={S.root}>
        <StarBg />
        {ceoResetBtn}
        <Confetti active={confetti} />
        <UnicornCelebration active={unicorns} />
        <div style={S.page}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 4, color: "rgba(255,215,0,0.5)", textTransform: "uppercase", marginBottom: 8 }}>TENKARA AI VIBE CODE SHOWDOWN</div>
            <h1 style={{ ...S.title, fontSize: 40, margin: 0 }}>
              WHAT YOU'RE PLAYING FOR
            </h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, margin: "8px 0 0" }}>
              Three prizes. Three reveals. Let's see what's on the line.
            </p>
          </div>

          <div style={{ maxWidth: 740, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>

            {/* ════════ FIRST PLACE ════════ */}
            <div style={{ ...cardBase, border: `2px solid ${prizePhase >= 3 ? "rgba(255,215,0,0.7)" : "rgba(255,215,0,0.2)"}`, background: prizePhase >= 3 ? "rgba(255,215,0,0.06)" : "rgba(255,255,255,0.03)", animation: prizePhase >= 3 ? "prizeGlow 3s ease-in-out infinite" : "none" }}>
              <div style={{ padding: 28, textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 40, height: 2, background: "linear-gradient(90deg, transparent, rgba(255,215,0,0.5))" }} />
                  <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: 4, color: "rgba(255,215,0,0.6)", textTransform: "uppercase" }}>FIRST PLACE</span>
                  <div style={{ width: 40, height: 2, background: "linear-gradient(90deg, rgba(255,215,0,0.5), transparent)" }} />
                </div>

                {prizePhase === 1 && isCeo && (
                  <button onClick={() => setPrizePhase(2)} style={{ ...S.btn("linear-gradient(135deg, #FFD700, #b8860b, #FFD700)","#000"), fontSize: 20, padding: "20px 56px", animation: "pulse 2s ease-in-out infinite", boxShadow: "0 8px 48px rgba(255,215,0,0.4)", letterSpacing: 2 }}>
                    REVEAL GRAND PRIZE
                  </button>
                )}
                {prizePhase === 1 && !isCeo && (
                  <div style={{ padding: 40, color: "rgba(255,255,255,0.3)", fontSize: 15 }}>Waiting for the reveal...</div>
                )}
                {prizePhase === 2 && (
                  <CountdownReveal label="THE GRAND PRIZE IS..." onComplete={() => { setPrizePhase(3); setConfetti(true); setUnicorns(true); setTimeout(() => { setConfetti(false); setUnicorns(false); }, 15000); }} />
                )}
                {prizePhase >= 3 && (
                  <div style={{ animation: "bounceIn 0.8s ease" }}>
                    <div style={{ display: "flex", gap: 12, marginBottom: 24, borderRadius: 16, overflow: "hidden" }}>
                      <div style={{ flex: 1, height: 220, borderRadius: 16, overflow: "hidden", position: "relative" }}>
                        <img src="/images/fourseasons-beach.png" alt="Four Seasons Beach" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 14px 12px", background: "linear-gradient(transparent, rgba(0,0,0,0.8))" }}>
                          <div style={{ color: "#FFD700", fontSize: 11, fontWeight: 700, letterSpacing: 2 }}>BEACHFRONT LOUNGE</div>
                        </div>
                      </div>
                      <div style={{ flex: 1, height: 220, borderRadius: 16, overflow: "hidden", position: "relative" }}>
                        <img src="/images/fourseasons-pool.png" alt="Four Seasons Pool Villa" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 14px 12px", background: "linear-gradient(transparent, rgba(0,0,0,0.8))" }}>
                          <div style={{ color: "#FFD700", fontSize: 11, fontWeight: 700, letterSpacing: 2 }}>PRIVATE POOL VILLA</div>
                        </div>
                      </div>
                    </div>

                    <div style={{
                      fontSize: 36, fontWeight: 900, lineHeight: 1.1, marginBottom: 6,
                      background: "linear-gradient(90deg, #FFD700, #fff, #FFD700, #b8860b, #FFD700)",
                      backgroundSize: "200%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                      animation: "textShine 3s linear infinite",
                    }}>ALL-EXPENSE PAID TRIP<br/>TO VIETNAM</div>
                    <div style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", fontWeight: 600, marginBottom: 24, letterSpacing: 1 }}>FOR YOU AND A +1</div>

                    {/* Four Seasons branding */}
                    <div style={{ background: "linear-gradient(135deg, rgba(255,215,0,0.08), rgba(0,0,0,0.3))", border: "1px solid rgba(255,215,0,0.25)", borderRadius: 20, padding: "24px 20px", marginBottom: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 6, color: "rgba(255,215,0,0.5)", textTransform: "uppercase", marginBottom: 12 }}>FOUR SEASONS</div>
                      <div style={{ color: "#FFD700", fontWeight: 900, fontSize: 22, marginBottom: 4 }}>The Nam Hai</div>
                      <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>Hoi An, Vietnam</div>
                      <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 8, lineHeight: 1.5, maxWidth: 400, margin: "8px auto 0" }}>
                        Private pool villa on the beach. Daily breakfast at Caf&eacute; Nam Hai. Personal attendant. Complimentary laundry. World-class spa & wellness.
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                      <div style={{ background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 16, padding: "20px 12px", textAlign: "center" }}>
                        <div style={iconBox("linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,215,0,0.05)")}>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/></svg>
                        </div>
                        <div style={{ color: "#FFD700", fontWeight: 800, fontSize: 20 }}>4 Nights</div>
                        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>5 Days of luxury</div>
                      </div>
                      <div style={{ background: "rgba(78,205,196,0.06)", border: "1px solid rgba(78,205,196,0.2)", borderRadius: 16, padding: "20px 12px", textAlign: "center" }}>
                        <div style={iconBox("linear-gradient(135deg, rgba(78,205,196,0.2), rgba(78,205,196,0.05)")}>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>
                        </div>
                        <div style={{ color: "#4ECDC4", fontWeight: 800, fontSize: 16 }}>First Class</div>
                        <div style={{ color: "#4ECDC4", fontWeight: 800, fontSize: 16 }}>Flights</div>
                        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>Round-trip for two</div>
                      </div>
                      <div style={{ background: "rgba(255,107,107,0.06)", border: "1px solid rgba(255,107,107,0.2)", borderRadius: 16, padding: "20px 12px", textAlign: "center" }}>
                        <div style={iconBox("linear-gradient(135deg, rgba(255,107,107,0.2), rgba(255,107,107,0.05)")}>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                        </div>
                        <div style={{
                          fontWeight: 900, fontSize: 24,
                          background: "linear-gradient(90deg, #FFD700, #FF6B6B, #FFD700)",
                          backgroundSize: "200%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                          animation: "textShine 2s linear infinite",
                        }}>$1,200</div>
                        <div style={{ color: "#FF6B6B", fontWeight: 700, fontSize: 13 }}>POCKET CASH</div>
                        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>Food, drinks, adventures</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ════════ SECOND PLACE ════════ */}
            {prizePhase >= 3 && (
              <div style={{ ...cardBase, border: `2px solid ${prizePhase >= 5 ? "rgba(192,192,192,0.5)" : "rgba(192,192,192,0.2)"}`, background: prizePhase >= 5 ? "rgba(192,192,192,0.04)" : "rgba(255,255,255,0.03)", animation: prizePhase >= 5 ? "prizeGlow 3s ease-in-out infinite" : "bounceIn 0.6s ease" }}>
                <div style={{ padding: 28, textAlign: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
                    <div style={{ width: 40, height: 2, background: "linear-gradient(90deg, transparent, rgba(192,192,192,0.5))" }} />
                    <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: 4, color: "rgba(192,192,192,0.6)", textTransform: "uppercase" }}>SECOND PLACE</span>
                    <div style={{ width: 40, height: 2, background: "linear-gradient(90deg, rgba(192,192,192,0.5), transparent)" }} />
                  </div>
                  {prizePhase === 3 && isCeo && (
                    <button onClick={() => setPrizePhase(4)} style={{ ...S.btn("linear-gradient(135deg, #C0C0C0, #708090, #C0C0C0)","#000"), fontSize: 18, padding: "16px 44px", animation: "pulse 2s ease-in-out infinite", letterSpacing: 2 }}>
                      REVEAL 2ND PLACE PRIZE
                    </button>
                  )}
                  {prizePhase === 3 && !isCeo && (
                    <div style={{ padding: 30, color: "rgba(255,255,255,0.3)", fontSize: 15 }}>Waiting for the reveal...</div>
                  )}
                  {prizePhase === 4 && (
                    <CountdownReveal label="SECOND PLACE WINS..." onComplete={() => { setPrizePhase(5); setConfetti(true); setTimeout(() => setConfetti(false), 8000); }} />
                  )}
                  {prizePhase >= 5 && (
                    <div style={{ animation: "bounceIn 0.8s ease" }}>
                      <div style={iconBox("linear-gradient(135deg, rgba(192,192,192,0.2), rgba(192,192,192,0.05)")}>
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#C0C0C0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                      </div>
                      <div style={{ fontSize: 30, fontWeight: 900, color: "#C0C0C0", marginBottom: 4 }}>Brand New iPad</div>
                      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 15 }}>Latest generation, sealed in box</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ════════ THIRD PLACE ════════ */}
            {prizePhase >= 5 && (
              <div style={{ ...cardBase, border: `2px solid ${prizePhase >= 7 ? "rgba(205,127,50,0.5)" : "rgba(205,127,50,0.2)"}`, background: prizePhase >= 7 ? "rgba(205,127,50,0.04)" : "rgba(255,255,255,0.03)", animation: prizePhase >= 7 ? "prizeGlow 3s ease-in-out infinite" : "bounceIn 0.6s ease" }}>
                <div style={{ padding: 28, textAlign: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
                    <div style={{ width: 40, height: 2, background: "linear-gradient(90deg, transparent, rgba(205,127,50,0.5))" }} />
                    <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: 4, color: "rgba(205,127,50,0.6)", textTransform: "uppercase" }}>THIRD PLACE</span>
                    <div style={{ width: 40, height: 2, background: "linear-gradient(90deg, rgba(205,127,50,0.5), transparent)" }} />
                  </div>
                  {prizePhase === 5 && isCeo && (
                    <button onClick={() => setPrizePhase(6)} style={{ ...S.btn("linear-gradient(135deg, #CD7F32, #8b4513, #CD7F32)","#fff"), fontSize: 18, padding: "16px 44px", animation: "pulse 2s ease-in-out infinite", letterSpacing: 2 }}>
                      REVEAL 3RD PLACE PRIZE
                    </button>
                  )}
                  {prizePhase === 5 && !isCeo && (
                    <div style={{ padding: 30, color: "rgba(255,255,255,0.3)", fontSize: 15 }}>Waiting for the reveal...</div>
                  )}
                  {prizePhase === 6 && (
                    <CountdownReveal label="THIRD PLACE WINS..." onComplete={() => { setPrizePhase(7); setConfetti(true); setTimeout(() => setConfetti(false), 6000); }} />
                  )}
                  {prizePhase >= 7 && (
                    <div style={{ animation: "bounceIn 0.8s ease" }}>
                      <div style={iconBox("linear-gradient(135deg, rgba(205,127,50,0.2), rgba(205,127,50,0.05)")}>
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#CD7F32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="2" x2="4" y2="22"/><path d="M4 2c4 0 8 3 8 8"/><circle cx="12" cy="14" r="1"/><path d="M12 15v3c0 1-1 2-2 2"/><path d="M4 6c2 0 3 1 3 2"/></svg>
                      </div>
                      <div style={{ fontSize: 30, fontWeight: 900, color: "#CD7F32", marginBottom: 4 }}>A Real Tenkara</div>
                      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 15 }}>In the spirit of Tenkara AI</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Proceed to wheel after all prizes revealed */}
            {prizePhase >= 7 && isCeo && (
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <button onClick={startSpinFromPrizes}
                  style={{ ...S.btn("linear-gradient(135deg, #FFE66D, #FF6B6B)"), fontSize: 22, padding: "20px 56px", animation: "pulse 2s ease-in-out infinite", boxShadow: "0 8px 40px rgba(255,230,109,0.4)" }}>
                  LET'S SPIN THE WHEEL
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     PHASE: SPIN — Wheel determines presentation order (CEO only)
  ═══════════════════════════════════════════════════════════════ */
  if (phase === "spin")
    return (
      <div style={S.root}>
        <StarBg />
        {ceoResetBtn}
        <div style={{ ...S.page, textAlign: "center" }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ marginBottom: 14 }}><TechTag color="#FF4800">Randomizing Sequence</TechTag></div>
            <h1 style={{ ...S.title, fontSize: 52, margin: 0 }}>
              Spinning for Order
            </h1>
            <p style={{ color: "rgba(255,250,208,0.45)", fontSize: 13, margin: "10px 0 0", fontFamily: "var(--font-mono)", letterSpacing: 1 }}>
              THE WHEEL DECIDES THE PRESENTATION ORDER…
            </p>
          </div>
          <SpinWheel names={[...claimedVoters].filter((n) => n !== CEO_NAME)} onComplete={onWheelComplete} />
        </div>
      </div>
    );

  /* ═══════════════════════════════════════════════════════════════
     PHASE: VOTING — One candidate at a time, everyone votes together
  ═══════════════════════════════════════════════════════════════ */
  if (phase === "voting" && currentCandidate && activeVoter) {
    const candidateColor = AVATAR_COLORS[people.indexOf(currentCandidate) % AVATAR_COLORS.length];
    const voterColor = AVATAR_COLORS[people.indexOf(activeVoter) % AVATAR_COLORS.length] || "#888";
    const isSelf = activeVoter === currentCandidate && activeVoter !== CEO_NAME;

    if (isSelf || myVoteSubmitted) {
      const expectedVoters = voterOrder.filter((p) => p !== currentCandidate);
      const votedList = expectedVoters.filter((p) => roundVotedNames.has(p));
      const pendingList = expectedVoters.filter((p) => !roundVotedNames.has(p));
      const ceoHasVoted = myVoteSubmitted || isSelf;

      return (
        <div style={S.root}>
          <StarBg />
        {ceoResetBtn}
          <div style={{ ...S.page, maxWidth: 600, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ marginBottom: 14 }}>
                <TechTag color={isSelf ? "#FFFAD0" : "#02FF06"}>{isSelf ? "Now Presenting — You" : "Vote Recorded"}</TechTag>
              </div>
              <h2 style={{ ...S.title, fontSize: 38, margin: "4px 0 0" }}>
                {isSelf ? `It's your turn, ${activeVoter}` : "Vote Submitted"}
              </h2>
              <p style={{ color: "rgba(255,250,208,0.5)", fontSize: 13, margin: "8px 0 0", fontFamily: "var(--font-mono)", letterSpacing: 1 }}>
                {isSelf
                  ? "SIT BACK WHILE EVERYONE ELSE RATES YOU"
                  : "WAITING FOR EVERYONE ELSE…"}
              </p>
              <div style={{ color: "rgba(255,250,208,0.25)", fontSize: 11, marginTop: 8, fontFamily: "var(--font-mono)", letterSpacing: 1 }}>
                ROUND {currentRound + 1} / {presentationOrder.length} · RATING: {currentCandidate}
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ width: "100%", background: "rgba(255,255,255,0.08)", borderRadius: 0, height: 8, overflow: "hidden", marginBottom: 8 }}>
              <div style={{ width: `${totalVoters > 0 ? (roundVoteCount / totalVoters) * 100 : 0}%`, height: "100%", background: allRoundVotesIn ? "#02FF06" : "#0011FF", borderRadius: 0, transition: "width 0.5s ease" }} />
            </div>
            <div style={{ textAlign: "center", color: "rgba(255,250,208,0.4)", fontSize: 12, marginBottom: 20, fontFamily: "var(--font-mono)", letterSpacing: 1 }}>
              {roundVoteCount} OF {totalVoters} VOTED
            </div>

            {/* CEO: Voter status panel */}
            {isCeo && (
              <div style={{ ...S.card("rgba(255,255,255,0.04)"), marginBottom: 20 }}>
                <span style={S.label}>Voter Status</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 240, overflowY: "auto" }}>
                  {expectedVoters.map((name) => {
                    const voted = roundVotedNames.has(name);
                    const isCeoVoter = name === CEO_NAME;
                    return (
                      <div key={name} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "6px 12px", borderRadius: 4,
                        background: voted ? "rgba(0,17,255,0.1)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${voted ? "rgba(0,17,255,0.3)" : "rgba(255,250,208,0.1)"}`,
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: "50%",
                            background: isCeoVoter ? "#FFFAD0" : AVATAR_COLORS[people.indexOf(name) % AVATAR_COLORS.length],
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: isCeoVoter ? 8 : 9, fontWeight: 900, color: "#000",
                            fontFamily: isCeoVoter ? "var(--font-mono)" : "var(--font-body)",
                          }}>{isCeoVoter ? "CEO" : initials(name)}</div>
                          <span style={{ color: voted ? "#8FA0FF" : "rgba(255,250,208,0.5)", fontWeight: 600, fontSize: 13 }}>
                            {name}{isCeoVoter ? " (CEO)" : ""}
                          </span>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: voted ? "#8FA0FF" : "rgba(255,250,208,0.4)", fontFamily: "var(--font-mono)", letterSpacing: 1, textTransform: "uppercase" }}>
                          {voted ? "Voted" : "Waiting"}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {pendingList.length > 0 && (
                  <div style={{ marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                    Still waiting on: {pendingList.join(", ")}
                  </div>
                )}
              </div>
            )}

            {/* CEO controls */}
            {isCeo && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {allRoundVotesIn ? (
                  <div style={{ ...S.card("rgba(2,255,6,0.06)"), border: "1px solid rgba(2,255,6,0.3)", textAlign: "center" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#02FF06", marginBottom: 10, fontFamily: "var(--font-mono)", letterSpacing: 2, textTransform: "uppercase" }}>All Votes Are In</div>
                    <button
                      onClick={isLastRound ? calculateAndReveal : advanceRound}
                      style={{ ...S.btn(), fontSize: 16, padding: "14px 40px", animation: "pulse 2s ease-in-out infinite" }}
                    >
                      {isLastRound ? "See Results" : `Next: ${presentationOrder[currentRound + 1]}`}
                    </button>
                  </div>
                ) : (
                  <div style={{ ...S.card("rgba(255,255,255,0.03)"), textAlign: "center" }}>
                    <div style={{ fontSize: 12, color: "rgba(255,250,208,0.4)", marginBottom: 10, fontFamily: "var(--font-mono)", letterSpacing: 1 }}>
                      Move on with {roundVoteCount} of {totalVoters} votes?
                    </div>
                    <button
                      onClick={() => {
                        if (!window.confirm(`Only ${roundVoteCount} of ${totalVoters} have voted. Move on anyway? Missing votes won't count for this candidate.`)) return;
                        if (isLastRound) calculateAndReveal();
                        else advanceRound();
                      }}
                      style={{ ...S.btn("rgba(255,2,2,0.15)", "#FF0202"), fontSize: 13, padding: "10px 28px" }}
                    >
                      Force {isLastRound ? "Results" : "Next"} ({pendingList.length} missing)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div style={S.root}>
        <StarBg />
        {ceoResetBtn}
        <div style={S.page}>
          {/* Top bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: voterColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#000" }}>
                {activeVoter ? initials(activeVoter) : "?"}
              </div>
              <div>
                <div style={{ color: "#FFFAD0", fontWeight: 700, fontSize: 16 }}>{activeVoter}{isCeo ? " · CEO" : ""}</div>
                <div style={{ color: "rgba(255,250,208,0.4)", fontSize: 11, fontFamily: "var(--font-mono)", letterSpacing: 1, textTransform: "uppercase" }}>
                  Round {currentRound + 1} / {presentationOrder.length} · Confidential
                </div>
              </div>
            </div>
            {/* Round progress dots */}
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {presentationOrder.map((p, i) => (
                <div key={p} style={{
                  width: 20, height: 20, borderRadius: "50%",
                  background: i === currentRound ? candidateColor : i < currentRound ? "rgba(0,17,255,0.6)" : "rgba(255,255,255,0.08)",
                  border: i === currentRound ? "2px solid #FFFAD0" : "1px solid rgba(255,250,208,0.12)",
                  fontSize: 8, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-mono)",
                  color: i === currentRound ? "#000" : "rgba(255,250,208,0.4)",
                }} title={p}>{i < currentRound ? "" : i + 1}</div>
              ))}
            </div>
          </div>

          {/* CEO live vote count */}
          {isCeo && (
            <div style={{ marginBottom: 20, background: "rgba(0,17,255,0.08)", border: "1px solid rgba(0,17,255,0.25)", borderRadius: 6, padding: "10px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <span style={{ color: "#8FA0FF", fontWeight: 700, fontSize: 12, fontFamily: "var(--font-mono)", letterSpacing: 1.5, textTransform: "uppercase" }}>
                Live · {roundVoteCount} of {totalVoters} voted
              </span>
              <div style={{ width: 200, background: "rgba(255,255,255,0.08)", borderRadius: 0, height: 6, overflow: "hidden" }}>
                <div style={{ width: `${totalVoters > 0 ? (roundVoteCount / totalVoters) * 100 : 0}%`, height: "100%", background: allRoundVotesIn ? "#02FF06" : "#0011FF", borderRadius: 0, transition: "width 0.5s ease" }} />
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>
            {/* LEFT: Scoring card */}
            <div style={S.card()}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: candidateColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900, color: "#000", boxShadow: `0 6px 24px ${candidateColor}55`, flexShrink: 0 }}>
                  {initials(currentCandidate)}
                </div>
                <div>
                  <div style={{ color: "rgba(0,17,255,0.85)", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>Now Rating</div>
                  <div style={{ color: "#FFFAD0", fontWeight: 500, fontSize: 30, lineHeight: 1.1, fontFamily: "var(--font-display)" }}>{currentCandidate}</div>
                </div>
                <div style={{ marginLeft: "auto", textAlign: "right" }}>
                  <div style={{ color: "rgba(255,250,208,0.3)", fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: 1, textTransform: "uppercase" }}>Your score</div>
                  <div style={{ fontSize: 36, fontWeight: 700, fontFamily: "var(--font-mono)", color: roundTotal >= 20 ? "#02FF06" : roundTotal >= 12 ? "#FFFAD0" : "#8FA0FF" }}>
                    {roundTotal}<span style={{ fontSize: 16, color: "rgba(255,250,208,0.3)", fontWeight: 400 }}>/25</span>
                  </div>
                </div>
              </div>

              {CATEGORIES.map((cat) => {
                const val = roundScores[cat.id];
                return (
                  <div key={cat.id} style={{ marginBottom: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div>
                        <span style={{ fontSize: 12, marginRight: 8, fontFamily: "var(--font-mono)", color: "#0011FF", fontWeight: 700 }}>{cat.icon}</span>
                        <strong style={{ color: "#FFFAD0", fontSize: 15 }}>{cat.name}</strong>
                        <div style={{ fontSize: 12, color: "rgba(255,250,208,0.4)", marginTop: 2 }}>{cat.desc}</div>
                      </div>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                        background: val ? `linear-gradient(135deg, ${AVATAR_COLORS[((val - 1) * 4) % AVATAR_COLORS.length]}, ${AVATAR_COLORS[(val * 3) % AVATAR_COLORS.length]})` : "rgba(255,255,255,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900,
                        color: val ? "#000" : "rgba(255,255,255,0.2)", border: val ? "none" : "1px solid rgba(255,255,255,0.15)",
                      }}>{val ?? "?"}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} onClick={() => setScore(cat.id, n)} style={{
                          flex: 1, height: 48, borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 900, fontSize: 16, fontFamily: "inherit",
                          background: val >= n ? `linear-gradient(135deg, ${AVATAR_COLORS[((val - 1) * 4) % AVATAR_COLORS.length]}, ${AVATAR_COLORS[(val * 3) % AVATAR_COLORS.length]})` : "rgba(255,255,255,0.07)",
                          color: val >= n ? "#000" : "rgba(255,255,255,0.3)", transition: "all 0.15s",
                          transform: val === n ? "scale(1.08)" : "scale(1)", boxShadow: val === n ? "0 4px 16px rgba(0,0,0,0.3)" : "none",
                        }}>{n}</button>
                      ))}
                    </div>
                  </div>
                );
              })}

              <button
                onClick={() => { if (roundComplete && !submitting) submitRoundVote(); }}
                disabled={!roundComplete || submitting}
                style={{
                  ...S.btn(roundComplete ? "#0011FF" : "rgba(255,255,255,0.1)", roundComplete ? "#FFFAD0" : "rgba(255,255,255,0.3)"),
                  width: "100%", marginTop: 8, opacity: (roundComplete && !submitting) ? 1 : 0.5, cursor: (roundComplete && !submitting) ? "pointer" : "not-allowed",
                }}
              >
                {submitting ? "Submitting…" : `Submit Vote — ${currentCandidate}`}
              </button>
              {voteError && (
                <button
                  onClick={() => { if (!submitting) submitRoundVote(); }}
                  style={{
                    ...S.btn("#FF0202", "#fff"),
                    width: "100%", marginTop: 8,
                  }}
                >
                  {voteError}
                </button>
              )}
            </div>

            {/* RIGHT: Rubric sidebar */}
            <div style={{ position: "sticky", top: 24 }}>
              <div style={S.card("rgba(255,255,255,0.05)")}>
                <span style={S.label}>Scoring Guide</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {CATEGORIES.map((cat, ci) => (
                    <div key={cat.id} style={{ borderLeft: `2px solid ${AVATAR_COLORS[(ci * 4) % AVATAR_COLORS.length]}`, paddingLeft: 12 }}>
                      <div style={{ fontWeight: 700, color: "#FFFAD0", fontSize: 14, marginBottom: 4 }}><span style={{ fontFamily: "var(--font-mono)", color: "#0011FF", marginRight: 6 }}>{cat.icon}</span>{cat.name}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>{cat.guide}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        {cat.rubric.map((r, i) => (
                          <div key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.4 }}>{r}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     PHASE: RESULTS — Scratch-off Lottery Reveal!
  ═══════════════════════════════════════════════════════════════ */
  if (phase === "results") {
    const RANK_STYLES = [
      {
        bg: "linear-gradient(135deg, #FFFAD022, #FFFAD008)",
        border: "#FFFAD0",
        glow: "#FFFAD066",
        label: "01 — CHAMPION",
        labelColor: "#FFFAD0",
      },
      {
        bg: "linear-gradient(135deg, #0011FF22, #0011FF08)",
        border: "#0011FF",
        glow: "#0011FF66",
        label: "02 — RUNNER-UP",
        labelColor: "#8FA0FF",
      },
      {
        bg: "linear-gradient(135deg, #8FA0FF22, #8FA0FF08)",
        border: "#8FA0FF",
        glow: "#8FA0FF44",
        label: "03 — THIRD PLACE",
        labelColor: "#8FA0FF",
      },
    ];
    const LAST_STYLE = {
      bg: "rgba(255,2,2,0.06)",
      border: "rgba(255,2,2,0.25)",
      label: "LAST PLACE",
      labelColor: "#FF0202",
    };

    const revealedCount = revealed.filter(Boolean).length;

    return (
      <div style={S.root}>

        <StarBg />
        {ceoResetBtn}
        <Confetti active={confetti} />
        <UnicornCelebration active={unicorns} />
        <SadRain active={sadRain} />
        <div style={S.page}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <TenkaraLogo size={24} />
            </div>
            <div style={{ marginBottom: 12 }}><TechTag color="#02FF06">Results Compiled · Field Tested</TechTag></div>
            <h1 style={{ ...S.title, fontSize: 60, margin: 0 }}>
              The Results Are In
            </h1>
            <p
              style={{
                color: "rgba(255,250,208,0.45)",
                margin: "10px 0 0",
                fontSize: 13,
                fontFamily: "var(--font-mono)",
                letterSpacing: 1,
              }}
            >
              {revealedCount === 0
                ? "SCRATCH EACH CARD TO REVEAL — OR AUTO-REVEAL LAST TO FIRST"
                : allRevealed
                  ? "ALL RESULTS COMPILED — FIELD TESTED"
                  : `${revealedCount} OF ${results.length} REVEALED…`}
            </p>
          </div>

          {!allRevealed && (
            <div
              style={{
                textAlign: "center",
                marginBottom: 32,
                display: "flex",
                gap: 16,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={triggerAutoReveal}
                disabled={autoRevealing}
                style={{
                  ...S.btn("#0011FF", "#FFFAD0"),
                  fontSize: 18,
                  padding: "18px 48px",
                  boxShadow:
                    "0 8px 40px rgba(0,17,255,0.5), 0 0 0 3px rgba(255,250,208,0.2)",
                  animation: autoRevealing
                    ? "none"
                    : "pulse 2s ease-in-out infinite",
                  opacity: autoRevealing ? 0.6 : 1,
                }}
              >
                {autoRevealing
                  ? "Revealing…"
                  : "Auto Reveal (Last → First)"}
              </button>
            </div>
          )}

          <div
            style={{
              maxWidth: 800,
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {results.map((r, i) => {
              const isRev = revealed[i];
              const rank = i + 1;
              const isLast = i === results.length - 1 && results.length > 1;
              const rs =
                rank <= 3
                  ? RANK_STYLES[i]
                  : isLast
                    ? LAST_STYLE
                    : null;
              const personColor =
                AVATAR_COLORS[people.indexOf(r.name) % AVATAR_COLORS.length];

              return (
                <div
                  key={r.name}
                  style={{
                    position: "relative",
                    borderRadius: 20,
                    overflow: "hidden",
                    border: `1px solid ${isRev && rs ? rs.border : "rgba(255,255,255,0.08)"}`,
                    background:
                      isRev && rs ? rs.bg : "rgba(255,255,255,0.04)",
                    boxShadow:
                      isRev && rs && rank <= 3
                        ? `0 0 32px ${rs.glow}`
                        : "none",
                    transition: "all 0.6s ease",
                    transform:
                      isRev && rank === 1 ? "scale(1.02)" : "scale(1)",
                    animation: isRev
                      ? "slideInUp 0.6s ease backwards"
                      : "none",
                    animationDelay: isRev ? "0.1s" : "0s",
                  }}
                >
                  {/* Scratch overlay — interactive lottery ticket */}
                  {!isRev && !autoRevealing && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 10,
                        borderRadius: 20,
                      }}
                    >
                      <ScratchCard
                        width={800}
                        height={100}
                        onComplete={() => revealSlot(i)}
                      >
                        <div
                          style={{
                            color: "rgba(255,255,255,0.15)",
                            fontSize: 13,
                            fontWeight: 700,
                          }}
                        >
                          #{rank}
                        </div>
                      </ScratchCard>
                    </div>
                  )}

                  {/* Auto-reveal overlay */}
                  {!isRev && autoRevealing && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 10,
                        background:
                          "linear-gradient(135deg, #060a2e 0%, #0011FF 50%, #060a2e 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        borderRadius: 6,
                        animation:
                          revealingIdx === i
                            ? "scratchOff 0.8s ease forwards"
                            : "none",
                      }}
                    >
                      {Array.from({ length: 9 }).map((_, j) => (
                        <span
                          key={j}
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 20,
                            fontWeight: 700,
                            color: j % 2 ? "#FFFAD0" : "rgba(255,250,208,0.4)",
                          }}
                        >
                          &gt;
                        </span>
                      ))}
                      <div
                        style={{
                          position: "absolute",
                          color: "rgba(255,250,208,0.4)",
                          fontSize: 10,
                          letterSpacing: 2,
                          fontFamily: "var(--font-mono)",
                          textTransform: "uppercase",
                          bottom: 12,
                        }}
                      >
                        Locked
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div style={{ padding: 20 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        marginBottom: isRev ? 16 : 0,
                      }}
                    >
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: "50%",
                          flexShrink: 0,
                          background: rs
                            ? `linear-gradient(135deg, ${rs.border}44, ${rs.border}22)`
                            : "rgba(255,255,255,0.06)",
                          border: `2px solid ${rs ? rs.border : "rgba(255,255,255,0.1)"}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize:
                            rank <= 3 ? 20 : isLast ? 18 : 16,
                          fontWeight: 700,
                          fontFamily: "var(--font-mono)",
                          color: rs ? rs.labelColor : "#888",
                        }}
                      >
                        {rank <= 3
                          ? String(rank).padStart(2, "0")
                          : isLast
                            ? "XX"
                            : `#${rank}`}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: "50%",
                            background: personColor,
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 14,
                            fontWeight: 900,
                            color: "#000",
                          }}
                        >
                          {initials(r.name)}
                        </div>
                        <div>
                          <div
                            style={{
                              color: rs ? rs.labelColor : "#fff",
                              fontWeight: 900,
                              fontSize: 20,
                            }}
                          >
                            {r.name}
                          </div>
                          {rs && (
                            <div
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: 1.5,
                                color: rs.labelColor,
                                opacity: 0.8,
                              }}
                            >
                              {rs.label}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontSize: 38,
                            fontWeight: 900,
                            color: rs ? rs.labelColor : "#fff",
                            lineHeight: 1,
                          }}
                        >
                          {r.total}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "rgba(255,255,255,0.3)",
                          }}
                        >
                          / 50 pts
                        </div>
                      </div>
                    </div>

                    {isRev && (
                      <>
                        {/* Category breakdown — blended scores */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 14 }}>
                          {r.catBreakdown.map((cb) => (
                            <div key={cb.id} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "8px 6px", textAlign: "center" }}>
                              <div style={{ fontSize: 16, marginBottom: 2 }}>{cb.icon}</div>
                              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 4, lineHeight: 1.2 }}>{cb.name}</div>
                              <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>
                                {Math.round((cb.ceo + cb.team) * 10) / 10}
                              </div>
                              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>/10</div>
                            </div>
                          ))}
                        </div>

                        {/* Hover audit trail (CEO only) */}
                        {isCeo && r.voterAudit && (
                          <details style={{ marginTop: 8, cursor: "pointer" }}>
                            <summary style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", listStyle: "none", textAlign: "center", padding: "6px 0" }}>
                              View individual votes ({r.voterAudit.length + 1} voters)
                            </summary>
                            <div style={{ marginTop: 8, background: "rgba(0,0,0,0.2)", borderRadius: 12, padding: 12, maxHeight: 200, overflowY: "auto" }}>
                              {/* CEO row */}
                              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                <div style={{ width: 80, fontSize: 11, fontWeight: 700, color: "#FFE66D" }}>CEO (Ben)</div>
                                {CATEGORIES.map((cat) => (
                                  <div key={cat.id} style={{ flex: 1, textAlign: "center", fontSize: 12, color: "#FFE66D", fontWeight: 700 }}>{r.ceoBreakdown?.[cat.id] || "—"}</div>
                                ))}
                                <div style={{ width: 50, textAlign: "right", fontSize: 12, fontWeight: 800, color: "#FFE66D" }}>{r.ceoTotal}</div>
                              </div>
                              {/* Team rows */}
                              {r.voterAudit.map((v) => (
                                <div key={v.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                  <div style={{ width: 80, fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.name}</div>
                                  {CATEGORIES.map((cat) => (
                                    <div key={cat.id} style={{ flex: 1, textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{v.scores[cat.id] || "—"}</div>
                                  ))}
                                  <div style={{ width: 50, textAlign: "right", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>{v.total}</div>
                                </div>
                              ))}
                              {/* Header row */}
                              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0 0", marginTop: 4 }}>
                                <div style={{ width: 80, fontSize: 9, color: "rgba(255,255,255,0.2)" }}>VOTER</div>
                                {CATEGORIES.map((cat) => (
                                  <div key={cat.id} style={{ flex: 1, textAlign: "center", fontSize: 9, color: "rgba(255,255,255,0.2)" }}>{cat.icon}</div>
                                ))}
                                <div style={{ width: 50, textAlign: "right", fontSize: 9, color: "rgba(255,255,255,0.2)" }}>TOTAL</div>
                              </div>
                            </div>
                          </details>
                        )}

                        {isLast && (
                          <div style={{ marginTop: 14, textAlign: "center" }}>
                            <div style={{
                              padding: "16px 20px", background: "rgba(255,2,2,0.07)",
                              borderRadius: 6, border: "1px solid rgba(255,2,2,0.2)", marginBottom: 8,
                            }}>
                              <div style={{ fontSize: 11, marginBottom: 8, animation: "sadDrip 2s ease-in-out infinite", fontFamily: "var(--font-mono)", letterSpacing: 3, color: "#FF0202", textTransform: "uppercase" }}>
                                Critical — Last Place
                              </div>
                              <div style={{ fontSize: 15, color: "#FFFAD0", fontStyle: "italic", fontFamily: "var(--font-display)", marginBottom: penalties[r.name] ? 12 : 0 }}>
                                {SAD_QUOTES[Math.floor(Math.random() * SAD_QUOTES.length)]}
                              </div>
                              {penalties[r.name] && (
                                <div style={{
                                  marginTop: 8, padding: "14px 18px",
                                  background: "linear-gradient(135deg, rgba(255,50,50,0.15), rgba(255,50,50,0.05))",
                                  border: "2px solid rgba(255,50,50,0.4)", borderRadius: 14,
                                  animation: "bounceIn 0.8s ease",
                                }}>
                                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "rgba(255,50,50,0.5)", textTransform: "uppercase", marginBottom: 6 }}>
                                    THE PENALTY
                                  </div>
                                  <div style={{
                                    fontSize: 18, fontWeight: 900, color: "#FF6B6B", lineHeight: 1.4,
                                  }}>
                                    {r.name} must eat:
                                  </div>
                                  <div style={{
                                    fontSize: 16, color: "#fff", fontWeight: 700, marginTop: 6, lineHeight: 1.5,
                                    background: "linear-gradient(90deg, #FF6B6B, #ff9f43, #FF6B6B)",
                                    backgroundSize: "200%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                                    animation: "textShine 3s linear infinite",
                                  }}>
                                    {penalties[r.name]}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        {rank === 1 && (
                          <div
                            style={{
                              marginTop: 14,
                              textAlign: "center",
                              padding: "14px 16px",
                              background:
                                "linear-gradient(135deg, rgba(255,215,0,0.12), rgba(255,107,107,0.08), rgba(78,205,196,0.08))",
                              backgroundSize: "200%",
                              animation:
                                "rainbowShift 3s ease infinite",
                              borderRadius: 12,
                              border:
                                "1px solid rgba(255,215,0,0.3)",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 18,
                                fontWeight: 900,
                                color: "#FFD700",
                                letterSpacing: 1,
                              }}
                            >
                              {
                                WINNER_TITLES[
                                  Math.floor(
                                    Math.random() *
                                      WINNER_TITLES.length
                                  )
                                ]
                              }
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {allRevealed && isCeo && (
            <div style={{ textAlign: "center", marginTop: 40 }}>
              <button
                onClick={resetShow}
                style={{ ...S.btn(), fontSize: 14, padding: "14px 36px" }}
              >
                New Show
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     PHASE: VOTER DONE — Thank you screen for non-CEO voters
  ═══════════════════════════════════════════════════════════════ */
  if (phase === "voter-done")
    return (
      <div style={S.root}>
        <StarBg />
        {ceoResetBtn}
        <div
          style={{
            ...S.page,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "80vh",
            flexDirection: "column",
            gap: 20,
            textAlign: "center",
          }}
        >
          <TenkaraLogo size={40} />
          <div><TechTag color="#02FF06">Session Complete · Field Tested</TechTag></div>
          <h1 style={{ ...S.title, fontSize: 44, margin: 0 }}>
            Voting Has Concluded
          </h1>
          <p
            style={{
              color: "rgba(255,250,208,0.5)",
              fontSize: 13,
              maxWidth: 420,
              lineHeight: 1.7,
              margin: 0,
              fontFamily: "var(--font-mono)",
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            All votes are locked in. Thanks for participating.
            <br />
            Ben is about to reveal the results live…
          </p>
          <div
            style={{
              marginTop: 12,
              fontFamily: "var(--font-mono)",
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: 6,
              color: "#0011FF",
              animation: "tkBlink 1.4s steps(1) infinite",
            }}
          >
            &gt;&gt;&gt;&gt;&gt;&gt;&gt;
          </div>
        </div>
      </div>
    );

  return null;
}

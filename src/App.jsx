import { useState, useEffect, useRef, useCallback } from "react";

/* ─── DATA ─────────────────────────────────────────────────────── */
const CATEGORIES = [
  {
    id: "c1",
    icon: "⚡",
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
    icon: "🎯",
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
    icon: "🚀",
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
    icon: "🧩",
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
    icon: "💎",
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

const AVATAR_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
  "#F0B27A",
  "#82E0AA",
  "#F1948A",
  "#85C1E9",
  "#D2B4DE",
  "#A9DFBF",
  "#FAD7A0",
  "#AED6F1",
  "#F9E79F",
  "#A8DFEB",
];

const SAD_QUOTES = [
  '"Every legend has a humble beginning… or something." 😢',
  '"It\'s not losing, it\'s \'aggressive learning.\'" 😭',
  '"On the bright side, someone had to go last." 💀',
  '"First is just last backwards... wait, no." 😅',
  '"The real treasure was the bugs we shipped along the way." 🐛',
];

const WINNER_TITLES = [
  "🦄 VIBE CHAMPION OF THE UNIVERSE 🌈",
  "👑 SUPREME OVERLORD OF VIBES 🎪",
  "🏆 THE VIBE-CODED ONE 🔮",
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

/* ─── CONFETTI ──────────────────────────────────────────────────── */
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
    const shapes = ["rect", "circle", "star"];
    const pieces = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 200,
      vx: (Math.random() - 0.5) * 8,
      vy: Math.random() * 5 + 3,
      r: Math.random() * 10 + 4,
      color: [
        "#FF6B6B",
        "#4ECDC4",
        "#FFE66D",
        "#A8EDEA",
        "#FF9FF3",
        "#54A0FF",
        "#5F27CD",
        "#00D2D3",
        "#FFD700",
        "#FF6348",
      ][Math.floor(Math.random() * 10)],
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.3,
      shape: shapes[Math.floor(Math.random() * 3)],
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        if (p.shape === "rect") {
          ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
        } else if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const method = i === 0 ? "moveTo" : "lineTo";
            ctx[method](Math.cos(a) * p.r * 0.5, Math.sin(a) * p.r * 0.5);
          }
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.vx *= 0.99;
        p.angle += p.spin;
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [active]);
  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
}

/* ─── UNICORN + RAINBOW CELEBRATION ──────────────────────────── */
function UnicornCelebration({ active }) {
  if (!active) return null;
  const unicorns = Array.from({ length: 12 }, (_, i) => ({
    emoji: ["🦄", "🌈", "✨", "⭐", "🎉", "🎊", "💫", "🔮", "🏆", "👑", "💎", "🎪"][i],
    left: Math.random() * 100,
    delay: Math.random() * 3,
    dur: 2 + Math.random() * 3,
    size: 20 + Math.random() * 30,
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
      {unicorns.map((u, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${u.left}%`,
            bottom: -60,
            fontSize: u.size,
            animation: `floatUp ${u.dur}s ease-out ${u.delay}s infinite`,
          }}
        >
          {u.emoji}
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
            fontSize: 16,
            opacity: 0.4,
            animation: `floatUp ${d.dur}s linear ${d.delay}s infinite reverse`,
          }}
        >
          💧
        </div>
      ))}
    </div>
  );
}

/* ─── STAR BG ───────────────────────────────────────────────────── */
function StarBg() {
  const stars = useRef(
    Array.from({ length: 50 }, () => ({
      w: Math.random() * 3 + 1,
      h: Math.random() * 3 + 1,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      opacity: Math.random() * 0.5 + 0.1,
      dur: `${Math.random() * 3 + 2}s`,
      delay: `${Math.random() * 3}s`,
    }))
  );
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      {stars.current.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: s.w,
            height: s.h,
            borderRadius: "50%",
            background: "#fff",
            left: s.left,
            top: s.top,
            opacity: s.opacity,
            animation: `twinkle ${s.dur} ease-in-out infinite`,
            animationDelay: s.delay,
          }}
        />
      ))}
    </div>
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
      <div style={{ fontSize: 64 }}>🔒</div>
      <h2
        style={{
          color: "#fff",
          fontWeight: 900,
          fontSize: 28,
          fontFamily: "'Trebuchet MS', sans-serif",
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
        Unlock & Vote 🗳️
      </button>
    </div>
  );
}

/* ─── SCRATCH CARD CANVAS ────────────────────────────────────── */
function ScratchCard({ width, height, onComplete, children }) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const percentRef = useRef(0);
  const doneRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#2a1052");
    gradient.addColorStop(0.5, "#0d2b5e");
    gradient.addColorStop(1, "#0f4a3a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.font = "bold 14px Trebuchet MS";
    ctx.textAlign = "center";
    ctx.fillText("✨ SCRATCH HERE ✨", width / 2, height / 2 + 5);

    const emojis = ["🎰", "🦄", "🌈", "⭐", "💎"];
    emojis.forEach((e, i) => {
      ctx.font = "20px serif";
      ctx.fillText(
        e,
        30 + (i * (width - 60)) / (emojis.length - 1),
        height / 2 - 18
      );
    });
  }, [width, height]);

  const scratch = useCallback(
    (x, y) => {
      const canvas = canvasRef.current;
      if (!canvas || doneRef.current) return;
      const ctx = canvas.getContext("2d");
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let cleared = 0;
      for (let i = 3; i < imageData.data.length; i += 4) {
        if (imageData.data[i] === 0) cleared++;
      }
      const pct = cleared / (imageData.data.length / 4);
      percentRef.current = pct;
      if (pct > 0.4 && !doneRef.current) {
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
    <div style={{ position: "relative", width: "100%", height }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </div>
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          cursor: "crosshair",
          borderRadius: 16,
          touchAction: "none",
        }}
        onMouseDown={(e) => {
          isDrawing.current = true;
          const p = getPos(e);
          scratch(p.x, p.y);
        }}
        onMouseMove={(e) => {
          if (!isDrawing.current) return;
          const p = getPos(e);
          scratch(p.x, p.y);
        }}
        onMouseUp={() => (isDrawing.current = false)}
        onMouseLeave={() => (isDrawing.current = false)}
        onTouchStart={(e) => {
          e.preventDefault();
          isDrawing.current = true;
          const p = getPos(e);
          scratch(p.x, p.y);
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          if (!isDrawing.current) return;
          const p = getPos(e);
          scratch(p.x, p.y);
        }}
        onTouchEnd={() => (isDrawing.current = false)}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════════ */
export default function VibeShowdown() {
  const [phase, setPhase] = useState("setup");
  const [people, setPeople] = useState(INITIAL_PEOPLE);
  const [addName, setAddName] = useState("");

  // Randomized voting order (set when show starts)
  const [voterOrder, setVoterOrder] = useState([]);

  // Presentation order (same for all voters, set once at show start)
  const [presentationOrder, setPresentationOrder] = useState([]);

  const [activeVoter, setActiveVoter] = useState(null);
  const [allVotes, setAllVotes] = useState({});
  const [doneVoters, setDoneVoters] = useState(new Set());
  const [claimedVoters, setClaimedVoters] = useState(new Set());
  const [showLock, setShowLock] = useState(false);
  const [pendingVoter, setPendingVoter] = useState(null);

  const [currentScores, setCurrentScores] = useState({});
  const [scoringIdx, setScoringIdx] = useState(0);
  const [ceoScores, setCeoScores] = useState({});
  const [ceoCurrent, setCeoCurrent] = useState(0);
  const [ceoDone, setCeoDone] = useState(false);

  const [results, setResults] = useState([]);
  const [revealed, setRevealed] = useState([]);
  const [revealingIdx, setRevealingIdx] = useState(-1);
  const [allRevealed, setAllRevealed] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [unicorns, setUnicorns] = useState(false);
  const [sadRain, setSadRain] = useState(false);
  const [autoRevealing, setAutoRevealing] = useState(false);
  const [ceoAlert, setCeoAlert] = useState(false);

  const participants = people;
  const regularVoters = voterOrder.length > 0 ? voterOrder : people;
  const pendingVoters = regularVoters.filter(
    (p) => !doneVoters.has(p) && !claimedVoters.has(p)
  );
  const allRegularDone =
    voterOrder.length > 0 &&
    regularVoters.every(
      (p) => doneVoters.has(p) || claimedVoters.has(p)
    );
  const allVotesSubmitted =
    voterOrder.length > 0 &&
    regularVoters.every((p) => doneVoters.has(p));

  function startShow() {
    if (people.length < 2) return;
    setVoterOrder(shuffle(people));
    setPresentationOrder(shuffle(people));
    setPhase("login");
  }

  function targetsFor(voter) {
    return presentationOrder.filter((p) => p !== voter);
  }

  function requestVoting(voter) {
    setPendingVoter(voter);
    setShowLock(true);
  }

  function unlockAndVote() {
    setShowLock(false);
    const voter = pendingVoter;
    setClaimedVoters((prev) => new Set([...prev, voter]));
    setActiveVoter(voter);
    const existing = allVotes[voter] || {};
    setCurrentScores(existing);
    setScoringIdx(0);
    setPhase("voting");
  }

  function setScore(participantName, catId, val) {
    setCurrentScores((prev) => ({
      ...prev,
      [participantName]: {
        ...(prev[participantName] || {}),
        [catId]: val,
      },
    }));
  }

  function submitVoterScores() {
    const voter = activeVoter;
    setAllVotes((prev) => ({ ...prev, [voter]: currentScores }));
    setDoneVoters((prev) => {
      const next = new Set([...prev, voter]);
      if (voterOrder.every((p) => next.has(p))) {
        setCeoAlert(true);
      }
      return next;
    });
    setActiveVoter(null);
    setCurrentScores({});
    setScoringIdx(0);
    setPhase("login");
  }

  /* ── TEST: simulate all votes with random scores ── */
  function simulateAllVotes() {
    const order = shuffle(people);
    const presOrder = shuffle(people);
    setVoterOrder(order);
    setPresentationOrder(presOrder);

    const fakeVotes = {};
    order.forEach((voter) => {
      fakeVotes[voter] = {};
      presOrder
        .filter((p) => p !== voter)
        .forEach((target) => {
          fakeVotes[voter][target] = {};
          CATEGORIES.forEach((cat) => {
            fakeVotes[voter][target][cat.id] = Math.floor(Math.random() * 5) + 1;
          });
        });
    });
    setAllVotes(fakeVotes);
    setDoneVoters(new Set(order));
    setClaimedVoters(new Set(order));

    const fakeCeo = {};
    presOrder.forEach((target) => {
      fakeCeo[target] = {};
      CATEGORIES.forEach((cat) => {
        fakeCeo[target][cat.id] = Math.floor(Math.random() * 5) + 1;
      });
    });
    setCeoScores(fakeCeo);
    setCeoDone(true);

    const scored = presOrder.map((p) => {
      const ceo = fakeCeo[p] || {};
      const ceoTotal = CATEGORIES.reduce((s, c) => s + (ceo[c.id] || 0), 0);
      const voterList = order.filter((v) => v !== p);
      const catMeans = CATEGORIES.map((cat) => {
        const vals = voterList.map((v) => fakeVotes[v]?.[p]?.[cat.id] || 0);
        return vals.reduce((a, b) => a + b, 0) / vals.length;
      });
      const teamRaw = catMeans.reduce((a, b) => a + b, 0);
      return {
        name: p,
        ceoTotal: Math.round(ceoTotal * 10) / 10,
        teamTotal: Math.round(teamRaw * 10) / 10,
        total: Math.round((ceoTotal + teamRaw) * 10) / 10,
        catBreakdown: CATEGORIES.map((cat, i) => ({
          id: cat.id,
          icon: cat.icon,
          name: cat.name,
          ceo: ceo[cat.id] || 0,
          team: Math.round(catMeans[i] * 10) / 10,
        })),
      };
    });
    scored.sort((a, b) => b.total - a.total);
    setResults(scored);
    setRevealed(Array(scored.length).fill(false));
    setRevealingIdx(-1);
    setPhase("results");
  }

  function startCeoVoting() {
    setPhase("ceo");
    setCeoCurrent(0);
  }

  function setCeoScore(participantName, catId, val) {
    setCeoScores((prev) => ({
      ...prev,
      [participantName]: {
        ...(prev[participantName] || {}),
        [catId]: val,
      },
    }));
  }

  function submitCeoVote() {
    setCeoDone(true);
    calculateAndReveal();
  }

  function calculateAndReveal() {
    const scored = participants.map((p) => {
      const ceo = ceoScores[p] || {};
      const ceoTotal = CATEGORIES.reduce((s, c) => s + (ceo[c.id] || 0), 0);

      const voterList = regularVoters.filter((v) => v !== p);
      const catMeans = CATEGORIES.map((cat) => {
        const vals = voterList
          .filter((v) => allVotes[v]?.[p]?.[cat.id] != null)
          .map((v) => allVotes[v][p][cat.id]);
        if (!vals.length) return 0;
        return vals.reduce((a, b) => a + b, 0) / vals.length;
      });
      const teamRaw = catMeans.reduce((a, b) => a + b, 0);
      const total = ceoTotal + teamRaw;

      return {
        name: p,
        ceoTotal: Math.round(ceoTotal * 10) / 10,
        teamTotal: Math.round(teamRaw * 10) / 10,
        total: Math.round(total * 10) / 10,
        catBreakdown: CATEGORIES.map((cat, i) => ({
          id: cat.id,
          icon: cat.icon,
          name: cat.name,
          ceo: ceo[cat.id] || 0,
          team: Math.round(catMeans[i] * 10) / 10,
        })),
      };
    });
    scored.sort((a, b) => b.total - a.total);
    setResults(scored);
    setRevealed(Array(scored.length).fill(false));
    setRevealingIdx(-1);
    setPhase("results");
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

  /* ── Current voting state ── */
  const votingTargets = activeVoter ? targetsFor(activeVoter) : [];
  const currentTarget = votingTargets[scoringIdx];
  const currentTargetScores = currentScores[currentTarget] || {};
  const currentTargetComplete = CATEGORIES.every(
    (c) => currentTargetScores[c.id] != null
  );
  const totalCurrentScore = CATEGORIES.reduce(
    (s, c) => s + (currentTargetScores[c.id] || 0),
    0
  );

  const ceoTargets = participants;
  const ceoCurrent_name = ceoTargets[ceoCurrent];
  const ceoCurrent_scores = ceoScores[ceoCurrent_name] || {};
  const ceoCurrent_complete = CATEGORIES.every(
    (c) => ceoCurrent_scores[c.id] != null
  );
  const ceoCurrent_total = CATEGORIES.reduce(
    (s, c) => s + (ceoCurrent_scores[c.id] || 0),
    0
  );

  /* ─── STYLES ─────────────────────────────────────────────────── */
  const S = {
    root: {
      minHeight: "100vh",
      background:
        "linear-gradient(160deg, #1a0533 0%, #0d1b4b 40%, #0a3d2e 100%)",
      fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif",
      position: "relative",
      overflow: "hidden",
    },
    page: {
      position: "relative",
      zIndex: 1,
      maxWidth: 1100,
      margin: "0 auto",
      padding: "32px 24px",
    },
    title: {
      background:
        "linear-gradient(90deg, #FFE66D, #FF6B6B, #4ECDC4, #FFE66D)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundSize: "200%",
      animation: "rainbowShift 4s ease infinite",
      fontWeight: 900,
      letterSpacing: "-0.5px",
    },
    card: (color = "rgba(255,255,255,0.07)") => ({
      background: color,
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 20,
      padding: 24,
      backdropFilter: "blur(12px)",
    }),
    btn: (
      bg = "linear-gradient(135deg, #FFE66D, #FF6B6B)",
      color = "#1a0533"
    ) => ({
      background: bg,
      color,
      border: "none",
      borderRadius: 14,
      padding: "14px 32px",
      fontWeight: 800,
      fontSize: 16,
      cursor: "pointer",
      fontFamily: "inherit",
      letterSpacing: 0.5,
      transition: "transform 0.15s, box-shadow 0.15s",
      boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    }),
    label: {
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: 1.5,
      color: "rgba(255,255,255,0.45)",
      textTransform: "uppercase",
      marginBottom: 6,
      display: "block",
    },
  };

  /* ── TEST BUTTON (remove before production) ── */
  const testBtn = (
    <button
      onClick={simulateAllVotes}
      style={{
        position: "fixed",
        top: 12,
        right: 12,
        zIndex: 10000,
        background: "linear-gradient(135deg, #ff0066, #ff6600)",
        color: "#fff",
        border: "2px solid rgba(255,255,255,0.3)",
        borderRadius: 10,
        padding: "8px 16px",
        fontWeight: 900,
        fontSize: 12,
        cursor: "pointer",
        fontFamily: "'Trebuchet MS', sans-serif",
        letterSpacing: 1,
        textTransform: "uppercase",
        boxShadow: "0 4px 20px rgba(255,0,102,0.5)",
      }}
    >
      🧪 TEST: Skip to Results
    </button>
  );

  /* ═══════════════════════════════════════════════════════════════
     PHASE: SETUP
  ═══════════════════════════════════════════════════════════════ */
  if (phase === "setup")
    return (
      <div style={S.root}>
        {testBtn}
        <StarBg />
        <div style={S.page}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 64, marginBottom: 8, lineHeight: 1 }}>
              🎪
            </div>
            <h1 style={{ ...S.title, fontSize: 44, margin: "0 0 8px" }}>
              VIBE CODE SHOWDOWN
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: 16,
                margin: 0,
              }}
            >
              Who built the best vibe-coded app? Let's find out.
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

              <div
                style={{
                  maxHeight: 340,
                  overflowY: "auto",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {people.map((p, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 40,
                      padding: "6px 14px 6px 8px",
                      fontSize: 13,
                    }}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 9,
                        fontWeight: 900,
                        color: "#000",
                        flexShrink: 0,
                      }}
                    >
                      {initials(p)}
                    </div>
                    <span style={{ color: "#fff" }}>{p}</span>
                    <span
                      onClick={() =>
                        setPeople((prev) => prev.filter((_, j) => j !== i))
                      }
                      style={{
                        cursor: "pointer",
                        color: "rgba(255,255,255,0.3)",
                        fontWeight: 700,
                        lineHeight: 1,
                        fontSize: 16,
                      }}
                    >
                      ×
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Rubric */}
            <div style={S.card()}>
              <span style={S.label}>Scoring Rubric — 50 Points Total</span>
              <div
                style={{
                  background: "rgba(255,230,109,0.1)",
                  border: "1px solid rgba(255,230,109,0.3)",
                  borderRadius: 12,
                  padding: "10px 14px",
                  marginBottom: 16,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                <strong style={{ color: "#FFE66D" }}>Ben (CEO):</strong> 1–5
                per category = up to{" "}
                <strong style={{ color: "#FFE66D" }}>25 pts</strong>
                <br />
                <strong style={{ color: "#4ECDC4" }}>Team:</strong> Everyone
                votes 1–5, scores averaged = up to{" "}
                <strong style={{ color: "#4ECDC4" }}>25 pts</strong>
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
                      background: "rgba(255,255,255,0.04)",
                      borderRadius: 12,
                      padding: "12px 14px",
                      borderLeft: "3px solid rgba(255,255,255,0.15)",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 800,
                        color: "#fff",
                        fontSize: 14,
                        marginBottom: 2,
                      }}
                    >
                      {cat.icon} {cat.name}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "rgba(255,255,255,0.5)",
                      }}
                    >
                      {cat.desc}
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
                boxShadow: "0 6px 32px rgba(255,107,107,0.4)",
              }}
            >
              🎤 START THE SHOW
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
     PHASE: LOGIN — Pick your name (randomized order shown)
  ═══════════════════════════════════════════════════════════════ */
  if (phase === "login")
    return (
      <div style={S.root}>
        {testBtn}
        <StarBg />
        {showLock && pendingVoter && (
          <LockScreen voterName={pendingVoter} onUnlock={unlockAndVote} />
        )}

        {/* CEO Alert — all team votes are in */}
        {ceoAlert && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 200,
              background: "rgba(0,0,0,0.85)",
              backdropFilter: "blur(20px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 20,
              animation: "slideInUp 0.5s ease",
            }}
          >
            <div style={{ fontSize: 80, animation: "crownBounce 2s ease-in-out infinite" }}>👑</div>
            <h2
              style={{
                color: "#FFE66D",
                fontWeight: 900,
                fontSize: 32,
                fontFamily: "'Trebuchet MS', sans-serif",
                textAlign: "center",
                margin: 0,
              }}
            >
              ALL TEAM VOTES ARE IN!
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: 18,
                textAlign: "center",
                maxWidth: 420,
                lineHeight: 1.5,
                fontFamily: "'Trebuchet MS', sans-serif",
                margin: 0,
              }}
            >
              {voterOrder.length} team members have submitted their scores.
              <br />
              It's your turn, Ben. The CEO Super Vote awaits.
            </p>
            <button
              onClick={() => {
                setCeoAlert(false);
                startCeoVoting();
              }}
              style={{
                background: "linear-gradient(135deg, #FFE66D, #FF6B6B)",
                color: "#1a0533",
                border: "none",
                borderRadius: 14,
                padding: "16px 48px",
                fontWeight: 900,
                fontSize: 20,
                cursor: "pointer",
                fontFamily: "'Trebuchet MS', sans-serif",
                boxShadow: "0 8px 40px rgba(255,230,109,0.4)",
                animation: "pulse 2s ease-in-out infinite",
                marginTop: 8,
              }}
            >
              👑 LET'S GO — Cast CEO Vote
            </button>
            <button
              onClick={() => setCeoAlert(false)}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.3)",
                fontSize: 14,
                cursor: "pointer",
                fontFamily: "'Trebuchet MS', sans-serif",
              }}
            >
              Dismiss
            </button>
          </div>
        )}
        <div style={S.page}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h1 style={{ ...S.title, fontSize: 36, margin: "0 0 6px" }}>
              🎪 WHO'S NEXT?
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: 15,
                margin: 0,
              }}
            >
              Tap your name to cast your confidential ballot. Voting order is
              randomized.
            </p>
            <div
              style={{
                marginTop: 16,
                display: "inline-flex",
                gap: 24,
                background: "rgba(255,255,255,0.06)",
                borderRadius: 14,
                padding: "10px 20px",
                fontSize: 14,
              }}
            >
              <span style={{ color: "#4ECDC4" }}>
                ✅ <strong>{doneVoters.size}</strong> voted
              </span>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>
                ⏳ <strong>{voterOrder.length - doneVoters.size}</strong>{" "}
                pending
              </span>
            </div>
          </div>

          {/* Voting queue */}
          {pendingVoters.length > 0 && (
            <div
              style={{
                maxWidth: 860,
                margin: "0 auto 20px",
                background: "rgba(78,205,196,0.06)",
                border: "1px solid rgba(78,205,196,0.2)",
                borderRadius: 14,
                padding: "12px 18px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                Up Next:
              </span>
              {pendingVoters.slice(0, 5).map((p, i) => (
                <span
                  key={p}
                  style={{
                    color: i === 0 ? "#4ECDC4" : "rgba(255,255,255,0.35)",
                    fontWeight: i === 0 ? 800 : 400,
                    fontSize: 14,
                  }}
                >
                  {i === 0 ? "➡️ " : ""}
                  {p}
                  {i < Math.min(pendingVoters.length, 5) - 1 ? " → " : ""}
                </span>
              ))}
              {pendingVoters.length > 5 && (
                <span
                  style={{
                    color: "rgba(255,255,255,0.3)",
                    fontSize: 13,
                  }}
                >
                  +{pendingVoters.length - 5} more
                </span>
              )}
            </div>
          )}

          {/* Name grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 14,
              maxWidth: 860,
              margin: "0 auto",
            }}
          >
            {voterOrder.map((p) => {
              const done = doneVoters.has(p);
              const claimed = claimedVoters.has(p) && !done;
              const unavailable = done || claimed;
              const i = people.indexOf(p);
              const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
              return (
                <button
                  key={p}
                  onClick={() => !unavailable && requestVoting(p)}
                  disabled={unavailable}
                  style={{
                    background: unavailable
                      ? "rgba(255,255,255,0.04)"
                      : `linear-gradient(135deg, ${color}22, ${color}11)`,
                    border: done
                      ? "1px solid rgba(255,255,255,0.07)"
                      : claimed
                        ? "2px dashed rgba(255,230,109,0.4)"
                        : `2px solid ${color}55`,
                    borderRadius: 18,
                    padding: "18px 14px",
                    cursor: unavailable ? "default" : "pointer",
                    textAlign: "center",
                    transition: "transform 0.15s, box-shadow 0.15s",
                    opacity: unavailable ? 0.5 : 1,
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => {
                    if (!unavailable)
                      e.currentTarget.style.transform = "translateY(-4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      background: done
                        ? "rgba(255,255,255,0.1)"
                        : claimed
                          ? "rgba(255,230,109,0.2)"
                          : color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 10px",
                      fontSize: 18,
                      fontWeight: 900,
                      color: unavailable ? "rgba(255,255,255,0.3)" : "#000",
                      boxShadow: unavailable ? "none" : `0 4px 16px ${color}66`,
                    }}
                  >
                    {done ? "✓" : claimed ? "⏳" : initials(p)}
                  </div>
                  <div
                    style={{
                      color: unavailable ? "rgba(255,255,255,0.3)" : "#fff",
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    {p}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: done
                        ? "#4ECDC4"
                        : claimed
                          ? "#FFE66D"
                          : "rgba(255,255,255,0.35)",
                      marginTop: 4,
                    }}
                  >
                    {done ? "Voted ✅" : claimed ? "Voting... ⏳" : "🔒 Tap to vote"}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Ben / CEO section */}
          <div
            style={{
              maxWidth: 860,
              margin: "28px auto 0",
              ...S.card("rgba(255,230,109,0.08)"),
              border: "1px solid rgba(255,230,109,0.3)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #FFE66D, #FF6B6B)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    fontWeight: 900,
                    color: "#000",
                  }}
                >
                  BS
                </div>
                <div>
                  <div
                    style={{
                      color: "#FFE66D",
                      fontWeight: 900,
                      fontSize: 18,
                    }}
                  >
                    Ben Stern — CEO 👑
                  </div>
                  <div
                    style={{
                      color: "rgba(255,255,255,0.5)",
                      fontSize: 13,
                    }}
                  >
                    {allVotesSubmitted
                      ? "All team votes are in. Time for the CEO vote! 🔥"
                      : `Waiting for ${voterOrder.length - doneVoters.size} more voter${voterOrder.length - doneVoters.size !== 1 ? "s" : ""}...`}
                  </div>
                </div>
              </div>
              <button
                onClick={startCeoVoting}
                disabled={!allVotesSubmitted}
                style={{
                  ...S.btn(
                    allVotesSubmitted
                      ? "linear-gradient(135deg, #FFE66D, #FF6B6B)"
                      : "rgba(255,255,255,0.1)",
                    allVotesSubmitted ? "#1a0533" : "rgba(255,255,255,0.3)"
                  ),
                  opacity: allVotesSubmitted ? 1 : 0.5,
                  cursor: allVotesSubmitted ? "pointer" : "not-allowed",
                }}
              >
                {ceoDone ? "✅ Voted" : "👑 Cast CEO Vote"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );

  /* ═══════════════════════════════════════════════════════════════
     PHASE: VOTING (regular voter)
  ═══════════════════════════════════════════════════════════════ */
  if (phase === "voting") {
    const voterColor =
      AVATAR_COLORS[people.indexOf(activeVoter) % AVATAR_COLORS.length];
    const targetColor =
      AVATAR_COLORS[people.indexOf(currentTarget) % AVATAR_COLORS.length];

    return (
      <div style={S.root}>
        {testBtn}
        <StarBg />
        <div style={S.page}>
          {/* Top bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: voterColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 900,
                  color: "#000",
                }}
              >
                {initials(activeVoter)}
              </div>
              <div>
                <div
                  style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}
                >
                  {activeVoter}
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontSize: 12,
                  }}
                >
                  Rating {scoringIdx + 1} of {votingTargets.length} · 🔒
                  Confidential
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {votingTargets.map((t, i) => {
                const done =
                  currentScores[t] &&
                  CATEGORIES.every((c) => currentScores[t][c.id] != null);
                return (
                  <div
                    key={t}
                    onClick={() => setScoringIdx(i)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      cursor: "pointer",
                      background:
                        i === scoringIdx
                          ? AVATAR_COLORS[
                              people.indexOf(t) % AVATAR_COLORS.length
                            ]
                          : done
                            ? "rgba(78,205,196,0.5)"
                            : "rgba(255,255,255,0.1)",
                      border:
                        i === scoringIdx
                          ? "2px solid #fff"
                          : "1px solid rgba(255,255,255,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 9,
                      fontWeight: 900,
                      color:
                        i === scoringIdx
                          ? "#000"
                          : "rgba(255,255,255,0.6)",
                      transition: "all 0.2s",
                    }}
                    title={t}
                  >
                    {done && i !== scoringIdx ? "✓" : initials(t)}
                  </div>
                );
              })}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 360px",
              gap: 24,
              alignItems: "start",
            }}
          >
            {/* LEFT: Scoring card */}
            <div style={S.card()}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 28,
                  paddingBottom: 20,
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: targetColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    fontWeight: 900,
                    color: "#000",
                    boxShadow: `0 6px 24px ${targetColor}55`,
                    flexShrink: 0,
                  }}
                >
                  {initials(currentTarget)}
                </div>
                <div>
                  <div
                    style={{
                      color: "rgba(255,255,255,0.4)",
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: 1.5,
                      textTransform: "uppercase",
                    }}
                  >
                    Now Rating
                  </div>
                  <div
                    style={{
                      color: "#fff",
                      fontWeight: 900,
                      fontSize: 26,
                      lineHeight: 1.1,
                    }}
                  >
                    {currentTarget}
                  </div>
                </div>
                <div style={{ marginLeft: "auto", textAlign: "right" }}>
                  <div
                    style={{
                      color: "rgba(255,255,255,0.3)",
                      fontSize: 12,
                    }}
                  >
                    Your score
                  </div>
                  <div
                    style={{
                      fontSize: 36,
                      fontWeight: 900,
                      color:
                        totalCurrentScore >= 20
                          ? "#4ECDC4"
                          : totalCurrentScore >= 12
                            ? "#FFE66D"
                            : "#FF6B6B",
                    }}
                  >
                    {totalCurrentScore}
                    <span
                      style={{
                        fontSize: 16,
                        color: "rgba(255,255,255,0.3)",
                        fontWeight: 400,
                      }}
                    >
                      /25
                    </span>
                  </div>
                </div>
              </div>

              {CATEGORIES.map((cat) => {
                const val = currentTargetScores[cat.id];
                return (
                  <div key={cat.id} style={{ marginBottom: 24 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 10,
                      }}
                    >
                      <div>
                        <span style={{ fontSize: 18, marginRight: 8 }}>
                          {cat.icon}
                        </span>
                        <strong style={{ color: "#fff", fontSize: 15 }}>
                          {cat.name}
                        </strong>
                        <div
                          style={{
                            fontSize: 12,
                            color: "rgba(255,255,255,0.4)",
                            marginTop: 2,
                          }}
                        >
                          {cat.desc}
                        </div>
                      </div>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          flexShrink: 0,
                          background: val
                            ? `linear-gradient(135deg, ${AVATAR_COLORS[((val - 1) * 4) % AVATAR_COLORS.length]}, ${AVATAR_COLORS[(val * 3) % AVATAR_COLORS.length]})`
                            : "rgba(255,255,255,0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 22,
                          fontWeight: 900,
                          color: val ? "#000" : "rgba(255,255,255,0.2)",
                          border: val
                            ? "none"
                            : "1px solid rgba(255,255,255,0.15)",
                        }}
                      >
                        {val ?? "?"}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() => setScore(currentTarget, cat.id, n)}
                          style={{
                            flex: 1,
                            height: 48,
                            borderRadius: 12,
                            border: "none",
                            cursor: "pointer",
                            fontWeight: 900,
                            fontSize: 16,
                            fontFamily: "inherit",
                            background:
                              val >= n
                                ? `linear-gradient(135deg, ${AVATAR_COLORS[((val - 1) * 4) % AVATAR_COLORS.length]}, ${AVATAR_COLORS[(val * 3) % AVATAR_COLORS.length]})`
                                : "rgba(255,255,255,0.07)",
                            color:
                              val >= n
                                ? "#000"
                                : "rgba(255,255,255,0.3)",
                            transition: "all 0.15s",
                            transform:
                              val === n ? "scale(1.08)" : "scale(1)",
                            boxShadow:
                              val === n
                                ? "0 4px 16px rgba(0,0,0,0.3)"
                                : "none",
                          }}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                {scoringIdx > 0 && (
                  <button
                    onClick={() => setScoringIdx((i) => i - 1)}
                    style={{
                      ...S.btn("rgba(255,255,255,0.1)", "#fff"),
                      flex: "0 0 auto",
                      padding: "14px 20px",
                    }}
                  >
                    ← Back
                  </button>
                )}
                {scoringIdx < votingTargets.length - 1 ? (
                  <button
                    onClick={() => {
                      if (currentTargetComplete)
                        setScoringIdx((i) => i + 1);
                    }}
                    disabled={!currentTargetComplete}
                    style={{
                      ...S.btn(
                        currentTargetComplete
                          ? "linear-gradient(135deg, #4ECDC4, #45B7D1)"
                          : "rgba(255,255,255,0.1)",
                        currentTargetComplete
                          ? "#000"
                          : "rgba(255,255,255,0.3)"
                      ),
                      flex: 1,
                      opacity: currentTargetComplete ? 1 : 0.5,
                      cursor: currentTargetComplete
                        ? "pointer"
                        : "not-allowed",
                    }}
                  >
                    Next App →
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const allDone = votingTargets.every((t) => {
                        const s = currentScores[t] || {};
                        return CATEGORIES.every(
                          (c) => s[c.id] != null
                        );
                      });
                      if (allDone) submitVoterScores();
                      else
                        alert(
                          "Please score all apps before submitting!"
                        );
                    }}
                    style={{ ...S.btn(), flex: 1 }}
                  >
                    ✅ Submit All Scores
                  </button>
                )}
              </div>
            </div>

            {/* RIGHT: Rubric sidebar */}
            <div style={{ position: "sticky", top: 24 }}>
              <div style={S.card("rgba(255,255,255,0.05)")}>
                <span style={S.label}>📋 Scoring Guide</span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                  }}
                >
                  {CATEGORIES.map((cat, ci) => (
                    <div
                      key={cat.id}
                      style={{
                        borderLeft: `3px solid ${AVATAR_COLORS[(ci * 4) % AVATAR_COLORS.length]}`,
                        paddingLeft: 12,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 800,
                          color: "#fff",
                          fontSize: 14,
                          marginBottom: 4,
                        }}
                      >
                        {cat.icon} {cat.name}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "rgba(255,255,255,0.5)",
                          marginBottom: 8,
                        }}
                      >
                        {cat.guide}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 3,
                        }}
                      >
                        {cat.rubric.map((r, i) => (
                          <div
                            key={i}
                            style={{
                              fontSize: 11,
                              color: "rgba(255,255,255,0.35)",
                              lineHeight: 1.4,
                            }}
                          >
                            {r}
                          </div>
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
     PHASE: CEO VOTING
  ═══════════════════════════════════════════════════════════════ */
  if (phase === "ceo") {
    const targetColor =
      AVATAR_COLORS[people.indexOf(ceoCurrent_name) % AVATAR_COLORS.length];

    return (
      <div style={S.root}>
        {testBtn}
        <StarBg />
        <div style={S.page}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div
              style={{
                fontSize: 48,
                marginBottom: 4,
                animation: "crownBounce 2s ease-in-out infinite",
                display: "inline-block",
              }}
            >
              👑
            </div>
            <h2 style={{ ...S.title, fontSize: 30, margin: 0 }}>
              CEO SUPER VOTE
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: 14,
                margin: "6px 0 0",
              }}
            >
              Ben Stern · Rating {ceoCurrent + 1} of {ceoTargets.length}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 6,
              justifyContent: "center",
              marginBottom: 28,
              flexWrap: "wrap",
            }}
          >
            {ceoTargets.map((t, i) => {
              const done =
                ceoScores[t] &&
                CATEGORIES.every((c) => ceoScores[t][c.id] != null);
              return (
                <div
                  key={t}
                  onClick={() => setCeoCurrent(i)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    cursor: "pointer",
                    background:
                      i === ceoCurrent
                        ? AVATAR_COLORS[
                            people.indexOf(t) % AVATAR_COLORS.length
                          ]
                        : done
                          ? "rgba(78,205,196,0.5)"
                          : "rgba(255,255,255,0.1)",
                    border:
                      i === ceoCurrent
                        ? "2px solid #FFE66D"
                        : "1px solid rgba(255,255,255,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                    fontWeight: 900,
                    color:
                      i === ceoCurrent
                        ? "#000"
                        : "rgba(255,255,255,0.6)",
                    transition: "all 0.2s",
                  }}
                  title={t}
                >
                  {done && i !== ceoCurrent ? "✓" : initials(t)}
                </div>
              );
            })}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 360px",
              gap: 24,
              alignItems: "start",
            }}
          >
            <div
              style={{
                ...S.card("rgba(255,230,109,0.06)"),
                border: "1px solid rgba(255,230,109,0.25)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 28,
                  paddingBottom: 20,
                  borderBottom: "1px solid rgba(255,230,109,0.15)",
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: targetColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    fontWeight: 900,
                    color: "#000",
                    boxShadow: `0 6px 24px ${targetColor}55`,
                    flexShrink: 0,
                  }}
                >
                  {initials(ceoCurrent_name)}
                </div>
                <div>
                  <div
                    style={{
                      color: "rgba(255,230,109,0.6)",
                      fontSize: 12,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 1.5,
                    }}
                  >
                    CEO Rating
                  </div>
                  <div
                    style={{
                      color: "#fff",
                      fontWeight: 900,
                      fontSize: 26,
                    }}
                  >
                    {ceoCurrent_name}
                  </div>
                </div>
                <div style={{ marginLeft: "auto", textAlign: "right" }}>
                  <div
                    style={{
                      color: "rgba(255,255,255,0.3)",
                      fontSize: 12,
                    }}
                  >
                    CEO score
                  </div>
                  <div
                    style={{
                      fontSize: 36,
                      fontWeight: 900,
                      color: "#FFE66D",
                    }}
                  >
                    {ceoCurrent_total}
                    <span
                      style={{
                        fontSize: 16,
                        color: "rgba(255,255,255,0.3)",
                        fontWeight: 400,
                      }}
                    >
                      /25
                    </span>
                  </div>
                </div>
              </div>

              {CATEGORIES.map((cat) => {
                const val = ceoCurrent_scores[cat.id];
                return (
                  <div key={cat.id} style={{ marginBottom: 24 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 10,
                      }}
                    >
                      <div>
                        <span style={{ fontSize: 18, marginRight: 8 }}>
                          {cat.icon}
                        </span>
                        <strong style={{ color: "#fff", fontSize: 15 }}>
                          {cat.name}
                        </strong>
                        <div
                          style={{
                            fontSize: 12,
                            color: "rgba(255,255,255,0.4)",
                            marginTop: 2,
                          }}
                        >
                          {cat.desc}
                        </div>
                      </div>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          flexShrink: 0,
                          background: val
                            ? "linear-gradient(135deg, #FFE66D, #FF6B6B)"
                            : "rgba(255,255,255,0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 22,
                          fontWeight: 900,
                          color: val ? "#000" : "rgba(255,255,255,0.2)",
                          border: val
                            ? "none"
                            : "1px solid rgba(255,255,255,0.15)",
                        }}
                      >
                        {val ?? "?"}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() =>
                            setCeoScore(ceoCurrent_name, cat.id, n)
                          }
                          style={{
                            flex: 1,
                            height: 48,
                            borderRadius: 12,
                            border: "none",
                            cursor: "pointer",
                            fontWeight: 900,
                            fontSize: 16,
                            fontFamily: "inherit",
                            background:
                              val >= n
                                ? "linear-gradient(135deg, #FFE66D, #FF6B6B)"
                                : "rgba(255,255,255,0.07)",
                            color:
                              val >= n
                                ? "#000"
                                : "rgba(255,255,255,0.3)",
                            transition: "all 0.15s",
                            transform:
                              val === n ? "scale(1.08)" : "scale(1)",
                          }}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                {ceoCurrent > 0 && (
                  <button
                    onClick={() => setCeoCurrent((i) => i - 1)}
                    style={{
                      ...S.btn("rgba(255,255,255,0.1)", "#fff"),
                      flex: "0 0 auto",
                      padding: "14px 20px",
                    }}
                  >
                    ← Back
                  </button>
                )}
                {ceoCurrent < ceoTargets.length - 1 ? (
                  <button
                    onClick={() => {
                      if (ceoCurrent_complete)
                        setCeoCurrent((i) => i + 1);
                    }}
                    disabled={!ceoCurrent_complete}
                    style={{
                      ...S.btn(
                        "linear-gradient(135deg, #FFE66D, #FF6B6B)"
                      ),
                      flex: 1,
                      opacity: ceoCurrent_complete ? 1 : 0.5,
                      cursor: ceoCurrent_complete
                        ? "pointer"
                        : "not-allowed",
                    }}
                  >
                    Next App →
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const allDone = ceoTargets.every((t) => {
                        const s = ceoScores[t] || {};
                        return CATEGORIES.every(
                          (c) => s[c.id] != null
                        );
                      });
                      if (allDone) submitCeoVote();
                      else
                        alert(
                          "Please score all apps before submitting!"
                        );
                    }}
                    style={{
                      ...S.btn(
                        "linear-gradient(135deg, #FFE66D, #FF6B6B)"
                      ),
                      flex: 1,
                    }}
                  >
                    👑 Submit CEO Vote & See Results
                  </button>
                )}
              </div>
            </div>

            {/* Rubric sidebar */}
            <div style={{ position: "sticky", top: 24 }}>
              <div style={S.card("rgba(255,230,109,0.04)")}>
                <span style={S.label}>📋 Scoring Guide</span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                  }}
                >
                  {CATEGORIES.map((cat) => (
                    <div
                      key={cat.id}
                      style={{
                        borderLeft:
                          "3px solid rgba(255,230,109,0.4)",
                        paddingLeft: 12,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 800,
                          color: "#FFE66D",
                          fontSize: 14,
                          marginBottom: 4,
                        }}
                      >
                        {cat.icon} {cat.name}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "rgba(255,255,255,0.5)",
                          marginBottom: 8,
                        }}
                      >
                        {cat.guide}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 3,
                        }}
                      >
                        {cat.rubric.map((r, i) => (
                          <div
                            key={i}
                            style={{
                              fontSize: 11,
                              color: "rgba(255,255,255,0.35)",
                            }}
                          >
                            {r}
                          </div>
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
        bg: "linear-gradient(135deg, #FFD70022, #FFD70008)",
        border: "#FFD700",
        glow: "#FFD70066",
        label: "🥇 CHAMPION",
        labelColor: "#FFD700",
      },
      {
        bg: "linear-gradient(135deg, #C0C0C022, #C0C0C008)",
        border: "#C0C0C0",
        glow: "#C0C0C044",
        label: "🥈 RUNNER-UP",
        labelColor: "#C0C0C0",
      },
      {
        bg: "linear-gradient(135deg, #CD7F3222, #CD7F3208)",
        border: "#CD7F32",
        glow: "#CD7F3244",
        label: "🥉 THIRD PLACE",
        labelColor: "#CD7F32",
      },
    ];
    const LAST_STYLE = {
      bg: "rgba(255,50,50,0.06)",
      border: "rgba(255,50,50,0.2)",
      label: "😭 LAST PLACE",
      labelColor: "#ff6b6b",
    };

    const revealedCount = revealed.filter(Boolean).length;

    return (
      <div style={S.root}>
        {testBtn}
        <StarBg />
        <Confetti active={confetti} />
        <UnicornCelebration active={unicorns} />
        <SadRain active={sadRain} />
        <div style={S.page}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 56, marginBottom: 8 }}>🎪🦄🌈</div>
            <h1 style={{ ...S.title, fontSize: 42, margin: 0 }}>
              THE RESULTS ARE IN
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                margin: "8px 0 0",
                fontSize: 15,
              }}
            >
              {revealedCount === 0
                ? "Scratch each card to reveal, or auto-reveal all from last to first!"
                : allRevealed
                  ? "Congrats to all vibers! 🎉"
                  : `${revealedCount} of ${results.length} revealed...`}
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
                  ...S.btn(
                    "linear-gradient(135deg, #FFE66D, #FF6B6B, #4ECDC4)",
                    "#000"
                  ),
                  fontSize: 20,
                  padding: "18px 48px",
                  boxShadow:
                    "0 8px 40px rgba(255,107,107,0.5), 0 0 0 4px rgba(255,230,109,0.2)",
                  animation: autoRevealing
                    ? "none"
                    : "pulse 2s ease-in-out infinite",
                  opacity: autoRevealing ? 0.6 : 1,
                }}
              >
                {autoRevealing
                  ? "✨ Revealing..."
                  : "🎰 AUTO REVEAL (Last → First)"}
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
                          "linear-gradient(135deg, #1a0533 0%, #0d1b4b 50%, #0a3d2e 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        borderRadius: 20,
                        animation:
                          revealingIdx === i
                            ? "scratchOff 0.8s ease forwards"
                            : "none",
                      }}
                    >
                      {[
                        "🎰",
                        "🦄",
                        "🌈",
                        "✨",
                        "🎊",
                        "🎉",
                        "⭐",
                        "🚀",
                        "🔥",
                        "💫",
                      ].map((e, j) => (
                        <span key={j} style={{ fontSize: 24 }}>
                          {e}
                        </span>
                      ))}
                      <div
                        style={{
                          position: "absolute",
                          color: "rgba(255,255,255,0.25)",
                          fontSize: 13,
                          bottom: 12,
                        }}
                      >
                        🔒 Locked
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
                            rank <= 3 ? 26 : isLast ? 22 : 18,
                          fontWeight: 900,
                          color: rs ? rs.border : "#666",
                        }}
                      >
                        {rank <= 3
                          ? ["🥇", "🥈", "🥉"][rank - 1]
                          : isLast
                            ? "😭"
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
                        <div
                          style={{
                            display: "flex",
                            gap: 10,
                            marginBottom: 14,
                          }}
                        >
                          <div
                            style={{
                              flex: 1,
                              background: "rgba(255,230,109,0.1)",
                              border:
                                "1px solid rgba(255,230,109,0.25)",
                              borderRadius: 10,
                              padding: "8px 14px",
                              textAlign: "center",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 11,
                                color: "rgba(255,230,109,0.6)",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: 1,
                              }}
                            >
                              👑 CEO
                            </div>
                            <div
                              style={{
                                fontSize: 24,
                                fontWeight: 900,
                                color: "#FFE66D",
                              }}
                            >
                              {r.ceoTotal}
                              <span
                                style={{
                                  fontSize: 13,
                                  color: "rgba(255,255,255,0.3)",
                                }}
                              >
                                /25
                              </span>
                            </div>
                          </div>
                          <div
                            style={{
                              flex: 1,
                              background: "rgba(78,205,196,0.1)",
                              border:
                                "1px solid rgba(78,205,196,0.25)",
                              borderRadius: 10,
                              padding: "8px 14px",
                              textAlign: "center",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 11,
                                color: "rgba(78,205,196,0.6)",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: 1,
                              }}
                            >
                              🗳️ TEAM AVG
                            </div>
                            <div
                              style={{
                                fontSize: 24,
                                fontWeight: 900,
                                color: "#4ECDC4",
                              }}
                            >
                              {r.teamTotal}
                              <span
                                style={{
                                  fontSize: 13,
                                  color: "rgba(255,255,255,0.3)",
                                }}
                              >
                                /25
                              </span>
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(5, 1fr)",
                            gap: 8,
                          }}
                        >
                          {r.catBreakdown.map((cb) => (
                            <div
                              key={cb.id}
                              style={{
                                background: "rgba(255,255,255,0.04)",
                                borderRadius: 10,
                                padding: "8px 6px",
                                textAlign: "center",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 16,
                                  marginBottom: 2,
                                }}
                              >
                                {cb.icon}
                              </div>
                              <div
                                style={{
                                  fontSize: 10,
                                  color: "rgba(255,255,255,0.4)",
                                  marginBottom: 4,
                                  lineHeight: 1.2,
                                }}
                              >
                                {cb.name}
                              </div>
                              <div
                                style={{
                                  fontSize: 16,
                                  fontWeight: 900,
                                  color: "#fff",
                                }}
                              >
                                {Math.round((cb.ceo + cb.team) * 10) /
                                  10}
                              </div>
                              <div
                                style={{
                                  fontSize: 10,
                                  color: "rgba(255,255,255,0.25)",
                                }}
                              >
                                👑{cb.ceo} · 🗳️{cb.team}
                              </div>
                            </div>
                          ))}
                        </div>

                        {isLast && (
                          <div
                            style={{
                              marginTop: 14,
                              textAlign: "center",
                              padding: "12px 16px",
                              background: "rgba(255,50,50,0.08)",
                              borderRadius: 12,
                              border: "1px solid rgba(255,50,50,0.15)",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 28,
                                marginBottom: 6,
                                animation:
                                  "sadDrip 2s ease-in-out infinite",
                              }}
                            >
                              😢🌧️💔
                            </div>
                            <div
                              style={{
                                fontSize: 14,
                                color: "#ff6b6b",
                                fontStyle: "italic",
                              }}
                            >
                              {
                                SAD_QUOTES[
                                  Math.floor(
                                    Math.random() * SAD_QUOTES.length
                                  )
                                ]
                              }
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

          {allRevealed && (
            <div style={{ textAlign: "center", marginTop: 40 }}>
              <button
                onClick={() => {
                  setPhase("setup");
                  setAllVotes({});
                  setDoneVoters(new Set());
                  setClaimedVoters(new Set());
                  setCeoScores({});
                  setCeoDone(false);
                  setCeoAlert(false);
                  setResults([]);
                  setRevealed([]);
                  setAllRevealed(false);
                  setVoterOrder([]);
                  setPresentationOrder([]);
                  setAutoRevealing(false);
                  setRevealingIdx(-1);
                }}
                style={{
                  ...S.btn(),
                  fontSize: 16,
                  padding: "14px 36px",
                }}
              >
                🔄 Run Another Show
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

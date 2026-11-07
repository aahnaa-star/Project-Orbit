import { useState, useEffect, useRef } from "react";

// ─── CUSTOM CURSOR ────────────────────────────────────────────────────────────
function CustomCursor() {
  const dotRef  = useRef();
  const ringRef = useRef();
  const mouse   = useRef({ x: 0, y: 0 });
  const ring    = useRef({ x: 0, y: 0 });
  const raf     = useRef();
  const isTouchDevice = useRef(false);

  useEffect(() => {
    isTouchDevice.current = window.matchMedia("(hover: none)").matches;

    // ── DESKTOP CURSOR ──────────────────────────────────────────
    if (!isTouchDevice.current) {
      document.body.style.cursor = "none";

      const onMove = (e) => {
        mouse.current = { x: e.clientX, y: e.clientY };
        if (dotRef.current) {
          dotRef.current.style.left = e.clientX + "px";
          dotRef.current.style.top  = e.clientY + "px";
          dotRef.current.style.opacity = "1";
        }
      };

      const animate = () => {
        ring.current.x += (mouse.current.x - ring.current.x) * 0.12;
        ring.current.y += (mouse.current.y - ring.current.y) * 0.12;
        if (ringRef.current) {
          ringRef.current.style.left = ring.current.x + "px";
          ringRef.current.style.top  = ring.current.y + "px";
        }
        raf.current = requestAnimationFrame(animate);
      };

      const onEnter = () => {
        if (dotRef.current)  { dotRef.current.style.width  = "20px"; dotRef.current.style.height  = "20px"; }
        if (ringRef.current) { ringRef.current.style.width = "56px"; ringRef.current.style.height = "56px"; }
      };
      const onLeave = () => {
        if (dotRef.current)  { dotRef.current.style.width  = "12px"; dotRef.current.style.height  = "12px"; }
        if (ringRef.current) { ringRef.current.style.width = "36px"; ringRef.current.style.height = "36px"; }
      };

      document.addEventListener("mousemove", onMove);
      document.querySelectorAll("a, button").forEach((el) => {
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);
      });
      raf.current = requestAnimationFrame(animate);

      return () => {
        document.body.style.cursor = "";
        document.removeEventListener("mousemove", onMove);
        cancelAnimationFrame(raf.current);
      };
    }

    // ── MOBILE TOUCH RIPPLE ─────────────────────────────────────
    const createRipple = (x, y) => {
      const ripple = document.createElement("div");
      ripple.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: rgba(0, 212, 255, 0.6);
        box-shadow: 0 0 12px #00d4ff, 0 0 30px rgba(0,212,255,0.4);
        transform: translate(-50%, -50%) scale(1);
        pointer-events: none;
        z-index: 9999;
        transition: transform 0.5s ease-out, opacity 0.5s ease-out;
      `;
      document.body.appendChild(ripple);

      // Outer ring
      const ring = document.createElement("div");
      ring.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 1.5px solid rgba(0, 212, 255, 0.8);
        transform: translate(-50%, -50%) scale(1);
        pointer-events: none;
        z-index: 9998;
        transition: transform 0.6s ease-out, opacity 0.6s ease-out;
      `;
      document.body.appendChild(ring);

      requestAnimationFrame(() => {
        ripple.style.transform = "translate(-50%, -50%) scale(4)";
        ripple.style.opacity = "0";
        ring.style.transform = "translate(-50%, -50%) scale(6)";
        ring.style.opacity = "0";
      });

      setTimeout(() => {
        ripple.remove();
        ring.remove();
      }, 600);
    };

    const onTouch = (e) => {
      const touch = e.touches[0] || e.changedTouches[0];
      if (touch) createRipple(touch.clientX, touch.clientY);
    };

    document.addEventListener("touchstart", onTouch, { passive: true });
    return () => document.removeEventListener("touchstart", onTouch);
  }, []);

  // Don't render cursor divs on touch devices
  if (typeof window !== "undefined" && window.matchMedia("(hover: none)").matches) {
    return null;
  }

  return (
    <>
      <div ref={dotRef} style={{
        position: "fixed", pointerEvents: "none", zIndex: 9999,
        width: 12, height: 12, borderRadius: "50%",
        background: "#00d4ff",
        transform: "translate(-50%, -50%)",
        transition: "width 0.2s, height 0.2s",
        boxShadow: "0 0 10px #00d4ff, 0 0 30px rgba(0,212,255,0.5)",
        opacity: 0,
      }} />
      <div ref={ringRef} style={{
        position: "fixed", pointerEvents: "none", zIndex: 9998,
        width: 36, height: 36, borderRadius: "50%",
        border: "1px solid rgba(0,212,255,0.5)",
        transform: "translate(-50%, -50%)",
        transition: "width 0.3s, height 0.3s",
      }} />
    </>
  );
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const PHONE = "917093525891";
const WA_LINK = `https://wa.me/${PHONE}?text=${encodeURIComponent("Hi Aahnaa Technologies! I’d like to discuss my learning goal.")}`;
const MAIL = "aahnaatechnologies@gmail.com";

// ─── UTILITY HOOKS ────────────────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("revealed"); obs.unobserve(e.target); } }),
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  });
}

// ─── FULL CANVAS BACKGROUND ───────────────────────────────────────────────────
function AnimatedBackground() {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width  = W;
    canvas.height = H;

    // ── Stars
    const stars = Array.from({ length: 220 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      alpha: Math.random(),
      speed: Math.random() * 0.004 + 0.001,
      phase: Math.random() * Math.PI * 2,
    }));

    // ── Floating particles (blue/cyan dots drifting upward)
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2 + 0.5,
      vy: -(Math.random() * 0.4 + 0.1),
      vx: (Math.random() - 0.5) * 0.2,
      alpha: Math.random() * 0.5 + 0.1,
      color: Math.random() > 0.5 ? "0,212,255" : "26,111,255",
    }));

    // ── Nebula blobs
    const blobs = [
      { x: W * 0.2,  y: H * 0.3,  r: 260, color: "26,111,255",  alpha: 0.07, phase: 0,    speed: 0.0008 },
      { x: W * 0.8,  y: H * 0.6,  r: 200, color: "0,212,255",   alpha: 0.06, phase: 1.5,  speed: 0.001  },
      { x: W * 0.5,  y: H * 0.8,  r: 180, color: "59,130,246",  alpha: 0.05, phase: 3,    speed: 0.0006 },
    ];

    // ── Orbit rings config (cx, cy = center of screen)
    const rings = [
      { r: 140, speed:  0.004, tilt: 0.35, alpha: 0.25, width: 1.2, color: "0,212,255"  },
      { r: 210, speed: -0.0025, tilt: 0.25, alpha: 0.18, width: 1,   color: "26,111,255" },
      { r: 290, speed:  0.0015, tilt: 0.45, alpha: 0.12, width: 0.8, color: "0,212,255"  },
      { r: 370, speed: -0.001,  tilt: 0.2,  alpha: 0.08, width: 0.7, color: "59,130,246" },
    ];
    // Each ring has a rotating dot
    const ringAngles = rings.map(() => Math.random() * Math.PI * 2);

    let t = 0;

    const draw = () => {
      t += 1;
      ctx.clearRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;

      // ── Nebula blobs (pulsing radial gradients)
      blobs.forEach((b) => {
        const pulse = 1 + 0.08 * Math.sin(t * b.speed * 60 + b.phase);
        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * pulse);
        grad.addColorStop(0,   `rgba(${b.color},${b.alpha})`);
        grad.addColorStop(0.5, `rgba(${b.color},${b.alpha * 0.4})`);
        grad.addColorStop(1,   `rgba(${b.color},0)`);
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      // ── Stars (twinkling)
      stars.forEach((s) => {
        const a = 0.2 + 0.7 * (0.5 + 0.5 * Math.sin(t * s.speed * 60 + s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,230,255,${a})`;
        ctx.fill();
      });

      // ── Orbit rings (ellipses simulating 3D tilt)
      rings.forEach((ring, i) => {
        ringAngles[i] += ring.speed;
        const angle = ringAngles[i];

        // Draw ellipse (tilt via Y scale)
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(1, ring.tilt);
        ctx.beginPath();
        ctx.ellipse(0, 0, ring.r, ring.r, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${ring.color},${ring.alpha})`;
        ctx.lineWidth = ring.width;
        ctx.stroke();

        // Glowing dot orbiting the ring
        const dotX = Math.cos(angle) * ring.r;
        const dotY = Math.sin(angle) * ring.r;

        // Glow
        const glow = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, 8);
        glow.addColorStop(0,   `rgba(${ring.color},0.9)`);
        glow.addColorStop(0.4, `rgba(${ring.color},0.4)`);
        glow.addColorStop(1,   `rgba(${ring.color},0)`);
        ctx.beginPath();
        ctx.arc(dotX, dotY, 8, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Dot core
        ctx.beginPath();
        ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${ring.color},1)`;
        ctx.fill();

        ctx.restore();
      });

      // ── Floating particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }

        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
        glow.addColorStop(0, `rgba(${p.color},${p.alpha})`);
        glow.addColorStop(1, `rgba(${p.color},0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.alpha + 0.3})`;
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };

    draw();

    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width  = W;
      canvas.height = H;
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: "#050b18" }}
    />
  );
}

// ─── ORBIT RINGS (hero section — now just a placeholder, real ones on canvas) ─
function OrbitRings() {
  return null;
}

// ─── NAV ──────────────────────────────────────────────────────────────────────
function Nav({ page, setPage }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const navLinks = [
    { label: "Services",   action: () => { setPage("home"); setMenuOpen(false); setTimeout(() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" }), 100); } },
    { label: "Projects",   action: () => { setPage("home"); setMenuOpen(false); setTimeout(() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" }), 100); } },
    { label: "Process",    action: () => { setPage("home"); setMenuOpen(false); setTimeout(() => document.getElementById("process")?.scrollIntoView({ behavior: "smooth" }), 100); } },
    { label: "Pricing",    action: () => { setPage("home"); setMenuOpen(false); setTimeout(() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" }), 100); } },
    { label: "Resume Builder", action: () => { setPage("resume"); setMenuOpen(false); } },
    { label: "Order Now",  action: () => { setPage("order"); setMenuOpen(false); } },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between transition-all duration-300 border-b border-cyan-500/10 backdrop-blur-xl ${scrolled ? "py-3 px-6 md:px-10 bg-[#050b18]/95" : "py-5 px-6 md:px-14 bg-gradient-to-b from-[#050b18]/90 to-transparent"}`}>
        <button onClick={() => setPage("home")} className="flex items-center gap-3 cursor-pointer">
          <img src="/logo.png" alt="Aahnaa Technologies Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(0,212,255,0.7)]" />
          <span className="font-bold tracking-widest text-sm hidden sm:block" style={{ fontFamily: "'Orbitron', monospace" }}>
            Aahnaa <span className="text-cyan-400">Technologies</span>
          </span>
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex gap-8 items-center">
          {navLinks.map((l) => (
            <button key={l.label} onClick={l.action}
              className={`text-xs tracking-widest uppercase transition-colors cursor-pointer
                ${(l.label === "Resume Builder" && page === "resume") || (l.label === "Order Now" && page === "order")
                  ? "text-cyan-400" : "text-slate-400 hover:text-cyan-400"}`}>
              {l.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a href={WA_LINK} target="_blank" rel="noreferrer"
            className="hidden sm:block px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-xs font-bold tracking-widest uppercase shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/60 hover:-translate-y-0.5 transition-all"
            style={{ fontFamily: "'Orbitron', monospace" }}>
            Get Started
          </a>
          {/* Hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden flex flex-col gap-1.5 p-2 cursor-pointer z-50">
            <span className={`block w-6 h-0.5 bg-cyan-400 transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-6 h-0.5 bg-cyan-400 transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-6 h-0.5 bg-cyan-400 transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-[#050b18]/98 backdrop-blur-xl flex flex-col items-center justify-center gap-6 md:hidden">
          {navLinks.map((l) => (
            <button key={l.label} onClick={l.action}
              className="text-xl font-bold tracking-widest uppercase text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
              style={{ fontFamily: "'Orbitron', monospace" }}>
              {l.label}
            </button>
          ))}
          <a href={WA_LINK} target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)}
            className="mt-4 px-10 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold tracking-widest uppercase text-sm shadow-xl"
            style={{ fontFamily: "'Orbitron', monospace" }}>
            Get Started
          </a>
        </div>
      )}
    </>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero({ setPage }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-5 pt-24 pb-16 overflow-hidden">
      <OrbitRings />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[400px] md:w-[600px] h-[300px] md:h-[400px] bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Badge */}
      <div className="relative z-10 flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-2 mb-8 animate-fade-down">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-lg shadow-cyan-400 flex-shrink-0" />
        <span className="font-mono text-cyan-400 text-xs tracking-wide">Practical tech career support for students</span>
      </div>

      {/* Headline */}
      <h1 className="relative z-10 text-4xl sm:text-5xl md:text-7xl font-black leading-tight mb-5" style={{ fontFamily: "'Orbitron', monospace" }}>
        <span className="block text-white">Build Skills That</span>
        <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent bg-[length:200%] animate-shimmer">
          Move Your Career Forward
        </span>
      </h1>

      <p className="relative z-10 max-w-lg text-slate-400 text-sm md:text-lg leading-relaxed mb-10 px-2">
        Build practical projects, create a portfolio that reflects your work, and prepare for interviews with clear guidance. Start with a free resume builder or talk with us about your goals.
      </p>

      <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full max-w-sm sm:max-w-none sm:justify-center px-2">
        <button onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
          className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold tracking-widest uppercase text-xs shadow-2xl shadow-cyan-500/40 transition-all cursor-pointer"
          style={{ fontFamily: "'Orbitron', monospace" }}>
          Explore How We Help
        </button>
        <button onClick={() => setPage("resume")}
          className="w-full sm:w-auto px-8 py-4 rounded-xl border border-cyan-500/30 text-cyan-400 font-bold tracking-widest uppercase text-xs hover:bg-cyan-500/10 transition-all cursor-pointer"
          style={{ fontFamily: "'Orbitron', monospace" }}>
          Try the Free Resume Builder
        </button>
      </div>

      <style>{`
        @keyframes shimmer { to { background-position: 200% center; } }
        .animate-shimmer { animation: shimmer 3s linear infinite; }
        @keyframes fade-down { from { opacity:0; transform:translateY(-16px); } to { opacity:1; transform:translateY(0); } }
        .animate-fade-down { animation: fade-down 0.7s ease both; }
        .reveal { opacity:0; transform:translateY(36px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .revealed { opacity:1; transform:translateY(0); }
      `}</style>
    </section>
  );
}

// ─── STATS ────────────────────────────────────────────────────────────────────
function Stats() {
  const items = [
    { num: "01", label: "See each package price up front" },
    { num: "02", label: "Build practical skills as you go" },
    { num: "03", label: "Understand and explain your work" },
    { num: "04", label: "Get support directly on WhatsApp" },
  ];
  return (
    <div className="relative z-10 grid grid-cols-2 md:flex md:flex-row justify-center gap-4 md:gap-0 px-6 mb-20 reveal max-w-2xl mx-auto">
      {items.map((s, i) => (
        <div key={i} className="flex flex-col items-center px-6 py-8 md:px-12 md:py-10 border border-cyan-500/15 bg-[#0a1428]/70 backdrop-blur-xl rounded-2xl md:rounded-none
          md:first:rounded-l-2xl md:last:rounded-r-2xl">
          <span className="font-black text-2xl md:text-3xl bg-gradient-to-br from-blue-400 to-cyan-400 bg-clip-text text-transparent" style={{ fontFamily: "'Orbitron', monospace" }}>{s.num}</span>
          <span className="text-slate-500 text-xs tracking-widest uppercase mt-1 text-center">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── SERVICES ─────────────────────────────────────────────────────────────────
function Services({ setPage }) {
  const cards = [
    {
      num: "01", icon: "🌐", title: "Portfolio Website",
      desc: "A responsive portfolio shaped around your real skills and projects, with guidance to help you update and maintain it yourself.",
      tags: ["Custom Design", "Fully Hosted", "Mobile Ready"],
      cta: "See Pricing →",
    },
    {
      num: "02", icon: "🚀", title: "Guided Project Builds",
      desc: "Work through a practical project with setup help, code walkthroughs, and deployment guidance so you understand what you build.",
      tags: ["Hands-On Guidance", "Code Walkthrough", "Deployment Help"],
      cta: "See Pricing →",
    },
    {
      num: "03", icon: "📄", title: "Project Docs & Interview Prep",
      desc: "Organize your project decisions, architecture, and talking points into clear documentation you can understand and present honestly.",
      tags: ["Project Report", "Presentation Prep", "Interview Practice"],
      cta: "See Pricing →",
    },
    {
      num: "04", icon: "✨", title: "Free Resume Builder",
      desc: "Create a clean, readable resume from your own experience and projects. Your details stay in your browser while you work.",
      tags: ["Readable Layout", "Tech Focused", "PDF Export"],
      action: () => setPage("resume"),
      cta: "Build Free →",
    },
  ];

  return (
    <section id="services" className="relative z-10 px-6 md:px-16 pb-28">
      <div className="reveal mb-16">
        <p className="flex items-center gap-3 text-cyan-400 font-mono text-xs tracking-widest uppercase mb-3">
          <span className="w-8 h-px bg-cyan-400 inline-block" />What We Offer
        </p>
        <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: "'Orbitron', monospace" }}>Practical Help.<br/>Real Understanding.</h2>
        <p className="text-slate-400 text-base max-w-lg leading-relaxed">Build, present, and confidently discuss your own skills and projects.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {cards.map((c, i) => (
          <div key={i} className="reveal group relative bg-[#0a1428]/70 border border-cyan-500/15 rounded-2xl p-10 backdrop-blur-xl hover:-translate-y-2 hover:border-cyan-400/30 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 flex flex-col"
            style={{ transitionDelay: `${i * 80}ms` }}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />
            <div className="w-14 h-14 rounded-xl bg-blue-500/10 border border-cyan-500/20 flex items-center justify-center text-2xl mb-6 group-hover:shadow-lg group-hover:shadow-cyan-500/20 transition-shadow">
              {c.icon}
            </div>
            <span className="absolute top-8 right-8 font-mono text-xs text-cyan-500/30">{c.num}</span>
            <h3 className="font-bold text-base mb-3 leading-snug" style={{ fontFamily: "'Orbitron', monospace" }}>{c.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">{c.desc}</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {c.tags.map((t, j) => (
                <span key={j} className="px-3 py-1 rounded-full text-xs font-mono border border-cyan-500/20 text-cyan-400 bg-cyan-500/5">{t}</span>
              ))}
            </div>
            {/* CTA Button — always visible, full width */}
            <div className="mt-auto">
              {c.action ? (
                <button onClick={c.action}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-mono tracking-widest uppercase hover:from-blue-500/40 hover:to-cyan-500/40 hover:border-cyan-400 hover:text-white transition-all cursor-pointer">
                  {c.cta}
                </button>
              ) : (
                <button onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-mono tracking-widest uppercase hover:from-blue-500/40 hover:to-cyan-500/40 hover:border-cyan-400 hover:text-white transition-all cursor-pointer">
                  {c.cta}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── PROJECT LEVELS ───────────────────────────────────────────────────────────
function ProjectLevels() {
  const levels = [
    { badge: "Easy", color: "green", bg: "from-green-500/10 to-green-900/5", border: "border-green-500/20", badgeCls: "bg-green-500/15 text-green-400 border-green-500/30", title: "Build the Foundations", desc: "Practice core web skills with a small project you can adapt and explain.", items: ["Todo, calculator, or weather app", "HTML / CSS / JavaScript", "Git and GitHub basics", "Deployment walkthrough", "README writing guidance"] },
    { badge: "⭐ Medium", color: "yellow", bg: "from-amber-500/10 to-amber-900/5", border: "border-amber-400/25", badgeCls: "bg-amber-500/15 text-amber-400 border-amber-400/30", title: "Build a Full-Stack App", desc: "Learn how a front end, API, and database work together.", items: ["E-commerce, blog, or chat app", "React + Node + MongoDB", "API integration walkthrough", "Deployment guidance", "Project documentation practice"], featured: true },
    { badge: "High", color: "red", bg: "from-rose-500/10 to-rose-900/5", border: "border-rose-500/20", badgeCls: "bg-rose-500/15 text-rose-400 border-rose-500/30", title: "Explore Advanced Systems", desc: "Explore architecture and trade-offs with a mentor as you build.", items: ["AI/ML, DevOps, or microservices", "Architecture and design choices", "CI/CD concepts", "Technical presentation practice", "Scalability trade-offs"] },
  ];

  return (
    <section id="projects" className="relative z-10 px-6 md:px-16 pb-28">
      <div className="reveal text-center mb-16">
        <p className="flex items-center justify-center gap-3 text-cyan-400 font-mono text-xs tracking-widest uppercase mb-3">
          <span className="w-8 h-px bg-cyan-400" />Deploy-Ready Projects<span className="w-8 h-px bg-cyan-400" />
        </p>
        <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: "'Orbitron', monospace" }}>Pick Your Level</h2>
        <p className="text-slate-400 max-w-lg mx-auto">These are guided learning builds. Customize the work, follow your institution's rules, and be ready to explain your own contribution.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {levels.map((l, i) => (
          <div key={i} className={`reveal rounded-2xl p-10 bg-gradient-to-br ${l.bg} border ${l.border} backdrop-blur-xl hover:-translate-y-2 transition-all duration-300 ${l.featured ? "md:scale-105 shadow-xl shadow-amber-500/10" : ""}`}
            style={{ transitionDelay: `${i * 100}ms` }}>
            <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-widest border mb-5 ${l.badgeCls}`}>{l.badge}</span>
            <h3 className="font-bold text-base mb-2" style={{ fontFamily: "'Orbitron', monospace" }}>{l.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">{l.desc}</p>
            <ul className="space-y-2">
              {l.items.map((item, j) => (
                <li key={j} className="text-slate-400 text-sm flex items-start gap-2">
                  <span className="text-slate-600 mt-0.5">→</span>{item}
                </li>
              ))}
            </ul>
            <button onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
              className={`mt-6 block w-full text-center py-2.5 rounded-lg border text-xs font-mono tracking-widest uppercase transition-all hover:-translate-y-0.5 cursor-pointer ${l.badgeCls}`}>
              See Pricing →
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { n: "01", title: "Tell Us Your Goal", desc: "Message us with your skill level and what you want to learn or improve." },
    { n: "02", title: "Choose Your Support", desc: "Review what is included and the listed price. Ask us on WhatsApp if you want to clarify your scope before ordering." },
    { n: "03", title: "Share Details & Start", desc: "Send your requirements and payment screenshot through WhatsApp. We review the request and confirm the plan before work begins." },
    { n: "04", title: "Launch With Confidence", desc: "Get a walkthrough and next steps so you can maintain and explain your work." },
  ];

  return (
    <section id="process" className="relative z-10 px-6 md:px-16 pb-28">
      <div className="reveal text-center mb-16">
        <p className="flex items-center justify-center gap-3 text-cyan-400 font-mono text-xs tracking-widest uppercase mb-3">
          <span className="w-8 h-px bg-cyan-400" />Process<span className="w-8 h-px bg-cyan-400" />
        </p>
        <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: "'Orbitron', monospace" }}>How It Works</h2>
        <p className="text-slate-400 max-w-md mx-auto">From inquiry to delivery — streamlined, fast, and student-friendly.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto relative">
        <div className="hidden md:block absolute top-10 left-[12%] w-[76%] h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
        {steps.map((s, i) => (
          <div key={i} className="reveal text-center" style={{ transitionDelay: `${i * 100}ms` }}>
            <div className="w-20 h-20 rounded-full border border-cyan-500/30 bg-[#0a1428] flex items-center justify-center mx-auto mb-5 relative shadow-lg shadow-cyan-500/10">
              <span className="font-black text-xl bg-gradient-to-br from-blue-400 to-cyan-400 bg-clip-text text-transparent" style={{ fontFamily: "'Orbitron', monospace" }}>{s.n}</span>
            </div>
            <h3 className="font-bold text-sm mb-2" style={{ fontFamily: "'Orbitron', monospace" }}>{s.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState(null);

  const faqs = [
    { q: "What happens before I pay?", a: "Each package lists its price and included items. If you need to clarify whether your requirements fit, message us on WhatsApp before ordering." },
    { q: "What if I need a change?", a: "Every order includes a free revision. We agree the requested scope and timeline over WhatsApp so expectations are clear." },
    { q: "How long does delivery take?", a: "Current estimates are 1–2 days for foundation projects and docs, 2–3 days for medium projects, 3–5 days for portfolios, and 5–7 days for the Portfolio & Practice Pack. We confirm the estimate before payment." },
    { q: "Is the Resume Builder free?", a: "Yes. You can enter your details, preview the resume, and use your browser's print dialog to save it as a PDF without signing up." },
    { q: "Can I submit a guided project as my own?", a: "Use project guidance responsibly. Follow your college or employer's rules, customize the work yourself, and accurately describe your contribution. We do not promise grades, interviews, or jobs." },
    { q: "Will I understand the project?", a: "The guided build includes walkthroughs and interview practice. Bring questions as you work so you can explain the decisions and code in your own words." },
    { q: "Do you provide GitHub setup?", a: "GitHub setup guidance is included in selected packages. We can help you understand repositories, write a README, and publish your own work." },
    { q: "What payment methods do you accept?", a: "We accept all UPI payments — GPay, PhonePe, Paytm, BHIM, or any UPI app. Payment is fast, instant, and secure." },
    { q: "Can I get a custom combo not listed here?", a: "Yes. Message us with your goal and budget. We will confirm what we can provide and the price before you decide to order." },
  ];

  return (
    <section id="faq" className="relative z-10 px-6 md:px-16 pb-28">
      {/* Guarantee Banner */}
      <div className="reveal max-w-4xl mx-auto mb-16">
        <div className="relative rounded-2xl overflow-hidden border border-green-500/20 bg-gradient-to-r from-green-500/8 to-emerald-500/5 p-8 text-center">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-400 to-transparent" />
          <div className="text-4xl mb-3">🛡️</div>
          <h3 className="text-xl font-black text-white mb-2" style={{ fontFamily: "'Orbitron', monospace" }}>
            Know What’s Included
          </h3>
          <p className="text-slate-400 max-w-lg mx-auto text-sm leading-relaxed">
            Each package lists its price, included deliverables, and estimated timing. If your requirements need a custom scope, message us before paying. Every order includes a free revision.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {["Free Revision", "Agreed Deliverables", "WhatsApp Support", "Price Confirmed First"].map((g) => (
              <span key={g} className="flex items-center gap-2 text-xs font-mono text-green-400 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-full">
                <span>✓</span>{g}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="reveal text-center mb-12">
        <p className="flex items-center justify-center gap-3 text-cyan-400 font-mono text-xs tracking-widest uppercase mb-3">
          <span className="w-8 h-px bg-cyan-400" />FAQ<span className="w-8 h-px bg-cyan-400" />
        </p>
        <h2 className="text-4xl font-black mb-3" style={{ fontFamily: "'Orbitron', monospace" }}>Got Questions?</h2>
        <p className="text-slate-400 text-sm">Everything students ask before ordering.</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((f, i) => (
          <div key={i} className="reveal border border-cyan-500/15 rounded-2xl overflow-hidden bg-[#0a1428]/60 backdrop-blur-xl"
            style={{ transitionDelay: `${i * 40}ms` }}>
            <button onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer hover:bg-cyan-500/5 transition-all">
              <span className="font-semibold text-sm text-white pr-4">{f.q}</span>
              <span className={`text-cyan-400 text-lg transition-transform flex-shrink-0 ${open === i ? "rotate-45" : ""}`}>+</span>
            </button>
            {open === i && (
              <div className="px-6 pb-5 text-slate-400 text-sm leading-relaxed border-t border-cyan-500/10 pt-4">
                {f.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function CTA({ setPage }) {
  return (
    <section id="contact" className="relative z-10 px-4 md:px-16 pb-20">
      <div className="reveal max-w-3xl mx-auto bg-[#0a1428]/80 border border-cyan-500/20 rounded-2xl p-8 md:p-16 text-center relative overflow-hidden backdrop-blur-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-blue-500/15 blur-3xl rounded-full pointer-events-none" />
        <p className="flex items-center justify-center gap-3 text-cyan-400 font-mono text-xs tracking-widest uppercase mb-4">
          <span className="w-6 h-px bg-cyan-400" />Ready to Launch?<span className="w-6 h-px bg-cyan-400" />
        </p>
        <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight" style={{ fontFamily: "'Orbitron', monospace" }}>
          Take the next step<br />
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">with a clear plan.</span>
        </h2>
        <p className="text-slate-400 text-sm md:text-base mb-8 max-w-lg mx-auto leading-relaxed">
          Tell us where you are in your learning journey. We’ll help you choose a practical next step—without promising a job or placement outcome.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <a href={`mailto:${MAIL}`}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold tracking-widest uppercase text-xs shadow-xl shadow-cyan-500/30 transition-all text-center"
            style={{ fontFamily: "'Orbitron', monospace" }}>
            Email Us
          </a>
          <a href={WA_LINK} target="_blank" rel="noreferrer"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-cyan-500/30 text-cyan-400 font-bold tracking-widest uppercase text-xs hover:bg-cyan-500/10 transition-all text-center"
            style={{ fontFamily: "'Orbitron', monospace" }}>
            WhatsApp Us
          </a>
          <button onClick={() => setPage("resume")}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-blue-500/30 text-blue-400 font-bold tracking-widest uppercase text-xs hover:bg-blue-500/10 transition-all cursor-pointer"
            style={{ fontFamily: "'Orbitron', monospace" }}>
            Build Resume ✨
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── PRICING ──────────────────────────────────────────────────────────────────
const BUNDLES = [
  {
    icon: "⚡", name: "Resume Booster Pack", badge: "Build and Practice",
    highlight: true,
    orderKey: "booster", price: "₹1,299", amount: 1299,
    desc: "Three guided builds plus documentation and interview practice to help you learn by doing.",
    includes: [
      "3 Guided Builds: Easy + Medium + Advanced",
      "Project documentation examples",
      "GitHub setup guidance",
      "Resume bullet writing guidance",
      "Practice questions for each build",
    ],
    color: "from-rose-500/15 to-orange-900/10", border: "border-rose-400/40", badgeCls: "bg-rose-500/15 text-rose-300 border-rose-400/30",
    tag: "Guided Learning Bundle",
  },
  {
    icon: "🚀", name: "Starter Pack", badge: "Start Here",
    highlight: false,
    orderKey: "starter", price: "₹499", amount: 499,
    desc: "A focused first project with setup and documentation guidance.",
    includes: ["Guided foundation project", "Basic documentation", "GitHub setup guidance", "README walkthrough", "Estimated 2-day delivery"],
    color: "from-green-500/10 to-green-900/5", border: "border-green-500/20", badgeCls: "bg-green-500/15 text-green-400 border-green-500/30",
  },
  {
    icon: "💼", name: "Job Ready Pack", badge: "Project Practice",
    highlight: false,
    orderKey: "jobready", price: "₹999", amount: 999,
    desc: "A guided full-stack build with a portfolio and interview practice focus.",
    includes: ["Medium full-stack guided build", "Project documentation guidance", "Free resume builder", "Deployment walkthrough", "Estimated 3-day delivery"],
    color: "from-blue-500/15 to-cyan-900/10", border: "border-cyan-400/40", badgeCls: "bg-cyan-500/15 text-cyan-400 border-cyan-400/30",
  },
  {
    icon: "👑", name: "Placement Pack", badge: "Portfolio + Practice",
    highlight: false,
    orderKey: "placement", price: "₹1,799", amount: 1799,
    desc: "Portfolio support, an advanced guided build, and presentation practice.",
    includes: ["Portfolio website support", "Advanced guided project", "Project report and presentation guidance", "Free resume builder", "Estimated 5–7 day delivery"],
    color: "from-amber-500/10 to-amber-900/5", border: "border-amber-400/25", badgeCls: "bg-amber-500/15 text-amber-400 border-amber-400/30",
  },
  {
    icon: "🌐", name: "Portfolio Pack", badge: "Show Your Work",
    highlight: false,
    orderKey: "portfolio", price: "₹849", amount: 849,
    desc: "A responsive portfolio that presents your real work and learning clearly.",
    includes: ["Portfolio website support", "Responsive design", "Free resume builder", "Personalization guidance", "Estimated 4-day delivery"],
    color: "from-purple-500/10 to-purple-900/5", border: "border-purple-400/20", badgeCls: "bg-purple-500/15 text-purple-400 border-purple-400/30",
  },
];

const ADDONS = [
  { icon: "🌐", name: "Portfolio Website", orderKey: "port_ind", tiers: [{ t: "Basic", p: "₹349", a: 349 }, { t: "Pro", p: "₹699", a: 699 }, { t: "Premium", p: "₹1,499", a: 1499 }] },
  { icon: "🚀", name: "Guided Project Build", orderKey: "proj_ind", tiers: [{ t: "Easy", p: "₹349", a: 349 }, { t: "Medium", p: "₹549", a: 549 }, { t: "High", p: "₹849", a: 849 }] },
  { icon: "📄", name: "Project Docs & Interview Prep", orderKey: "docs_ind", tiers: [{ t: "Basic", p: "₹199", a: 199 }, { t: "Pro", p: "₹349", a: 349 }, { t: "Premium", p: "₹599", a: 599 }] },
];

function Pricing({ setPage, onOrder }) {
  const [tab, setTab] = useState("bundles");

  return (
    <section id="pricing" className="relative z-10 px-6 md:px-16 pb-28">
      {/* Header */}
      <div className="reveal text-center mb-10">
        <p className="flex items-center justify-center gap-3 text-cyan-400 font-mono text-xs tracking-widest uppercase mb-3">
          <span className="w-8 h-px bg-cyan-400" />Pricing<span className="w-8 h-px bg-cyan-400" />
        </p>
        <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: "'Orbitron', monospace" }}>
          Student-Friendly<br />
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Prices</span>
        </h2>
        <p className="text-slate-400 max-w-lg mx-auto text-base leading-relaxed">
          See the listed price and included items for each package. Message us if you want to clarify your scope before ordering.
        </p>
      </div>

      {/* Clear pricing banner */}
      <div className="reveal max-w-3xl mx-auto mb-10">
          <div className="relative rounded-2xl border border-cyan-400/20 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 backdrop-blur-xl px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />
          <div className="flex items-center gap-4">
            <span className="text-3xl">🧾</span>
            <div>
              <p className="text-cyan-300 font-bold text-sm tracking-wide" style={{ fontFamily: "'Orbitron', monospace" }}>CLEAR PRICING. CLEAR DELIVERABLES.</p>
              <p className="text-slate-400 text-xs mt-0.5 font-mono">Review the package details, then ask us if your needs differ.</p>
            </div>
          </div>
          <span className="text-cyan-300 text-xs font-mono">Career support, not job guarantees</span>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="reveal flex justify-center mb-12">
        <div className="flex bg-[#0a1428] border border-cyan-500/20 rounded-2xl p-1.5 gap-1">
          {[["bundles", "🔥 Combo Packs"], ["addons", "⚙️ Individual Services"]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all cursor-pointer
                ${tab === key ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg shadow-cyan-500/20" : "text-slate-400 hover:text-white"}`}
              style={{ fontFamily: "'Orbitron', monospace" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── BUNDLES TAB ── */}
      {tab === "bundles" && (
        <div className="max-w-7xl mx-auto">

          {/* ⚡ Hero Bundle — Resume Booster Pack */}
          {(() => {
            const b = BUNDLES[0];
            return (
              <div className="reveal mb-8 relative rounded-3xl p-px overflow-hidden"
                style={{ background: "linear-gradient(135deg, #ff4d6d, #ff8c42, #ff4d6d)", backgroundSize: "300% 300%", animation: "gradientShift 3s ease infinite" }}>
                <div className="relative rounded-3xl bg-[#0d0814] overflow-hidden p-8 md:p-10">
                  {/* Glow bg */}
                  <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-60 h-60 bg-orange-500/8 rounded-full blur-3xl" />

                  <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    {/* Left */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">{b.icon}</span>
                        <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 text-xs font-bold tracking-widest">{b.tag}</span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-black text-white mb-2" style={{ fontFamily: "'Orbitron', monospace" }}>{b.name}</h3>
                      <p className="text-slate-300 text-sm leading-relaxed mb-5 max-w-lg">{b.desc}</p>

                      {/* Pain points */}
                      <div className="flex flex-wrap gap-2 mb-5">
                        {["Kills Resume Emptiness", "Beats Interview Fear", "Builds Confidence"].map((pt) => (
                          <span key={pt} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-mono">✓ {pt}</span>
                        ))}
                      </div>

                      {/* Includes */}
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {b.includes.map((item, j) => (
                          <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                            <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center text-xs flex-shrink-0">✓</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Right — Price + CTA */}
                    <div className="flex flex-col items-center gap-4 min-w-[180px]">
                      <div className="text-center">
                        <p className="text-slate-500 text-xs font-mono mb-1">Package price</p>
                        <div className="flex items-end gap-2 justify-center">
                          <span className="text-5xl font-black text-white" style={{ fontFamily: "'Orbitron', monospace" }}>{b.price}</span>
                        </div>
                      </div>
                      <button onClick={() => onOrder({ service: b.orderKey })}
                        className="w-full px-8 py-4 rounded-2xl text-white font-black tracking-widest uppercase text-sm shadow-2xl shadow-rose-500/30 hover:shadow-rose-500/60 hover:-translate-y-1 transition-all cursor-pointer"
                        style={{ fontFamily: "'Orbitron', monospace", background: "linear-gradient(135deg, #ff4d6d, #ff8c42)" }}>
                        Get This Pack →
                      </button>
                      <p className="text-slate-500 text-xs font-mono text-center">Ask us to confirm scope and delivery timing.</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Remaining bundles grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {BUNDLES.slice(1).map((b, i) => (
              <div key={i} className={`reveal relative rounded-2xl p-8 bg-gradient-to-br ${b.color} border ${b.border} backdrop-blur-xl flex flex-col transition-all duration-300 hover:-translate-y-2`}
                style={{ transitionDelay: `${i * 80}ms` }}>
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold tracking-widest border whitespace-nowrap ${b.badgeCls}`}>
                  {b.badge}
                </div>
                <div className="text-3xl mb-4 mt-2">{b.icon}</div>
                <h3 className="font-black text-base text-white mb-2" style={{ fontFamily: "'Orbitron', monospace" }}>{b.name}</h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-5">{b.desc}</p>
                <div className="flex items-end gap-2 mb-5">
                  <span className="text-4xl font-black text-white" style={{ fontFamily: "'Orbitron', monospace" }}>{b.price}</span>
                </div>
                <div className="h-px bg-white/5 mb-5" />
                <ul className="space-y-2.5 mb-6 flex-1">
                  {b.includes.map((item, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-xs text-slate-300">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${b.highlight ? "bg-cyan-500/20 text-cyan-400" : "bg-white/10 text-slate-400"}`}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <button onClick={() => onOrder({ service: b.orderKey })}
                  className={`w-full py-3 rounded-xl text-xs font-bold tracking-widest uppercase transition-all hover:-translate-y-0.5 cursor-pointer border ${b.border} ${b.badgeCls} hover:opacity-80`}
                  style={{ fontFamily: "'Orbitron', monospace" }}>
                  Get This Pack →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ADDONS TAB ── */}
      {tab === "addons" && (
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 text-center">
            <p className="text-blue-300 text-sm font-mono">💡 Individual services are add-ons. For best value, check out our <button onClick={() => setTab("bundles")} className="text-cyan-400 underline cursor-pointer">Combo Packs</button>!</p>
          </div>
          {ADDONS.map((svc, si) => (
            <div key={si} className="reveal" style={{ transitionDelay: `${si * 80}ms` }}>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-xl">{svc.icon}</span>
                <h3 className="font-bold text-sm text-white" style={{ fontFamily: "'Orbitron', monospace" }}>{svc.name}</h3>
                <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/20 to-transparent" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {svc.tiers.map((tier, ti) => (
                  <div key={ti} className="bg-[#0a1428]/70 border border-cyan-500/15 rounded-2xl p-6 flex flex-col hover:-translate-y-1 transition-all">
                    <span className="text-xs font-mono text-slate-500 tracking-widest uppercase mb-2">{tier.t}</span>
                    <span className="text-3xl font-black text-white mb-4" style={{ fontFamily: "'Orbitron', monospace" }}>{tier.p}</span>
                    <button onClick={() => onOrder({ service: svc.orderKey, tier: tier.t })}
                      className="mt-auto w-full py-2.5 rounded-xl border border-cyan-500/25 text-cyan-400 text-xs font-mono tracking-widest uppercase hover:bg-cyan-500/10 hover:border-cyan-400 transition-all cursor-pointer">
                      Order →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {/* Free resume */}
          <div className="reveal bg-gradient-to-r from-green-500/10 to-emerald-900/5 border border-green-500/20 rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✨</span>
              <div>
                <h3 className="font-bold text-sm text-white" style={{ fontFamily: "'Orbitron', monospace" }}>Free Resume Builder</h3>
                <p className="text-slate-400 text-xs mt-0.5">Always free — no payment needed</p>
              </div>
            </div>
            <button onClick={() => setPage("resume")}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-400 text-white text-xs font-bold tracking-widest uppercase shadow-lg shadow-green-500/20 hover:-translate-y-0.5 transition-all cursor-pointer"
              style={{ fontFamily: "'Orbitron', monospace" }}>
              Build Free →
            </button>
          </div>
        </div>
      )}

      {/* Bottom note */}
      <div className="reveal text-center mt-14">
        <p className="text-slate-500 text-sm font-mono">
          💬 Need a custom combo? <a href={WA_LINK} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">WhatsApp us</a> — we'll build the right pack for you!
        </p>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer({ setPage }) {
  return (
    <footer className="relative z-10 border-t border-cyan-500/10 px-6 md:px-16 py-10 flex flex-col items-center gap-6" style={{ backgroundColor: "#050b18" }}>
      <button onClick={() => setPage("home")} className="font-bold tracking-widest text-sm cursor-pointer" style={{ fontFamily: "'Orbitron', monospace" }}>
        Aahnaa <span className="text-cyan-400">Technologies</span>
      </button>
      <div className="flex flex-wrap justify-center gap-4">
        {["Services", "Projects", "Pricing", "FAQ", "Contact"].map((l) => (
          <a key={l} href={`#${l.toLowerCase()}`} className="text-slate-500 hover:text-cyan-400 text-xs tracking-widest uppercase transition-colors">{l}</a>
        ))}
        <button onClick={() => setPage("resume")} className="text-slate-500 hover:text-cyan-400 text-xs tracking-widest uppercase transition-colors cursor-pointer">Resume</button>
      </div>
      <p className="text-slate-500 text-xs font-mono text-center">© 2026 Aahnaa Technologies. All rights reserved.</p>
    </footer>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function HomePage({ setPage, onOrder }) {
  useReveal();
  return (
    <>
      <Hero setPage={setPage} />
      <Stats />
      <Services setPage={setPage} />
      <ProjectLevels />
      <HowItWorks />
      <Pricing setPage={setPage} onOrder={onOrder} />
      {/* <Testimonials /> */}
      <FAQ />
      <CTA setPage={setPage} />
    </>
  );
}

// ─── RESUME FIELD (defined outside to prevent remount on every keystroke) ─────
const inputCls = "w-full bg-[#0a1428] border border-cyan-500/20 rounded-xl px-4 py-3 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-400/50 focus:shadow-lg focus:shadow-cyan-500/10 transition-all";
const labelCls = "text-xs font-mono text-cyan-400/80 tracking-widest uppercase mb-1.5 block";

function Field({ label, value, onChange, placeholder, type = "text", rows }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {rows ? (
        <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} className={inputCls + " resize-none"} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} className={inputCls} />
      )}
    </div>
  );
}

// ─── RESUME STEP COMPONENTS (each outside to keep stable identity) ────────────
function StepPersonal({ data, upd }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <Field label="Full Name *" value={data.name} onChange={(v) => upd("name", v)} placeholder="Your Full Name" />
      <Field label="Email *" value={data.email} onChange={(v) => upd("email", v)} placeholder="you@example.com" type="email" />
      <Field label="Phone *" value={data.phone} onChange={(v) => upd("phone", v)} placeholder="+91 XXXXX XXXXX" />
      <Field label="Location" value={data.location} onChange={(v) => upd("location", v)} placeholder="City, State" />
      <Field label="LinkedIn URL" value={data.linkedin} onChange={(v) => upd("linkedin", v)} placeholder="linkedin.com/in/yourprofile" />
      <Field label="GitHub URL" value={data.github} onChange={(v) => upd("github", v)} placeholder="github.com/yourusername" />
    </div>
  );
}

function StepObjective({ data, upd }) {
  return (
    <div className="space-y-4">
      <p className="text-slate-400 text-sm leading-relaxed bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 font-mono">
        💡 <strong className="text-blue-300">ATS Tip:</strong> Write 2–3 sentences. Include your degree, target role, and 2 key skills. Use keywords from job descriptions.
      </p>
      <Field label="Career Objective *" value={data.objective} onChange={(v) => upd("objective", v)}
        placeholder="e.g. Final-year B.Tech (CSE) student seeking a Software Engineer role. Proficient in React and Node.js with hands-on experience in full-stack development."
        rows={5} />
    </div>
  );
}

function StepEducation({ data, updNested, addItem, removeItem }) {
  return (
    <div className="space-y-6">
      {data.education.map((e, i) => (
        <div key={i} className="bg-[#050b18] border border-cyan-500/15 rounded-2xl p-6 space-y-4 relative">
          {data.education.length > 1 && (
            <button onClick={() => removeItem("education", i)} className="absolute top-4 right-4 text-rose-400/60 hover:text-rose-400 text-lg transition-colors cursor-pointer">✕</button>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Degree / Course *" value={e.degree} onChange={(v) => updNested("education", i, "degree", v)} placeholder="e.g. B.Tech in Computer Science" />
            <Field label="College / University *" value={e.college} onChange={(v) => updNested("education", i, "college", v)} placeholder="Your College / University Name" />
            <Field label="Year of Passing" value={e.year} onChange={(v) => updNested("education", i, "year", v)} placeholder="e.g. 2025" />
            <Field label="CGPA / Percentage" value={e.gpa} onChange={(v) => updNested("education", i, "gpa", v)} placeholder="e.g. 8.5 / 10" />
          </div>
        </div>
      ))}
      <button onClick={() => addItem("education", { degree: "", college: "", year: "", gpa: "" })}
        className="w-full py-3 rounded-xl border border-dashed border-cyan-500/30 text-cyan-400 text-sm font-mono hover:border-cyan-400 hover:bg-cyan-500/5 transition-all cursor-pointer">
        + Add Education
      </button>
    </div>
  );
}

function StepSkills({ data, setData }) {
  const updSkill = (key, v) => setData((d) => ({ ...d, skills: { ...d.skills, [key]: v } }));
  return (
    <div className="space-y-5">
      <p className="text-slate-400 text-sm bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 font-mono">
        💡 <strong className="text-blue-300">ATS Tip:</strong> Separate skills with commas. Use exact technology names as listed in job descriptions.
      </p>
      <Field label="Programming Languages" value={data.skills.languages} onChange={(v) => updSkill("languages", v)} placeholder="e.g. Python, Java, C++, JavaScript" />
      <Field label="Frameworks & Libraries" value={data.skills.frameworks} onChange={(v) => updSkill("frameworks", v)} placeholder="e.g. React, Node.js, Express, Django" />
      <Field label="Tools & Platforms" value={data.skills.tools} onChange={(v) => updSkill("tools", v)} placeholder="e.g. Git, Docker, VS Code, Postman" />
      <Field label="Databases" value={data.skills.databases} onChange={(v) => updSkill("databases", v)} placeholder="e.g. MySQL, MongoDB, PostgreSQL" />
    </div>
  );
}

function StepProjects({ data, updNested, addItem, removeItem }) {
  return (
    <div className="space-y-6">
      {data.projects.map((p, i) => (
        <div key={i} className="bg-[#050b18] border border-cyan-500/15 rounded-2xl p-6 space-y-4 relative">
          {data.projects.length > 1 && (
            <button onClick={() => removeItem("projects", i)} className="absolute top-4 right-4 text-rose-400/60 hover:text-rose-400 text-lg transition-colors cursor-pointer">✕</button>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Project Title *" value={p.title} onChange={(v) => updNested("projects", i, "title", v)} placeholder="e.g. Student Management System" />
            <Field label="Tech Stack" value={p.tech} onChange={(v) => updNested("projects", i, "tech", v)} placeholder="e.g. React, Node.js, MongoDB" />
            <Field label="GitHub / Live Link" value={p.link} onChange={(v) => updNested("projects", i, "link", v)} placeholder="github.com/yourusername/project" />
          </div>
          <Field label="Description (2–3 bullet points)" value={p.desc} onChange={(v) => updNested("projects", i, "desc", v)}
            placeholder={"• Describe what you built and its purpose.\n• Mention key features or technologies used.\n• Add any measurable impact if possible."}
            rows={4} />
        </div>
      ))}
      <button onClick={() => addItem("projects", { title: "", tech: "", desc: "", link: "" })}
        className="w-full py-3 rounded-xl border border-dashed border-cyan-500/30 text-cyan-400 text-sm font-mono hover:border-cyan-400 hover:bg-cyan-500/5 transition-all cursor-pointer">
        + Add Project
      </button>
    </div>
  );
}

function StepExperience({ data, updNested, addItem, removeItem }) {
  return (
    <div className="space-y-6">
      <p className="text-slate-400 text-sm bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 font-mono">
        💡 No experience yet? Add internships, freelance work, or open-source contributions. Leave this section empty if none.
      </p>
      {data.experience.map((e, i) => (
        <div key={i} className="bg-[#050b18] border border-cyan-500/15 rounded-2xl p-6 space-y-4 relative">
          {data.experience.length > 1 && (
            <button onClick={() => removeItem("experience", i)} className="absolute top-4 right-4 text-rose-400/60 hover:text-rose-400 text-lg transition-colors cursor-pointer">✕</button>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Role / Title" value={e.role} onChange={(v) => updNested("experience", i, "role", v)} placeholder="e.g. Frontend Intern" />
            <Field label="Company" value={e.company} onChange={(v) => updNested("experience", i, "company", v)} placeholder="e.g. Company Name Pvt. Ltd." />
            <Field label="Duration" value={e.duration} onChange={(v) => updNested("experience", i, "duration", v)} placeholder="e.g. Jun 2024 – Aug 2024" />
          </div>
          <Field label="Key Points" value={e.points} onChange={(v) => updNested("experience", i, "points", v)}
            placeholder={"• Describe your key responsibilities or achievements.\n• Mention tools, technologies, or team size if relevant."}
            rows={3} />
        </div>
      ))}
      <button onClick={() => addItem("experience", { role: "", company: "", duration: "", points: "" })}
        className="w-full py-3 rounded-xl border border-dashed border-cyan-500/30 text-cyan-400 text-sm font-mono hover:border-cyan-400 hover:bg-cyan-500/5 transition-all cursor-pointer">
        + Add Experience
      </button>
    </div>
  );
}

function StepCertifications({ data, upd }) {
  return (
    <div className="space-y-8">
      <div>
        <h4 className="text-sm font-bold text-white mb-4" style={{ fontFamily: "'Orbitron', monospace" }}>Certifications</h4>
        <div className="space-y-3">
          {data.certifications.map((c, i) => (
            <div key={i} className="flex gap-2">
              <input value={c} onChange={(e) => { const a = [...data.certifications]; a[i] = e.target.value; upd("certifications", a); }}
                placeholder="e.g. Certification Name — Issuer, Year"
                className={inputCls} />
              {data.certifications.length > 1 && (
                <button onClick={() => upd("certifications", data.certifications.filter((_, j) => j !== i))} className="text-rose-400/60 hover:text-rose-400 px-3 cursor-pointer transition-colors">✕</button>
              )}
            </div>
          ))}
          <button onClick={() => upd("certifications", [...data.certifications, ""])}
            className="w-full py-2.5 rounded-xl border border-dashed border-cyan-500/30 text-cyan-400 text-sm font-mono hover:border-cyan-400 hover:bg-cyan-500/5 transition-all cursor-pointer">
            + Add Certification
          </button>
        </div>
      </div>
      <div>
        <h4 className="text-sm font-bold text-white mb-4" style={{ fontFamily: "'Orbitron', monospace" }}>Achievements</h4>
        <div className="space-y-3">
          {data.achievements.map((a, i) => (
            <div key={i} className="flex gap-2">
              <input value={a} onChange={(e) => { const arr = [...data.achievements]; arr[i] = e.target.value; upd("achievements", arr); }}
                placeholder="e.g. Winner — Hackathon Name, Year"
                className={inputCls} />
              {data.achievements.length > 1 && (
                <button onClick={() => upd("achievements", data.achievements.filter((_, j) => j !== i))} className="text-rose-400/60 hover:text-rose-400 px-3 cursor-pointer transition-colors">✕</button>
              )}
            </div>
          ))}
          <button onClick={() => upd("achievements", [...data.achievements, ""])}
            className="w-full py-2.5 rounded-xl border border-dashed border-cyan-500/30 text-cyan-400 text-sm font-mono hover:border-cyan-400 hover:bg-cyan-500/5 transition-all cursor-pointer">
            + Add Achievement
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ATS RESUME BUILDER ───────────────────────────────────────────────────────
const EMPTY_RESUME = {
  name: "", email: "", phone: "", linkedin: "", github: "", location: "",
  objective: "",
  education: [{ degree: "", college: "", year: "", gpa: "" }],
  skills: { languages: "", frameworks: "", tools: "", databases: "" },
  projects: [{ title: "", tech: "", desc: "", link: "" }],
  experience: [{ role: "", company: "", duration: "", points: "" }],
  certifications: [""],
  achievements: [""],
};

function ResumeBuilder() {
  const [data, setData] = useState(EMPTY_RESUME);
  const [step, setStep] = useState(0);
  const [preview, setPreview] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const printRef = useRef();

  // Auto-save on every change (gracefully skips if storage unavailable)
  useEffect(() => {
    let savedTimer;
    let resetTimer;
    try {
      localStorage.setItem("aahnaa_resume", JSON.stringify(data));
      savedTimer = setTimeout(() => setAutoSaved(true), 0);
      resetTimer = setTimeout(() => setAutoSaved(false), 1500);
    } catch (error) {
      console.warn("Resume auto-save is unavailable in this browser.", error);
    }
    return () => {
      clearTimeout(savedTimer);
      clearTimeout(resetTimer);
    };
  }, [data]);

  const steps = ["Personal Info", "Objective", "Education", "Skills", "Projects", "Experience", "Certifications & Achievements"];

  const upd = (field, val) => setData((d) => ({ ...d, [field]: val }));
  const updNested = (field, idx, key, val) => {
    const arr = [...data[field]];
    arr[idx] = { ...arr[idx], [key]: val };
    setData((d) => ({ ...d, [field]: arr }));
  };
  const addItem = (field, empty) => setData((d) => ({ ...d, [field]: [...d[field], empty] }));
  const removeItem = (field, idx) => setData((d) => ({ ...d, [field]: d[field].filter((_, i) => i !== idx) }));

  const renderStep = () => {
    switch (step) {
      case 0: return <StepPersonal data={data} upd={upd} />;
      case 1: return <StepObjective data={data} upd={upd} />;
      case 2: return <StepEducation data={data} updNested={updNested} addItem={addItem} removeItem={removeItem} />;
      case 3: return <StepSkills data={data} setData={setData} />;
      case 4: return <StepProjects data={data} updNested={updNested} addItem={addItem} removeItem={removeItem} />;
      case 5: return <StepExperience data={data} updNested={updNested} addItem={addItem} removeItem={removeItem} />;
      case 6: return <StepCertifications data={data} upd={upd} />;
      default: return null;
    }
  };

  // ── RESUME PREVIEW ─────────────────────────────────────────────────────────
  const renderResumePreview = () => (
    <div ref={printRef} className="bg-white text-gray-900 p-10 max-w-3xl mx-auto shadow-2xl rounded-lg" style={{ fontFamily: "Georgia, serif", fontSize: "13px", lineHeight: "1.5" }}>
      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-4 mb-4">
        <h1 className="text-2xl font-bold tracking-wide uppercase" style={{ fontFamily: "Arial, sans-serif", letterSpacing: "3px" }}>{data.name || "Your Name Here"}</h1>
        <div className="text-xs text-gray-600 mt-1 flex flex-wrap justify-center gap-x-3">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>| {data.phone}</span>}
          {data.location && <span>| {data.location}</span>}
          {data.linkedin && <span>| {data.linkedin}</span>}
          {data.github && <span>| {data.github}</span>}
        </div>
      </div>

      {/* Objective */}
      {data.objective && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-400 mb-2 pb-1" style={{ fontFamily: "Arial, sans-serif" }}>Objective</h2>
          <p className="text-gray-700">{data.objective}</p>
        </div>
      )}

      {/* Education */}
      {data.education.some(e => e.degree) && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-400 mb-2 pb-1" style={{ fontFamily: "Arial, sans-serif" }}>Education</h2>
          {data.education.filter(e => e.degree).map((e, i) => (
            <div key={i} className="flex justify-between mb-1">
              <div>
                <strong>{e.degree}</strong> — {e.college}
                {e.gpa && <span className="text-gray-500"> | CGPA: {e.gpa}</span>}
              </div>
              <span className="text-gray-500 text-xs">{e.year}</span>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {Object.values(data.skills).some(Boolean) && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-400 mb-2 pb-1" style={{ fontFamily: "Arial, sans-serif" }}>Technical Skills</h2>
          {data.skills.languages && <div className="mb-0.5"><strong>Languages:</strong> {data.skills.languages}</div>}
          {data.skills.frameworks && <div className="mb-0.5"><strong>Frameworks:</strong> {data.skills.frameworks}</div>}
          {data.skills.tools && <div className="mb-0.5"><strong>Tools:</strong> {data.skills.tools}</div>}
          {data.skills.databases && <div className="mb-0.5"><strong>Databases:</strong> {data.skills.databases}</div>}
        </div>
      )}

      {/* Projects */}
      {data.projects.some(p => p.title) && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-400 mb-2 pb-1" style={{ fontFamily: "Arial, sans-serif" }}>Projects</h2>
          {data.projects.filter(p => p.title).map((p, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between">
                <strong>{p.title}</strong>
                {p.link && <span className="text-blue-600 text-xs">{p.link}</span>}
              </div>
              {p.tech && <div className="text-gray-500 text-xs mb-1">Tech: {p.tech}</div>}
              {p.desc && <div className="text-gray-700 whitespace-pre-line text-xs">{p.desc}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Experience */}
      {data.experience.some(e => e.role) && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-400 mb-2 pb-1" style={{ fontFamily: "Arial, sans-serif" }}>Experience</h2>
          {data.experience.filter(e => e.role).map((e, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between">
                <strong>{e.role}</strong> — {e.company}
                <span className="text-gray-500 text-xs">{e.duration}</span>
              </div>
              {e.points && <div className="text-gray-700 whitespace-pre-line text-xs mt-1">{e.points}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {data.certifications.some(Boolean) && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-400 mb-2 pb-1" style={{ fontFamily: "Arial, sans-serif" }}>Certifications</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-0.5">
            {data.certifications.filter(Boolean).map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </div>
      )}

      {/* Achievements */}
      {data.achievements.some(Boolean) && (
        <div className="mb-2">
          <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-400 mb-2 pb-1" style={{ fontFamily: "Arial, sans-serif" }}>Achievements</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-0.5">
            {data.achievements.filter(Boolean).map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-gray-400 text-xs mt-6 pt-3 border-t border-gray-200">
        Built with Aahnaa Technologies • aahnaatechnologies@gmail.com
      </div>
    </div>
  );

  const handlePrint = () => {
    try {
      const content = printRef.current?.innerHTML;
      const w = window.open("", "_blank");
      if (w) {
        w.document.write(`<html><head><title>${data.name || "Resume"} - Resume</title><link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet"><style>body{margin:0;padding:20px;background:white;}@media print{body{padding:0;}}</style></head><body>${content}<script>window.print();</script></body></html>`);
        w.document.close();
      }
    } catch { alert("Please use your browser's print function (Ctrl+P) to save as PDF."); }
  };

  return (
    <div className="relative z-10 min-h-screen pt-28 px-6 md:px-12 pb-20">
      {/* Page Header */}
      <div className="text-center mb-12">
        <p className="flex items-center justify-center gap-3 text-cyan-400 font-mono text-xs tracking-widest uppercase mb-3">
          <span className="w-8 h-px bg-cyan-400" />Free Resume Builder<span className="w-8 h-px bg-cyan-400" />
        </p>
        <h2 className="text-4xl md:text-5xl font-black mb-3" style={{ fontFamily: "'Orbitron', monospace" }}>Build Your Resume</h2>
        <p className="text-slate-400 max-w-lg mx-auto">Fill in your details step-by-step. Your progress is auto-saved. ✅</p>
        {autoSaved && <p className="text-green-400 text-xs font-mono mt-2 animate-pulse">✓ Progress saved automatically</p>}
      </div>

      {!preview ? (
        <div className="max-w-4xl mx-auto">
          {/* Step tabs */}
          <div className="flex overflow-x-auto gap-2 mb-8 pb-2">
            {steps.map((s, i) => (
              <button key={i} onClick={() => setStep(i)}
                className={`px-4 py-2 rounded-xl text-xs font-mono whitespace-nowrap tracking-wide cursor-pointer transition-all ${step === i ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg shadow-cyan-500/20" : "bg-[#0a1428] border border-cyan-500/20 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40"}`}>
                {i + 1}. {s}
              </button>
            ))}
          </div>

          {/* Step content */}
          <div className="bg-[#0a1428]/60 border border-cyan-500/15 rounded-2xl p-8 backdrop-blur-xl mb-6">
            <h3 className="text-base font-bold text-white mb-6 flex items-center gap-3" style={{ fontFamily: "'Orbitron', monospace" }}>
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-sm font-black">{step + 1}</span>
              {steps[step]}
            </h3>
            {renderStep()}
          </div>

          {/* Nav buttons */}
          <div className="flex justify-between items-center">
            <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
              className="px-6 py-2.5 rounded-xl border border-cyan-500/20 text-slate-400 text-sm font-mono hover:border-cyan-400 hover:text-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer">
              ← Previous
            </button>
            <span className="text-slate-600 text-xs font-mono">{step + 1} / {steps.length}</span>
            {step < steps.length - 1 ? (
              <button onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-sm font-mono shadow-lg shadow-cyan-500/20 hover:-translate-y-0.5 transition-all cursor-pointer">
                Next →
              </button>
            ) : (
              <button onClick={() => setPreview(true)}
                className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-sm font-bold tracking-wide shadow-lg shadow-cyan-500/30 hover:-translate-y-0.5 hover:shadow-cyan-500/60 transition-all cursor-pointer"
                style={{ fontFamily: "'Orbitron', monospace" }}>
                Preview Resume ✨
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <button onClick={() => setPreview(false)}
              className="px-5 py-2.5 rounded-xl border border-cyan-500/20 text-cyan-400 text-sm font-mono hover:bg-cyan-500/10 transition-all cursor-pointer">
              ← Edit Resume
            </button>
            <div className="flex gap-3">
              <button onClick={handlePrint}
                className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-sm font-bold tracking-wide shadow-lg shadow-cyan-500/30 hover:-translate-y-0.5 transition-all cursor-pointer"
                style={{ fontFamily: "'Orbitron', monospace" }}>
                🖨️ Print / Save PDF
              </button>
              <a href={WA_LINK} target="_blank" rel="noreferrer"
                className="px-6 py-2.5 rounded-xl border border-green-500/30 text-green-400 text-sm font-mono hover:bg-green-500/10 transition-all">
                Need Help? WhatsApp Us
              </a>
            </div>
          </div>
          <div className="bg-gray-100 rounded-2xl p-4">
            {renderResumePreview()}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ORDER & PAYMENT PAGE ─────────────────────────────────────────────────────
const SERVICES_CONFIG = {
  booster:   { label: "⚡ Resume Booster Pack – 3 Projects", tiers: { "Resume Booster Pack": 1299 } },
  starter:   { label: "🚀 Starter Pack",        tiers: { "Starter Pack": 499 } },
  jobready:  { label: "💼 Full-Stack Practice Pack", tiers: { "Full-Stack Practice Pack": 999 } },
  placement: { label: "👑 Portfolio & Practice Pack", tiers: { "Portfolio & Practice Pack": 1799 } },
  portfolio: { label: "🌐 Portfolio Pack",       tiers: { "Portfolio Pack": 849 } },
  port_ind:  { label: "🌐 Portfolio Website",    tiers: { Basic: 349, Pro: 699, Premium: 1499 } },
  proj_ind:  { label: "🚀 Deploy-Ready Project", tiers: { Easy: 349, Medium: 549, High: 849 } },
  docs_ind:  { label: "📄 Interview Docs",       tiers: { Basic: 199, Pro: 349, Premium: 599 } },
};

const UPI_ID = "7093525891@ptsbi";

function OrderPage({ setPage, initialSelection }) {
  const [step, setStep] = useState(1); // 1=Select, 2=Details, 3=Payment, 4=Done
  const [service, setService] = useState(initialSelection?.service ?? "");
  const [tier, setTier] = useState(initialSelection?.tier ?? (initialSelection?.service ? Object.keys(SERVICES_CONFIG[initialSelection.service]?.tiers ?? {})[0] ?? "" : ""));
  const [form, setForm] = useState({ name: "", email: "", phone: "", requirement: "" });
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [whatsappOrderUrl, setWhatsappOrderUrl] = useState(WA_LINK);

  const amount = service && tier ? SERVICES_CONFIG[service]?.tiers[tier] : null;

  const copyUPI = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleScreenshot = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("File too large! Please upload under 5MB.");
      return;
    }
    setScreenshot(file);
    try { setScreenshotPreview(URL.createObjectURL(file)); } catch { setScreenshotPreview(null); }
  };

  const handleConfirm = () => {
    setSending(true);

    // Send to n8n webhook for automation
    const orderData = {
      name: form.name, email: form.email, phone: form.phone,
      service: SERVICES_CONFIG[service]?.label,
      plan: tier, amount, requirement: form.requirement,
    };
    fetch("https://primary-production-e25c.up.railway.app/webhook/aahnaa-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    }).catch(() => {}); // silent fail — WhatsApp still works even if n8n is down

    const msg = encodeURIComponent(
      `🎉 *New Order — Aahnaa Technologies*\n\n` +
      `👤 *Name:* ${form.name}\n` +
      `📧 *Email:* ${form.email}\n` +
      `📱 *Phone:* ${form.phone}\n\n` +
      `🛒 *Service:* ${SERVICES_CONFIG[service]?.label}\n` +
      `📦 *Plan:* ${tier}\n` +
      `💰 *Amount:* ₹${amount}\n\n` +
      `📝 *Requirement:*\n${form.requirement}\n\n` +
      `📸 *Payment Screenshot:* Sending separately in this chat.\n\n` +
      `✅ Please verify and confirm my order.`
    );
    const orderUrl = `https://wa.me/${PHONE}?text=${msg}`;
    setWhatsappOrderUrl(orderUrl);
    window.open(orderUrl, "_blank", "noopener,noreferrer");
    setSending(false);
    setStep(4);
  };

  const canProceedStep1 = service && tier;
  const canProceedStep2 = form.name && form.email && form.phone && form.requirement;
  const canConfirm = screenshot;

  // Progress bar
  const renderProgress = () => {
    const getStepCls = (i) => step > i + 1
      ? "bg-green-500 text-white"
      : step === i + 1
      ? "bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg shadow-cyan-500/30"
      : "bg-slate-800 text-slate-500";
    return (
      <div className="flex items-center justify-center gap-2 mb-10">
        {["Select Plan", "Your Details", "Payment", "Done!"].map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${getStepCls(i)}`}
              style={{ fontFamily: "'Orbitron', monospace" }}>
              {step > i + 1 ? "✓" : i + 1}
            </div>
            <span className={`text-xs font-mono hidden sm:block ${step === i + 1 ? "text-cyan-400" : "text-slate-600"}`}>{s}</span>
            {i < 3 && <div className={`w-8 h-px ${step > i + 1 ? "bg-green-500" : "bg-slate-700"}`} />}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="relative z-10 min-h-screen pt-24 px-4 md:px-10 lg:px-16 pb-20">
      {/* Header */}
      <div className="text-center mb-6">
        <p className="flex items-center justify-center gap-3 text-cyan-400 font-mono text-xs tracking-widest uppercase mb-3">
          <span className="w-6 h-px bg-cyan-400" />Place Your Order<span className="w-6 h-px bg-cyan-400" />
        </p>
        <h2 className="text-3xl md:text-5xl font-black mb-2" style={{ fontFamily: "'Orbitron', monospace" }}>Order Now</h2>
        <p className="text-slate-400 max-w-lg mx-auto text-sm">Select your service · Fill your details · Pay via UPI · We deliver!</p>
      </div>

      {/* Progress */}
      <div className="max-w-xl mx-auto mb-8">
        {renderProgress()}
      </div>

      {/* ── STEP 1: Two column on desktop ── */}
      {step === 1 && (
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left — Service Selection */}
          <div className="bg-[#0a1428]/80 border border-cyan-500/15 rounded-2xl p-5 md:p-6 backdrop-blur-xl">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: "'Orbitron', monospace" }}>
              <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xs font-black flex-shrink-0">1</span>
              Choose Your Service
            </h3>
            <p className="text-xs font-mono text-amber-400/80 tracking-widest uppercase mb-2">🔥 Combo Packs</p>
            <div className="space-y-2 mb-4">
              {[
                { key: "booster",   label: "⚡ Resume Booster Pack", price: "₹1,299", badge: "Guided learning" },
                { key: "starter",   label: "🚀 Starter Pack",         price: "₹499", badge: "Freshers" },
                { key: "jobready",  label: "💼 Full-Stack Practice Pack", price: "₹999", badge: "Project practice" },
                { key: "placement", label: "👑 Portfolio & Practice Pack", price: "₹1,799", badge: "Portfolio support" },
                { key: "portfolio", label: "🌐 Portfolio Pack",        price: "₹849", badge: "Stand Out" },
              ].map((s) => (
                <button key={s.key} onClick={() => { setService(s.key); setTier(Object.keys(SERVICES_CONFIG[s.key].tiers)[0]); }}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2
                    ${service === s.key ? "border-cyan-400 bg-cyan-500/10" : "border-cyan-500/20 bg-[#050b18] hover:border-cyan-500/40"}`}>
                  <span className="font-bold text-sm text-white truncate">{s.label}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-mono text-slate-500 hidden md:block">{s.badge}</span>
                    <span className="text-cyan-400 font-black text-sm" style={{ fontFamily: "'Orbitron', monospace" }}>{s.price}</span>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs font-mono text-slate-500 tracking-widest uppercase mb-2">⚙️ Individual Services</p>
            <div className="space-y-2">
              {[
                { key: "port_ind", label: "🌐 Portfolio Website" },
                { key: "proj_ind", label: "🚀 Deploy-Ready Project" },
                { key: "docs_ind", label: "📄 Interview Docs" },
              ].map((s) => (
                <button key={s.key} onClick={() => { setService(s.key); setTier(""); }}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all cursor-pointer
                    ${service === s.key ? "border-cyan-400 bg-cyan-500/10" : "border-cyan-500/20 bg-[#050b18] hover:border-cyan-500/40"}`}>
                  <span className="font-bold text-sm text-white">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right — Tier & Confirm */}
          <div className="bg-[#0a1428]/80 border border-cyan-500/15 rounded-2xl p-5 md:p-6 backdrop-blur-xl flex flex-col">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: "'Orbitron', monospace" }}>
              <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xs font-black flex-shrink-0">2</span>
              Confirm Your Plan
            </h3>

            {!service && (
              <div className="flex-1 flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="text-4xl mb-3">👈</div>
                  <p className="text-slate-500 text-sm font-mono">Select a service first</p>
                </div>
              </div>
            )}

            {service && Object.keys(SERVICES_CONFIG[service].tiers).length > 1 && (
              <div className="mb-4">
                <p className="text-xs font-mono text-cyan-400/80 tracking-widest uppercase mb-3">Select Tier</p>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(SERVICES_CONFIG[service].tiers).map(([t, price]) => (
                    <button key={t} onClick={() => setTier(t)}
                      className={`py-4 rounded-xl border text-center transition-all cursor-pointer
                        ${tier === t ? "border-cyan-400 bg-cyan-500/10" : "border-cyan-500/20 bg-[#050b18] hover:border-cyan-500/40"}`}>
                      <div className="font-bold text-sm text-white" style={{ fontFamily: "'Orbitron', monospace" }}>{t}</div>
                      <div className="text-cyan-400 font-black text-lg mt-1" style={{ fontFamily: "'Orbitron', monospace" }}>₹{price}</div>
                      {tier === t && <div className="text-xs text-green-400 font-mono mt-1">✓</div>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {service && Object.keys(SERVICES_CONFIG[service].tiers).length === 1 && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3 mb-4">
                <span className="text-green-400 text-2xl">✓</span>
                <div className="flex-1 min-w-0">
                  <p className="text-green-400 text-sm font-bold">Pack Selected!</p>
                  <p className="text-slate-400 text-xs font-mono mt-0.5 truncate">{SERVICES_CONFIG[service].label}</p>
                </div>
                <span className="text-2xl font-black text-cyan-400 flex-shrink-0" style={{ fontFamily: "'Orbitron', monospace" }}>
                  ₹{Object.values(SERVICES_CONFIG[service].tiers)[0]}
                </span>
              </div>
            )}

            {canProceedStep1 && Object.keys(SERVICES_CONFIG[service].tiers).length > 1 && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center justify-between mb-4">
                <div className="min-w-0 flex-1 pr-3">
                  <p className="text-xs text-slate-400 font-mono">Selected</p>
                  <p className="text-white font-bold text-sm truncate">{SERVICES_CONFIG[service].label} — {tier}</p>
                </div>
                <span className="text-2xl font-black text-cyan-400 flex-shrink-0" style={{ fontFamily: "'Orbitron', monospace" }}>₹{amount}</span>
              </div>
            )}

            <div className="mt-auto pt-4">
              <button onClick={() => setStep(2)} disabled={!canProceedStep1}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold tracking-widest uppercase text-sm shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                style={{ fontFamily: "'Orbitron', monospace" }}>
                Continue →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: Details ── */}
      {step === 2 && (
        <div className="max-w-2xl mx-auto bg-[#0a1428]/80 border border-cyan-500/15 rounded-2xl p-5 md:p-8 backdrop-blur-xl">
          <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2" style={{ fontFamily: "'Orbitron', monospace" }}>
            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xs font-black flex-shrink-0">2</span>
            Your Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {[
              { label: "Full Name *", key: "name", placeholder: "Your Full Name" },
              { label: "Email *", key: "email", placeholder: "you@example.com", type: "email" },
              { label: "Phone *", key: "phone", placeholder: "+91 XXXXX XXXXX" },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-xs font-mono text-cyan-400/80 tracking-widest uppercase mb-1.5 block">{f.label}</label>
                <input type={f.type || "text"} value={form[f.key]}
                  onChange={(e) => setForm((d) => ({ ...d, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full bg-[#050b18] border border-cyan-500/20 rounded-xl px-4 py-3 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-400/50 transition-all" />
              </div>
            ))}
          </div>
          <div className="mb-4">
            <label className="text-xs font-mono text-cyan-400/80 tracking-widest uppercase mb-1.5 block">Your Requirement *</label>
            <textarea rows={4} value={form.requirement}
              onChange={(e) => setForm((d) => ({ ...d, requirement: e.target.value }))}
              placeholder="Describe what you need — tech stack, project idea, domain, specific requirements..."
              className="w-full bg-[#050b18] border border-cyan-500/20 rounded-xl px-4 py-3 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-400/50 transition-all resize-none" />
          </div>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">
            When you continue, your contact details and requirements are sent to Aahnaa’s order system and included in the WhatsApp order draft. Please don’t include passwords or sensitive personal information.
          </p>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center justify-between mb-5">
            <p className="text-slate-300 text-sm truncate pr-2">{SERVICES_CONFIG[service]?.label}</p>
            <span className="text-xl font-black text-cyan-400 flex-shrink-0" style={{ fontFamily: "'Orbitron', monospace" }}>₹{amount}</span>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="px-5 py-3 rounded-xl border border-cyan-500/20 text-slate-400 text-sm font-mono hover:border-cyan-400 hover:text-cyan-400 transition-all cursor-pointer flex-shrink-0">← Back</button>
            <button onClick={() => setStep(3)} disabled={!canProceedStep2}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold tracking-widest uppercase text-sm shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              style={{ fontFamily: "'Orbitron', monospace" }}>
              Proceed to Payment →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Payment ── */}
      {step === 3 && (
        <div className="max-w-md mx-auto space-y-4">
          <div className="bg-[#0a1428]/80 border border-cyan-500/15 rounded-2xl p-5 backdrop-blur-xl">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: "'Orbitron', monospace" }}>
              <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xs font-black flex-shrink-0">3</span>
              Pay via UPI
            </h3>

              {/* ── Creative Payment Card ── */}
              <div className="relative rounded-3xl p-px overflow-hidden"
                style={{ background: "linear-gradient(135deg, #1a6fff, #00d4ff, #1a6fff, #00d4ff)", backgroundSize: "300% 300%", animation: "gradientShift 3s ease infinite" }}>
                <style>{`
                  @keyframes gradientShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
                  @keyframes floatOrb { 0%,100%{transform:translateY(0px) scale(1)} 50%{transform:translateY(-8px) scale(1.05)} }
                  @keyframes ping2 { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(2.5);opacity:0} }
                `}</style>

                <div className="relative rounded-3xl bg-[#060d1f] overflow-hidden p-5 sm:p-8">
                  {/* Background orbs */}
                  <div className="absolute top-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                  <div className="absolute bottom-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

                  {/* Top row — brand + status */}
                  <div className="relative flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                      <img src="/logo.png" alt="logo" className="w-8 h-8 object-contain drop-shadow-[0_0_6px_rgba(0,212,255,0.8)]" />
                      <span className="text-xs font-bold tracking-widest text-white" style={{ fontFamily: "'Orbitron', monospace" }}>AAHNAA<span className="text-cyan-400"> PAY</span></span>
                    </div>
                    <div className="flex items-center gap-2 bg-green-500/15 border border-green-500/30 rounded-full px-3 py-1">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                      </span>
                      <span className="text-green-400 text-xs font-mono">Pay using your UPI app</span>
                    </div>
                  </div>

                  {/* Amount display */}
                  <div className="relative text-center mb-6">
                    <p className="text-slate-500 text-xs font-mono tracking-widest uppercase mb-3">Total Amount</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-2xl text-cyan-400 font-bold">₹</span>
                      <span className="text-5xl sm:text-6xl font-black text-white" style={{ fontFamily: "'Orbitron', monospace", textShadow: "0 0 40px rgba(0,212,255,0.3)" }}>
                        {amount}
                      </span>
                    </div>
                    {/* Clean service label — no repetition */}
                    <p className="text-slate-400 text-xs font-mono mt-2 px-2 leading-relaxed">
                      {SERVICES_CONFIG[service]?.label?.replace(/^[^\w]*/, '')}
                    </p>
                  </div>

                  {/* UPI Apps row */}
                  <div className="relative flex justify-center gap-3 sm:gap-4 mb-6">
                    {[
                      { name: "GPay", color: "#4285F4", emoji: "G" },
                      { name: "PhonePe", color: "#5F259F", emoji: "P" },
                      { name: "Paytm", color: "#00BAF2", emoji: "₹" },
                      { name: "BHIM", color: "#00A550", emoji: "B" },
                    ].map((app) => (
                      <a key={app.name}
                        href={`upi://pay?pa=${UPI_ID}&pn=Aahnaa+Technologies&am=${amount}&cu=INR`}
                        className="flex flex-col items-center gap-1.5 cursor-pointer">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg"
                          style={{ background: app.color, boxShadow: `0 4px 16px ${app.color}50` }}>
                          {app.emoji}
                        </div>
                        <span className="text-slate-500 text-xs font-mono">{app.name}</span>
                      </a>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="relative flex items-center gap-3 mb-5">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-cyan-500/30" />
                    <span className="text-slate-500 text-xs font-mono px-2 whitespace-nowrap">or pay using UPI ID</span>
                    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-cyan-500/30" />
                  </div>

                  {/* UPI ID copy */}
                  <div className="relative flex items-center gap-2 bg-[#0a1428] border border-cyan-500/20 rounded-2xl px-4 py-3 mb-5">
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-500 text-xs font-mono mb-0.5">UPI ID</p>
                      <p className="text-cyan-400 font-mono font-bold text-sm truncate">{UPI_ID}</p>
                    </div>
                    <button onClick={copyUPI}
                      className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold tracking-widest uppercase border transition-all cursor-pointer
                        ${copied
                          ? "border-green-500 text-green-400 bg-green-500/15"
                          : "border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"}`}
                      style={{ fontFamily: "'Orbitron', monospace" }}>
                      {copied ? "✓" : "Copy"}
                    </button>
                  </div>

                  {/* Big Pay Button */}
                  <a href={`upi://pay?pa=${UPI_ID}&pn=Aahnaa+Technologies&am=${amount}&cu=INR`}
                    className="relative block w-full py-4 rounded-2xl text-center font-black tracking-widest uppercase text-white text-sm overflow-hidden group"
                    style={{ fontFamily: "'Orbitron', monospace", background: "linear-gradient(135deg, #1a6fff, #00d4ff)" }}>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 rounded-2xl shadow-lg shadow-cyan-500/40 group-hover:shadow-cyan-500/70 transition-shadow" />
                    <span className="relative">⚡ Pay ₹{amount} Now</span>
                  </a>

                  <p className="text-center text-slate-600 text-xs font-mono mt-4">
                    📱 On mobile — opens UPI app directly &nbsp;|&nbsp; 💻 On desktop — scan with your phone or use UPI ID above
                  </p>
                </div>
              </div>
            </div>

              {/* Screenshot upload */}
              <div>
                <label className="text-xs font-mono text-cyan-400/80 tracking-widest uppercase mb-2 block">
                  📸 Upload Payment Screenshot *
                </label>
                <label className={`flex flex-col items-center justify-center w-full py-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all
                  ${screenshotPreview ? "border-green-500/40 bg-green-500/5" : "border-cyan-500/20 bg-[#050b18] hover:border-cyan-400/40 hover:bg-cyan-500/5"}`}>
                  {screenshotPreview ? (
                    <div className="flex flex-col items-center gap-2">
                      <img src={screenshotPreview} alt="Screenshot" className="h-28 rounded-xl object-contain shadow-lg" />
                      <span className="text-green-400 text-xs font-mono mt-1">✓ Screenshot selected on this device</span>
                      <span className="text-slate-500 text-xs font-mono">Click to change</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-2xl mb-1">📸</div>
                      <span className="text-slate-300 text-sm font-medium">Select payment screenshot for WhatsApp</span>
                      <span className="text-slate-500 text-xs font-mono">You’ll attach it in WhatsApp · JPG or PNG</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleScreenshot} />
                </label>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-xl border border-cyan-500/20 text-slate-400 text-sm font-mono hover:border-cyan-400 hover:text-cyan-400 transition-all cursor-pointer">
                  ← Back
                </button>
                <button onClick={handleConfirm} disabled={!canConfirm || sending}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-400 text-white font-bold tracking-widest uppercase text-sm shadow-lg shadow-green-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  style={{ fontFamily: "'Orbitron', monospace" }}>
                  {sending ? "Preparing..." : "Continue to WhatsApp →"}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 4: Done ── */}
          {step === 4 && (
            <div className="max-w-md mx-auto">
              <div className="bg-[#0a1428]/80 border border-cyan-500/15 rounded-2xl p-6 backdrop-blur-xl text-center space-y-5">
                <div className="text-6xl animate-bounce">🚀</div>
                <h3 className="text-2xl font-black text-white" style={{ fontFamily: "'Orbitron', monospace" }}>Finish Your WhatsApp Request</h3>
                <p className="text-slate-400 text-sm">Your order details are ready. Send the WhatsApp message and attach your payment screenshot. We’ll confirm your order after reviewing it.</p>

                <div className="bg-[#050b18] border border-cyan-500/15 rounded-2xl p-5 text-left space-y-4">
                  <p className="text-xs font-mono text-cyan-400/80 tracking-widest uppercase">What Happens Next</p>
                  {[
                    { time: "Your next step", icon: "💬", text: "Send the prepared order message and payment screenshot in WhatsApp" },
                    { time: "After we receive it", icon: "📋", text: "We verify payment and confirm the agreed scope and timeline" },
                    { time: "During the project", icon: "⚡", text: "We share progress and answer questions as agreed" },
                    { time: "At handoff", icon: "✅", text: "You receive the deliverables and the included revision support" },
                  ].map((s, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0">{s.icon}</span>
                      <div>
                        <p className="text-xs font-mono text-cyan-400 mb-0.5">{s.time}</p>
                        <p className="text-slate-300 text-sm">{s.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-amber-500/10 border border-amber-400/20 rounded-xl p-4">
                  <p className="text-amber-300 text-sm font-mono text-center">
                    📸 <strong>One last step:</strong> attach your payment screenshot in the WhatsApp chat. Your request is not confirmed until we reply.
                  </p>
                </div>

                <div className="bg-[#050b18] border border-cyan-500/20 rounded-xl p-4 text-left space-y-2">
                  <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">Order Summary</p>
                  <div className="flex justify-between text-sm"><span className="text-slate-400">Name</span><span className="text-white">{form.name}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-400">Service</span><span className="text-cyan-400 text-xs truncate ml-2">{SERVICES_CONFIG[service]?.label}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-400">Amount</span><span className="text-green-400 font-bold">₹{amount}</span></div>
                </div>

                <div className="flex gap-3 justify-center flex-wrap">
                  <button onClick={() => setPage("home")}
                    className="px-6 py-3 rounded-xl border border-cyan-500/30 text-cyan-400 font-mono text-sm hover:bg-cyan-500/10 transition-all cursor-pointer">
                    ← Home
                  </button>
                  <a href={whatsappOrderUrl} target="_blank" rel="noreferrer"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-400 text-white font-bold text-sm shadow-lg transition-all">
                    💬 Open WhatsApp Order
                  </a>
                </div>
              </div>
            </div>
          )}

    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [orderSelection, setOrderSelection] = useState(null);
  const setOrderSelectionAndOpen = (selection) => {
    setOrderSelection(selection);
    setPage("order");
  };

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [page]);

  useEffect(() => {
    document.documentElement.style.backgroundColor = "#050b18";
    document.body.style.backgroundColor = "#050b18";
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    return () => {
      document.documentElement.style.backgroundColor = "";
      document.body.style.backgroundColor = "";
    };
  }, []);

  return (
    <div style={{ fontFamily: "'Syne', sans-serif", backgroundColor: "#050b18", minHeight: "100vh", color: "white", overflowX: "hidden", position: "relative" }}>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Syne:wght@400;500;600;700&family=JetBrains+Mono:wght@300;400&display=swap" rel="stylesheet" />
      <CustomCursor />
      <AnimatedBackground />
      <Nav page={page} setPage={setPage} />
      <main style={{ position: "relative", zIndex: 1 }}>
        {page === "home"   && <HomePage setPage={setPage} onOrder={setOrderSelectionAndOpen} />}
        {page === "resume" && <ResumeBuilder />}
        {page === "order"  && <OrderPage setPage={setPage} initialSelection={orderSelection} />}
      </main>
      <Footer setPage={setPage} />
    </div>
  );
}

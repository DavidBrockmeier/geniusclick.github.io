import { useState, useEffect } from "react";

const CATEGORIES = [
  {
    id: "team",
    title: "Your Team & Productivity",
    icon: "👥",
    items: [
      {
        id: "productivity",
        label: "Optimize employee productivity and network performance",
        desc: "See where bandwidth and time are going. Identify bottlenecks. Ensure your team has the speed and tools they need to work effectively.",
        price: 18,
      },
      {
        id: "approved_software",
        label: "Ensure only safe, approved software runs on your computers",
        desc: "Removes the ability for employees to install unknown or dangerous programs. Keeps your systems clean and predictable.",
        price: 15,
      },
      {
        id: "training",
        label: "Quarterly security awareness training for your team",
        desc: "Teach your people to recognize phishing, social engineering, and online scams before they cause damage.",
        price: 12,
      },
    ],
  },
  {
    id: "data",
    title: "Your Data & Information",
    icon: "🔐",
    items: [
      {
        id: "monitoring",
        label: "Continuous monitoring of access to your sensitive information",
        desc: "Know who is accessing critical files, when, and from where. Catch suspicious behavior the moment it happens.",
        price: 22,
      },
      {
        id: "exfil",
        label: "Get alerted if company data is being transferred out of the business",
        desc: "Detect unusual file transfers, large downloads, or unauthorized data access. Protect customer lists, financials, and trade secrets.",
        price: 20,
      },
      {
        id: "offboarding",
        label: "Automatic access removal when employees leave",
        desc: "The moment someone is terminated or resigns, their access to company systems is revoked. No loose ends.",
        price: 10,
      },
    ],
  },
  {
    id: "threats",
    title: "Threat Protection",
    icon: "🛡️",
    items: [
      {
        id: "threat_detection",
        label: "Real-time detection and response to malicious attacks",
        desc: "24/7 monitoring catches ransomware, malware, and targeted attacks. We stop them before they spread.",
        price: 25,
      },
      {
        id: "web_filtering",
        label: "Block dangerous and inappropriate websites on your network",
        desc: "Prevent access to malicious sites, adult content, gambling, and other non-business destinations. Protects your business from liability.",
        price: 12,
      },
      {
        id: "mfa",
        label: "Prevent stolen passwords from compromising your business",
        desc: "Multi-factor authentication ensures that a leaked or guessed password alone is never enough to access your systems.",
        price: 10,
      },
    ],
  },
  {
    id: "continuity",
    title: "Business Continuity",
    icon: "🏗️",
    items: [
      {
        id: "dr_drill",
        label: "Annual proof that we can rebuild your entire business from scratch",
        desc: "Once a year, we simulate total loss and rebuild from bare metal. You'll know — not hope — that your backups actually work.",
        price: 25,
      },
      {
        id: "proactive",
        label: "Proactive monitoring that catches problems before you notice them",
        desc: "System health, disk space, performance degradation, failing hardware — we see it first and fix it before it impacts your day.",
        price: 18,
      },
      {
        id: "qbr",
        label: "Quarterly strategic technology review with your leadership",
        desc: "Face-to-face review of your systems, security posture, upcoming needs, and technology roadmap. We plan ahead together.",
        price: 15,
      },
    ],
  },
  {
    id: "compliance",
    title: "Regulatory Compliance",
    icon: "📋",
    items: [
      {
        id: "hipaa",
        label: "HIPAA Compliance",
        desc: "Required if you handle patient health records. Includes security controls, audit logging, access management, and documentation to satisfy compliance requirements.",
        price: 30,
      },
      {
        id: "pci",
        label: "PCI DSS Compliance",
        desc: "Required if you process credit card transactions. Includes network segmentation, access controls, and documentation to protect payment data.",
        price: 25,
      },
    ],
  },
  {
    id: "infrastructure",
    title: "Infrastructure & Hardware",
    icon: "⚙️",
    items: [
      {
        id: "hardware",
        label: "We provide and maintain all computers — no upfront hardware costs",
        desc: "We spec, purchase, and deploy identical machines for your team. Hardware failures are replaced same-day from our inventory. No markup, ever.",
        price: 35,
      },
      {
        id: "networking",
        label: "Enterprise-grade managed network (UniFi)",
        desc: "Professional networking equipment that we manage remotely. Reliable WiFi, proper security, and same-day replacement from our spare inventory if anything fails.",
        price: 20,
      },
    ],
  },
];

const RESPONSE_TIERS = [
  {
    id: "standard",
    label: "Standard Response",
    response: "24-hour response time",
    afterHours: "$500/hr after-hours",
    price: 0,
    tagline: "Reliable support during business hours",
  },
  {
    id: "premium",
    label: "Premium Response",
    response: "10-minute callback",
    afterHours: "$200/hr after-hours",
    price: 100,
    tagline: "For businesses where every minute of downtime costs real money",
  },
];

const PREPAY_OPTIONS = [
  { id: "monthly", label: "Monthly", discount: 0, desc: "Pay as you go" },
  { id: "quarterly", label: "Quarterly", discount: 0.05, desc: "Save 5%" },
  { id: "semiannual", label: "6 Months", discount: 0.1, desc: "Save 10%" },
  { id: "annual", label: "Annual", discount: 0.15, desc: "Save 15%" },
];

const BASE_PRICE = 129;

const CAPABILITIES = [
  "Windows, macOS, and Linux endpoint administration",
  "Microsoft 365 (Entra ID, Intune, Defender, SharePoint, Exchange Online, Purview, Copilot)",
  "UniFi and pfSense network design and administration",
  "Cybersecurity assessments and hardening",
  "HIPAA compliance documentation and controls",
  "Backup architecture and disaster recovery",
  "Cloud migration and SharePoint deployment",
  "VoIP and telecommunications",
  "Multi-site network engineering",
  "Vendor management and RFP support",
  "Public-sector technology planning",
  "Budget recommendations and technology roadmaps",
  "Project and consultative engagements",
];

function AnimatedPrice({ value, prefix = "$", suffix = "" }) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const start = display;
    const end = value;
    const duration = 400;
    const startTime = performance.now();

    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [value]);

  return (
    <span>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

function CheckboxItem({ item, checked, onChange }) {
  return (
    <label
      className={`block cursor-pointer rounded-xl border-2 transition-all duration-300 ${
        checked
          ? "border-amber-500/60 bg-amber-500/[0.07]"
          : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
      }`}
      style={{ padding: "16px 18px" }}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all duration-300 ${
            checked
              ? "border-amber-500 bg-amber-500"
              : "border-white/20 bg-transparent"
          }`}
        >
          {checked && (
            <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
              <path
                d="M1 5L4.5 8.5L11 1.5"
                stroke="#0a0a0f"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <span
              className={`text-sm font-semibold leading-snug transition-colors duration-300 ${
                checked ? "text-amber-100" : "text-white/80"
              }`}
            >
              {item.label}
            </span>
            <span
              className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full transition-all duration-300 ${
                checked
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-white/[0.06] text-white/30"
              }`}
            >
              +${item.price}
            </span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-white/35">
            {item.desc}
          </p>
        </div>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
    </label>
  );
}

function Configurator() {
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [responseTier, setResponseTier] = useState("standard");
  const [seats, setSeats] = useState(10);
  const [prepay, setPrepay] = useState("monthly");

  const toggleItem = (id) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addonsTotal = CATEGORIES.flatMap((c) => c.items)
    .filter((item) => selectedItems.has(item.id))
    .reduce((sum, item) => sum + item.price, 0);

  const tierPrice =
    RESPONSE_TIERS.find((t) => t.id === responseTier)?.price || 0;
  const perSeat = BASE_PRICE + addonsTotal + tierPrice;
  const monthlyTotal = perSeat * seats;
  const prepayDiscount =
    PREPAY_OPTIONS.find((p) => p.id === prepay)?.discount || 0;
  const discountedMonthly = Math.round(monthlyTotal * (1 - prepayDiscount));
  const annualTotal = discountedMonthly * 12;
  const dailyPerUser = ((discountedMonthly / seats / 30) || 0).toFixed(2);
  const selectedTier = RESPONSE_TIERS.find((t) => t.id === responseTier);
  const checkedCount = selectedItems.size;

  return (
    <div className="pb-64">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest">
            Team Size
          </h3>
          <span className="text-white text-2xl font-bold">
            {seats}{" "}
            <span className="text-sm text-white/40 font-normal">people</span>
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="100"
          value={seats}
          onChange={(e) => setSeats(parseInt(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #d4a843 0%, #d4a843 ${(seats / 100) * 100}%, rgba(255,255,255,0.06) ${(seats / 100) * 100}%, rgba(255,255,255,0.06) 100%)`,
            accentColor: "#d4a843",
          }}
        />
        <div className="flex justify-between mt-1.5 text-[10px] text-white/20">
          <span>1</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">
          Response Priority
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {RESPONSE_TIERS.map((tier) => (
            <button
              key={tier.id}
              onClick={() => setResponseTier(tier.id)}
              className={`rounded-xl border-2 p-4 text-left transition-all duration-300 ${
                responseTier === tier.id
                  ? tier.id === "premium"
                    ? "border-amber-500/70 bg-amber-500/[0.08]"
                    : "border-white/20 bg-white/[0.05]"
                  : "border-white/[0.06] bg-white/[0.02] hover:border-white/10"
              }`}
            >
              <div
                className={`text-sm font-bold ${
                  responseTier === tier.id
                    ? tier.id === "premium"
                      ? "text-amber-300"
                      : "text-white/90"
                    : "text-white/40"
                }`}
              >
                {tier.label}
              </div>
              <div
                className={`mt-1 text-xs ${
                  responseTier === tier.id ? "text-white/50" : "text-white/20"
                }`}
              >
                {tier.response}
              </div>
              <div
                className={`mt-0.5 text-xs ${
                  responseTier === tier.id ? "text-white/40" : "text-white/15"
                }`}
              >
                {tier.afterHours}
              </div>
              {tier.price > 0 && (
                <div className="mt-2 text-xs font-bold text-amber-500/70">
                  +${tier.price}/seat
                </div>
              )}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-white/25 italic">
          {selectedTier.tagline}
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">
          Choose Your Capabilities
        </h3>
        <p className="text-[11px] text-white/25 mb-5">
          Select the protections and services your business needs. Each selection updates your investment in real time.
        </p>

        {CATEGORIES.map((category) => (
          <div key={category.id} className="mb-6">
            <h4 className="text-sm font-semibold text-white/50 mb-3 flex items-center gap-2">
              <span>{category.icon}</span>
              {category.title}
            </h4>
            <div className="space-y-2.5">
              {category.items.map((item) => (
                <CheckboxItem
                  key={item.id}
                  item={item}
                  checked={selectedItems.has(item.id)}
                  onChange={() => toggleItem(item.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">
          Payment Schedule
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {PREPAY_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setPrepay(opt.id)}
              className={`rounded-lg border-2 p-3 text-center transition-all duration-300 ${
                prepay === opt.id
                  ? opt.discount > 0
                    ? "border-emerald-500/50 bg-emerald-500/[0.08]"
                    : "border-white/20 bg-white/[0.05]"
                  : "border-white/[0.06] bg-white/[0.02] hover:border-white/10"
              }`}
            >
              <div
                className={`text-xs font-bold ${
                  prepay === opt.id ? "text-white/90" : "text-white/40"
                }`}
              >
                {opt.label}
              </div>
              {opt.discount > 0 && (
                <div
                  className={`mt-1 text-[11px] font-bold ${
                    prepay === opt.id
                      ? "text-emerald-400"
                      : "text-emerald-500/30"
                  }`}
                >
                  {opt.desc}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,10,15,0) 0%, rgba(10,10,15,0.95) 15%, rgba(10,10,15,1) 30%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="mx-auto max-w-3xl px-5 pb-5 pt-8">
          <div className="flex items-center justify-between mb-3 text-[11px] text-white/30">
            <span>
              {checkedCount} capabilities selected
              {responseTier === "premium" ? " • Premium response" : ""}
            </span>
            <span>
              <AnimatedPrice value={perSeat} /> per seat
            </span>
          </div>

          <div
            className="rounded-2xl border border-white/[0.08] p-5"
            style={{
              background:
                "linear-gradient(135deg, rgba(212,168,67,0.06) 0%, rgba(15,15,25,0.9) 50%, rgba(212,168,67,0.03) 100%)",
            }}
          >
            <div className="flex items-end justify-between">
              <div>
                <div className="text-[11px] text-white/30 uppercase tracking-widest font-bold mb-1">
                  Your Monthly Investment
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-white font-bold"
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: "clamp(2rem, 6vw, 2.75rem)",
                    }}
                  >
                    <AnimatedPrice value={discountedMonthly} />
                  </span>
                  <span className="text-white/25 text-sm">/month</span>
                </div>
                {prepayDiscount > 0 && (
                  <div className="mt-1 text-xs text-emerald-400/80 font-semibold">
                    Saving{" "}
                    <AnimatedPrice value={monthlyTotal - discountedMonthly} />
                    /month with {prepay} billing
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-white/20 text-[11px]">Annual</div>
                <div className="text-white/50 text-sm font-semibold">
                  <AnimatedPrice value={annualTotal} />
                </div>
                <div className="text-white/15 text-[11px] mt-1">
                  <AnimatedPrice
                    value={parseFloat(dailyPerUser)}
                    prefix="$"
                  />{" "}
                  /person/day
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] text-white/20">
            <span>No hardware markup</span>
            <span>•</span>
            <span>Your data is always yours</span>
            <span>•</span>
            <span>30 years of experience</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Nav({ currentPage, onNavigate }) {
  const links = [
    { id: "home", label: "Home" },
    { id: "pricing", label: "Pricing" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <nav
      className="sticky top-0 z-40"
      style={{
        background: "rgba(7, 7, 12, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="mx-auto max-w-5xl px-5 py-4 flex items-center justify-between">
        <button
          onClick={() => onNavigate("home")}
          className="text-amber-400/90 tracking-widest text-xs font-bold uppercase hover:text-amber-300 transition-colors"
          style={{ letterSpacing: "0.25em" }}
        >
          Genius Click
        </button>
        <div className="flex items-center gap-6">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`text-xs font-semibold uppercase tracking-widest transition-colors ${
                currentPage === link.id
                  ? "text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
              style={{ letterSpacing: "0.18em" }}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

function HomePage({ onNavigate }) {
  return (
    <div className="mx-auto max-w-3xl px-5">
      <section className="pt-20 pb-24 text-center">
        <div
          className="text-amber-400/80 tracking-widest text-[11px] font-bold uppercase mb-6"
          style={{ letterSpacing: "0.3em" }}
        >
          Established 2010 · Southern California
        </div>
        <h1
          className="text-white mb-4"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(3rem, 9vw, 5.5rem)",
            fontWeight: 500,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
          }}
        >
          Honest IT.
        </h1>
        <p
          className="text-white/55 max-w-xl mx-auto"
          style={{
            fontSize: "clamp(1rem, 2.2vw, 1.15rem)",
            lineHeight: 1.5,
          }}
        >
          For businesses that depend on their systems.
        </p>

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => onNavigate("pricing")}
            className="rounded-full border-2 border-amber-500/60 bg-amber-500/[0.08] px-7 py-3 text-sm font-semibold text-amber-200 hover:bg-amber-500/[0.15] hover:border-amber-500/80 transition-all duration-300"
          >
            See pricing
          </button>
          <button
            onClick={() => onNavigate("contact")}
            className="rounded-full border-2 border-white/[0.12] bg-white/[0.02] px-7 py-3 text-sm font-semibold text-white/70 hover:bg-white/[0.05] hover:border-white/20 hover:text-white/90 transition-all duration-300"
          >
            Get in touch
          </button>
        </div>
      </section>

      <section className="py-16 border-t border-white/[0.06]">
        <div
          className="text-white/40 tracking-widest text-[11px] font-bold uppercase mb-10 text-center"
          style={{ letterSpacing: "0.3em" }}
        >
          How we work
        </div>

        <div className="space-y-12 max-w-2xl mx-auto">
          <div>
            <h3
              className="text-amber-300/90 mb-3"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "1.5rem",
                fontWeight: 500,
              }}
            >
              Independence is non-negotiable.
            </h3>
            <p className="text-white/65 leading-relaxed text-[0.95rem]">
              We don't resell hardware or software. Vendor margins create financial incentives that color advice, and that conflict compromises the quality of what you're paying for. The recommendation you get is the one we'd make if no one were paying us to make it — because no one is.
            </p>
          </div>

          <div>
            <h3
              className="text-amber-300/90 mb-3"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "1.5rem",
                fontWeight: 500,
              }}
            >
              Skin in the game on both sides.
            </h3>
            <p className="text-white/65 leading-relaxed text-[0.95rem]">
              Managed engagements run on a one-year minimum. IT is a relationship, and good work compounds — but only when both parties are committed. A firm that promises "no contracts" is either lying about how they bill or planning to disappear before the second invoice. The minimum is how we earn the right to do the work properly the first time.
            </p>
          </div>

          <div>
            <h3
              className="text-amber-300/90 mb-3"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "1.5rem",
                fontWeight: 500,
              }}
            >
              The cheapest call is before the spend.
            </h3>
            <p className="text-white/65 leading-relaxed text-[0.95rem]">
              Helping you choose the right hardware, vendor, or architecture upfront is worth more than being hired to fix what the wrong choice broke. If you're about to make a significant technology decision, talk to us first. We'd rather be a sounding board than a remediation contractor.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-white/[0.06]">
        <div
          className="text-white/40 tracking-widest text-[11px] font-bold uppercase mb-3 text-center"
          style={{ letterSpacing: "0.3em" }}
        >
          Capabilities
        </div>
        <h2
          className="text-white text-center mb-10"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(1.75rem, 4.5vw, 2.5rem)",
            fontWeight: 500,
            lineHeight: 1.2,
          }}
        >
          A generalist practice.
        </h2>
        <p className="text-white/45 text-sm leading-relaxed max-w-xl mx-auto text-center mb-10">
          Managed services is the productized core. The broader practice covers anything a business that takes its systems seriously is likely to need.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 max-w-2xl mx-auto">
          {CAPABILITIES.map((cap, i) => (
            <div
              key={i}
              className="flex items-start gap-3 text-[0.9rem] text-white/70 leading-snug"
            >
              <span className="text-amber-500/70 mt-1.5 flex-shrink-0">
                <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor">
                  <circle cx="3" cy="3" r="3" />
                </svg>
              </span>
              <span>{cap}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 border-t border-white/[0.06] text-center">
        <h2
          className="text-white mb-4"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(1.75rem, 4.5vw, 2.5rem)",
            fontWeight: 500,
            lineHeight: 1.2,
          }}
        >
          Ready to talk?
        </h2>
        <p className="text-white/50 max-w-md mx-auto mb-8 text-[0.95rem] leading-relaxed">
          Whether you need managed services, a one-time project, or just a sanity check before a big purchase — start with a conversation.
        </p>
        <button
          onClick={() => onNavigate("contact")}
          className="rounded-full border-2 border-amber-500/60 bg-amber-500/[0.08] px-8 py-3 text-sm font-semibold text-amber-200 hover:bg-amber-500/[0.15] hover:border-amber-500/80 transition-all duration-300"
        >
          Get in touch
        </button>
      </section>
    </div>
  );
}

function PricingPage() {
  return (
    <div className="mx-auto max-w-3xl px-5">
      <section className="pt-16 pb-10 text-center">
        <div
          className="text-amber-400/80 tracking-widest text-[11px] font-bold uppercase mb-6"
          style={{ letterSpacing: "0.3em" }}
        >
          Configure your engagement
        </div>
        <h1
          className="text-white mb-5"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(2.5rem, 7vw, 4rem)",
            fontWeight: 500,
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
          }}
        >
          Pricing.
        </h1>
        <p className="text-white/55 max-w-lg mx-auto text-[0.95rem] leading-relaxed">
          Managed services. One-year minimum.
        </p>
        <p className="text-white/30 max-w-lg mx-auto text-xs mt-3 leading-relaxed">
          Select what matters to your business. Every feature you choose is a capability you gain — not a cost you bear.
        </p>
      </section>

      <Configurator />
    </div>
  );
}

function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-5">
      <section className="pt-20 pb-32 text-center">
        <div
          className="text-amber-400/80 tracking-widest text-[11px] font-bold uppercase mb-6"
          style={{ letterSpacing: "0.3em" }}
        >
          Start a conversation
        </div>
        <h1
          className="text-white mb-5"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(2.5rem, 7vw, 4rem)",
            fontWeight: 500,
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
          }}
        >
          Get in touch.
        </h1>
        <p className="text-white/55 max-w-md mx-auto text-[0.95rem] leading-relaxed mb-12">
          For new engagements, project inquiries, or pre-purchase advice. We read every message and reply personally.
        </p>

        <a
          href="mailto:hello@geniusclick.com"
          className="inline-block rounded-2xl border-2 border-amber-500/40 px-8 py-6 transition-all duration-300 hover:border-amber-500/70 hover:bg-amber-500/[0.05]"
          style={{
            background:
              "linear-gradient(135deg, rgba(212,168,67,0.04) 0%, rgba(15,15,25,0.6) 100%)",
          }}
        >
          <div
            className="text-amber-400/70 tracking-widest text-[10px] font-bold uppercase mb-2"
            style={{ letterSpacing: "0.25em" }}
          >
            Email
          </div>
          <div
            className="text-white"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(1.25rem, 3.5vw, 1.75rem)",
              fontWeight: 500,
            }}
          >
            hello@geniusclick.com
          </div>
        </a>
      </section>
    </div>
  );
}

function Footer() {
  return (
    <footer
      className="border-t border-white/[0.05] mt-auto"
      style={{ background: "rgba(7, 7, 12, 0.6)" }}
    >
      <div className="mx-auto max-w-5xl px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/30">
        <div>© 2026 Genius Click</div>
        <a
          href="mailto:hello@geniusclick.com"
          className="hover:text-white/60 transition-colors"
        >
          hello@geniusclick.com
        </a>
      </div>
    </footer>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const handleNavigate = (page) => {
    setCurrentPage(page);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  };

  return (
    <div
      style={{
        background:
          "linear-gradient(145deg, #07070c 0%, #0d0d16 50%, #0a0a12 100%)",
        minHeight: "100vh",
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Nav currentPage={currentPage} onNavigate={handleNavigate} />

      <main style={{ flex: 1 }}>
        {currentPage === "home" && <HomePage onNavigate={handleNavigate} />}
        {currentPage === "pricing" && <PricingPage />}
        {currentPage === "contact" && <ContactPage />}
      </main>

      <Footer />

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #d4a843;
          cursor: pointer;
          border: 3px solid #0a0a0f;
          box-shadow: 0 0 10px rgba(212,168,67,0.3);
          transition: box-shadow 0.2s;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          box-shadow: 0 0 20px rgba(212,168,67,0.5);
        }
        input[type="range"]::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #d4a843;
          cursor: pointer;
          border: 3px solid #0a0a0f;
          box-shadow: 0 0 10px rgba(212,168,67,0.3);
        }
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.1) transparent;
        }
      `}</style>
    </div>
  );
}

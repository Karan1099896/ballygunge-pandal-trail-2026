import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  STOPS, dirUrl, filterStops, itineraryText, mapsUrl, stopsForRoute,
  type Filter, type RouteKey, type Stop,
} from "@/lib/trail";

const TITLE = "Ballygunge Pandal Trail 2026 — South Kolkata Durga Puja guide";
const DESC = "8 iconic stops, 1 South Kolkata trail: an interactive Ballygunge, Gariahat & Lake Road pandal-hopping guide with maps, checklist and crowd-safety tips.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const TONE: Record<Stop["tone"], string> = {
  ruby: "bg-ruby text-primary-foreground",
  emerald: "bg-emerald text-primary-foreground",
  saffron: "bg-saffron text-ink",
  sapphire: "bg-sapphire text-primary-foreground",
  magenta: "bg-magenta text-primary-foreground",
};

const PACK = ["Fully charged phone + power bank", "Comfortable, broken-in footwear", "Water bottle", "Small cash + UPI ready", "Light rain cover / umbrella", "Hand fan or handkerchief", "Any personal medicines", "ID card"];
const TIPS = [
  "Fix a meeting point at every stop in case the group splits.",
  "Follow police barricades and one-way lanes — they change through the night.",
  "Keep phones and wallets in front pockets in dense queues.",
  "Weekday afternoons are usually calmer than Ashtami and Navami nights.",
  "Keep children and elders on the inside of the crowd flow.",
  "Order here is a suggestion — reshuffle based on queues you see.",
];

const KEY = "bpt26-visited";
const PACK_KEY = "bpt26-pack";

function useStoredSet(key: string) {
  const [set, setSet] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { setSet(new Set(JSON.parse(localStorage.getItem(key) || "[]"))); } catch { /* ignore */ }
    setReady(true);
  }, [key]);
  useEffect(() => { if (ready) localStorage.setItem(key, JSON.stringify([...set])); }, [key, set, ready]);
  const toggle = (id: string) => setSet((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  return [set, toggle, () => setSet(new Set())] as const;
}

function Lotus({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      {Array.from({ length: 12 }).map((_, i) => (
        <path key={i} d="M100 100 C 88 70, 92 30, 100 12 C 108 30, 112 70, 100 100Z" transform={`rotate(${i * 30} 100 100)`}
          fill={i % 2 ? "var(--saffron)" : "var(--ruby)"} stroke="var(--ink)" strokeWidth="2.5" />
      ))}
      <circle cx="100" cy="100" r="22" fill="var(--paper)" stroke="var(--ink)" strokeWidth="3" />
      <circle cx="100" cy="100" r="9" fill="var(--emerald)" stroke="var(--ink)" strokeWidth="2.5" />
    </svg>
  );
}

function Index() {
  const [visited, toggle, reset] = useStoredSet(KEY);
  const [packed, togglePack] = useStoredSet(PACK_KEY);
  const [route, setRoute] = useState<RouteKey>("classic");
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [menu, setMenu] = useState(false);

  const routeStops = stopsForRoute(route);
  const shown = useMemo(() => filterStops(routeStops, visited, filter, search), [routeStops, visited, filter, search]);
  const done = routeStops.filter((s) => visited.has(s.id)).length;
  const pct = Math.round((done / routeStops.length) * 100);

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2500); };
  const share = async () => {
    const text = itineraryText(routeStops, visited);
    try {
      if (navigator.share) { await navigator.share({ title: "Ballygunge Pandal Trail 2026", text }); return; }
      await navigator.clipboard.writeText(text); flash("Itinerary copied to clipboard");
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      try { await navigator.clipboard.writeText(text); flash("Itinerary copied to clipboard"); } catch { flash("Couldn't copy — please try again"); }
    }
  };

  const nav = [["#trail", "The trail"], ["#pack", "Pack list"], ["#safety", "Safety"]];

  return (
    <div className="min-h-screen overflow-x-hidden">
      <a href="#trail" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 chip bg-saffron">Skip to trail</a>
      <div className="alpona-border h-3" />
      <header className="sticky top-0 z-40 border-b-[3px] border-ink bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <a href="#top" className="flex min-w-0 items-center gap-2 font-display text-lg font-black">
            <Lotus className="h-8 w-8 shrink-0" /><span className="truncate">Ballygunge Trail '26</span>
          </a>
          <nav className="hidden items-center gap-2 md:flex" aria-label="Main">
            {nav.map(([h, l]) => <a key={h} href={h} className="chip hover:bg-saffron">{l}</a>)}
            <button onClick={share} className="ink-btn bg-ruby py-2 text-primary-foreground">Share itinerary</button>
          </nav>
          <button className="chip md:hidden" aria-expanded={menu} aria-controls="mnav" onClick={() => setMenu(!menu)}>{menu ? "Close" : "Menu"}</button>
        </div>
        {menu && (
          <nav id="mnav" className="flex flex-col gap-2 border-t-[3px] border-ink p-4 md:hidden" aria-label="Mobile">
            {nav.map(([h, l]) => <a key={h} href={h} onClick={() => setMenu(false)} className="chip text-center">{l}</a>)}
            <button onClick={() => { setMenu(false); share(); }} className="ink-btn bg-ruby text-primary-foreground">Share itinerary</button>
          </nav>
        )}
      </header>

      <main id="top">
        {/* Hero */}
        <section className="relative mx-auto max-w-6xl px-4 pb-16 pt-12 md:pt-20">
          <Lotus className="animate-spin-slow pointer-events-none absolute -right-24 -top-10 h-72 w-72 opacity-90 md:h-[30rem] md:w-[30rem]" />
          <div className="relative">
            <p className="chip inline-block bg-emerald text-accent-foreground">Durga Puja 2026 · South Kolkata</p>
            <h1 className="mt-6 font-display text-6xl font-black leading-[0.9] tracking-tight sm:text-7xl md:text-9xl">
              Bally<span className="italic text-ruby">gunge</span><br />Pandal<br /><span className="bg-saffron px-2 ink-card inline-block -rotate-2">Trail</span> 2026
            </h1>
            <p className="mt-4 font-bangla text-2xl text-sapphire">বালিগঞ্জ প্যান্ডেল পরিক্রমা</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <div className="ink-card animate-bob bg-ruby px-6 py-4 text-primary-foreground">
                <div className="font-display text-5xl font-black">8</div><div className="font-semibold">iconic stops</div>
              </div>
              <div className="ink-card animate-bob bg-sapphire px-6 py-4 text-primary-foreground [animation-delay:1s]">
                <div className="font-display text-5xl font-black">1</div><div className="font-semibold">South Kolkata trail</div>
              </div>
            </div>
            <p className="mt-8 max-w-xl text-lg text-muted-foreground">A practical hopping guide around Ballygunge, Gariahat and Lake Road — tick off pandals as you go, open directions in one tap, and share your plan with the gang.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#trail" className="ink-btn bg-saffron text-ink">Start the trail →</a>
              <button onClick={share} className="ink-btn bg-card">Share itinerary</button>
            </div>
          </div>
        </section>

        {/* Trail */}
        <section id="trail" className="scroll-mt-20 border-y-[3px] border-ink bg-muted/60 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <h2 className="font-display text-5xl font-black md:text-6xl">The trail</h2>
                <p className="mt-2 max-w-xl text-muted-foreground">Suggested order is crowd-dependent; barricades can change routes. Always confirm the exact gate on Maps.</p>
              </div>
              <div role="radiogroup" aria-label="Route" className="ink-card flex bg-card p-1">
                {([["classic", "Classic Ballygunge loop"], ["extended", "Extended South Kolkata"]] as const).map(([k, l]) => (
                  <button key={k} role="radio" aria-checked={route === k} onClick={() => setRoute(k)}
                    className={`rounded-lg px-3 py-2 text-sm font-bold ${route === k ? "bg-ink text-paper" : ""}`}>{l}</button>
                ))}
              </div>
            </div>

            {/* Progress */}
            <div className="ink-card mt-8 bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-display text-2xl font-black" aria-live="polite">{done} / {routeStops.length} visited</p>
                <button onClick={() => { reset(); flash("Progress reset"); }} className="chip hover:bg-muted">Reset progress</button>
              </div>
              <div className="mt-3 h-5 overflow-hidden rounded-full border-[3px] border-ink bg-paper" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Trail progress">
                <div className="alpona-border h-full transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
            </div>

            {/* Controls */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <label className="flex-1">
                <span className="sr-only">Search pandals by name or area</span>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or area…"
                  className="w-full rounded-full border-[3px] border-ink bg-card px-5 py-3 font-semibold placeholder:text-muted-foreground" />
              </label>
              <div className="flex gap-2" role="group" aria-label="Filter">
                {([["all", "All"], ["todo", "To visit"], ["visited", "Visited"]] as const).map(([k, l]) => (
                  <button key={k} aria-pressed={filter === k} onClick={() => setFilter(k)}
                    className={`chip ${filter === k ? "bg-saffron" : "bg-card"}`}>{l}</button>
                ))}
              </div>
            </div>

            <ol className="mt-8 grid gap-6 md:grid-cols-2">
              {shown.map((s) => {
                const v = visited.has(s.id);
                return (
                  <li key={s.id} className={`ink-card relative flex flex-col bg-card p-5 transition-transform hover:-translate-y-1 ${s.optional ? "border-dashed" : ""}`}>
                    <div className="flex items-start gap-4">
                      <span className={`ink-card grid h-14 w-14 shrink-0 place-items-center font-display text-2xl font-black ${TONE[s.tone]}`}>{s.optional ? "+" : s.n}</span>
                      <div className="min-w-0">
                        {s.optional && <span className="chip mb-1 inline-block bg-magenta text-xs text-primary-foreground">Optional add-on</span>}
                        <h3 className="font-display text-2xl font-black leading-tight">{s.name}</h3>
                        <p className="text-sm font-semibold text-sapphire">{s.area}</p>
                      </div>
                    </div>
                    <p className="mt-4">{s.blurb}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{s.address}</p>
                    {s.note && <p className="mt-2 inline-block self-start rounded-md bg-saffron/40 px-2 py-1 text-xs font-bold">⚠ {s.note}</p>}
                    <div className="mt-5 flex flex-wrap gap-2 pt-1">
                      <a href={mapsUrl(s.query)} target="_blank" rel="noopener noreferrer" className="chip bg-card hover:bg-muted">Open Maps ↗</a>
                      <a href={dirUrl(s.query)} target="_blank" rel="noopener noreferrer" className="chip bg-sapphire text-primary-foreground">Get directions ↗</a>
                      <button onClick={() => toggle(s.id)} aria-pressed={v} aria-label={`Mark ${s.name} as ${v ? "not visited" : "visited"}`}
                        className={`chip ml-auto ${v ? "animate-pop bg-emerald text-accent-foreground" : "bg-paper"}`}>{v ? "✓ Visited" : "Mark visited"}</button>
                    </div>
                  </li>
                );
              })}
            </ol>
            {shown.length === 0 && <p className="ink-card mt-8 bg-card p-6 text-center font-semibold">No pandals match — try another search or filter.</p>}
          </div>
        </section>

        {/* Pack + Safety */}
        <section className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-2">
          <div id="pack" className="ink-card scroll-mt-24 bg-saffron p-6">
            <h2 className="font-display text-4xl font-black">Pack list</h2>
            <p className="mt-1 text-sm font-semibold">{packed.size} / {PACK.length} packed — saved on this device</p>
            <ul className="mt-5 space-y-2">
              {PACK.map((p) => (
                <li key={p}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-ink bg-card px-3 py-2 font-semibold">
                    <input type="checkbox" checked={packed.has(p)} onChange={() => togglePack(p)} className="h-5 w-5 accent-[var(--emerald)]" />
                    <span className={packed.has(p) ? "line-through opacity-60" : ""}>{p}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
          <div id="safety" className="ink-card scroll-mt-24 bg-sapphire p-6 text-primary-foreground">
            <h2 className="font-display text-4xl font-black">Crowd-safety tips</h2>
            <ul className="mt-5 space-y-3">
              {TIPS.map((t, i) => (
                <li key={t} className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-ink bg-saffron font-bold text-ink">{i + 1}</span><span>{t}</span></li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t-[3px] border-ink bg-ink text-paper">
        <div className="alpona-border h-3" />
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3"><Lotus className="h-10 w-10" /><span className="font-display text-xl font-black">Ballygunge Pandal Trail 2026</span></div>
          <p className="max-w-lg text-sm opacity-80">An independent visitor guide — not affiliated with any puja committee. Map and address details may change due to Puja traffic and barricades. {STOPS.length - 1} main stops + 1 optional add-on.</p>
        </div>
      </footer>

      {toast && <div role="status" className="ink-card fixed bottom-5 left-1/2 z-50 -translate-x-1/2 bg-emerald px-5 py-3 font-bold text-accent-foreground">{toast}</div>}
    </div>
  );
}

export type Stop = {
  id: string;
  n: number;
  name: string;
  bn?: string;
  area: string;
  address: string;
  query: string;
  blurb: string;
  note?: string;
  optional?: boolean;
  tone: "ruby" | "emerald" | "saffron" | "sapphire" | "magenta";
};

export const STOPS: Stop[] = [
  { id: "ekdalia", n: 1, name: "Ekdalia Evergreen Club", area: "Ekdalia, Ballygunge", address: "15, Ekdalia Road, Ekdalia, Ballygunge, Kolkata 700019", query: "Ekdalia Evergreen Club Durga Puja Kolkata", blurb: "Known for a traditional idol and temple-inspired pandal architecture.", tone: "ruby" },
  { id: "singhi-park", n: 2, name: "Singhi Park Sarbojanin", area: "Dover Lane, Ballygunge", address: "18/33, Dover Lane / Ramani Chatterjee Road, Ballygunge, Kolkata 700029", query: "Singhi Park Sarbojanin Durga Puja Kolkata", blurb: "A well-known South Kolkata stop for detailed pandal presentation and lighting.", tone: "emerald" },
  { id: "hindusthan-park", n: 3, name: "Hindusthan Park Sarbojanin", area: "Off Rashbehari Avenue", address: "Hindustan Park, Ballygunge, off Rashbehari Avenue, Kolkata", query: "Hindusthan Park Sarbojanin Durga Puja Kolkata", blurb: "A neighbourhood favourite tucked just off Rashbehari Avenue.", note: "Verify exact gate on Maps", tone: "saffron" },
  { id: "bca", n: 4, name: "Ballygunge Cultural Association", area: "Lake Terrace", address: "20, Lake View Road, Lake Terrace, Kolkata 700029", query: "Ballygunge Cultural Association Durga Puja Kolkata", blurb: "Reported 2026 theme: “Jojon” (যোজন — connection).", note: "Reported theme — verify onsite", tone: "sapphire" },
  { id: "samaj-sebi", n: 5, name: "Samaj Sebi Sangha", area: "Lake View Road", address: "24A, Lake View Road, Hemanta Mukherjee Sarani, Lake Terrace, Ballygunge, Kolkata 700029", query: "Samaj Sebi Sangha Durga Puja Kolkata", blurb: "A Lake Terrace neighbour of BCA — easy to pair on the same stretch.", tone: "magenta" },
  { id: "21-pally", n: 6, name: "Ballygunge 21 Pally", area: "Ballygunge Park", address: "17, Bondel Road, near Patha Bhavan, Ballygunge Park, Kolkata 700019", query: "Ballygunge 21 Pally Durga Puja Kolkata", blurb: "A Bondel Road community puja near Patha Bhavan.", tone: "emerald" },
  { id: "maddox", n: 7, name: "Maddox Square", area: "Garcha, Ballygunge", address: "Garcha, Ballygunge, Kolkata 700026", query: "Maddox Square Durga Puja Kolkata", blurb: "A classic open-park stop — traditional idol and the city's favourite community adda.", tone: "ruby" },
  { id: "hindusthan-club", n: 8, name: "Hindusthan Club", area: "Dover Terrace", address: "37/B, Hindustan Road, Dover Terrace, Ballygunge, Kolkata 700019", query: "Hindusthan Club Durga Puja Kolkata", blurb: "A Dover Terrace stop close to the Gariahat crossing.", tone: "saffron" },
  { id: "71-palli", n: 9, name: "71 Palli Baishakhi Sarbojanin Durgotsav Samity", area: "Ballygunge Gardens", address: "7, Moni Mukherjee Road, Ballygunge Gardens, Kolkata 700019", query: "71 Palli Baishakhi Sarbojanin Durga Puja Kolkata", blurb: "Optional add-on for those with energy left after the main circuit.", optional: true, tone: "sapphire" },
];

export type RouteKey = "classic" | "extended";
export type Filter = "all" | "todo" | "visited";

export const mapsUrl = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
export const dirUrl = (q: string) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`;

export function stopsForRoute(route: RouteKey) {
  return route === "classic" ? STOPS.filter((s) => !s.optional) : STOPS;
}

export function filterStops(stops: Stop[], visited: Set<string>, filter: Filter, search: string) {
  const q = search.trim().toLowerCase();
  return stops.filter((s) => {
    if (filter === "visited" && !visited.has(s.id)) return false;
    if (filter === "todo" && visited.has(s.id)) return false;
    if (!q) return true;
    return [s.name, s.area, s.address].some((t) => t.toLowerCase().includes(q));
  });
}

export function itineraryText(stops: Stop[], visited: Set<string>) {
  const lines = stops.map((s) => `${visited.has(s.id) ? "✓" : "○"} ${s.n}. ${s.name}${s.optional ? " (optional)" : ""} — ${s.area}\n   ${mapsUrl(s.query)}`);
  return `BALLYGUNGE PANDAL TRAIL 2026\n${lines.join("\n")}\n\nOrder is crowd-dependent; barricades can change routes.`;
}

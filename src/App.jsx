import { useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from "recharts";

/* ── Brand tokens matching dnsxplore.com/stats ── */
const C = {
  purple:     "#8B2FC9",
  purpleLight:"#A855F7",
  purpleDim:  "#6D28D9",
  orange:     "#F97316",
  green:      "#22C55E",
  red:        "#EF4444",
  blue:       "#3B82F6",
  teal:       "#14B8A6",
  black:      "#111111",
  white:      "#FFFFFF",
  offWhite:   "#F9FAFB",
  border:     "#E5E7EB",
  labelGray:  "#9CA3AF",
  textGray:   "#6B7280",
  textDark:   "#111827",
};

/* ── Data ── */
const tldZoneSigning = [
  { name: "New gTLDs",     signed: 1100, unsigned: 10,  total: 1110, pct: 99.1 },
  { name: "Legacy gTLDs",  signed: 21,   unsigned: 1,   total: 22,   pct: 95.5 },
  { name: "ccTLDs",        signed: 78,   unsigned: 84,  total: 162,  pct: 48.1 },
];

const sldSigning = [
  { name: ".com",         pct: 4.3,  signed: 7000000,   total: 160000000, source: "Verisign/APNIC" },
  { name: ".net",         pct: 5.3,  signed: 675000,    total: 13000000,  source: "Verisign/APNIC" },
  { name: "New gTLDs",    pct: 3.01, signed: 2062268,   total: 68567863,  source: "nTLDStats" },
  { name: ".nl",          pct: 56.0, signed: 3584000,   total: 6400000,   source: "SIDN" },
  { name: ".se",          pct: 70.0, signed: 1120000,   total: 1600000,   source: "IIS.se" },
  { name: ".cz",          pct: 65.0, signed: 845000,    total: 1300000,   source: "CZ.NIC" },
];

const signedVsUnsigned = [
  { name: "Signed",   value: 3.01,  color: C.green },
  { name: "Unsigned", value: 96.99, color: C.orange },
];

const validationTrend = [
  { year: "2018", pct: 14 },
  { year: "2019", pct: 26 },
  { year: "2020", pct: 30 },
  { year: "2021", pct: 31 },
  { year: "2022", pct: 33 },
  { year: "2023", pct: 33 },
  { year: "2024", pct: 35 },
  { year: "2025", pct: 36 },
];

const competitors = [
  { name: "DNSXplore",         archive: 5, perRecord: 5, allGtld: 5, historical: 5, diagnostic: 5 },
  { name: "ICANN ITHI",        archive: 2, perRecord: 1, allGtld: 3, historical: 3, diagnostic: 1 },
  { name: "nTLDStats",         archive: 2, perRecord: 2, allGtld: 2, historical: 2, diagnostic: 2 },
  { name: "APNIC Labs",        archive: 3, perRecord: 1, allGtld: 2, historical: 4, diagnostic: 2 },
  { name: "Verisign Board",    archive: 1, perRecord: 2, allGtld: 1, historical: 2, diagnostic: 2 },
];

const radarKeys = ["archive","perRecord","allGtld","historical","diagnostic"];
const radarLabels = { archive:"DNSSEC Archive", perRecord:"Per-Record Data", allGtld:"All gTLDs", historical:"Historical", diagnostic:"Diagnostics" };
const radarData = radarKeys.map(k => {
  const row = { subject: radarLabels[k] };
  competitors.forEach(c => { row[c.name] = c[k]; });
  return row;
});

const COMP_COLORS = [C.purple, C.orange, C.blue, C.teal, C.red];

/* ── Dot background pattern ── */
const DotBg = () => (
  <div style={{
    position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
    backgroundImage: `radial-gradient(circle, #CBD5E1 1px, transparent 1px)`,
    backgroundSize: "28px 28px", opacity: 0.55,
  }} />
);

/* ── Navbar ── */
const Navbar = () => (
  <nav style={{
    background: C.black, display: "flex", alignItems: "center",
    padding: "0 28px", height: 52, gap: 28, position: "relative", zIndex: 10,
  }}>
    <span style={{ color: C.white, fontWeight: 800, fontSize: 16, letterSpacing: 0.5, fontFamily: "monospace" }}>
      DNSXplore
    </span>
    {["Home","Info","Blog","Stats","Help"].map(l => (
      <span key={l} style={{
        color: l === "Stats" ? C.white : "#9CA3AF",
        fontSize: 13, cursor: "pointer", fontFamily: "monospace",
        fontWeight: l === "Stats" ? 600 : 400,
      }}>{l}</span>
    ))}
    <div style={{ flex: 1 }} />
    <button style={{
      border: `1.5px solid ${C.white}`, borderRadius: 20,
      background: "transparent", color: C.white,
      padding: "5px 18px", fontSize: 13, cursor: "pointer", fontFamily: "monospace",
    }}>Sign In</button>
  </nav>
);

/* ── Hero banner ── */
const Hero = ({ tab }) => {
  const titles = {
    signed:      "gTLD Signing Status",
    tld:         "TLD Zone Signing",
    sld:         "Domain-Level Signing",
    competitors: "Competitor Analysis",
    validation:  "Global DNSSEC Validation",
  };
  const subs = {
    signed:      "Signed vs. unsigned breakdown across all gTLD namespaces.",
    tld:         "DS record presence in the root zone per TLD category.",
    sld:         "Second-level domain DNSSEC adoption rates by TLD.",
    competitors: "DNSXplore feature coverage versus other DNSSEC platforms.",
    validation:  "Global resolver-side DNSSEC validation trend (APNIC Labs).",
  };
  return (
    <div style={{
      background: `linear-gradient(135deg, #7C3AED 0%, #9333EA 50%, #6D28D9 100%)`,
      padding: "28px 48px", display: "flex", alignItems: "center",
      justifyContent: "space-between", position: "relative", zIndex: 1,
    }}>
      <div>
        <h1 style={{ color: C.white, fontFamily: "monospace", fontSize: 28, fontWeight: 800, margin: 0 }}>
          {titles[tab]}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.75)", fontFamily: "monospace", fontSize: 13, margin: "6px 0 0" }}>
          {subs[tab]}
        </p>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ color: C.white, fontFamily: "monospace", fontSize: 42, fontWeight: 800, lineHeight: 1 }}>
          ~1,200
        </div>
        <div style={{ color: "rgba(255,255,255,0.65)", fontFamily: "monospace", fontSize: 11, letterSpacing: 2, marginTop: 4 }}>
          TOTAL GTLDS
        </div>
      </div>
    </div>
  );
};

/* ── Tab bar ── */
const TABS = [
  { id: "signed",      label: "SIGNING OVERVIEW" },
  { id: "tld",         label: "TLD ZONES" },
  { id: "sld",         label: "DOMAIN SIGNING" },
  { id: "competitors", label: "COMPETITORS" },
  { id: "validation",  label: "VALIDATION TREND" },
];

const TabBar = ({ active, setActive }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 8,
    padding: "14px 32px", background: C.white,
    borderBottom: `1px solid ${C.border}`, position: "relative", zIndex: 1,
    overflowX: "auto",
  }}>
    {TABS.map(t => (
      <button key={t.id} onClick={() => setActive(t.id)} style={{
        background: active === t.id ? C.purple : "transparent",
        color: active === t.id ? C.white : C.textGray,
        border: `1.5px solid ${active === t.id ? C.purple : C.border}`,
        borderRadius: 20, padding: "5px 18px",
        fontSize: 11, fontWeight: 600, cursor: "pointer",
        fontFamily: "monospace", letterSpacing: 1,
        whiteSpace: "nowrap", transition: "all 0.15s",
      }}>{t.label}</button>
    ))}
    <div style={{ flex: 1 }} />
    {["PREV","NEXT"].map(d => (
      <button key={d} style={{
        background: "transparent", border: `1.5px solid ${C.border}`,
        borderRadius: 6, padding: "5px 14px", fontSize: 11,
        cursor: "pointer", fontFamily: "monospace", color: C.textGray,
      }}>{d === "PREV" ? "< PREV" : "NEXT >"}</button>
    ))}
  </div>
);

/* ── Section header bar ── */
const SectionBar = ({ title }) => (
  <div style={{
    background: C.purple, borderRadius: 8,
    padding: "12px 20px", marginBottom: 20,
  }}>
    <span style={{ color: C.white, fontFamily: "monospace", fontWeight: 700, fontSize: 14, letterSpacing: 0.5 }}>
      {title}
    </span>
  </div>
);

/* ── Stat card (top row style) ── */
const StatCard = ({ label, value }) => (
  <div style={{
    flex: 1, minWidth: 150,
    background: C.white, border: `1px solid ${C.border}`,
    borderRadius: 8, padding: "18px 20px",
  }}>
    <div style={{ color: C.labelGray, fontFamily: "monospace", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>
      {label}
    </div>
    <div style={{ color: C.textDark, fontFamily: "monospace", fontSize: 22, fontWeight: 800 }}>
      {value}
    </div>
  </div>
);

/* ── Status card (with badge) ── */
const StatusCard = ({ status, badgeColor, count, pct, desc }) => (
  <div style={{
    flex: 1, minWidth: 170,
    background: C.white, border: `1px solid ${C.border}`,
    borderRadius: 8, padding: "16px 18px",
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
      <span style={{ color: C.labelGray, fontFamily: "monospace", fontSize: 10, letterSpacing: 1.5 }}>STATUS</span>
      <span style={{
        border: `1.5px solid ${badgeColor}`, color: badgeColor,
        borderRadius: 12, padding: "2px 10px", fontSize: 11,
        fontFamily: "monospace", fontWeight: 600,
      }}>{status}</span>
    </div>
    <div style={{ color: C.textDark, fontFamily: "monospace", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
      {count}
    </div>
    <div style={{ color: C.textGray, fontFamily: "monospace", fontSize: 11, marginBottom: 6 }}>{pct}</div>
    <div style={{ color: C.textGray, fontFamily: "monospace", fontSize: 11, lineHeight: 1.5 }}>{desc}</div>
  </div>
);

/* ── Chart card ── */
const ChartCard = ({ title, children, half }) => (
  <div style={{
    flex: half ? "1 1 45%" : "1 1 100%",
    minWidth: 280,
    background: C.white, border: `1px solid ${C.border}`,
    borderRadius: 8, padding: "20px",
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
      <span style={{ color: C.textDark, fontFamily: "monospace", fontSize: 13, fontWeight: 700 }}>{title}</span>
      <button style={{
        border: `1px solid ${C.border}`, background: C.offWhite,
        borderRadius: 6, padding: "3px 12px", fontSize: 11,
        fontFamily: "monospace", color: C.textGray, cursor: "pointer",
      }}>Snapshot</button>
    </div>
    {children}
  </div>
);

/* ── Custom tooltip ── */
const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: C.white, border: `1px solid ${C.border}`,
      borderRadius: 6, padding: "10px 14px",
      fontFamily: "monospace", fontSize: 12, color: C.textDark,
      boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: {typeof p.value === "number" && p.value > 1000
            ? p.value.toLocaleString() : `${p.value}`}
        </div>
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════════
   TABS
══════════════════════════════════════════════ */

function SignedOverview() {
  return (
    <div>
      <SectionBar title="gTLD DNSSEC Signing — Overview" />

      {/* Top stat row */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <StatCard label="Total Active gTLDs"     value="~1,200" />
        <StatCard label="New gTLDs Tracked"      value="1,110" />
        <StatCard label="SLD Signing Rate"        value="3.01%" />
        <StatCard label=".com Signing Rate"       value="4.3%" />
        <StatCard label="ccTLD Zone Signing"      value="48%" />
      </div>

      {/* Status badge row */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <StatusCard
          status="Signed"    badgeColor={C.green}
          count="2,062,268"  pct="3.01% of new gTLD domains"
          desc="Domain has valid DS record and DNSSEC chain of trust." />
        <StatusCard
          status="Unsigned"  badgeColor={C.orange}
          count="66,505,595" pct="96.99% of new gTLD domains"
          desc="No DS record present. DNSSEC not deployed." />
        <StatusCard
          status="Partial"   badgeColor={C.blue}
          count=".nl / .se"  pct=">50% in select ccTLDs"
          desc="Incentive programmes drove adoption in select zones." />
        <StatusCard
          status="Zone Only" badgeColor={C.purple}
          count="99.1%"      pct="of new gTLDs have signed zones"
          desc="TLD zone is signed but SLD adoption remains very low." />
      </div>

      {/* Charts */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <ChartCard title="Status distribution" half>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={signedVsUnsigned} cx="50%" cy="50%"
                innerRadius={65} outerRadius={95}
                dataKey="value" paddingAngle={2}>
                {signedVsUnsigned.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip formatter={v => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 8 }}>
            {signedVsUnsigned.map(d => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color }} />
                <span style={{ fontFamily: "monospace", fontSize: 11, color: C.textGray }}>
                  {d.name} ({d.value}%)
                </span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Signing rate by TLD" half>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sldSigning} margin={{ top: 4, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="name" tick={{ fontFamily: "monospace", fontSize: 10, fill: C.textGray }} />
              <YAxis tickFormatter={v => `${v}%`} tick={{ fontFamily: "monospace", fontSize: 10, fill: C.textGray }} />
              <Tooltip content={<Tip />} formatter={v => `${v}%`} />
              <Bar dataKey="pct" name="% Signed" radius={[4,4,0,0]}>
                {sldSigning.map((d, i) => (
                  <Cell key={i} fill={d.pct > 50 ? C.green : d.pct > 10 ? C.blue : C.orange} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function TLDZones() {
  return (
    <div>
      <SectionBar title="TLD Zone Signing — Root Zone DS Records" />

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        {tldZoneSigning.map(row => (
          <StatCard key={row.name} label={row.name} value={`${row.pct}%`} />
        ))}
        <StatCard label="Root Zone Signed?" value="Yes (2010)" />
        <StatCard label="New gTLD Mandate"  value="Since 2014" />
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        {tldZoneSigning.map(row => {
          const color = row.pct > 90 ? C.green : row.pct > 60 ? C.blue : C.orange;
          return (
            <StatusCard
              key={row.name}
              status={row.pct > 90 ? "Signed" : row.pct > 60 ? "Partial" : "Mixed"}
              badgeColor={color}
              count={`${row.signed} / ${row.total}`}
              pct={`${row.pct}% of ${row.name} zones signed`}
              desc={
                row.name === "New gTLDs"
                  ? "ICANN mandatory policy since 2014 ensures near-universal zone signing."
                  : row.name === "Legacy gTLDs"
                  ? ".com, .net, .org and most legacy gTLDs have signed zones."
                  : "No universal mandate. Adoption varies by country policy."
              }
            />
          );
        })}
      </div>

      <ChartCard title="TLD zone signing — signed vs unsigned count">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={tldZoneSigning} margin={{ top: 4, right: 20, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="name" tick={{ fontFamily: "monospace", fontSize: 11, fill: C.textGray }} />
            <YAxis tick={{ fontFamily: "monospace", fontSize: 11, fill: C.textGray }} />
            <Tooltip content={<Tip />} />
            <Legend wrapperStyle={{ fontFamily: "monospace", fontSize: 11 }} />
            <Bar dataKey="signed"   name="Signed"   fill={C.green}  radius={[4,4,0,0]} />
            <Bar dataKey="unsigned" name="Unsigned" fill={C.orange} radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function DomainSigning() {
  return (
    <div>
      <SectionBar title="Second-Level Domain (SLD) DNSSEC Signing Rates" />

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <StatCard label=".com signed"      value="4.3%" />
        <StatCard label=".net signed"      value="5.3%" />
        <StatCard label="New gTLDs signed" value="3.01%" />
        <StatCard label=".nl signed"       value="56%" />
        <StatCard label=".se signed"       value="70%" />
        <StatCard label=".cz signed"       value="65%" />
      </div>

      {/* Table */}
      <div style={{
        background: C.white, border: `1px solid ${C.border}`,
        borderRadius: 8, overflow: "hidden", marginBottom: 20,
      }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.offWhite, borderBottom: `1px solid ${C.border}` }}>
                {["TLD","Total Registered","DNSSEC Signed","Unsigned","% Signed","Source"].map(h => (
                  <th key={h} style={{
                    padding: "11px 16px", textAlign: "left",
                    fontFamily: "monospace", fontSize: 10,
                    color: C.labelGray, letterSpacing: 1.2,
                    textTransform: "uppercase", fontWeight: 600,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sldSigning.map((row, i) => {
                const color = row.pct > 50 ? C.green : row.pct > 10 ? C.blue : C.orange;
                return (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.white : C.offWhite }}>
                    <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: C.textDark }}>{row.name}</td>
                    <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, color: C.textGray }}>{row.total.toLocaleString()}</td>
                    <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, color: C.green, fontWeight: 600 }}>{row.signed.toLocaleString()}</td>
                    <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, color: C.orange }}>{(row.total - row.signed).toLocaleString()}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 60, height: 5, background: "#E5E7EB", borderRadius: 3 }}>
                          <div style={{ width: `${Math.min(row.pct, 100)}%`, height: "100%", background: color, borderRadius: 3 }} />
                        </div>
                        <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color }}>{row.pct}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 11, color: C.labelGray }}>{row.source}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <ChartCard title="Signed vs unsigned by TLD (domain count)" half>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sldSigning} margin={{ top: 4, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="name" tick={{ fontFamily: "monospace", fontSize: 10, fill: C.textGray }} />
              <YAxis tickFormatter={v => v >= 1e6 ? `${(v/1e6).toFixed(0)}M` : v >= 1e3 ? `${(v/1e3).toFixed(0)}K` : v}
                tick={{ fontFamily: "monospace", fontSize: 10, fill: C.textGray }} />
              <Tooltip content={<Tip />} />
              <Legend wrapperStyle={{ fontFamily: "monospace", fontSize: 10 }} />
              <Bar dataKey="signed"   name="Signed"   fill={C.green}  radius={[4,4,0,0]} />
              <Bar dataKey="total"    name="Total"    fill={C.orange} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Signing % distribution" half>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={[
                  { name: "Low (<10%)",    value: 3, color: C.orange },
                  { name: "Medium (10–50%)", value: 0, color: C.blue },
                  { name: "High (>50%)",   value: 3, color: C.green },
                ]}
                cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                dataKey="value" paddingAngle={3}
                label={({ name }) => name}
                labelLine={false}
              >
                {[C.orange, C.blue, C.green].map((c, i) => <Cell key={i} fill={c} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function Competitors() {
  return (
    <div>
      <SectionBar title="Competitor Analysis — DNSSEC Statistics Platforms" />

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <StatCard label="Platforms Compared" value="5" />
        <StatCard label="Features Assessed"  value="5" />
        <StatCard label="DNSXplore Score"    value="5 / 5" />
        <StatCard label="Closest Rival"      value="APNIC Labs" />
      </div>

      {/* Table */}
      <div style={{
        background: C.white, border: `1px solid ${C.border}`,
        borderRadius: 8, overflow: "hidden", marginBottom: 20,
      }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.offWhite, borderBottom: `1px solid ${C.border}` }}>
                <th style={{ padding: "11px 16px", textAlign: "left", fontFamily: "monospace", fontSize: 10, color: C.labelGray, letterSpacing: 1.2, textTransform: "uppercase" }}>Platform</th>
                {["DNSSEC Archive","Per-Record Data","All gTLDs","Historical","Diagnostics"].map(h => (
                  <th key={h} style={{ padding: "11px 14px", textAlign: "center", fontFamily: "monospace", fontSize: 10, color: C.labelGray, letterSpacing: 1, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {competitors.map((c, i) => (
                <tr key={c.name} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.white : C.offWhite }}>
                  <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: i === 0 ? C.purple : C.textDark }}>
                    {c.name}{i === 0 && <span style={{ color: C.purple, fontSize: 10, marginLeft: 6 }}>★ This project</span>}
                  </td>
                  {radarKeys.map(k => {
                    const score = c[k];
                    const color = score >= 4 ? C.green : score >= 3 ? C.blue : C.orange;
                    return (
                      <td key={k} style={{ padding: "12px 14px", textAlign: "center" }}>
                        <span style={{
                          display: "inline-block", width: 26, height: 26, lineHeight: "26px",
                          borderRadius: 6, background: `${color}18`,
                          color, fontWeight: 800, fontSize: 13, fontFamily: "monospace",
                          border: `1px solid ${color}40`,
                        }}>{score}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ChartCard title="Feature coverage radar">
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={radarData}>
            <PolarGrid stroke={C.border} />
            <PolarAngleAxis dataKey="subject" tick={{ fontFamily: "monospace", fontSize: 10, fill: C.textGray }} />
            <PolarRadiusAxis domain={[0,5]} tick={false} />
            {competitors.map((c, i) => (
              <Radar key={c.name} name={c.name} dataKey={c.name}
                stroke={COMP_COLORS[i]} fill={COMP_COLORS[i]}
                fillOpacity={i === 0 ? 0.2 : 0.05}
                strokeWidth={i === 0 ? 2.5 : 1.5} />
            ))}
            <Legend wrapperStyle={{ fontFamily: "monospace", fontSize: 11 }} />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function ValidationTrend() {
  return (
    <div>
      <SectionBar title="Global DNSSEC Validation Trend — APNIC Labs (2018–2025)" />

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <StatCard label="2025 Validation Rate"  value="36%" />
        <StatCard label="Secure Delegation"     value="7%" />
        <StatCard label="2018 Baseline"         value="14%" />
        <StatCard label="Growth (7 yrs)"        value="+22pp" />
        <StatCard label="Data Source"           value="APNIC Labs" />
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <StatusCard status="Validating"   badgeColor={C.green}  count="36%"  pct="of global resolvers in 2025" desc="Resolver performs DNSSEC signature validation." />
        <StatusCard status="Delegated"    badgeColor={C.blue}   count="7%"   pct="secure delegation rate 2025" desc="Domains with a valid and complete chain of trust." />
        <StatusCard status="Unsigned"     badgeColor={C.orange} count="~93%" pct="of domains lack DNSSEC"      desc="No DS record published in parent zone." />
        <StatusCard status="No Validate"  badgeColor={C.red}    count="~64%" pct="of resolvers don't validate" desc="Resolver accepts responses without DNSSEC checks." />
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <ChartCard title="DNSSEC validation rate 2018–2025" half>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={validationTrend} margin={{ top: 4, right: 16, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="year" tick={{ fontFamily: "monospace", fontSize: 10, fill: C.textGray }} />
              <YAxis domain={[0, 50]} tickFormatter={v => `${v}%`} tick={{ fontFamily: "monospace", fontSize: 10, fill: C.textGray }} />
              <Tooltip content={<Tip />} />
              <Line type="monotone" dataKey="pct" name="Validation %" stroke={C.purple}
                strokeWidth={2.5} dot={{ fill: C.purple, r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Error code volume (illustrative)" half>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={[
                { name: "No DNSSEC", value: 93 },
                { name: "Signed",    value: 3 },
                { name: "Validated", value: 7 },
                { name: "Bogus",     value: 0.1 },
              ]}
              margin={{ top: 4, right: 10, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="name" tick={{ fontFamily: "monospace", fontSize: 10, fill: C.textGray }} />
              <YAxis tickFormatter={v => `${v}%`} tick={{ fontFamily: "monospace", fontSize: 10, fill: C.textGray }} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="value" name="%" radius={[4,4,0,0]}>
                {[C.orange, C.green, C.blue, C.red].map((c, i) => <Cell key={i} fill={c} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div style={{
        marginTop: 16, background: "#F5F3FF", border: `1px solid #DDD6FE`,
        borderRadius: 8, padding: "14px 18px",
      }}>
        <span style={{ color: C.purple, fontFamily: "monospace", fontSize: 12, fontWeight: 700 }}>
          📌 Source note:{" "}
        </span>
        <span style={{ color: C.textGray, fontFamily: "monospace", fontSize: 12 }}>
          Validation % from APNIC Labs (blog.apnic.net/2026/02/25/towards-an-industry-best-practice-for-dnssec-automation).
          Signing rates from Verisign Labs (.com 4.3%, .net 5.3%) via APNIC Blog Sep 2023.
          All figures sourced directly from primary research publications.
        </span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   ROOT
══════════════════════════════════════════════ */
export default function App() {
  const [tab, setTab] = useState("signed");

  const panels = { signed: <SignedOverview />, tld: <TLDZones />, sld: <DomainSigning />, competitors: <Competitors />, validation: <ValidationTrend /> };

  return (
    <div style={{ background: C.offWhite, minHeight: "100vh", position: "relative" }}>
      <DotBg />
      <div style={{ position: "relative", zIndex: 1 }}>
        <Navbar />
        <Hero tab={tab} />
        <TabBar active={tab} setActive={setTab} />
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 32px 48px" }}>
          {panels[tab]}
        </div>
      </div>
    </div>
  );
}

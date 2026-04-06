"use client";

import { useState, useMemo } from "react";

export interface Expert {
  id: number;
  name: string;
  email: string;
  type: string;
  typeLabel: string;
  priority: string;
  institution: string;
  country: string;
  specialty: string;
  researchTopic: string;
  emailStatus: string;
}

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> =
  {
    eses_treatment: {
      label: "ESES Treatment",
      color: "text-rose-800",
      bg: "bg-rose-50 border-rose-200",
    },
    epileptologist: {
      label: "Epileptologist",
      color: "text-blue-800",
      bg: "bg-blue-50 border-blue-200",
    },
    epilepsy_surgeon: {
      label: "Epilepsy Surgeon",
      color: "text-indigo-800",
      bg: "bg-indigo-50 border-indigo-200",
    },
    etiology_researcher: {
      label: "Etiology Researcher",
      color: "text-emerald-800",
      bg: "bg-emerald-50 border-emerald-200",
    },
    eeg_genetic_analysis: {
      label: "EEG / Genetics",
      color: "text-purple-800",
      bg: "bg-purple-50 border-purple-200",
    },
    researcher: {
      label: "Researcher",
      color: "text-teal-800",
      bg: "bg-teal-50 border-teal-200",
    },
    clinical_trial_pi: {
      label: "Clinical Trial PI",
      color: "text-orange-800",
      bg: "bg-orange-50 border-orange-200",
    },
    neuropsychologist: {
      label: "Neuropsychologist",
      color: "text-amber-800",
      bg: "bg-amber-50 border-amber-200",
    },
    cognitive_rehab: {
      label: "Cognitive Rehab",
      color: "text-cyan-800",
      bg: "bg-cyan-50 border-cyan-200",
    },
  };

function TypeBadge({ type }: { type: string }) {
  const config = TYPE_CONFIG[type] ?? {
    label: type,
    color: "text-gray-800",
    bg: "bg-gray-50 border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${config.color} ${config.bg}`}
    >
      {config.label}
    </span>
  );
}

function EmailStatus({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    verified_institutional: { label: "Verified", className: "text-emerald-600" },
    verified_personal: { label: "Personal", className: "text-amber-600" },
    likely_valid: { label: "Likely valid", className: "text-blue-600" },
    unverified: { label: "Unverified", className: "text-zinc-400" },
    unverified_personal: { label: "Unverified", className: "text-zinc-400" },
    not_found: { label: "Not found", className: "text-zinc-300" },
  };
  const c = config[status] ?? { label: status, className: "text-zinc-400" };
  return <span className={`text-xs ${c.className}`}>{c.label}</span>;
}

type SortKey = "name" | "institution" | "country" | "type" | "priority";
type SortDir = "asc" | "desc";

function SortHeader({
  label,
  sortKey,
  currentSort,
  currentDir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  currentSort: SortKey;
  currentDir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const active = currentSort === sortKey;
  return (
    <button
      onClick={() => onSort(sortKey)}
      className="group inline-flex items-center gap-1 font-semibold cursor-pointer"
    >
      {label}
      <span
        className={
          active
            ? "text-zinc-700"
            : "text-zinc-300 group-hover:text-zinc-400"
        }
      >
        {active && currentDir === "desc" ? "\u2193" : "\u2191"}
      </span>
    </button>
  );
}

export default function ExpertDirectory({
  experts,
}: {
  experts: Expert[];
}) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("priority");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of experts) {
      counts[e.type] = (counts[e.type] || 0) + 1;
    }
    return counts;
  }, [experts]);

  const countries = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of experts) {
      if (e.country) counts[e.country] = (counts[e.country] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [experts]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filtered = useMemo(() => {
    const list = experts.filter((e) => {
      if (typeFilter !== "all" && e.type !== typeFilter) return false;
      if (priorityFilter !== "all" && e.priority !== priorityFilter)
        return false;
      if (countryFilter !== "all" && e.country !== countryFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          e.name.toLowerCase().includes(q) ||
          e.institution.toLowerCase().includes(q) ||
          e.specialty.toLowerCase().includes(q) ||
          e.researchTopic.toLowerCase().includes(q) ||
          e.country.toLowerCase().includes(q)
        );
      }
      return true;
    });

    const priorityOrder: Record<string, number> = { high: 0, normal: 1 };
    const typeOrder: Record<string, number> = {
      eses_treatment: 0,
      epileptologist: 1,
      epilepsy_surgeon: 2,
      clinical_trial_pi: 3,
      etiology_researcher: 4,
      eeg_genetic_analysis: 5,
      researcher: 6,
      neuropsychologist: 7,
      cognitive_rehab: 8,
    };

    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "institution":
          cmp = a.institution.localeCompare(b.institution);
          break;
        case "country":
          cmp = a.country.localeCompare(b.country);
          break;
        case "type":
          cmp =
            (typeOrder[a.type] ?? 99) - (typeOrder[b.type] ?? 99);
          break;
        case "priority":
          cmp =
            (priorityOrder[a.priority] ?? 99) -
            (priorityOrder[b.priority] ?? 99);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [experts, search, typeFilter, priorityFilter, countryFilter, sortKey, sortDir]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
          DEE-SWAS Expert Finder
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--muted)]">
          {experts.length} specialists across {countries.length} countries.
          Click any row to see full details.
        </p>
      </header>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search name, institution, specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-10 pr-4 text-sm placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All types ({experts.length})</option>
            {Object.entries(TYPE_CONFIG).map(([key, config]) =>
              typeCounts[key] ? (
                <option key={key} value={key}>
                  {config.label} ({typeCounts[key]})
                </option>
              ) : null
            )}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All priorities</option>
            <option value="high">High priority</option>
            <option value="normal">Normal priority</option>
          </select>

          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All countries</option>
            {countries.map(([country, count]) => (
              <option key={country} value={country}>
                {country} ({count})
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mb-3 text-xs text-[var(--muted)]">
        Showing {filtered.length} of {experts.length} experts
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
              <th className="px-4 py-3">
                <SortHeader label="Name" sortKey="name" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
              </th>
              <th className="px-4 py-3 hidden md:table-cell">
                <SortHeader label="Institution" sortKey="institution" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
              </th>
              <th className="px-4 py-3 hidden lg:table-cell">
                <SortHeader label="Country" sortKey="country" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
              </th>
              <th className="px-4 py-3">
                <SortHeader label="Type" sortKey="type" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
              </th>
              <th className="px-4 py-3">
                <SortHeader label="Priority" sortKey="priority" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((expert) => {
              const isExpanded = expandedId === expert.id;
              return (
                <tr
                  key={expert.id}
                  className="group border-b border-zinc-100 last:border-0 hover:bg-blue-50/40 cursor-pointer"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : expert.id)
                  }
                >
                  <td
                    className="px-4 py-3 align-top"
                    colSpan={isExpanded ? 5 : 1}
                  >
                    <div className="font-medium text-zinc-900">
                      {expert.name}
                    </div>
                    {!isExpanded && (
                      <div className="text-xs text-zinc-400 md:hidden">
                        {expert.institution}
                      </div>
                    )}
                    {isExpanded && (
                      <div className="mt-2 space-y-1.5 text-sm text-zinc-600 pb-1">
                        <div className="flex gap-2 items-center flex-wrap">
                          <TypeBadge type={expert.type} />
                          {expert.priority === "high" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-xs font-medium text-red-800">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                              High Priority
                            </span>
                          )}
                        </div>
                        <p>
                          <span className="font-medium text-zinc-500">Institution:</span>{" "}
                          {expert.institution}
                          {expert.country && ` — ${expert.country}`}
                        </p>
                        {expert.specialty && (
                          <p>
                            <span className="font-medium text-zinc-500">Specialty:</span>{" "}
                            {expert.specialty}
                          </p>
                        )}
                        {expert.researchTopic && expert.researchTopic !== expert.specialty && (
                          <p>
                            <span className="font-medium text-zinc-500">Research:</span>{" "}
                            {expert.researchTopic}
                          </p>
                        )}
                        <p>
                          <span className="font-medium text-zinc-500">Email:</span>{" "}
                          {expert.email ? (
                            <>
                              <a
                                href={`mailto:${expert.email}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-blue-600 hover:text-blue-800 underline underline-offset-2"
                              >
                                {expert.email}
                              </a>
                              {" "}
                              <EmailStatus status={expert.emailStatus} />
                            </>
                          ) : (
                            <span className="text-zinc-400 italic">Not available</span>
                          )}
                        </p>
                      </div>
                    )}
                  </td>
                  {!isExpanded && (
                    <>
                      <td className="px-4 py-3 text-zinc-600 hidden md:table-cell align-top">
                        {expert.institution || "\u2014"}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 hidden lg:table-cell align-top">
                        {expert.country || "\u2014"}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <TypeBadge type={expert.type} />
                      </td>
                      <td className="px-4 py-3 align-top">
                        {expert.priority === "high" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                            High
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-400">
                            Normal
                          </span>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="mt-12 text-center">
          <p className="text-lg text-[var(--muted)]">
            No experts match your filters.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setTypeFilter("all");
              setPriorityFilter("all");
              setCountryFilter("all");
            }}
            className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      )}

      <footer className="mt-12 border-t border-zinc-200 pt-6 text-center text-xs text-zinc-400">
        Expert data compiled by Bryan Hong. For the Hong family.
      </footer>
    </div>
  );
}

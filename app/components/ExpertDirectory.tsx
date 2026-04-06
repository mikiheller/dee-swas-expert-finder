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
  expertise: string;
  paperTitle?: string;
  journal?: string;
}

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> =
  {
    advisory_board: {
      label: "Advisory Board",
      color: "text-amber-800",
      bg: "bg-amber-50 border-amber-200",
    },
    epileptologist: {
      label: "Epileptologist",
      color: "text-blue-800",
      bg: "bg-blue-50 border-blue-200",
    },
    neurogeneticist: {
      label: "Neurogeneticist",
      color: "text-purple-800",
      bg: "bg-purple-50 border-purple-200",
    },
    researcher: {
      label: "Researcher",
      color: "text-emerald-800",
      bg: "bg-emerald-50 border-emerald-200",
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

type SortKey = "name" | "institution" | "type" | "priority";
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
      <span className={active ? "text-zinc-700" : "text-zinc-300 group-hover:text-zinc-400"}>
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
      if (search) {
        const q = search.toLowerCase();
        return (
          e.name.toLowerCase().includes(q) ||
          e.institution.toLowerCase().includes(q) ||
          e.expertise.toLowerCase().includes(q) ||
          (e.paperTitle?.toLowerCase().includes(q) ?? false)
        );
      }
      return true;
    });

    const priorityOrder: Record<string, number> = { high: 0, normal: 1 };
    const typeOrder: Record<string, number> = {
      advisory_board: 0,
      epileptologist: 1,
      neurogeneticist: 2,
      researcher: 3,
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
        case "type":
          cmp = (typeOrder[a.type] ?? 99) - (typeOrder[b.type] ?? 99);
          break;
        case "priority":
          cmp = (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [experts, search, typeFilter, priorityFilter, sortKey, sortDir]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
          DEE-SWAS Expert Finder
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          {experts.length} specialists in DEE-SWAS, SYNGAP1, and ESES/CSWS.
          Click any row to see details.
        </p>
      </header>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
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
            placeholder="Search by name, institution, or expertise..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-10 pr-4 text-sm placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All types ({experts.length})</option>
            {Object.entries(TYPE_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label} ({typeCounts[key] || 0})
              </option>
            ))}
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
              <th className="px-4 py-3 hidden sm:table-cell">
                <SortHeader label="Institution" sortKey="institution" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
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
                  onClick={() => setExpandedId(isExpanded ? null : expert.id)}
                >
                  <td className="px-4 py-3 align-top" colSpan={isExpanded ? 4 : 1}>
                    <div className="font-medium text-zinc-900">{expert.name}</div>
                    {!isExpanded && (
                      <div className="text-xs text-zinc-400 sm:hidden">{expert.institution}</div>
                    )}
                    {isExpanded && (
                      <div className="mt-2 space-y-2 text-zinc-600 text-sm pb-1">
                        <div className="flex gap-2 items-center flex-wrap">
                          <TypeBadge type={expert.type} />
                          {expert.priority === "high" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-xs font-medium text-red-800">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                              High Priority
                            </span>
                          )}
                        </div>
                        {expert.institution && (
                          <p><span className="font-medium text-zinc-500">Institution:</span> {expert.institution}</p>
                        )}
                        {expert.expertise && (
                          <p><span className="font-medium text-zinc-500">Expertise:</span> {expert.expertise}</p>
                        )}
                        {expert.paperTitle && (
                          <p>
                            <span className="font-medium text-zinc-500">Key paper:</span>{" "}
                            <span className="italic">{expert.paperTitle}</span>
                            {expert.journal && <span className="text-zinc-400"> — {expert.journal}</span>}
                          </p>
                        )}
                        <p>
                          <span className="font-medium text-zinc-500">Email:</span>{" "}
                          <a
                            href={`mailto:${expert.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-blue-600 hover:text-blue-800 underline underline-offset-2"
                          >
                            {expert.email}
                          </a>
                        </p>
                      </div>
                    )}
                  </td>
                  {!isExpanded && (
                    <>
                      <td className="px-4 py-3 text-zinc-600 hidden sm:table-cell align-top">
                        {expert.institution || "—"}
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
                          <span className="text-xs text-zinc-400">Normal</span>
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

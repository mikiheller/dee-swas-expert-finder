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
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.color} ${config.bg}`}
    >
      {config.label}
    </span>
  );
}

function PriorityIndicator({ priority }: { priority: string }) {
  if (priority === "high") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-xs font-medium text-red-800">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        High Priority
      </span>
    );
  }
  return null;
}

function ExpertCard({ expert }: { expert: Expert }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-[var(--foreground)] leading-tight">
              {expert.name}
            </h3>
            {expert.institution && (
              <p className="mt-0.5 text-sm text-[var(--muted)]">
                {expert.institution}
              </p>
            )}
          </div>
          <div className="flex flex-shrink-0 flex-wrap items-center gap-1.5">
            <PriorityIndicator priority={expert.priority} />
            <TypeBadge type={expert.type} />
          </div>
        </div>

        {expert.expertise && (
          <p className="text-sm leading-relaxed text-zinc-700">
            {expert.expertise}
          </p>
        )}

        {expert.paperTitle && (
          <div className="rounded-lg bg-zinc-50 px-3 py-2 text-sm">
            <span className="font-medium text-zinc-600">Key paper: </span>
            <span className="text-zinc-800 italic">{expert.paperTitle}</span>
            {expert.journal && (
              <span className="text-zinc-500"> — {expert.journal}</span>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
          >
            {expanded ? "Hide contact" : "Show contact"}
          </button>
        </div>

        {expanded && (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm">
            <a
              href={`mailto:${expert.email}`}
              className="text-blue-600 hover:text-blue-800 underline underline-offset-2"
            >
              {expert.email}
            </a>
          </div>
        )}
      </div>
    </div>
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

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of experts) {
      counts[e.type] = (counts[e.type] || 0) + 1;
    }
    return counts;
  }, [experts]);

  const filtered = useMemo(() => {
    return experts.filter((e) => {
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
  }, [experts, search, typeFilter, priorityFilter]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
          DEE-SWAS Expert Finder
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--muted)]">
          {experts.length} specialists in DEE-SWAS, SYNGAP1, and ESES/CSWS —
          researchers, epileptologists, neurogeneticists, and advisory board
          members who may be able to help.
        </p>
      </header>

      {/* Filters */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
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
            className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-10 pr-4 text-sm placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All priorities</option>
            <option value="high">High priority</option>
            <option value="normal">Normal priority</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <p className="mb-4 text-sm text-[var(--muted)]">
        Showing {filtered.length} of {experts.length} experts
      </p>

      {/* Expert grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((expert) => (
          <ExpertCard key={expert.id} expert={expert} />
        ))}
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

      <footer className="mt-16 border-t border-zinc-200 pt-6 text-center text-xs text-zinc-400">
        Expert data compiled by Bryan Hong. For the Hong family.
      </footer>
    </div>
  );
}

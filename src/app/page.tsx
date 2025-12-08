"use client";
import { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react"
import { useTheme } from "next-themes";
import { spells } from "@/data/all_spells";
import { FunnelIcon } from "@heroicons/react/24/outline";
import { SunIcon } from "@heroicons/react/24/solid";
import { MoonIcon } from "@heroicons/react/24/solid";

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [nameFilter, setNameFilter] = useState("");
  const [levelFilters, setLevelFilters] = useState<string[]>([]);
  const [spellListFilter, setSpellListFilter] = useState("");
  const [classFilterMode, setClassFilterMode] = useState<"inclusive" | "exclusive">("inclusive");
  const [ritualFilter, setRitualFilter] = useState(0);
  const [concentrationFilter, setConcentrationFilter] = useState(0);
  const [schoolFilter, setSchoolFilter] = useState("");
  const [castingTimeFilter, setCastingTimeFilter] = useState("");
  const [componentsFilter, setComponentsFilter] = useState({
    V: 0,
    S: 0,
    M: 0,
    $: 0,
  });
  const [showFilters, setShowFilters] = useState(false);


  const classes = ["Artificer", "Bard", "Cleric", "Druid", "Paladin", "Ranger", "Sorcerer", "Warlock", "Wizard"];
  const schools = ["Abjuration", "Conjuration", "Divination", "Enchantment", "Evocation", "Illusion", "Necromancy", "Transmutation"];
  const castingTimes = ["1 action", "1 bonus action", "1 reaction", "1 minute", "10 minutes", "1 hour", "8 hours", "12 hours", "24 hours"];

  const labelMap = {
    V: "Verbal",
    S: "Somatic",
    M: "Material",
    gp: "Cost",
  }

  const toggleComponentFilter = (comp: "V" | "S" | "M" | "gp") => {
    const key = comp === "gp" ? "$" : comp;
    setComponentsFilter((prev) => ({
      ...prev,
      [key]: prev[key] === 0 ? 1 : prev[key] === 1 ? -1 : 0,
    }));
  };

  const toggleLevelFilter = (level: string) => {
    setLevelFilters(prev =>
      prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  const uniqueLevels = useMemo(() =>
    [...new Set(spells.map((spell) => spell.details.level.toLowerCase()))], []
  );


  const filteredSpells = useMemo(() => {
    return spells.filter((spell) => {
      const { name, details } = spell;

      const nameMatches =
        !nameFilter ||
        name.toLowerCase().includes(nameFilter.toLowerCase());
      const levelMatches =
        levelFilters.length === 0 ||
        levelFilters.includes(details.level.toLowerCase());

      // Class filtering with exclusive/inclusive modes
      let spellListMatches = true;
      if (spellListFilter) {
        const classList = details.spellList.toLowerCase().split(',').map(c => c.trim());
        if (classFilterMode === "exclusive") {
          // Exclusive: spell must ONLY be available to the selected class
          spellListMatches = classList.length === 1 && classList[0].includes(spellListFilter.toLowerCase());
        } else {
          // Inclusive: spell must be available to the selected class (default)
          spellListMatches = details.spellList.toLowerCase().includes(spellListFilter.toLowerCase());
        }
      }
      const ritualStr = details.school?.toLowerCase?.() || details.school.toLowerCase() || "";
      const durationStr = details.duration.toLowerCase();

      let ritualMatches = true;
      if (ritualFilter === 1 && !ritualStr.includes("ritual")) ritualMatches = false;
      if (ritualFilter === -1 && ritualStr.includes("ritual")) ritualMatches = false;

      let concentrationMatches = true;
      if (concentrationFilter === 1 && !durationStr.includes("concentration")) concentrationMatches = false;
      if (concentrationFilter === -1 && durationStr.includes("concentration")) concentrationMatches = false;

      const schoolMatches =
        !schoolFilter ||
        details.school.toLowerCase().includes(schoolFilter.toLowerCase());
      const castingTimeMatches =
        !castingTimeFilter ||
        details.castingTime.toLowerCase().includes(castingTimeFilter.toLowerCase());

      // Components filtering with three states: 
      // 0 = ignore, 1 = required, -1 = forbidden.
      let componentsMatch = true;
      const compStr = details.components.toLowerCase();
      for (const comp of ["V", "S", "M", "$"]) {
        const key = comp;
        const searchTerms = key === "$" ? ["gp", "tax"] : [comp.toLowerCase()];

        const filterVal = componentsFilter[key as "V" | "S" | "M" | "$"];

        if (filterVal === 1 && !searchTerms.some(term => compStr.includes(term))) {
          componentsMatch = false;
          break;
        }
        if (filterVal === -1 && searchTerms.some(term => compStr.includes(term))) {
          componentsMatch = false;
          break;
        }
      }

      return (
        nameMatches &&
        levelMatches &&
        spellListMatches &&
        ritualMatches &&
        concentrationMatches &&
        schoolMatches &&
        castingTimeMatches &&
        componentsMatch
      );
    });
  }, [
    nameFilter,
    levelFilters,
    spellListFilter,
    classFilterMode,
    ritualFilter,
    concentrationFilter,
    schoolFilter,
    castingTimeFilter,
    componentsFilter,
  ]);

  // console.log("unique duration", uniqueDuration);
  // console.log("unique range", uniqueRange);
  // console.log("unique casting tiem", uniqueCastingTime);

  // Add this useEffect to handle client-side only rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <div className="grid grid-rows-[5px_1fr_20px] items-start justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        {/* Navigation Bar */}
        <nav className="fixed top-0 left-0 right-0 h-[60px] bg-[var(--background)] border-b border-[var(--card-border)] flex items-center justify-center px-4 gap-4 z-10">
          <div className="relative">

            <button
              className="border-2 rounded-sm p-2 bg-[var(--background)] text-[var(--text-primary)] border-[var(--card-border)]"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {mounted ? (
                theme === "dark" ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />
              ) : (
                <div className="w-5 h-5"></div> // Placeholder while not mounted
              )}
            </button></div>

          <div className="flex-1 max-w-xl">
            <input
              id="nameFilter"
              type="text"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              placeholder="Search spells..."
              className="border rounded-lg p-2 w-full bg-[var(--background)] text-[var(--text-primary)] border-[var(--card-border)]"
            />
          </div>

          <button
            className="border-2 rounded-sm p-2 bg-[var(--background)] text-[var(--text-primary)] border-[var(--card-border)]"
            onClick={showFilters === true ? () => setShowFilters(false) : () => setShowFilters(true)}
          >
            <FunnelIcon className="w-5 h-5" />
          </button>
        </nav>

        <main className="flex flex-col gap-8 mt-[60px]">
          <div>
            {showFilters && (
              <div className="fixed top-0 right-0 h-full w-full bg-[var(--background)] shadow-lg z-40 overflow-y-auto transition-transform duration-300">
                <div className="p-2 flex justify-between items-center border-b border-[var(--card-border)]">
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">Filters</h2>
                  <button onClick={() => setShowFilters(false)} className="border-2 rounded-sm p-2 z-100 bg-[var(--background)] text-[var(--text-primary)] border-[var(--card-border)]">
                    Close
                  </button>
                </div>
                <div className="p-4 space-y-6">
                  <div className="justify-center">
                    {/* Responsive grid for filter controls */}
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

                      {/* Spell List Filter with Exclusive/Inclusive Toggle */}
                      <div className="sm:col-span-2">
                        <label htmlFor="spellListFilter" className="block text-sm font-medium mb-2 text-[var(--text-primary)] tracking-tight">
                          Class Filter:
                        </label>
                        <div className="space-y-2">
                          <select
                            id="spellListFilter"
                            value={spellListFilter}
                            onChange={(e) => setSpellListFilter(e.target.value)}
                            className="border rounded-lg p-2 w-full bg-[var(--background)] text-[var(--text-primary)] border-[var(--card-border)]"
                          >
                            <option value="">All Classes</option>
                            {classes.map((sl, index) => (
                              <option key={index} value={sl} className="bg-[var(--background)] text-[var(--text-primary)]">
                                {sl}
                              </option>
                            ))}
                          </select>
                          {spellListFilter && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => setClassFilterMode("inclusive")}
                                className={`flex-1 border rounded-lg p-2 text-sm transition-colors ${classFilterMode === "inclusive"
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-[var(--background)] text-[var(--text-primary)] border-[var(--card-border)]"
                                  }`}
                              >
                                Inclusive
                              </button>
                              <button
                                onClick={() => setClassFilterMode("exclusive")}
                                className={`flex-1 border rounded-lg p-2 text-sm transition-colors ${classFilterMode === "exclusive"
                                    ? "bg-purple-600 text-white border-purple-600"
                                    : "bg-[var(--background)] text-[var(--text-primary)] border-[var(--card-border)]"
                                  }`}
                              >
                                Exclusive
                              </button>
                            </div>
                          )}
                          {spellListFilter && (
                            <p className="text-xs text-[var(--text-secondary)] italic">
                              {classFilterMode === "inclusive"
                                ? `Showing spells available to ${spellListFilter} (may be shared with other classes)`
                                : `Showing spells ONLY available to ${spellListFilter}`
                              }
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Level Filter */}
                      <div className="sm:col-span-2 lg:col-span-4">
                        <label className="block text-sm font-medium mb-2 text-[var(--text-primary)] tracking-tight">
                          Level:
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                          {uniqueLevels.map((lvl) => (
                            <button
                              key={lvl}
                              onClick={() => toggleLevelFilter(lvl)}
                              className={`border rounded-lg p-2 text-sm transition-all ${levelFilters.includes(lvl)
                                  ? "bg-blue-600 text-white border-blue-600 font-semibold"
                                  : "bg-[var(--background)] text-[var(--text-primary)] border-[var(--card-border)]"
                                }`}
                            >
                              {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* School Filter */}
                      <div>
                        <label htmlFor="schoolFilter" className="block text-sm font-medium mb-2 text-[var(--text-primary)] tracking-tight">
                          School:
                        </label>
                        <select
                          id="schoolFilter"
                          value={schoolFilter}
                          onChange={(e) => setSchoolFilter(e.target.value)}
                          className="border rounded-lg p-2 w-full bg-[var(--background)] text-[var(--text-primary)] border-[var(--card-border)]"
                        >
                          <option value="">All Schools</option>
                          {schools.map((school, index) => (
                            <option key={index} value={school} className="bg-[var(--background)] text-[var(--text-primary)]">
                              {school}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Casting Time Filter */}
                      <div className="sm:col-span-2 md:col-span-1">
                        <label htmlFor="castingTimeFilter" className="block text-sm font-medium mb-2 text-[var(--text-primary)] tracking-tight">
                          Casting Time:
                        </label>
                        <select
                          id="castingTimeFilter"
                          value={castingTimeFilter}
                          onChange={(e) => setCastingTimeFilter(e.target.value)}
                          className="border rounded-lg p-2 w-full bg-[var(--background)] text-[var(--text-primary)] border-[var(--card-border)]"
                        >
                          <option value="">All Casting Times</option>
                          {castingTimes.map((castTime, index) => (
                            <option key={index} value={castTime} className="bg-[var(--background)] text-[var(--text-primary)]">
                              {castTime}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Components Filter */}
                      <div className="sm:col-span-2 md:col-span-4">
                        <label className="block text-sm font-medium mb-2 text-[var(--text-primary)] tracking-tight">Components:</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {(["V", "S", "M", "gp"] as Array<"V" | "S" | "M" | "gp">).map((comp) => {
                            const key: "V" | "S" | "M" | "$" = comp === "gp" ? "$" : comp;
                            return (
                              <button
                                key={comp}
                                onClick={() => toggleComponentFilter(comp)}
                                className={`border rounded-lg p-2 text-sm transition-all ${componentsFilter[key] === 1
                                  ? "bg-green-600 text-white border-green-600 font-semibold"
                                  : componentsFilter[key] === -1
                                    ? "bg-red-600 text-white border-red-600 font-semibold"
                                    : "bg-[var(--tag-background)] text-[var(--text-primary)] border-[var(--card-border)]"
                                  }`}
                              >
                                {labelMap[comp]}
                                {componentsFilter[key] === 1 && " ✓"}
                                {componentsFilter[key] === -1 && " ✗"}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Ritual Button */}
                      <div>
                        <label className="block text-sm font-medium mb-2 text-[var(--text-primary)] tracking-tight">Ritual:</label>
                        <button
                          className={`border rounded-lg p-2 w-full text-sm transition-all ${ritualFilter === 1
                            ? "bg-green-600 text-white border-green-600 font-semibold"
                            : ritualFilter === -1
                              ? "bg-red-600 text-white border-red-600 font-semibold"
                              : "bg-[var(--background)] text-[var(--text-primary)] border-[var(--card-border)]"
                            }`}
                          onClick={() =>
                            setRitualFilter((prev) => (prev === 0 ? 1 : prev === 1 ? -1 : 0))
                          }
                        >
                          {ritualFilter === 1
                            ? "Required ✓"
                            : ritualFilter === -1
                              ? "Excluded ✗"
                              : "Any"}
                        </button>
                      </div>

                      {/* Concentration Button */}
                      <div>
                        <label className="block text-sm font-medium mb-2 text-[var(--text-primary)] tracking-tight">Concentration:</label>
                        <button
                          className={`border rounded-lg p-2 w-full text-sm transition-all ${concentrationFilter === 1
                            ? "bg-green-600 text-white border-green-600 font-semibold"
                            : concentrationFilter === -1
                              ? "bg-red-600 text-white border-red-600 font-semibold"
                              : "bg-[var(--background)] text-[var(--text-primary)] border-[var(--card-border)]"
                            }`}
                          onClick={() =>
                            setConcentrationFilter((prev) => (prev === 0 ? 1 : prev === 1 ? -1 : 0))
                          }
                        >
                          {concentrationFilter === 1
                            ? "Required ✓"
                            : concentrationFilter === -1
                              ? "Excluded ✗"
                              : "Any"}
                        </button>
                      </div>
                    </div>

                    {/* Clear Filters Button */}
                    <div className="mt-6 pt-4 border-t border-[var(--card-border)]">
                      <button
                        className="border-2 rounded-lg p-3 w-full bg-[var(--background)] text-[var(--text-primary)] border-[var(--card-border)] transition-colors hover:bg-[var(--tag-background)] font-medium"
                        onClick={() => {
                          setNameFilter("");
                          setLevelFilters([]);
                          setSchoolFilter("");
                          setCastingTimeFilter("");
                          setSpellListFilter("");
                          setClassFilterMode("inclusive");
                          setConcentrationFilter(0);
                          setRitualFilter(0);
                          setComponentsFilter({
                            V: 0,
                            S: 0,
                            M: 0,
                            $: 0,
                          });
                        }}
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
        <div className="flex flex-col gap-4 w-full max-w-5xl">
          {/* Filter Summary Section */}
          {(nameFilter || levelFilters.length > 0 || spellListFilter || ritualFilter ||
            concentrationFilter || schoolFilter || castingTimeFilter ||
            Object.values(componentsFilter).some(val => val !== 0)) && (
              <div className="bg-[var(--tag-background)] border border-[var(--card-border)] rounded-lg p-3 text-sm text-[var(--text-secondary)]">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="font-medium">Active Filters:</span>
                  {nameFilter && (
                    <span className="bg-[var(--background)] px-2 py-1 rounded border border-[var(--card-border)] flex items-center gap-1">
                      Name: {nameFilter}
                      <button
                        onClick={() => setNameFilter("")}
                        className="ml-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                        aria-label="Clear name filter"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {levelFilters.length > 0 && (
                    <span className="bg-[var(--background)] px-2 py-1 rounded border border-[var(--card-border)] flex items-center gap-1">
                      Levels: {levelFilters.join(", ")}
                      <button
                        onClick={() => setLevelFilters([])}
                        className="ml-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                        aria-label="Clear level filters"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {spellListFilter && (
                    <span className={`px-2 py-1 rounded border flex items-center gap-1 ${classFilterMode === "exclusive"
                        ? "bg-purple-100 border-purple-400 dark:bg-purple-900/30 dark:border-purple-600"
                        : "bg-blue-100 border-blue-400 dark:bg-blue-900/30 dark:border-blue-600"
                      }`}>
                      {classFilterMode === "exclusive" ? "🔒" : "📖"} {spellListFilter} ({classFilterMode})
                      <button
                        onClick={() => setSpellListFilter("")}
                        className="ml-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                        aria-label="Clear class filter"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {ritualFilter !== 0 && (
                    <span className="bg-[var(--background)] px-2 py-1 rounded border border-[var(--card-border)] flex items-center gap-1">
                      Ritual: {ritualFilter === 1 ? "Included" : "Excluded"}
                      <button
                        onClick={() => setRitualFilter(0)}
                        className="ml-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                        aria-label="Clear ritual filter"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {concentrationFilter !== 0 && (
                    <span className="bg-[var(--background)] px-2 py-1 rounded border border-[var(--card-border)] flex items-center gap-1">
                      Concentration: {concentrationFilter === 1 ? "Included" : "Excluded"}
                      <button
                        onClick={() => setConcentrationFilter(0)}
                        className="ml-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                        aria-label="Clear concentration filter"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {schoolFilter && (
                    <span className="bg-[var(--background)] px-2 py-1 rounded border border-[var(--card-border)] flex items-center gap-1">
                      School: {schoolFilter}
                      <button
                        onClick={() => setSchoolFilter("")}
                        className="ml-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                        aria-label="Clear school filter"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {castingTimeFilter && (
                    <span className="bg-[var(--background)] px-2 py-1 rounded border border-[var(--card-border)] flex items-center gap-1">
                      Casting Time: {castingTimeFilter}
                      <button
                        onClick={() => setCastingTimeFilter("")}
                        className="ml-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                        aria-label="Clear casting time filter"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {Object.entries(componentsFilter).map(([key, value]) => {
                    if (value === 0) return null;
                    const label = key === "$" ? "Cost" : key;
                    return (
                      <span key={key} className="bg-[var(--background)] px-2 py-1 rounded border border-[var(--card-border)] flex items-center gap-1">
                        {label}: {value === 1 ? "Required" : "Excluded"}
                        <button
                          onClick={() => {
                            setComponentsFilter(prev => ({
                              ...prev,
                              [key]: 0
                            }));
                          }}
                          className="ml-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                          aria-label={`Clear ${label} component filter`}
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                  <button
                    onClick={() => {
                      setNameFilter("");
                      setLevelFilters([]);
                      setSchoolFilter("");
                      setCastingTimeFilter("");
                      setSpellListFilter("");
                      setClassFilterMode("inclusive");
                      setConcentrationFilter(0);
                      setRitualFilter(0);
                      setComponentsFilter({
                        V: 0,
                        S: 0,
                        M: 0,
                        $: 0,
                      });
                    }}
                    className="ml-auto text-xs underline hover:text-[var(--text-primary)]"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}
          {filteredSpells.map((spell, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                opacity: { duration: 0.3, delay: index * 0.05 },
                y: { type: 'spring', stiffness: 100, damping: 15, delay: index * 0.05 }
              }}
              whileHover={{
                y: -12,
                rotateZ: 0.1,
                transition: { type: 'spring', stiffness: 350, damping: 18 }
              }}
              key={index}
              className="relative border border-[var(--card-border)] rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow bg-[var(--card-background)]"
              id="spell-card"
              style={{ perspective: '1000px' }}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">
                  {spell.name}
                </h3>
                <div className="text-sm text-[var(--text-secondary)] font-medium tracking-tight">
                  {spell.details.level} {spell.details.school}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-[var(--text-secondary)] mb-3">
                <div><span className="font-medium">Casting Time:</span> {spell.details.castingTime}</div>
                <div><span className="font-medium">Components:</span> {spell.details.components}</div>
                <div><span className="font-medium">Duration:</span> {spell.details.duration}</div>
                <div><span className="font-medium">Range:</span> {spell.details.range}</div>
                <div><span className="font-medium"></span> </div>
              </div>

              <div className="text-sm text-[var(--text-secondary)] mb-3">
                <p>{spell.details.description}</p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <div className="bg-[var(--tag-background)] px-2 py-1 rounded">
                  <span className="font-medium">Classes:</span> {spell.details.spellList}
                </div>
                {spell.details.upcast && (
                  <div className="bg-[var(--tag-background)] px-2 py-1 rounded">
                    <span className="font-medium">Upcast:</span> {spell.details.upcast}
                  </div>
                )}
                <div className="bg-[var(--tag-background)] px-2 py-1 rounded">
                  <span className="font-medium">Source:</span> {spell.details.source}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">

        </footer>
      </div>
    </>
  );
}

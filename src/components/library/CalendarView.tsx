import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookCover } from '@/components/books/BookCover';
import type { Book, UserBook } from '@/types';

type LibraryBook = UserBook & { book: Book };

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function isoKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function todayKey(): string {
  const t = new Date();
  return isoKey(t.getFullYear(), t.getMonth(), t.getDate());
}

interface CalendarViewProps {
  books: LibraryBook[];
}

export function CalendarView({ books }: CalendarViewProps) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [showCovers, setShowCovers] = useState(false);

  const { startMap, finishMap, bookById, availableYears, selectedBookEndpoints } = useMemo(() => {
    const startMap = new Map<string, LibraryBook[]>();
    const finishMap = new Map<string, LibraryBook[]>();
    const bookById = new Map<string, LibraryBook>();
    const yearsSet = new Set<number>([new Date().getFullYear()]);

    for (const ub of books) {
      bookById.set(ub.id, ub);
      if (ub.started_at) {
        const d = parseISODate(ub.started_at);
        yearsSet.add(d.getFullYear());
        if (d.getFullYear() === year) {
          if (!startMap.has(ub.started_at)) startMap.set(ub.started_at, []);
          startMap.get(ub.started_at)!.push(ub);
        }
      }
      if (ub.finished_at) {
        const d = parseISODate(ub.finished_at);
        yearsSet.add(d.getFullYear());
        if (d.getFullYear() === year) {
          if (!finishMap.has(ub.finished_at)) finishMap.set(ub.finished_at, []);
          finishMap.get(ub.finished_at)!.push(ub);
        }
      }
    }

    let selectedBookEndpoints: { startKey: string; endKey: string; endIsToday: boolean } | null = null;
    if (selectedBookId) {
      const ub = bookById.get(selectedBookId);
      if (ub?.started_at) {
        const sd = parseISODate(ub.started_at);
        if (sd.getFullYear() === year) {
          if (ub.finished_at) {
            const fd = parseISODate(ub.finished_at);
            if (fd.getFullYear() === year) {
              selectedBookEndpoints = { startKey: ub.started_at, endKey: ub.finished_at, endIsToday: false };
            }
          } else if (ub.status === 'currently_reading') {
            const today = new Date();
            if (today.getFullYear() === year) {
              selectedBookEndpoints = { startKey: ub.started_at, endKey: todayKey(), endIsToday: true };
            }
          }
        }
      }
    }

    return {
      startMap,
      finishMap,
      bookById,
      availableYears: Array.from(yearsSet).sort((a, b) => b - a),
      selectedBookEndpoints,
    };
  }, [books, year, selectedBookId]);

  const selectedBook = selectedBookId ? bookById.get(selectedBookId) ?? null : null;

  const handleCellClick = (key: string) => {
    const starts = startMap.get(key) ?? [];
    const finishes = finishMap.get(key) ?? [];
    const candidates = [...starts, ...finishes];
    if (candidates.length === 0) return;

    // If currently selected book is associated with this cell, cycle to the next on this cell, else clear.
    if (selectedBookId) {
      const idx = candidates.findIndex((b) => b.id === selectedBookId);
      if (idx !== -1) {
        const next = candidates[idx + 1];
        setSelectedBookId(next ? next.id : null);
        return;
      }
    }
    setSelectedBookId(candidates[0].id);
  };

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <label className="inline-flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showCovers}
            onChange={(e) => setShowCovers(e.target.checked)}
            className="accent-indigo-600"
          />
          Show covers
        </label>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setYear((y) => y - 1)}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
          >
            ←
          </button>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-3 py-1 text-sm border border-gray-300 rounded bg-white"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
            {!availableYears.includes(year) && <option value={year}>{year}</option>}
          </select>
          <button
            onClick={() => setYear((y) => y + 1)}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
          >
            →
          </button>
        </div>
      </div>

      <MonthGrid
        year={year}
        startMap={startMap}
        finishMap={finishMap}
        showCovers={showCovers}
        selectedBook={selectedBook}
        selectedBookEndpoints={selectedBookEndpoints}
        onCellClick={handleCellClick}
      />

      <p className="mt-3 text-xs text-gray-500">
        Indigo dots are starts, emerald dots are finishes. Click a dot to draw that book's trail to its finish.
      </p>

      {selectedBook && (
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <Link
              to={`/book/${selectedBook.book.id}`}
              className="flex items-center gap-3 min-w-0"
            >
              <BookCover src={selectedBook.book.cover_url} title={selectedBook.book.title} size="sm" />
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{selectedBook.book.title}</div>
                <div className="text-xs text-gray-500 truncate">{selectedBook.book.authors?.join(', ')}</div>
                <div className="text-[11px] mt-0.5 text-gray-600">
                  {selectedBook.started_at && (
                    <>
                      <span className="text-indigo-600">Started {selectedBook.started_at}</span>
                      {selectedBook.finished_at && (
                        <>
                          <span className="mx-1 text-gray-400">→</span>
                          <span className="text-emerald-600">Finished {selectedBook.finished_at}</span>
                        </>
                      )}
                      {!selectedBook.finished_at && selectedBook.status === 'currently_reading' && (
                        <>
                          <span className="mx-1 text-gray-400">→</span>
                          <span className="text-gray-600">Still reading</span>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </Link>
            <button
              onClick={() => setSelectedBookId(null)}
              className="text-xs text-gray-500 hover:text-gray-700 flex-shrink-0"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface MonthGridProps {
  year: number;
  startMap: Map<string, LibraryBook[]>;
  finishMap: Map<string, LibraryBook[]>;
  showCovers: boolean;
  selectedBook: LibraryBook | null;
  selectedBookEndpoints: { startKey: string; endKey: string; endIsToday: boolean } | null;
  onCellClick: (key: string) => void;
}

function MonthGrid({
  year,
  startMap,
  finishMap,
  showCovers,
  selectedBook,
  selectedBookEndpoints,
  onCellClick,
}: MonthGridProps) {
  const selectedBookId = selectedBook?.id ?? null;
  const containerRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [path, setPath] = useState<string | null>(null);
  const [labels, setLabels] = useState<{ start?: { x: number; y: number }; end?: { x: number; y: number; isToday: boolean } } | null>(null);
  const [overlaySize, setOverlaySize] = useState({ w: 0, h: 0 });

  const setCellRef = (key: string) => (el: HTMLButtonElement | null) => {
    if (el) cellRefs.current.set(key, el);
    else cellRefs.current.delete(key);
  };

  useLayoutEffect(() => {
    const compute = () => {
      const container = containerRef.current;
      if (!container) return;
      const box = container.getBoundingClientRect();
      setOverlaySize({ w: box.width, h: box.height });
      if (!selectedBookEndpoints) {
        setPath(null);
        setLabels(null);
        return;
      }
      const s = cellRefs.current.get(selectedBookEndpoints.startKey);
      const f = cellRefs.current.get(selectedBookEndpoints.endKey);
      if (!s || !f) {
        setPath(null);
        setLabels(null);
        return;
      }
      const sb = s.getBoundingClientRect();
      const fb = f.getBoundingClientRect();
      const x1 = sb.left - box.left + sb.width / 2;
      const y1 = sb.top - box.top + sb.height / 2;
      const x2 = fb.left - box.left + fb.width / 2;
      const y2 = fb.top - box.top + fb.height / 2;
      setLabels({
        start: { x: x1, y: sb.top - box.top },
        end: { x: x2, y: fb.top - box.top, isToday: selectedBookEndpoints.endIsToday },
      });
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const arc = Math.min(80, dist * 0.22);
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      const nx = -dy / (dist || 1);
      const ny = dx / (dist || 1);
      const cx = mx + nx * arc;
      const cy = my + ny * arc;
      setPath(`M${x1},${y1} Q${cx},${cy} ${x2},${y2}`);
    };
    compute();
    const ro = new ResizeObserver(compute);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', compute);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', compute);
    };
  }, [selectedBookEndpoints, year, showCovers]);

  return (
    <div ref={containerRef} className="relative">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {MONTH_NAMES.map((name, monthIdx) => {
          const firstWeekday = new Date(year, monthIdx, 1).getDay();
          const numDays = new Date(year, monthIdx + 1, 0).getDate();
          const cells: (number | null)[] = [];
          for (let i = 0; i < firstWeekday; i++) cells.push(null);
          for (let d = 1; d <= numDays; d++) cells.push(d);

          return (
            <div key={name} className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="text-sm font-semibold text-gray-900 mb-2">{name}</div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {WEEKDAY_LABELS.map((wd, i) => (
                  <div key={i} className="text-[10px] text-gray-400 font-medium">{wd}</div>
                ))}
                {cells.map((day, i) => {
                  if (day === null) return <div key={i} />;
                  const key = isoKey(year, monthIdx, day);
                  const starts = startMap.get(key);
                  const finishes = finishMap.get(key);
                  const hasActivity = !!(starts?.length || finishes?.length);

                  const isSelectedStart = selectedBookEndpoints?.startKey === key;
                  const isSelectedEnd = selectedBookEndpoints?.endKey === key;
                  const isOnSelectedTrail = isSelectedStart || isSelectedEnd;
                  const dimmed = !!selectedBookId && !isOnSelectedTrail;

                  // On the selected trail's endpoints, render the SELECTED book's cover/dot.
                  // Otherwise fall back to whichever book is first for this cell.
                  const trailStartedHere = isSelectedStart;
                  const trailFinishedHere = isSelectedEnd && !selectedBookEndpoints?.endIsToday;
                  const cellBook = isOnSelectedTrail
                    ? selectedBook
                    : (starts?.[0] ?? finishes?.[0]) ?? null;
                  const cover = cellBook?.book.cover_url ?? null;
                  const showCover = showCovers && hasActivity && cover;
                  const showStartDot = isOnSelectedTrail
                    ? trailStartedHere
                    : !!starts?.length;
                  const showFinishDot = isOnSelectedTrail
                    ? trailFinishedHere
                    : !!finishes?.length;

                  return (
                    <button
                      key={i}
                      ref={hasActivity ? setCellRef(key) : undefined}
                      onClick={() => onCellClick(key)}
                      className={`relative aspect-square text-[11px] rounded flex items-center justify-center overflow-hidden transition-opacity
                        ${hasActivity
                          ? 'text-gray-900 font-medium hover:ring-1 hover:ring-gray-400 cursor-pointer'
                          : 'text-gray-400'}
                        ${isOnSelectedTrail ? 'ring-2 ring-indigo-600' : ''}
                        ${dimmed ? 'opacity-30' : ''}`}
                      disabled={!hasActivity}
                    >
                      {showCover ? (
                        <>
                          <img
                            src={cover}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover opacity-95"
                          />
                          <span className="absolute top-0 left-0 px-1 text-[9px] font-semibold text-white bg-black/55 rounded-br">
                            {day}
                          </span>
                          <span className="absolute bottom-0 right-0 flex gap-0.5 p-0.5">
                            {showStartDot && (
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 ring-1 ring-white" />
                            )}
                            {showFinishDot && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ring-1 ring-white" />
                            )}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="relative z-10">{day}</span>
                          {hasActivity && (
                            <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                              {showStartDot && (
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                              )}
                              {showFinishDot && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              )}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {path && (
        <svg
          className="absolute inset-0 pointer-events-none"
          width={overlaySize.w}
          height={overlaySize.h}
          style={{ zIndex: 50 }}
        >
          <defs>
            <marker
              id="cal-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 Z" fill="#4f46e5" />
            </marker>
          </defs>
          <path
            d={path}
            stroke="#4f46e5"
            strokeWidth={2.5}
            strokeOpacity={0.9}
            strokeLinecap="round"
            fill="none"
            markerEnd="url(#cal-arrow)"
          />
        </svg>
      )}

      {labels?.start && (
        <span
          className="absolute pointer-events-none px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-600 text-white shadow-sm whitespace-nowrap"
          style={{
            left: labels.start.x,
            top: labels.start.y,
            transform: 'translate(-50%, calc(-100% - 4px))',
            zIndex: 51,
          }}
        >
          Start
        </span>
      )}
      {labels?.end && (
        <span
          className={`absolute pointer-events-none px-1.5 py-0.5 rounded text-[10px] font-semibold text-white shadow-sm whitespace-nowrap ${
            labels.end.isToday ? 'bg-gray-600' : 'bg-emerald-600'
          }`}
          style={{
            left: labels.end.x,
            top: labels.end.y,
            transform: 'translate(-50%, calc(-100% - 4px))',
            zIndex: 51,
          }}
        >
          {labels.end.isToday ? 'Today' : 'Finish'}
        </span>
      )}
    </div>
  );
}

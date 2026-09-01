import React, { useRef, useEffect, useState } from 'react';
import {
  Globe,
  MapPin,
  Building2,
  FolderOpen,
  Layers,
  ChevronRight,
} from 'lucide-react';

/** Default hierarchical level definitions */
const DEFAULT_LEVELS = [
  { id: 'national', label: 'National', icon: Globe },
  { id: 'state', label: 'State', icon: MapPin },
  { id: 'district', label: 'District', icon: Building2 },
  { id: 'project', label: 'Project', icon: FolderOpen },
  { id: 'parcel', label: 'Parcel', icon: Layers },
];

/**
 * LevelNav — Hierarchical administrative drill-down navigation.
 *
 * @param {Object} props
 * @param {string} props.activeLevel - Currently selected level id
 * @param {(levelId: string) => void} props.onLevelChange - Callback when level changes
 * @param {Array<{id: string, label: string, icon?: React.ComponentType}>} [props.levels] - Level definitions (defaults to National→Parcel)
 * @param {Array<{label: string, onClick?: () => void}>} [props.breadcrumbs] - Context breadcrumb items shown on mobile
 */
export const LevelNav = ({
  activeLevel,
  onLevelChange,
  levels = DEFAULT_LEVELS,
  breadcrumbs,
}) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Detect scroll overflow for fade indicators
  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  // Scroll active tab into view on level change
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const activeBtn = el.querySelector('[aria-current="true"]');
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeLevel]);

  // Keyboard navigation between tabs
  const handleTabKeyDown = (e, index) => {
    const tabs = scrollRef.current?.querySelectorAll('[role="tab"]');
    if (!tabs) return;
    let nextIndex = index;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = Math.min(index + 1, tabs.length - 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = Math.max(index - 1, 0);
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = tabs.length - 1;
    } else {
      return;
    }
    tabs[nextIndex].focus();
    tabs[nextIndex].click();
  };

  const activeIndex = levels.findIndex((l) => l.id === activeLevel);

  return (
    <nav
      aria-label="Hierarchical level navigation"
      className="bg-white border-b border-slate-200 shadow-gov-sm sticky top-16 lg:top-[68px] z-30"
    >
      {/* Main tab row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* Left fade indicator */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none lg:hidden" />
          )}

          <div
            ref={scrollRef}
            className="flex overflow-x-auto scrollbar-none py-0.5"
            role="tablist"
            aria-label="Administrative levels"
          >
            {levels.map((level, index) => {
              const Icon = level.icon;
              const isActive = activeLevel === level.id;
              const isPast = activeIndex >= 0 && index < activeIndex;

              return (
                <button
                  key={level.id}
                  type="button"
                  role="tab"
                  id={`level-tab-${level.id}`}
                  aria-selected={isActive}
                  aria-current={isActive ? 'true' : undefined}
                  aria-controls={`level-panel-${level.id}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => onLevelChange(level.id)}
                  onKeyDown={(e) => handleTabKeyDown(e, index)}
                  className={`relative flex items-center gap-1.5 px-4 text-sm font-medium whitespace-nowrap transition-colors
                    min-h-[44px] shrink-0
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gov-primary
                    ${
                      isActive
                        ? 'text-gov-primary font-semibold'
                        : isPast
                          ? 'text-slate-600 hover:text-gov-text hover:bg-slate-50'
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-gov-primary rounded-full" />
                  )}

                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-gov-primary' : isPast ? 'text-slate-500' : 'text-slate-300'
                    }`}
                  />
                  <span>{level.label}</span>

                  {/* Connector arrow between levels (hidden on active/last) */}
                  {index < levels.length - 1 && (
                    <ChevronRight
                      className={`w-3 h-3 ml-1 shrink-0 ${
                        isPast ? 'text-slate-300' : 'text-slate-200'
                      }`}
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right fade indicator */}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none lg:hidden" />
          )}
        </div>
      </div>

      {/* Mobile context breadcrumb row */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="lg:hidden border-t border-slate-100 bg-slate-50/60">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex items-center gap-1 text-xs text-slate-500 overflow-x-auto scrollbar-none">
              <span className="text-gov-primary font-semibold shrink-0">National</span>
              {breadcrumbs.map((crumb, i) => (
                <React.Fragment key={i}>
                  <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" aria-hidden="true" />
                  <button
                    type="button"
                    onClick={crumb.onClick}
                    className={`shrink-0 truncate max-w-[120px] ${
                      crumb.onClick
                        ? 'text-slate-600 hover:text-gov-primary underline underline-offset-2 decoration-slate-300 hover:decoration-gov-primary transition-colors'
                        : 'text-slate-700 font-medium'
                    }`}
                    disabled={!crumb.onClick}
                  >
                    {crumb.label}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default LevelNav;

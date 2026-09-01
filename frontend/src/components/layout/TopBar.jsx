import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bell,
  HelpCircle,
  User,
  LogOut,
  MapPin,
  ChevronDown,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { JURISDICTION_OPTIONS } from '../../data/mockData';

/** Map role codes from OFFICER_REGISTRY to human-readable labels */
const ROLE_LABELS = {
  CENTRAL: 'Central Administrator',
  DISTRICT: 'District Administrator',
  FIELD_OFFICER: 'Field Officer',
};

export const TopBar = ({
  currentUser,
  currentJurisdiction,
  onJurisdictionChange,
  onOpenLogin,
  onLogout,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isJurisdictionDropdownOpen, setIsJurisdictionDropdownOpen] = useState(false);
  const [unreadCount] = useState(3); // mock unread count

  const profileRef = useRef(null);
  const dropdownRef = useRef(null);
  const profileButtonId = 'topbar-profile-btn';
  const profileMenuId = 'topbar-profile-menu';

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        profileRef.current &&
        !profileRef.current.contains(e.target)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on Escape
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setIsProfileOpen(false);
      setIsMobileMenuOpen(false);
      setIsJurisdictionDropdownOpen(false);
    }
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleStateSelect = (stateCode, stateName) => {
    onJurisdictionChange({
      stateCode,
      stateName,
      district:
        stateCode === 'ALL'
          ? 'All Districts'
          : JURISDICTION_OPTIONS.districts[stateCode]?.[0] || 'All Districts',
    });
    setIsJurisdictionDropdownOpen(false);
  };

  const handleDistrictSelect = (districtName) => {
    onJurisdictionChange({
      ...currentJurisdiction,
      district: districtName,
    });
    setIsJurisdictionDropdownOpen(false);
  };

  const getRoleLabel = (role) => ROLE_LABELS[role] || role;

  return (
    <header
      className="bg-white border-b border-slate-200 sticky top-0 z-40 w-full"
      onKeyDown={handleKeyDown}
    >
      {/* ===== DESKTOP HEADER (≥ lg) ===== */}
      <div className="hidden lg:flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[68px] items-center justify-between">
        {/* LEFT: Brand + Jurisdiction */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Logo / Wordmark */}
          <div className="flex flex-col min-w-0">
            <h1 className="text-lg font-bold text-gov-text uppercase tracking-wide leading-tight">
              BHU-DRISHTI
            </h1>
            <p className="text-[11px] text-slate-500 leading-tight hidden sm:block">
              Land Acquisition Intelligence &amp; Decision Control Tower
            </p>
          </div>

          {/* Jurisdiction selector (desktop only) */}
          <div className="hidden lg:block relative">
            <button
              type="button"
              onClick={() =>
                setIsJurisdictionDropdownOpen(!isJurisdictionDropdownOpen)
              }
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gov-text bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gov-primary transition-colors"
              aria-expanded={isJurisdictionDropdownOpen}
              aria-label="Select jurisdiction"
            >
              <MapPin className="w-4 h-4 text-gov-primary shrink-0" />
              <span className="truncate">{currentJurisdiction.stateName}</span>
              {currentJurisdiction.stateCode !== 'ALL' && (
                <span className="text-slate-400 mx-0.5">
                  &rarr; {currentJurisdiction.district}
                </span>
              )}
            </button>

            {isJurisdictionDropdownOpen && (
              <div
                ref={dropdownRef}
                className="absolute left-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-gov-md p-3 z-50"
              >
                <div className="text-[10px] font-mono font-semibold text-slate-400 uppercase mb-2">
                  Select State
                </div>
                {JURISDICTION_OPTIONS.states.map((st) => (
                  <button
                    key={st.code}
                    type="button"
                    onClick={() => handleStateSelect(st.code, st.name)}
                    className={`w-full text-left px-2.5 py-1.5 text-sm rounded-md transition-colors ${
                      currentJurisdiction.stateCode === st.code
                        ? 'bg-teal-50 text-gov-primary font-medium'
                        : 'text-gov-text hover:bg-slate-50'
                    }`}
                  >
                    {st.name}
                  </button>
                ))}
                {currentJurisdiction.stateCode !== 'ALL' && (
                  <>
                    <hr className="my-2 border-slate-200" />
                    <div className="text-[10px] font-mono font-semibold text-slate-400 uppercase mb-2">
                      Select District
                    </div>
                    <div className="grid grid-cols-2 gap-1 max-h-40 overflow-y-auto">
                      {JURISDICTION_OPTIONS.districts[
                        currentJurisdiction.stateCode
                      ].map((dst) => (
                        <button
                          key={dst}
                          type="button"
                          onClick={() => handleDistrictSelect(dst)}
                          className={`px-2 py-1.5 text-xs rounded-md transition-colors ${
                            currentJurisdiction.district === dst
                              ? 'bg-gov-primary text-white font-medium'
                              : 'text-gov-text hover:bg-slate-50'
                          }`}
                        >
                          {dst}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CENTER: Context label (desktop) */}
        <div className="hidden lg:flex items-center gap-2 text-sm font-medium text-slate-600">
          <ShieldCheck className="w-4 h-4 text-gov-primary" />
          <span>National Control Tower</span>
        </div>

        {/* RIGHT: Notifications · Help · User */}
        <div className="flex items-center gap-1">
          {/* Notification button */}
          <button
            type="button"
            className="relative p-2.5 text-slate-400 hover:text-gov-text hover:bg-slate-50 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gov-primary transition-colors"
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span
                className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-600 rounded-full leading-none"
                aria-hidden="true"
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Help button */}
          <button
            type="button"
            className="p-2.5 text-slate-400 hover:text-gov-text hover:bg-slate-50 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gov-primary transition-colors"
            aria-label="Help"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* User profile / dropdown */}
          {currentUser ? (
            <div className="relative ml-1">
              <button
                ref={profileRef}
                type="button"
                id={profileButtonId}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 pl-1.5 pr-2 py-1.5 text-gov-text hover:bg-slate-50 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gov-primary transition-colors"
                aria-haspopup="menu"
                aria-expanded={isProfileOpen}
                aria-controls={isProfileOpen ? profileMenuId : undefined}
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gov-primary text-white font-mono font-bold flex items-center justify-center text-xs shrink-0">
                  {currentUser.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                {/* Name + Role (hidden on small screens) */}
                <div className="hidden md:flex flex-col items-start min-w-0">
                  <span className="text-sm font-medium leading-tight truncate max-w-[160px]">
                    {currentUser.fullName}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 leading-tight">
                    {getRoleLabel(currentUser.role)}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    isProfileOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Desktop profile dropdown */}
              {isProfileOpen && (
                <div
                  id={profileMenuId}
                  role="menu"
                  aria-labelledby={profileButtonId}
                  className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-gov-md py-1 z-50"
                >
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="text-sm font-medium text-gov-text truncate">
                      {currentUser.fullName}
                    </div>
                    <div className="text-xs font-mono text-slate-500 mt-0.5">
                      {currentUser.designation}
                    </div>
                  </div>

                  <button
                    type="button"
                    role="menuitem"
                    className="w-full text-left px-4 py-2.5 text-sm text-gov-text hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    Profile
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="w-full text-left px-4 py-2.5 text-sm text-gov-text hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    Settings
                  </button>
                  <hr className="my-1 border-slate-100" />
                  <button
                    type="button"
                    role="menuitem"
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                    onClick={() => {
                      onLogout();
                      setIsProfileOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenLogin}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-gov-primary rounded-md hover:bg-gov-primary-hover focus-visible:ring-2 focus-visible:ring-gov-primary transition-colors ml-1"
            >
              <User className="w-4 h-4" />
              Login
            </button>
          )}
        </div>
      </div>

      {/* ===== MOBILE HEADER (< lg) ===== */}
      <div className="lg:hidden h-14 flex items-center justify-between px-4">
        {/* Brand compact */}
        <h1 className="text-base font-bold text-gov-text uppercase tracking-wide">
          BHU-DRISHTI
        </h1>

        {/* Mobile icons */}
        <div className="flex items-center gap-1">
          {/* Notification */}
          <button
            type="button"
            className="relative p-2.5 text-slate-400 hover:text-gov-text hover:bg-slate-50 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gov-primary transition-colors"
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span
                className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-600 rounded-full leading-none"
                aria-hidden="true"
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* User / Menu toggle */}
          <button
            type="button"
            className="p-2.5 text-slate-400 hover:text-gov-text hover:bg-slate-50 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gov-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {currentUser ? (
              <div className="w-8 h-8 rounded-full bg-gov-primary text-white font-mono font-bold flex items-center justify-center text-xs">
                {currentUser.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
            ) : (
              <User className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* ===== MOBILE DROPDOWN PANEL ===== */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden bg-white border-b border-slate-200 shadow-gov-md z-30 max-h-[calc(100vh-56px)] overflow-y-auto"
          role="dialog"
          aria-label="User menu"
        >
          <div className="p-4 space-y-4">
            {/* Context */}
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <ShieldCheck className="w-4 h-4 text-gov-primary shrink-0" />
              <span>National Control Tower</span>
            </div>

            {/* Jurisdiction summary */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>
                {currentJurisdiction.stateName}
                {currentJurisdiction.stateCode !== 'ALL'
                  ? `, ${currentJurisdiction.district}`
                  : ''}
              </span>
            </div>

            {/* User info */}
            {currentUser && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gov-primary text-white font-mono font-bold flex items-center justify-center text-sm shrink-0">
                    {currentUser.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-gov-text truncate">
                      {currentUser.fullName}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">
                      {currentUser.designation}
                    </div>
                    <div className="text-[10px] font-mono text-gov-primary font-semibold mt-0.5">
                      {getRoleLabel(currentUser.role)}
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                <button
                  type="button"
                  className="w-full text-left px-3 py-2.5 text-sm text-gov-text hover:bg-slate-50 rounded-lg flex items-center gap-2.5 min-h-[44px] transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="w-4 h-4 text-slate-400" />
                  Profile
                </button>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2.5 text-sm text-gov-text hover:bg-slate-50 rounded-lg flex items-center gap-2.5 min-h-[44px] transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  Settings
                </button>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2.5 min-h-[44px] transition-colors"
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}

            {/* Login for guests */}
            {!currentUser && (
              <button
                type="button"
                onClick={() => {
                  onOpenLogin();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center px-3 py-2.5 text-sm font-medium text-white bg-gov-primary hover:bg-gov-primary-hover rounded-lg min-h-[44px] transition-colors"
              >
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

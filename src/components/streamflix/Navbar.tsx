import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState, useDeferredValue } from "react";
import { Search, ChevronDown, LogOut, Settings, Menu, X, Users, Clock, Bookmark, Compass, BarChart3} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "./Logo";
import { auth, db } from "@/lib/firebase";
import { signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { fetchSearch } from "@/lib/api/tmdb";
import { MOVIE_SORT_OPTIONS, PAGED_LIST_SIZE } from "@/lib/constants";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const u = auth.currentUser;
  const [selectedProfile, setSelectedProfile] = useState<{
    id: string;
    name: string;
    color: string;
    avatarUrl?: string;
    kids?: boolean;
  } | null>(null);
  const [userData, setUserData] = useState<{ email: string | null; photoURL: string | null }>({
    email: u?.email ?? null,
    photoURL: u?.photoURL ?? null,
  });
  const [isVip, setIsVip] = useState(() => {
    try { return localStorage.getItem("sf:vip") === "1"; } catch { return false; }
  });
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const searchKind = useRouterState({
    select: (s) => (s.location.search as { kind?: string } | undefined)?.kind ?? "home",
  });
  const router = useRouter();

  const [searchQ, setSearchQ] = useState("");
  const deferredSearchQ = useDeferredValue(searchQ.trim());
  const [searchFocused, setSearchFocused] = useState(false);
  const searchBlurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchBoxRef = useRef<HTMLDivElement | null>(null);

  const { data: searchSuggestions = [], isFetching } = useQuery({
    queryKey: ["search_suggestions", deferredSearchQ],
    queryFn: async () => {
      const search = await fetchSearch({
        data: {
          q: deferredSearchQ,
          page: 1,
          per_page: PAGED_LIST_SIZE.SEARCH_SUGGGESTION,
          sort: MOVIE_SORT_OPTIONS.POPULAR,
        },
      });
      return search?.results || [];
    },
    // Only fetch if the deferred string matches minimum length requirements
    enabled: deferredSearchQ.length >= 2,
    staleTime: 30 * 1000, 
  });
  const isTypingOrLoading = isFetching || searchQ.trim() !== deferredSearchQ;

  const submitSearch = (value?: string) => {
    const q = (value ?? searchQ).trim();
    setSearchFocused(false);
    setSearchQ("");
    if (!q) return;
    router.navigate({ to: "/search", search: { q } });
  };

  const openSearch = () => {
    if (searchBlurTimer.current) clearTimeout(searchBlurTimer.current);
    setSearchFocused(true);
  };

  const closeSearchSoon = () => {
    if (searchBlurTimer.current) clearTimeout(searchBlurTimer.current);
    searchBlurTimer.current = setTimeout(() => setSearchFocused(false), 150);
  };

  useEffect(
    () => () => {
      if (searchBlurTimer.current) clearTimeout(searchBlurTimer.current);
    },
    [],
  );

  const loadProfile = () => {
    try {
      const raw = localStorage.getItem("sf:selectedProfile");
      if (raw) {
        const p = JSON.parse(raw);
        setSelectedProfile(p);
      } else {
        setSelectedProfile(null);
      }
    } catch {
      setSelectedProfile(null);
    }
  };

  useEffect(() => {
    loadProfile();
    window.addEventListener("storage", loadProfile);
    window.addEventListener("profileChanged", loadProfile);
    return () => {
      window.removeEventListener("storage", loadProfile);
      window.removeEventListener("profileChanged", loadProfile);
    };
  }, []);

  useEffect(() => {
    if (!u?.uid) { setIsVip(false); try { localStorage.removeItem("sf:vip"); } catch {} return; }
    getDoc(doc(db, "vip", u.uid)).then((snap) => {
      const v = snap.exists();
      setIsVip(v);
      try { localStorage.setItem("sf:vip", v ? "1" : "0"); } catch {}
    }).catch(() => {});
  }, [u?.uid]);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    if (!u) return;
    const unsub = onSnapshot(doc(db, "profiles", u.uid), (snap) => {
      const data = snap.data();
      setUserData({
        email: u.email ?? null,
        photoURL: data?.avatar_url || u.photoURL || null,
      });
    });
    return unsub;
  }, [u]);

  const signOut = async () => {
    await firebaseSignOut(auth);
    toast.success("Signed out");
    router.navigate({ to: "/auth", replace: true });
  };

  const vipRing = isVip ? "ring-2 ring-yellow-400 ring-offset-2 ring-offset-background" : "";

  const profileAvatar = selectedProfile ? (
    selectedProfile.avatarUrl ? (
      <img
        src={selectedProfile.avatarUrl}
        alt=""
        className={`size-9 sm:size-8 shrink-0 aspect-square rounded-lg object-cover ${vipRing}`}
      />
    ) : (
      <div
        className={`grid size-9 sm:size-8 place-items-center rounded-lg bg-gradient-to-br ${selectedProfile.color} text-xs font-bold text-white ${vipRing}`}
      >
        {selectedProfile.name[0]?.toUpperCase()}
      </div>
    )
  ) : userData.photoURL ? (
    <img
      src={userData.photoURL}
      alt=""
      className={`size-9 sm:size-8 shrink-0 aspect-square rounded-lg object-cover ${vipRing}`}
    />
  ) : (
    <div className={`grid size-9 sm:size-8 place-items-center rounded-lg bg-gradient-to-br from-rose-500 to-red-700 text-xs font-bold text-white ${vipRing}`}>
      {(userData.email || "?")[0]?.toUpperCase()}
    </div>
  );

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 wco-aware transition-colors duration-300 ${
        scrolled
          ? "bg-background/55 backdrop-blur-md"
          : "bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 items-center gap-6 px-4 sm:px-8">
        <Logo />
        <nav className="hidden md:flex items-center gap-5 text-sm text-muted-foreground">
           <Link
            to="/"
            preload="intent"
            className={`hover:text-foreground transition-colors ${pathname.startsWith("/") ? "text-foreground font-semibold" : ""}`}
          >
            Home
          </Link>
          <Link
            to="/movies"
            preload="intent"
            className={`hover:text-foreground transition-colors ${pathname.startsWith("/movies") ? "text-foreground font-semibold" : ""}`}
          >
            Movies
          </Link>
          <Link
            to="/collections/genres"
            preload="intent"
            className={`hover:text-foreground transition-colors ${pathname.startsWith("/collections/genres") ? "text-foreground font-semibold" : ""}`}
          >
            Genres
          </Link>
          <Link
            to="/collections/series"
            preload="intent"
            className={`hover:text-foreground transition-colors ${pathname.startsWith("/collections/series") ? "text-foreground font-semibold" : ""}`}
          >
            Series
          </Link>
          <Link
            to="/collections/actresses"
            preload="intent"
            className={`hover:text-foreground transition-colors ${pathname.startsWith("/collections/actresses") ? "text-foreground font-semibold" : ""}`}
          >
            Actresses
          </Link>
          <Link
            to="/collections/studios"
            preload="intent"
            className={`hover:text-foreground transition-colors ${pathname.startsWith("/collections/studios") ? "text-foreground font-semibold" : ""}`}
          >
            Studios
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={() => setMobileNavOpen((v) => !v)}
            className="md:hidden text-muted-foreground hover:text-foreground" aria-label="Toggle navigation"
          >
            {mobileNavOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
          <div className="relative hidden md:block" ref={searchBoxRef}>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              onFocus={openSearch}
              onBlur={closeSearchSoon}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitSearch();
                if (e.key === "Escape") {
                  setSearchFocused(false);
                  setSearchQ("");
                }
              }}
              placeholder="Search…"
              aria-label="Search"
              className="h-9 w-44 rounded-full border border-border bg-background/40 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:w-60 focus:border-primary/60 focus:bg-background/70"
            />
            {searchFocused && searchQ.trim().length >= 2 && (
            <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-card/95 shadow-2xl backdrop-blur animate-fade-in">
              <ul className="max-h-72 overflow-y-auto py-1">
                
                {/* 🟢 Using Native State Indicators */}
                {isTypingOrLoading ? (
                  <li className="px-3 py-2 text-sm text-muted-foreground animate-pulse">Searching…</li>
                ) : searchSuggestions.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-muted-foreground">No matches found</li>
                ) : (
                  searchSuggestions.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSearchFocused(false);
                          setSearchQ("");
                          router.navigate({ to: "/movies/$id", params: { id: s.id } });
                        }}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-accent"
                      >
                        {s.poster ? (
                          <img src={s.poster} alt="" className="size-8 shrink-0 rounded object-cover" />
                        ) : (
                          <span className="grid size-8 shrink-0 place-items-center rounded bg-muted text-[10px] font-semibold text-muted-foreground">
                            MOV
                          </span>
                        )}
                        <span className="truncate">{s.title}</span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    submitSearch();
                  }}
                  className="flex w-full items-center justify-center gap-2 border-t border-border px-3 py-2 text-sm font-semibold text-primary hover:bg-accent"
                >
                  <Search className="size-4" /> See all results
                </button>
              </div>
            )}
          </div>
          <Link
            to="/search"
            className="md:hidden inline-flex items-center justify-center text-muted-foreground hover:text-foreground" aria-label="Search"
          >
            <Search className="size-5" />
          </Link>
          <div className="relative pr-1 sm:pr-0">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-1.5 group p-1 sm:p-0" aria-label="Account menu"
            >
              {profileAvatar}
              <ChevronDown
                className={`size-4 text-muted-foreground transition-transform ${menuOpen ? "rotate-180" : ""}`}
              />
            </button>
            {menuOpen && (
              <div
                className="fixed sm:absolute right-4 left-4 sm:left-auto sm:right-0 top-16 sm:top-12 z-50 sm:w-72 overflow-hidden rounded-2xl sm:rounded-xl border border-border bg-card/95 backdrop-blur shadow-2xl animate-fade-in"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                  {profileAvatar}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {selectedProfile?.name ?? userData.email ?? "Account"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {selectedProfile?.kids ? "Kids profile" : (userData.email ?? "Signed in")}
                    </p>
                  </div>
                </div>
                <div className="py-1">
                  <Link
                      to="/profiles"
                      preload={false}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-accent"
                    >
                      <Users className="size-4 text-muted-foreground" /> Switch Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-accent"
                  >
                    <Settings className="size-4 text-muted-foreground" /> Account & Devices
                  </Link>
                  <Link
                    to="/history"
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-accent"
                  >
                    <Clock className="size-4 text-muted-foreground" /> Watch History
                  </Link>
                  <Link
                    to="/mylist"
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-accent"
                  >
                    <Bookmark className="size-4 text-muted-foreground" /> My List
                  </Link>
                  <Link
                    to="/stats"
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-accent"
                  >
                    <BarChart3 className="size-4 text-muted-foreground" /> Stats
                  </Link>
                </div>
                <div className="border-t border-border py-1">
                  <button
                    onClick={signOut}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <LogOut className="size-4" /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {mobileNavOpen && (
        <div className="md:hidden mx-4 mb-4 rounded-2xl border border-border bg-background/95 backdrop-blur py-4 px-4 animate-fade-in shadow-2xl pb-[env(safe-area-inset-bottom)]">
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Browse
          </p>
          <div className="space-y-1">
            <Link
              to="/"
              preload="intent"
              onClick={() => setMobileNavOpen(false)}
              className={`flex items-center gap-3 rounded-md px-2 py-2.5 text-sm transition-colors ${
                pathname.startsWith("/")
                  ? "bg-accent text-foreground font-semibold"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              }`}
            >
              <Compass className="size-4 text-muted-foreground" /> Home
            </Link>
            <Link
              to="/movies"
              preload="intent"
              onClick={() => setMobileNavOpen(false)}
              className={`flex items-center gap-3 rounded-md px-2 py-2.5 text-sm transition-colors ${
                pathname.startsWith("/movies")
                  ? "bg-accent text-foreground font-semibold"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              }`}
            >
              <Compass className="size-4 text-muted-foreground" /> Movies
            </Link>
            <Link
              to="/collections/genres"
              preload="intent"
              onClick={() => setMobileNavOpen(false)}
              className={`flex items-center gap-3 rounded-md px-2 py-2.5 text-sm transition-colors ${
                pathname.startsWith("/genres")
                  ? "bg-accent text-foreground font-semibold"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              }`}
            >
              <Compass className="size-4 text-muted-foreground" /> Genres
            </Link>            
            <Link
              to="/collections/series"
              preload="intent"
              onClick={() => setMobileNavOpen(false)}
              className={`flex items-center gap-3 rounded-md px-2 py-2.5 text-sm transition-colors ${
                pathname.startsWith("/series")
                  ? "bg-accent text-foreground font-semibold"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              }`}
            >
              <Compass className="size-4 text-muted-foreground" /> Series
            </Link>
             <Link
              to="/collections/actresses"
              preload="intent"
              onClick={() => setMobileNavOpen(false)}
              className={`flex items-center gap-3 rounded-md px-2 py-2.5 text-sm transition-colors ${
                pathname.startsWith("/collections/actresses")
                  ? "bg-accent text-foreground font-semibold"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              }`}
            >
              <Compass className="size-4 text-muted-foreground" /> Actresses
            </Link>
             <Link
              to="/collections/studios"
              preload="intent"
              onClick={() => setMobileNavOpen(false)}
              className={`flex items-center gap-3 rounded-md px-2 py-2.5 text-sm transition-colors ${
                pathname.startsWith("/collections/studios")
                  ? "bg-accent text-foreground font-semibold"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              }`}
            >
              <Compass className="size-4 text-muted-foreground" /> Studios
            </Link>
          </div>
        </div>
      )}      
    </header>
  );
}

import { useEffect, useMemo, useState } from "react";
import { tg, isTelegram, getUser, expand } from "./telegram";

type Profile = {
  displayName: string;
  bio: string;
  interests: string[];
  genres: string[];
  artists: string[];
  updatedAt: number;
};

const PROFILE_KEY = "ascend_profile_v1";

function parseTags(input: string): string[] {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 50);
}

function tagsToString(tags: string[]) {
  return tags.join(", ");
}

function loadProfile(fallbackName: string): Profile {
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) {
    return {
      displayName: fallbackName,
      bio: "",
      interests: [],
      genres: [],
      artists: [],
      updatedAt: Date.now(),
    };
  }
  try {
    const p = JSON.parse(raw) as Partial<Profile>;
    return {
      displayName: p.displayName ?? fallbackName,
      bio: p.bio ?? "",
      interests: Array.isArray(p.interests) ? p.interests : [],
      genres: Array.isArray(p.genres) ? p.genres : [],
      artists: Array.isArray(p.artists) ? p.artists : [],
      updatedAt: typeof p.updatedAt === "number" ? p.updatedAt : Date.now(),
    };
  } catch {
    return {
      displayName: fallbackName,
      bio: "",
      interests: [],
      genres: [],
      artists: [],
      updatedAt: Date.now(),
    };
  }
}

function saveProfile(profile: Profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export default function App() {
  const user = getUser();

  const fallbackName = useMemo(() => {
    const tgName =
      [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
      user?.username ||
      "User";
    return tgName;
  }, [user?.first_name, user?.last_name, user?.username]);

  const [profile, setProfile] = useState<Profile>(() => ({
    displayName: "User",
    bio: "",
    interests: [],
    genres: [],
    artists: [],
    updatedAt: Date.now(),
  }));

  const [interestsInput, setInterestsInput] = useState("");
  const [genresInput, setGenresInput] = useState("");
  const [artistsInput, setArtistsInput] = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    if (isTelegram()) {
      tg.ready();
      tg.expand();
    }

    const loaded = loadProfile(fallbackName);
    setProfile(loaded);
    setInterestsInput(tagsToString(loaded.interests));
    setGenresInput(tagsToString(loaded.genres));
    setArtistsInput(tagsToString(loaded.artists));
  }, [fallbackName]);

  function onSave() {
    const next: Profile = {
      ...profile,
      interests: parseTags(interestsInput),
      genres: parseTags(genresInput),
      artists: parseTags(artistsInput),
      updatedAt: Date.now(),
    };
    setProfile(next);
    saveProfile(next);
    setSavedMsg("Saved ✅");
    window.setTimeout(() => setSavedMsg(""), 1500);
  }

  if (!isTelegram()) {
    return (
      <div className="container">
        <h2>Running outside Telegram (dev mode)</h2>
        <div className="card muted">
          Profile editor works here too (saved in your browser localStorage).
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Ascend</h1>

      <div className="card">
        <div>
          <b>Username:</b> @{user?.username || "unknown"}
        </div>
        <div>
          <b>User ID:</b> {user?.id}
        </div>
      </div>

      <div className="card">
        <h3>My profile</h3>

        <label className="label">
          Display name
          <input
            className="input"
            value={profile.displayName}
            onChange={(e) =>
              setProfile((p) => ({ ...p, displayName: e.target.value }))
            }
            placeholder="Your name"
          />
        </label>

        <label className="label">
          Bio
          <textarea
            className="input textarea"
            value={profile.bio}
            onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
            placeholder="A few words about you…"
          />
        </label>

        <label className="label">
          Interests (comma separated)
          <input
            className="input"
            value={interestsInput}
            onChange={(e) => setInterestsInput(e.target.value)}
            placeholder="rap, gym, design, anime"
          />
        </label>

        <label className="label">
          Favorite genres (comma separated)
          <input
            className="input"
            value={genresInput}
            onChange={(e) => setGenresInput(e.target.value)}
            placeholder="hip-hop, indie, techno"
          />
        </label>

        <label className="label">
          Top artists (comma separated)
          <input
            className="input"
            value={artistsInput}
            onChange={(e) => setArtistsInput(e.target.value)}
            placeholder="Travis Scott, The Weeknd, Kendrick Lamar"
          />
        </label>

        <div className="row">
          <button onClick={onSave}>Save profile</button>
          <div className="saved">{savedMsg}</div>
        </div>

        <div className="mini muted">
          Saved locally for now. Later we’ll store profiles on the server.
        </div>
      </div>

      <button onClick={expand}>Expand</button>
    </div>
  );
}

import { getRelativeLocaleUrl } from "astro:i18n";
import { getCollection, type CollectionEntry } from "astro:content";
import {
  dateLocales,
  defaultLocale,
  locales,
  ui,
  type Locale,
  type UiKey,
} from "./ui";

export { dateLocales, defaultLocale, locales, type Locale, type UiKey };

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getLocaleFromUrl(url: URL): Locale {
  const base = import.meta.env.BASE_URL;
  const basePath = base.endsWith("/") ? base.slice(0, -1) : base;
  let pathname = url.pathname;
  if (basePath && pathname.startsWith(basePath)) {
    pathname = pathname.slice(basePath.length) || "/";
  }
  const [, maybeLocale] = pathname.split("/");
  if (maybeLocale && isLocale(maybeLocale)) {
    return maybeLocale;
  }
  return defaultLocale;
}

export function t(locale: Locale, key: UiKey): string {
  return ui[locale][key] ?? ui[defaultLocale][key];
}

/** Locale-aware path helper that respects Astro `base`. */
export function localePath(locale: Locale, path = ""): string {
  const normalized = path.replace(/^\/+|\/+$/g, "");
  return getRelativeLocaleUrl(locale, normalized);
}

export function alternateLocale(locale: Locale): Locale {
  return locale === "en" ? "zh-Hant" : "en";
}

/** Astro normalizes content slugs to lowercase (e.g. zh-Hant → zh-hant). */
export function contentLocaleKey(locale: Locale): string {
  return locale.toLowerCase();
}

export function getProjectRouteSlug(
  project: CollectionEntry<"projects">,
): string {
  const fromData = project.data.projectSlug;
  if (fromData) return fromData;
  const fromSlug = project.slug.replace(/\.md$/i, "").split("/").pop();
  const fromId = project.id.replace(/\.md$/i, "").split("/").pop();
  return fromSlug || fromId || project.id;
}

function entryMatchesLocale(
  entry: { id: string; slug: string },
  locale: Locale,
): boolean {
  const key = contentLocaleKey(locale);
  const id = entry.id.replace(/\\/g, "/").replace(/\.md$/i, "");
  const slug = entry.slug.replace(/\\/g, "/").replace(/\.md$/i, "");

  return (
    slug === key ||
    slug.startsWith(`${key}/`) ||
    id === locale ||
    id === key ||
    id.startsWith(`${locale}/`) ||
    id.startsWith(`${key}/`)
  );
}

export async function getLocalizedProjects(
  locale: Locale,
): Promise<CollectionEntry<"projects">[]> {
  const projects = await getCollection("projects", (entry) =>
    entryMatchesLocale(entry, locale),
  );
  return projects.sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime(),
  );
}

export async function getLocalizedProject(
  locale: Locale,
  slug: string,
): Promise<CollectionEntry<"projects"> | undefined> {
  const projects = await getLocalizedProjects(locale);
  return projects.find((project) => getProjectRouteSlug(project) === slug);
}

type PageCollection =
  | "home-page"
  | "experience-page"
  | "stack-page"
  | "contact-page";

export async function getLocalizedPage<C extends PageCollection>(
  collection: C,
  locale: Locale,
): Promise<CollectionEntry<C>> {
  const entries = await getCollection(collection);
  const entry = entries.find((item) => entryMatchesLocale(item, locale));
  if (!entry) {
    const available = entries
      .map(
        (item) =>
          `${item.id} (slug=${item.slug}, file=${item.filePath ?? "?"})`,
      )
      .join("; ");
    throw new Error(
      `Missing ${collection} content for locale "${locale}". Available: ${available || "(none)"}`,
    );
  }
  return entry as CollectionEntry<C>;
}

export function buildAlternateUrls(
  _locale: Locale,
  path = "",
): { locale: Locale; href: string }[] {
  return locales.map((loc) => ({
    locale: loc,
    href: localePath(loc, path),
  }));
}

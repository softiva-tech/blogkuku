"use client";

import { useCallback, useState } from "react";

type ShareBarProps = {
  url: string;
  title: string;
  description?: string | null;
  /** Site Instagram profile (admin Settings). Instagram has no web “share article” URL; this opens your profile. */
  siteInstagramUrl?: string | null;
};

const pill =
  "inline-flex items-center justify-center rounded-full border border-ink-600/90 bg-transparent px-4 py-1.5 text-sm text-ink-300 transition hover:border-ember-500/45 hover:text-ink-100";

export function ShareBar({
  url,
  title,
  description,
  siteInstagramUrl,
}: ShareBarProps) {
  const [copied, setCopied] = useState(false);

  const shareNative = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: description ?? undefined,
          url,
        });
      } catch {
        /* user cancelled */
      }
    }
  }, [description, title, url]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [url]);

  const enc = encodeURIComponent;

  const twitter = `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`;
  const linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`;
  const whatsappText = `${title}\n${url}`;
  const whatsapp = `https://api.whatsapp.com/send?text=${enc(whatsappText)}`;
  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`;

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-ink-800 pt-8">
      <span className="text-xs font-medium uppercase tracking-[0.2em] text-ink-400">
        Share
      </span>
      {typeof navigator !== "undefined" && "share" in navigator ? (
        <button type="button" onClick={shareNative} className={pill}>
          Share…
        </button>
      ) : null}
      <button type="button" onClick={copy} className={pill}>
        {copied ? "Copied!" : "Copy link"}
      </button>
      <a href={twitter} target="_blank" rel="noopener noreferrer" className={pill}>
        X / Twitter
      </a>
      <a href={linkedin} target="_blank" rel="noopener noreferrer" className={pill}>
        LinkedIn
      </a>
      <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={pill}>
        WhatsApp
      </a>
      <a href={facebook} target="_blank" rel="noopener noreferrer" className={pill}>
        Facebook
      </a>
      {siteInstagramUrl ? (
        <a
          href={siteInstagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={pill}
          title="Open our Instagram"
        >
          Instagram
        </a>
      ) : null}
    </div>
  );
}

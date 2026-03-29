import { SITE_NAME } from "@/lib/site";

const gold = "text-[#FFD700]";

/**
 * Renders {@link SITE_NAME} with the first letter of each word in yellow/gold
 * (e.g. N, Q, P for “Never Quit Punjabi”).
 */
export function BrandTitle({ className }: { className?: string }) {
  const words = SITE_NAME.trim().split(/\s+/);
  return (
    <span className={className} translate="no">
      {words.map((word, i) => (
        <span key={`${i}-${word}`}>
          {i > 0 ? " " : null}
          {word.length > 0 ? (
            <>
              <span className={gold}>{word[0]}</span>
              {word.slice(1)}
            </>
          ) : null}
        </span>
      ))}
    </span>
  );
}

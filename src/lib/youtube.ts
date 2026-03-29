export function getYouTubeEmbedUrl(input: string | null | undefined): string | null {
  if (!input?.trim()) return null;
  const url = input.trim();

  const watch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watch?.[1]) return `https://www.youtube-nocookie.com/embed/${watch[1]}`;

  const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (short?.[1]) return `https://www.youtube-nocookie.com/embed/${short[1]}`;

  const embed = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embed?.[1]) return `https://www.youtube-nocookie.com/embed/${embed[1]}`;

  return null;
}

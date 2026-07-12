export const seasons = [
  { number: 1, name: "Connect Four Across America", video: "oZSUxdzgA08", playlist: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC7z1fCZetTI8TPeLlgagF9v" },
  { number: 2, name: "Circumnavigation", video: "Gta43oOV4Ag", playlist: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC7rGYl6StHarkLlgeZX66oL" },
  { number: 3, name: "Tag Eur It", video: "q2tJqO6nCSc", playlist: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC5B-l2FQNOPJVFpqF0QVxfG" },
  { number: 4, name: "Battle 4 America", video: "E0ejkkFT3V0", playlist: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC7ogXbMvwuBSfj3LHVRCqLc" },
  { number: 5, name: "Race To The End Of The World", video: "LxLgmsmvXOE", playlist: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC4SeH7qNw05wgU03HlRGiiS" },
  { number: 6, name: "Capture The Flag Across Japan", video: "8ZM_hPF1hsY", playlist: "https://www.youtube.com/watch?v=8ZM_hPF1hsY&list=UULFxkM67T_Iele-mRVUiBkRqg" },
  { number: 7, name: "Tag Eur It 2", video: "IV1dbqcg9bI", playlist: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC6wkQRczVE4Fz-4kUOIc3d1" },
  { number: 8, name: "Arctic Escape", video: "Qfb9eVgksms", playlist: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC6zyXJyImHgVdrC4Vl8SNG9" },
  { number: 9, name: "Hide + Seek", video: "E8UmTJVDnUI", playlist: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC7gTO_IVdiBv8nVPLKbqNa4" },
  { number: 10, name: "AU$TRALIA", video: "rNxi1-UgV2I", playlist: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC4dhXkpNzUVsGFZp72v0UqL" },
  { number: 11, name: "Tag Eur It 3", video: "hsoiHKaqG2s", playlist: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC56V3DHxfFVTMDzera__IFi" },
  { number: 12, name: "Hide + Seek: Japan", video: "PHjkSKQSzv4", playlist: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC79KvPUh76PhFZ8x7q18hOW" },
  { number: 13, name: "Schengen Showdown", video: "EJFAw1VRcsA", playlist: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC64gYhvs3PyyM_fRKpjq1l0" },
  { number: 13.5, name: "Hide and Seek Across NYC", video: "Zftv6Kh2zi4", playlist: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC5aiPqLOh4v2mGGxm2_gmu6" },
  { number: 14, name: "SnaKe", video: "eZVun8Iwq4U", playlist: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC4ZwbTbCqICVjsZbgn80SaK" },
  { number: 15, name: "Tag: All Stars", video: "QbXzfSn-jP4", playlist: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC7X7UoXDLnT8pPbAH6a45jM" },
  { number: 16, name: "Hide & Seek: U.K.", video: "giE5-sKMa4Q", playlist: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC5V7encRbWQdst2keI78jyL" },
  { number: 17, name: "Taiwan Rail Rush", video: "QUGHPuUU5FA", playlist: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC7lbptiTx9d-eQLZuYvHeBm" },
  { number: 18, name: "Stateside Scramble", video: "ozik7Ba4gkU", playlist: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC4gFeZSxp55tgVXo4tJCsrv" },
] as const;

export type Season = (typeof seasons)[number];

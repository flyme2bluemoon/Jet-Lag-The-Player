export const seasons = [
  { number: 1, name: "Connect Four Across America", playlist: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC7z1fCZetTI8TPeLlgagF9v" },
  { number: 2, name: "Circumnavigation", playlist: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC7rGYl6StHarkLlgeZX66oL" },
  { number: 3, name: "Tag Eur It", playlist: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC5B-l2FQNOPJVFpqF0QVxfG" },
  { number: 4, name: "Battle 4 America", playlist: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC7ogXbMvwuBSfj3LHVRCqLc" },
  { number: 5, name: "Race To The End Of The World", playlist: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC4SeH7qNw05wgU03HlRGiiS" },
  { number: 6, name: "Capture The Flag Across Japan", playlist: "https://www.youtube.com/watch?v=8ZM_hPF1hsY&list=UULFxkM67T_Iele-mRVUiBkRqg" },
  { number: 7, name: "Tag Eur It 2", playlist: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC6wkQRczVE4Fz-4kUOIc3d1" },
  { number: 8, name: "Arctic Escape", playlist: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC6zyXJyImHgVdrC4Vl8SNG9" },
  { number: 9, name: "Hide + Seek", playlist: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC7gTO_IVdiBv8nVPLKbqNa4" },
  { number: 10, name: "AU$TRALIA", playlist: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC4dhXkpNzUVsGFZp72v0UqL" },
  { number: 11, name: "Tag Eur It 3", playlist: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC56V3DHxfFVTMDzera__IFi" },
  { number: 12, name: "Hide + Seek: Japan", playlist: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC79KvPUh76PhFZ8x7q18hOW" },
  { number: 13, name: "Schengen Showdown", playlist: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC64gYhvs3PyyM_fRKpjq1l0" },
  { number: 13.5, name: "Hide and Seek Across NYC", playlist: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC5aiPqLOh4v2mGGxm2_gmu6" },
  { number: 14, name: "SnaKe", playlist: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC4ZwbTbCqICVjsZbgn80SaK" },
  { number: 15, name: "Tag: All Stars", playlist: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC7X7UoXDLnT8pPbAH6a45jM" },
  { number: 16, name: "Hide & Seek: U.K.", playlist: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC5V7encRbWQdst2keI78jyL" },
  { number: 17, name: "Taiwan Rail Rush", playlist: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC7lbptiTx9d-eQLZuYvHeBm" },
  { number: 18, name: "Stateside Scramble", playlist: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC4gFeZSxp55tgVXo4tJCsrv" },
] as const;

export type Season = (typeof seasons)[number];

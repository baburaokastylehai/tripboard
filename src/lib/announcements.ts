export interface Announcement {
  id: string;
  date: string; // YYYY-MM-DD
  text: string;
}

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'whatsapp-notify',
    date: '2026-03-16',
    text: "new: get trip updates on whatsapp — tap 'notify me' in the header",
  },
];

export const LATEST_ANNOUNCEMENT_DATE = ANNOUNCEMENTS[0]?.date ?? '';

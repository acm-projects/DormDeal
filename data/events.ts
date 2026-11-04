// what one calendar entry looks like
// what one calendar entry looks like
export type CalEvent = {
    id: string;
    date: string;            // 'YYYY-MM-DD'
    title: string;
    time: string;
    place: string;
    type: 'event' | 'pickup';
    borrow?: string[];       // things people might borrow for it (optional)
};

// sample events for now, swap for real UTD events later
// pickups live on items.ts now, so they're not listed here
export const events: CalEvent[] = [
    { id: 'e2', date: '2026-10-31', title: 'Halloween Costume Swap', time: '6:00 PM', place: 'Student Union', type: 'event', borrow: ['Costumes', 'Face paint', 'Props'] },
    { id: 'e4', date: '2026-11-07', title: 'Diwali Night', time: '7:00 PM', place: 'Plinth', type: 'event', borrow: ['Kurtas', 'Lehengas', 'Jhumkas', 'Diyas'] },
    { id: 'e5', date: '2026-11-12', title: 'Career Fair', time: '10:00 AM', place: 'Activity Center', type: 'event', borrow: ['Blazers', 'Padfolios', 'Ties'] },
    { id: 'e6', date: '2026-11-21', title: 'Friendsgiving Potluck', time: '6:30 PM', place: 'Residence Hall Commons', type: 'event', borrow: ['Slow cookers', 'Folding tables', 'Serving trays'] },
];
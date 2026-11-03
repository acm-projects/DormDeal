export type Item = {
    id: string;
    title: string;
    seller: string;
    initials: string;
    price: string;
    condition: string;
    category: string;
    description: string;
    pickup: string;
    posted: string;
    pickupDate: string;   // 'YYYY-MM-DD', shows up on the calendar
    pickupTime: string;
};

// fake items for now, later these come from the backend
export const items: Item[] = [
    {
        id: '1',
        title: 'Mini fridge, 3.1 cu ft',
        seller: 'Alex R.',
        initials: 'AR',
        price: '$60',
        condition: 'Like new',
        category: 'Appliances',
        description: 'Kept it in my dorm for one semester. Freezer works, super quiet, fits under a lofted bed.',
        pickup: 'West Hall lobby',
        posted: '5 hours ago',
        pickupDate: '2026-11-03',
        pickupTime: '11:00 AM',
    },
    {
        id: '2',
        title: 'Desk lamp',
        seller: 'Jordan M.',
        initials: 'JM',
        price: '$12',
        condition: 'Good',
        category: 'Dorm decor',
        description: 'Adjustable arm, three brightness levels, bulb included. Moving rooms so it needs to go.',
        pickup: 'Helix Hall lobby',
        posted: '2 hours ago',
        pickupDate: '2026-11-05',
        pickupTime: '5:30 PM',
    },
    {
        id: '3',
        title: 'Twin XL sheets',
        seller: 'Priya S.',
        initials: 'PS',
        price: '$15',
        condition: 'Like new',
        category: 'Bedding',
        description: 'Full set: fitted sheet, flat sheet and two pillowcases. Washed and folded.',
        pickup: 'Student Union',
        posted: '1 day ago',
        pickupDate: '2026-11-16',
        pickupTime: '2:00 PM',
    },
];
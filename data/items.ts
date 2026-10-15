// what every item has
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
    },
];
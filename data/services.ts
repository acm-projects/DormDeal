// what one service looks like
export type Service = {
    id: string;
    title: string;
    provider: string;
    initials: string;
    rate: string;        // the number part, like '$20'
    rateUnit: string;    // what the rate is per, like '/hr' or '/session'
    category: string;
    icon: string;        // Ionicons name shown on the card and page header
    description: string;
    availability: string;
    location: string;
    responseTime: string;
    posted: string;
};

// fake services for now, later these come from the backend
export const services: Service[] = [
    {
        id: '1',
        title: 'Calculus I & II tutoring',
        provider: 'Priya S.',
        initials: 'PS',
        rate: '$20',
        rateUnit: '/hr',
        category: 'Tutoring',
        icon: 'school-outline',
        description: 'Math major, aced both. I go over homework, quiz prep, and the stuff your professor skipped. Bring your notes and questions.',
        availability: 'Mon–Thu evenings',
        location: 'McDermott Library or online',
        responseTime: 'Usually within an hour',
        posted: '2 days ago',
    },
    {
        id: '2',
        title: 'Move-in / move-out help',
        provider: 'Jordan T.',
        initials: 'JT',
        rate: '$25',
        rateUnit: '/hr',
        category: 'Moving',
        icon: 'cube-outline',
        description: 'Two of us with a hand truck. We can carry boxes, mini fridges, and furniture between dorms or to your car.',
        availability: 'Weekends',
        location: 'Any campus residence hall',
        responseTime: 'Same day',
        posted: '1 week ago',
    },
    {
        id: '3',
        title: 'Laptop cleanup & setup',
        provider: 'Marcus L.',
        initials: 'ML',
        rate: '$15',
        rateUnit: '/session',
        category: 'Tech help',
        icon: 'laptop-outline',
        description: 'Slow laptop? I clear junk, set up backups, install class software, and get you on campus Wi-Fi and printing.',
        availability: 'Tue & Thu afternoons',
        location: 'Student Union',
        responseTime: 'Within a few hours',
        posted: '3 days ago',
    },
    {
        id: '4',
        title: 'Resume & cover letter review',
        provider: 'Aisha K.',
        initials: 'AK',
        rate: '$10',
        rateUnit: '/review',
        category: 'Career',
        icon: 'document-text-outline',
        description: 'I interned at two tech companies and review resumes for my org. Send it over and get line-by-line comments in 48 hours.',
        availability: 'Anytime (async)',
        location: 'Online',
        responseTime: 'Within a day',
        posted: '5 days ago',
    },
    {
        id: '5',
        title: 'Bike tune-up & flat repair',
        provider: 'Diego R.',
        initials: 'DR',
        rate: '$12',
        rateUnit: '/fix',
        category: 'Repairs',
        icon: 'bicycle-outline',
        description: 'Flats, brakes, chain, and gear adjustments. Parts extra if needed, I will tell you before buying anything.',
        availability: 'Wed & Fri, 3–6 PM',
        location: 'Bike racks by the Sciences Building',
        responseTime: 'Usually same day',
        posted: '4 hours ago',
    },
    {
        id: '6',
        title: 'Spanish conversation practice',
        provider: 'Sofia M.',
        initials: 'SM',
        rate: '$18',
        rateUnit: '/hr',
        category: 'Tutoring',
        icon: 'chatbubbles-outline',
        description: 'Native speaker. Casual conversation to get ready for oral exams, or help with grammar homework.',
        availability: 'Weekday mornings',
        location: 'Student Union or online',
        responseTime: 'Within a few hours',
        posted: '1 day ago',
    },
];

// '$20' -> 20, for the Under $25 filter
export function serviceRateNumber(service: Service) {
    return Number(service.rate.replace(/[^0-9.]/g, '')) || 0;
}

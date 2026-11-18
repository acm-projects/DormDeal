// what one service looks like
export type Service = {
    id: string;
    title: string;
    provider: string;
    initials: string;
    rate: string;        // the number part, like '$20'
    rateUnit: string;    // what the rate is per: '/hr', '/session', or '' for a flat rate
    category: string;    // same service categories as Create Listing
    icon: string;        // Ionicons name shown on the card and page header
    description: string;
    availability: string;
    location: string;
    responseTime: string;
    posted: string;
};

// demo services for now. there's no services table in the database yet,
// so these stand in until the backend can store real ones
export const services: Service[] = [
    {
        id: "1",
        title: "Calculus I & II tutoring",
        provider: "Priya S.",
        initials: "PS",
        rate: "$20",
        rateUnit: "/hr",
        category: "Tutoring",
        icon: "school-outline",
        description:
            "Math major, aced both. I go over homework, quiz prep, and the stuff your professor skipped. Bring your notes and questions.",
        availability: "Mon–Thu evenings",
        location: "McDermott Library or online",
        responseTime: "Usually within an hour",
        posted: "2 days ago",
    },
    {
        id: "2",
        title: "Airport & grocery rides",
        provider: "Jordan T.",
        initials: "JT",
        rate: "$12",
        rateUnit: "",
        category: "Rides",
        icon: "car-outline",
        description:
            "I have a car and go to DFW and the H Mart on Fridays. Split the gas, bring your bags. Up to 3 people per trip.",
        availability: "Fridays & Sundays",
        location: "Pickup at Residence Hall North",
        responseTime: "Same day",
        posted: "1 week ago",
    },
    {
        id: "3",
        title: "Fades & trims in my dorm",
        provider: "Marcus L.",
        initials: "ML",
        rate: "$15",
        rateUnit: "/session",
        category: "Haircuts",
        icon: "cut-outline",
        description:
            "Clean fades, tapers and trims. I bring clippers and a cape, you bring a reference pic. Takes about 30 minutes.",
        availability: "Tue & Thu afternoons",
        location: "Helix Hall",
        responseTime: "Within a few hours",
        posted: "3 days ago",
    },
    {
        id: "4",
        title: "Move-out help with a hand truck",
        provider: "Diego R.",
        initials: "DR",
        rate: "$25",
        rateUnit: "/hr",
        category: "Move-out help",
        icon: "cube-outline",
        description:
            "Two of us with a hand truck. We carry boxes, mini fridges and furniture between dorms or down to your car.",
        availability: "Weekends",
        location: "Any campus residence hall",
        responseTime: "Usually same day",
        posted: "4 hours ago",
    },
    {
        id: "5",
        title: "Orgo I study guide",
        provider: "Aisha K.",
        initials: "AK",
        rate: "$8",
        rateUnit: "",
        category: "Study guides",
        icon: "document-text-outline",
        description:
            "My full Orgo I notes: every mechanism, color-coded, plus practice problems with worked answers. Sent as a PDF.",
        availability: "Anytime",
        location: "Online",
        responseTime: "Within a day",
        posted: "5 days ago",
    },
    {
        id: "6",
        title: "Laptop cleanup & setup",
        provider: "Sofia M.",
        initials: "SM",
        rate: "$15",
        rateUnit: "/session",
        category: "Other",
        icon: "laptop-outline",
        description:
            "Slow laptop? I clear junk, set up backups, install class software, and get you on campus Wi-Fi and printing.",
        availability: "Weekday mornings",
        location: "Student Union",
        responseTime: "Within a few hours",
        posted: "1 day ago",
    },
];

// '$20' -> 20, for the Under $25 filter and price sorting
export function serviceRateNumber(service: Service) {
    return Number(service.rate.replace(/[^0-9.]/g, "")) || 0;
}

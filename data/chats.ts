// what one chat looks like
export type Chat = {
    id: string;
    name: string;
    initials: string;
    item: string;        // which listing this chat is about
    lastMessage: string;
    time: string;
    unread: boolean;
};

// fake chats for now, later these come from the backend
export const chats: Chat[] = [
    { id: '1', name: 'Gia Jinkins', initials: 'GJ', item: 'Mini fridge', lastMessage: 'Hi, is this still available?', time: '7:06 PM', unread: true },
    { id: '2', name: 'Duncan Winston', initials: 'DW', item: 'Desk lamp', lastMessage: 'Are we still on for 5:30?', time: '6:43 PM', unread: true },
    { id: '3', name: 'Anthony Simon', initials: 'AS', item: 'Twin XL sheets', lastMessage: 'Please pick up by Friday!', time: '12:22 PM', unread: false },
    { id: '4', name: 'Lisa Woodler', initials: 'LW', item: 'Mini fridge', lastMessage: 'Would you take $50?', time: 'Yesterday', unread: false },
    { id: '5', name: 'Monophy Lanping', initials: 'ML', item: 'Desk lamp', lastMessage: 'Hello there!', time: 'Mon', unread: false },
];
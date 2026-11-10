import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../root_styles';
import { Header1 } from '../components/text_styles';
import Base from '../components/base';
import Search_Bar from '../components/search_bar';
import TabBar from '../components/tab_bar';
import { services, serviceRateNumber } from '../../../data/services';
import type { Service } from '../../../data/services';

// one service card, tap it to open the service page
const Service_Card = ({ service }: { service: Service }) => {
    const router = useRouter();

    return (
        <Pressable style={list.card} onPress={() => router.push(`/Store/Listing/Service/${service.id}`)}>
            <View style={list.cardTop}>
                <View style={list.cardIcon}>
                    <Ionicons name={service.icon as React.ComponentProps<typeof Ionicons>['name']} size={30} color={colors.maroon} />
                </View>
                <Text style={list.cardCategory}>{service.category}</Text>
            </View>
            <View style={list.cardInfo}>
                <Text style={list.cardTitle} numberOfLines={2}>{service.title}</Text>
                <View style={list.providerRow}>
                    <View style={list.providerDot}>
                        <Text style={list.providerInitials}>{service.initials}</Text>
                    </View>
                    <Text style={list.providerName}>{service.provider}</Text>
                </View>
                <Text style={list.rate}>
                    {service.rate}<Text style={list.rateUnit}>{service.rateUnit}</Text>
                </Text>
            </View>
        </Pressable>
    );
};

const Services = () => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState('All');
    const [underBudget, setUnderBudget] = useState(false);

    // filter chips come from whatever categories the services have
    const categories = ['All', ...new Set(services.map((service) => service.category))];

    const query = searchQuery.trim().toLowerCase();
    const shown = services.filter((service) => {
        if (category !== 'All' && service.category !== category) return false;
        if (underBudget && serviceRateNumber(service) >= 25) return false;
        if (!query) return true;
        return `${service.title} ${service.category} ${service.provider}`.toLowerCase().includes(query);
    });

    // chop into rows of 2, like the marketplace
    const rows: Service[][] = [];
    for (let i = 0; i < shown.length; i += 2) rows.push(shown.slice(i, i + 2));

    return (
        <Base style={{}}>
            <View style={list.headerRow}>
                <Pressable style={list.backPill} onPress={() => router.push('/Shop')} accessibilityLabel="Back to shop">
                    <Ionicons name="chevron-back" size={16} color={colors.white} />
                    <Text style={list.backPillText}>Shop</Text>
                </Pressable>
            </View>
            <Header1 style={{ marginBottom: 16 }}>services</Header1>

            <Search_Bar
                placeholder="Tutoring, moving, tech help…"
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                accessibilityLabel="Search services"
            />

            <View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={list.chips}>
                    {categories.map((name) => (
                        <Pressable
                            key={name}
                            style={[list.chip, category === name && list.chipOn]}
                            onPress={() => setCategory(name)}
                        >
                            <Text style={[list.chipText, category === name && list.chipTextOn]}>{name}</Text>
                        </Pressable>
                    ))}
                    <Pressable style={[list.chip, underBudget && list.chipOn]} onPress={() => setUnderBudget(!underBudget)}>
                        <Text style={[list.chipText, underBudget && list.chipTextOn]}>Under $25</Text>
                    </Pressable>
                </ScrollView>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={list.grid} showsVerticalScrollIndicator={false}>
                {shown.length === 0 ? (
                    <Text style={list.empty}>No services match that yet.</Text>
                ) : (
                    rows.map((row, i) => (
                        <View key={i} style={list.row}>
                            {row.map((service) => <Service_Card key={service.id} service={service} />)}
                            {row.length === 1 && <View style={{ flex: 1 }} />}
                        </View>
                    ))
                )}
            </ScrollView>

            <TabBar active="catalog" />
        </Base>
    );
};

const list = StyleSheet.create({
    headerRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    backPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: colors.maroonDark,
    },
    backPillText: {
        color: colors.white,
        fontFamily: 'Outfit',
        fontSize: 15,
    },
    chips: {
        gap: 8,
        paddingVertical: 14,
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 16,
        backgroundColor: '#E4E4E4',
    },
    chipOn: {
        backgroundColor: colors.maroon,
    },
    chipText: {
        fontFamily: 'Outfit',
        fontSize: 14,
        color: colors.ink,
    },
    chipTextOn: {
        color: colors.white,
    },
    grid: {
        gap: 15,
        paddingBottom: 130, // room so the tab bar doesn't cover the last card
    },
    row: {
        flexDirection: 'row',
        gap: 15,
    },
    card: {
        flex: 1,
        backgroundColor: colors.white,
        borderRadius: 28,
        padding: 10,
        elevation: 4,
    },
    cardTop: {
        height: 120,
        borderRadius: 22,
        backgroundColor: colors.goldLight,
        padding: 12,
        justifyContent: 'space-between',
    },
    cardIcon: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardCategory: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: colors.white,
        color: colors.maroonDark,
        fontFamily: 'Outfit',
        fontSize: 12,
        fontWeight: '600',
    },
    cardInfo: {
        paddingHorizontal: 4,
        paddingTop: 14,
        paddingBottom: 8,
        gap: 6,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.ink,
        fontFamily: 'Outfit',
    },
    providerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    providerDot: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: colors.blush,
        alignItems: 'center',
        justifyContent: 'center',
    },
    providerInitials: {
        fontSize: 9,
        fontWeight: '700',
        color: colors.maroon,
        fontFamily: 'Outfit',
    },
    providerName: {
        fontSize: 13,
        color: colors.muted,
        fontFamily: 'Outfit',
    },
    rate: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.maroon,
        fontFamily: 'Outfit',
    },
    rateUnit: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.muted,
    },
    empty: {
        color: colors.muted,
        fontFamily: 'Outfit',
        fontSize: 14,
        paddingVertical: 40,
        textAlign: 'center',
    },
});

export default Services;

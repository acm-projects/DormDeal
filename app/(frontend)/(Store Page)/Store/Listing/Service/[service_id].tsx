import { useState } from 'react';
import { Text, View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../../../root_styles';
import { services } from '../../../../../../data/services';

const Service_Listing = () => {
    const { service_id } = useLocalSearchParams<{ service_id: string }>(); // the number at the end of the address
    const router = useRouter();
    const service = services.find((candidate) => candidate.id === service_id);
    const [note, setNote] = useState('');

    // bad link, no service with that id
    if (!service) {
        return (
            <View style={page.notFound}>
                <Text style={page.notFoundText}>Could not find that service.</Text>
                <Pressable onPress={() => router.push('/Services')}>
                    <Text style={page.link}>See all services</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={page.screen}>
            <ScrollView contentContainerStyle={page.content}>

                {/* big header with the service's icon */}
                <View style={page.header}>
                    <View style={page.headerIcon}>
                        <Ionicons name={service.icon as React.ComponentProps<typeof Ionicons>['name']} size={64} color={colors.maroon} />
                    </View>
                    <Pressable style={page.backButton} onPress={() => router.back()} accessibilityLabel="Go back">
                        <Ionicons name="chevron-back" size={22} color={colors.ink} />
                    </Pressable>
                </View>

                <View style={page.body}>
                    {/* provider */}
                    <View style={page.providerCard}>
                        <View style={page.providerAvatar}>
                            <Text style={page.providerInitials}>{service.initials}</Text>
                        </View>
                        <View style={page.providerInfo}>
                            <Text style={page.providerName}>{service.provider}</Text>
                            <Text style={page.verified}>Verified student · {service.responseTime.toLowerCase()}</Text>
                        </View>
                    </View>

                    {/* title + rate */}
                    <Text style={page.title}>{service.title}</Text>
                    <Text style={page.rate}>
                        {service.rate}<Text style={page.rateUnit}> {service.rateUnit}</Text>
                    </Text>

                    {/* tags */}
                    <View style={page.tags}>
                        <View style={[page.tag, page.tagMain]}>
                            <Text style={[page.tagText, page.tagTextMain]}>{service.category}</Text>
                        </View>
                        <View style={page.tag}>
                            <Text style={page.tagText}>Service</Text>
                        </View>
                    </View>

                    {/* description */}
                    <Text style={page.description}>{service.description}</Text>

                    {/* details list */}
                    <View style={page.details}>
                        <View style={page.detailRow}>
                            <Text style={page.detailLabel}>Availability</Text>
                            <Text style={page.detailValue}>{service.availability}</Text>
                        </View>
                        <View style={page.detailRow}>
                            <Text style={page.detailLabel}>Where</Text>
                            <Text style={page.detailValue}>{service.location}</Text>
                        </View>
                        <View style={page.detailRow}>
                            <Text style={page.detailLabel}>Replies</Text>
                            <Text style={page.detailValue}>{service.responseTime}</Text>
                        </View>
                        <View style={[page.detailRow, page.detailRowLast]}>
                            <Text style={page.detailLabel}>Posted</Text>
                            <Text style={page.detailValue}>{service.posted}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* buttons stuck to the bottom. services are demo data for now, so these don't hit the backend yet */}
            <View style={page.actionBar}>
                {note ? <Text style={page.noteText}>{note}</Text> : null}
                <View style={page.actionRow}>
                    <Pressable
                        style={page.messageButton}
                        onPress={() => setNote('Messaging for services is coming soon.')}
                    >
                        <Text style={page.messageText}>Message</Text>
                    </Pressable>
                    <Pressable
                        style={page.bookButton}
                        onPress={() => setNote('Booking is coming soon. Services are demo data for now.')}
                    >
                        <Text style={page.bookText}>Request</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
};

const page = StyleSheet.create({
    screen: {
        flex: 1,
        width: '100%',
        backgroundColor: colors.cream,
    },
    content: {
        paddingBottom: 140, // room for the button bar
    },
    header: {
        height: 300,
        backgroundColor: colors.goldLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerIcon: {
        width: 130,
        height: 130,
        borderRadius: 65,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 56,
        left: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    body: {
        padding: 20,
        gap: 14,
    },
    providerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: 12,
    },
    providerAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.blush,
        alignItems: 'center',
        justifyContent: 'center',
    },
    providerInitials: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.maroon,
        fontFamily: 'Outfit',
    },
    providerInfo: {
        gap: 2,
    },
    providerName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.ink,
        fontFamily: 'Outfit',
    },
    verified: {
        fontSize: 12,
        color: colors.muted,
        fontFamily: 'Outfit',
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: colors.ink,
        fontFamily: 'Outfit',
    },
    rate: {
        fontSize: 30,
        fontWeight: '700',
        color: colors.maroon,
        fontFamily: 'Outfit',
        marginTop: -6,
    },
    rateUnit: {
        fontSize: 18,
        fontWeight: '500',
        color: colors.muted,
    },
    tags: {
        flexDirection: 'row',
        gap: 8,
    },
    tag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: colors.white,
    },
    tagMain: {
        backgroundColor: colors.maroon,
    },
    tagText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.ink,
        fontFamily: 'Outfit',
    },
    tagTextMain: {
        color: colors.white,
    },
    description: {
        fontSize: 15,
        lineHeight: 22,
        color: colors.ink,
        fontFamily: 'Outfit',
    },
    details: {
        backgroundColor: colors.white,
        borderRadius: 20,
        paddingHorizontal: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        paddingVertical: 13,
        borderBottomWidth: 1,
        borderBottomColor: colors.blush,
    },
    detailRowLast: {
        borderBottomWidth: 0, // no line under the last row
    },
    detailLabel: {
        fontSize: 14,
        color: colors.muted,
        fontFamily: 'Outfit',
    },
    detailValue: {
        flexShrink: 1,
        textAlign: 'right',
        fontSize: 14,
        fontWeight: '600',
        color: colors.ink,
        fontFamily: 'Outfit',
    },
    actionBar: {
        position: 'absolute', // stuck to the bottom
        left: 0,
        right: 0,
        bottom: 0,
        gap: 8,
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: 30,
        backgroundColor: colors.white,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 10,
    },
    noteText: {
        fontSize: 13,
        color: colors.muted,
        fontFamily: 'Outfit',
        textAlign: 'center',
    },
    messageButton: {
        flex: 1,
        height: 52,
        borderRadius: 26,
        borderWidth: 1.5,
        borderColor: colors.maroon,
        alignItems: 'center',
        justifyContent: 'center',
    },
    messageText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.maroon,
        fontFamily: 'Outfit',
    },
    bookButton: {
        flex: 1,
        height: 52,
        borderRadius: 26,
        backgroundColor: colors.maroon,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bookText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.white,
        fontFamily: 'Outfit',
    },
    notFound: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        backgroundColor: colors.cream,
    },
    notFoundText: {
        fontSize: 18,
        color: colors.ink,
        fontFamily: 'Outfit',
    },
    link: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.maroon,
        fontFamily: 'Outfit',
    },
});

export default Service_Listing;

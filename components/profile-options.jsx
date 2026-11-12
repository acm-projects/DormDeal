import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../app/root_styles';
import { FormMotion, FormMotionProvider } from './form-motion';
import OptionsOverlay from './options-overlay';

export default function ProfileOptions({ name, options, onClose, onSelect, anchorTop, notice }) {
    return <OptionsOverlay title="Profile options" anchored anchorTop={anchorTop} onClose={onClose}>
        {(close) => <FormMotionProvider>
            <ScrollView style={styles.card} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <View style={styles.heading}>
                    <Text accessibilityRole="header" style={styles.title}>Options</Text>
                    <Text numberOfLines={1} style={styles.name}>{name}</Text>
                    <Pressable accessibilityRole="button" accessibilityLabel="Close profile options" onPress={close} style={styles.close}>
                        <Ionicons name="close" size={21} color={colors.maroon} />
                    </Pressable>
                </View>
                {options.map(({ id, label, icon, count, danger, divider }, index) => (
                    <FormMotion key={id} delay={index * 32} style={divider && styles.divider}>
                        <Pressable accessibilityRole="button" onPress={() => onSelect(id)} style={styles.row}>
                            <View style={[styles.tile, danger && styles.dangerTile]}>
                                <Ionicons name={icon} size={20} color={danger ? colors.white : colors.maroon} />
                            </View>
                            <Text style={[styles.label, danger && styles.danger]}>{label}</Text>
                            {count !== undefined && <Text style={styles.count}>{count}</Text>}
                        </Pressable>
                    </FormMotion>
                ))}
                {!!notice && <Text accessibilityRole="alert" style={styles.notice}>{notice}</Text>}
            </ScrollView>
        </FormMotionProvider>}
    </OptionsOverlay>;
}

const styles = StyleSheet.create({
    card: { backgroundColor: colors.white, borderRadius: 4, boxShadow: '0 8px 25px #0004' },
    content: { padding: 16 },
    heading: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingBottom: 9, borderBottomWidth: 2, borderColor: colors.maroon },
    title: { fontFamily: 'Outfit', fontSize: 24, fontWeight: '800', color: colors.maroon },
    name: { flex: 1, textAlign: 'right', fontFamily: 'Caveat', fontSize: 21, color: colors.muted },
    close: { width: 30, height: 32, alignItems: 'center', justifyContent: 'center' },
    row: { flexDirection: 'row', alignItems: 'center', gap: 11, minHeight: 46 },
    tile: { width: 33, height: 33, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.blush },
    label: { flex: 1, fontFamily: 'Outfit', fontSize: 16, fontWeight: '700', color: colors.ink },
    count: { fontFamily: 'Outfit', fontSize: 14, fontWeight: '800', color: colors.maroon },
    divider: { borderTopWidth: 1, borderStyle: 'dashed', borderColor: '#CFC6C6', marginTop: 5, paddingTop: 6 },
    dangerTile: { backgroundColor: colors.maroon },
    danger: { color: colors.maroon, fontWeight: '800' },
    notice: { fontFamily: 'Outfit', fontSize: 14, color: colors.maroon, marginTop: 8 },
});

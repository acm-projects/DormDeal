import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../root_styles';
import { events } from '../../../data/events';
import type { CalEvent } from '../../../data/events';
import { items } from '../../../data/items';

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const body = 'Outfit';
const heading = 'Caveat';

// year, month (0-11), day -> 'YYYY-MM-DD'
function toKey(year: number, month: number, day: number) {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

export default function Calendar() {
  const router = useRouter();
  const today = new Date();
  const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate());

// pickups come from items, events come from events.ts
const pickupEvents: CalEvent[] = items.map((i): CalEvent => ({
  id: `pickup-${i.id}`,
  date: i.pickupDate,
  title: `Pick up: ${i.title}`,
  time: i.pickupTime,
  place: i.pickup,
  type: 'pickup',
}));
const allEvents: CalEvent[] = [...events, ...pickupEvents];

  // shown = first day of the month we're looking at
  const [shown, setShown] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  // picked = the day tapped (starts on today)
  const [picked, setPicked] = useState(todayKey);

  const year = shown.getFullYear();
  const month = shown.getMonth();

  // blank squares before the 1st, then the days
  const blanks = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < blanks; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  // chop the flat list into rows of 7
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  // label for the info panel, like "October 31"
  const [, pm, pd] = picked.split('-').map(Number);
  const pickedLabel = `${monthNames[pm - 1]} ${pd}`;
  const dayEvents = allEvents.filter(e => e.date === picked);

  function changeMonth(step: number) {
    setShown(new Date(year, month + step, 1));
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Pressable onPress={() => changeMonth(-1)} hitSlop={10}>
          <Text style={styles.arrow}>‹</Text>
        </Pressable>
        <Text style={styles.monthTitle}>{monthNames[month]} {year}</Text>
        <Pressable onPress={() => changeMonth(1)} hitSlop={10}>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {weekdays.map((w, i) => (
          <Text key={i} style={styles.weekday}>{w}</Text>
        ))}
      </View>

      {weeks.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map((day, di) => {
            if (day === null) return <View key={di} style={styles.cell} />;

            const key = toKey(year, month, day);
            const dayEvs = allEvents.filter(e => e.date === key);
            const hasEvent = dayEvs.some(e => e.type === 'event');
            const hasPickup = dayEvs.some(e => e.type === 'pickup');
            const isPicked = key === picked;
            const isToday = key === todayKey;

            return (
              <Pressable key={di} onPress={() => setPicked(key)} style={styles.cell}>
                <View style={[
                  styles.dayCircle,
                  isPicked && styles.dayPicked,
                  isToday && !isPicked && styles.dayToday,
                ]}>
                  <Text style={[styles.dayText, isPicked && styles.dayTextPicked]}>
                    {day}
                  </Text>
                </View>
                <View style={styles.dotRow}>
                  {hasEvent && <View style={[styles.dot, { backgroundColor: colors.gold }]} />}
                  {hasPickup && <View style={[styles.dot, { backgroundColor: colors.maroon }]} />}
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}

      {/* legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.gold }]} />
          <Text style={styles.legendText}>UTD event</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.maroon }]} />
          <Text style={styles.legendText}>Pickup</Text>
        </View>
      </View>

      {/* info panel for the picked day */}
      <View style={styles.dayPanel}>
        <Text style={styles.panelTitle}>{pickedLabel}</Text>

        {dayEvents.length === 0 ? (
          <Text style={styles.emptyText}>Nothing planned.</Text>
        ) : (
          dayEvents.map(e => (
            <View key={e.id} style={styles.eventRow}>
              <Text style={styles.eventTitle}>{e.title}</Text>
              <Text style={styles.eventMeta}>{e.time} · {e.place}</Text>

              {e.borrow && (
                <>
                  <Text style={styles.borrowLabel}>Borrow for this:</Text>
                  <View style={styles.chipRow}>
                    {e.borrow.map(b => (
                      <Pressable key={b} style={styles.chip} onPress={() => router.push('/Store')}>
                        <Text style={styles.chipText}>{b}</Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              )}
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.blush,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  monthTitle: { fontFamily: heading, fontSize: 22, fontWeight: '500', color: colors.ink },
  arrow: { fontFamily: body, fontSize: 26, color: colors.maroon, paddingHorizontal: 8 },
  weekRow: { flexDirection: 'row' },
  weekday: {
    flex: 1,
    fontFamily: body,
    textAlign: 'center',
    color: colors.muted,
    fontSize: 12,
    marginBottom: 4,
  },
  cell: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayPicked: { backgroundColor: colors.maroon },
  dayToday: { borderWidth: 1.5, borderColor: colors.gold },
  dayText: { fontFamily: body, color: colors.ink, fontSize: 14 },
  dayTextPicked: { color: colors.white },
  dotRow: { flexDirection: 'row', gap: 3, marginTop: 3, height: 6 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  legend: { flexDirection: 'row', gap: 14, marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendText: { fontFamily: body, fontSize: 12, color: colors.muted },
  dayPanel: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.blush,
    paddingTop: 12,
  },
  panelTitle: { fontFamily: heading, fontSize: 20, fontWeight: '500', color: colors.ink, marginBottom: 8 },
  emptyText: { fontFamily: body, color: colors.muted, fontStyle: 'italic' },
  eventRow: { marginBottom: 12 },
  eventTitle: { fontFamily: heading, fontSize: 15, color: colors.ink },
  eventMeta: { fontFamily: body, fontSize: 13, color: colors.muted, marginTop: 2 },
  borrowLabel: { fontFamily: body, fontSize: 12, color: colors.muted, marginTop: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  chip: {
    backgroundColor: colors.goldLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  chipText: { fontFamily: body, color: colors.maroonDark, fontSize: 12 },
});
import { useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Circle, Path, Polygon, Rect } from 'react-native-svg';
import { FormAction, FormBack, FormStamp, PaperForm, paperFormStyles } from '../../../components/paper-form';
import { FormMotion } from '../../../components/form-motion';
import { createListing, deleteListing, uploadListingImage } from '../../../lib/api/listings';
import type { ListingCategory } from '../../../lib/api/types';
import { colors } from '../../root_styles';

type ListingKind = 'item' | 'service';

const categories = {
    item: [
        ['Textbooks', 'textbooks'], ['Dorm & furniture', 'furniture'], ['Electronics', 'electronics'],
        ['Clothing', 'clothing'], ['Kitchen', 'dorm_supplies'], ['Lab & art supplies', 'other'], ['Other', 'other'],
    ],
    service: [
        ['Tutoring', 'other'], ['Rides', 'other'], ['Haircuts', 'other'],
        ['Move-out help', 'other'], ['Study guides', 'textbooks'], ['Other', 'other'],
    ],
} satisfies Record<ListingKind, [string, ListingCategory][]>;

const conditions = ['New', 'Like new', 'Good', 'Well loved'];
const times = ['Morning', 'Afternoon', 'Evening'];
const rateUnits = [['hour', 'Per hour'], ['session', 'Per session'], ['flat', 'Flat rate']] as const;
const spots = [
    { label: 'McDermott Library', x: '50%', y: '27%' },
    { label: 'Student Union', x: '47%', y: '51%' },
    { label: 'Activity Center', x: '76%', y: '67%' },
    { label: 'Residence hall lobby', x: '22%', y: '77%' },
] as const;
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const steps = ['Type', 'Details', 'Price and meetup', 'Availability', 'Review'];

function dateKey(date: Date) {
    return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
        .map((part) => String(part).padStart(2, '0')).join('-');
}

function displayDate(value: string) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
    return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={[styles.chip, selected && styles.selectedChip]}>
        <Text style={[styles.chipText, selected && styles.selectedText]}>{label}</Text>
    </Pressable>;
}

function PhotoDecorations() {
    return <View pointerEvents="none" accessible={false} style={styles.photoDecorations}>
        <View style={styles.paperclip}>
            <Svg width={28} height={48} viewBox="0 0 28 48">
                <Path d="M10 40V12a6 6 0 0 1 12 0v26a3.5 3.5 0 0 1-7 0V14" fill="none" stroke="#818181" strokeWidth={3} strokeLinecap="round" />
            </Svg>
        </View>
        <View style={styles.photoTape}><View style={styles.tapeSeam} /></View>
    </View>;
}

function PriceTag({ children }: { children: React.ReactNode }) {
    return <View style={styles.priceTag}>
        <View pointerEvents="none" accessible={false} style={styles.priceTagArt}>
            <Svg width="100%" height="100%" viewBox="0 0 366 140">
                <Polygon points="68,2 364,2 364,138 68,138 26,70" fill="#FFFAF0" stroke={colors.maroon} strokeWidth={3} strokeLinejoin="round" />
                <Polygon points="72,12 354,12 354,128 72,128 40,70" fill="none" stroke={colors.maroon} strokeWidth={1.5} strokeDasharray="6 5" opacity={0.55} />
                <Circle cx={54} cy={70} r={8} fill="#E8E3DA" stroke={colors.maroon} strokeWidth={2.5} />
                <Path d="M0 3C26 11 50 34 54 70C57 80 64 88 72 90" fill="none" stroke={colors.ink} strokeWidth={2.5} strokeLinecap="round" />
            </Svg>
        </View>
        {children}
    </View>;
}

function MeetupMap({ selected, onSelect }: { selected: string; onSelect: (spot: string) => void }) {
    return <View style={styles.map}>
        <View style={styles.mapCanvas}>
            <Svg width="100%" height="100%" viewBox="0 0 342 255">
                <Path d="M13 46H329 M13 228H329 M92 10V245 M262 10V245 M92 132H262" fill="none" stroke="#D3CBB7" strokeWidth={19} />
                <Path d="M13 46H329 M13 228H329 M92 10V245 M262 10V245 M92 132H262" fill="none" stroke="#FFFAF0" strokeWidth={14} />
                <Path d="M171 58V121 M110 96H230 M110 190L164 154L236 186" fill="none" stroke="#F3ECD9" strokeWidth={6} />
                {[[138, 52, 66, 35], [128, 106, 64, 40], [226, 156, 68, 39], [22, 168, 59, 41], [208, 57, 39, 24]].map(([x, y, width, height]) =>
                    <Rect key={x} x={x} y={y} width={width} height={height} rx={3} fill="#E8DCC0" stroke="#A99A78" strokeWidth={2} />)}
            </Svg>
            <Text style={styles.mapLabel}>UT DALLAS</Text>
            <Text style={styles.compass}>N</Text>
            {spots.map(({ label, x, y }) => <Pressable key={label} accessibilityRole="button" accessibilityLabel={label}
                accessibilityState={{ selected: selected === label }} onPress={() => onSelect(label)} style={[styles.pin, { left: x, top: y }]}>
                <Ionicons name={selected === label ? 'location' : 'location-outline'} size={32} color={colors.maroon} />
            </Pressable>)}
        </View>
    </View>;
}

function Availability({ dates, onToggle }: { dates: string[]; onToggle: (key: string) => void }) {
    const today = new Date();
    const todayKey = dateKey(today);
    const [offset, setOffset] = useState(0);
    const month = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const days = Array.from({ length: month.getDay() + count }, (_, index) => index - month.getDay() + 1);

    return <View style={[paperFormStyles.card, styles.calendar]}>
        <View style={styles.calendarTop}>
            <Pressable accessibilityRole="button" accessibilityLabel="Previous month" onPress={() => setOffset(offset - 1)}
                disabled={offset === 0} style={[styles.monthButton, offset === 0 && styles.disabled]}>
                <Ionicons name="chevron-back" size={20} color={colors.maroon} />
            </Pressable>
            <Text style={styles.optionTitle}>{month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Next month" onPress={() => setOffset(offset + 1)} style={styles.monthButton}>
                <Ionicons name="chevron-forward" size={20} color={colors.maroon} />
            </Pressable>
        </View>
        <View style={styles.calendarGrid}>
            {weekdays.map((day) => <View key={day} style={styles.dayCell}><Text style={styles.weekday}>{day}</Text></View>)}
            {days.map((day) => {
                if (day < 1) return <View key={day} style={styles.dayCell} />;
                const key = dateKey(new Date(month.getFullYear(), month.getMonth(), day));
                const selected = dates.includes(key);
                return <View key={day} style={styles.dayCell}>
                    <Pressable accessibilityRole="button" accessibilityLabel={displayDate(key)} accessibilityState={{ selected }}
                        disabled={key < todayKey} onPress={() => onToggle(key)}
                        style={[styles.day, selected && styles.selectedDay, key < todayKey && styles.disabled]}>
                        <Text style={[styles.dayText, key === todayKey && styles.todayText, selected && styles.selectedText]}>{day}</Text>
                    </Pressable>
                </View>;
            })}
        </View>
    </View>;
}

export default function CreateListing() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [kind, setKind] = useState<ListingKind | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [condition, setCondition] = useState('');
    const [price, setPrice] = useState('');
    const [free, setFree] = useState(false);
    const [rateUnit, setRateUnit] = useState<(typeof rateUnits)[number][0]>('hour');
    const [meetup, setMeetup] = useState('');
    const [customMeetup, setCustomMeetup] = useState(false);
    const [customLocation, setCustomLocation] = useState('');
    const [dates, setDates] = useState<string[]>([]);
    const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
    const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [postedId, setPostedId] = useState<number | null>(null);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');
    const publishing = useRef(false);
    const service = kind === 'service';
    const meetupLabel = customMeetup ? customLocation.trim() : meetup;
    const choices = categories[kind ?? 'item'];
    const categoryValue = choices.find(([label]) => label === category)?.[1];
    const numericPrice = free ? 0 : Number(price);
    const priceText = free ? 'Free' : '$' + (price || '0') + (service ? { hour: '/hr', session: '/session', flat: '' }[rateUnit] : '');

    function chooseType(value: ListingKind) {
        if (value !== kind) {
            setKind(value);
            setCategory('');
            setCondition('');
        }
        setMessage('');
    }

    async function pickPhoto() {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.8,
            });
            if (!result.canceled) setImage(result.assets[0]);
        } catch {
            setMessage('Could not open your photo library. Try again.');
        }
    }

    function next() {
        const errors = [
            kind ? '' : 'Pick one to continue.',
            title.trim().length < 3 ? 'Give it a title with at least 3 characters.'
                : !categoryValue ? 'Pick a category.'
                    : description.trim().length < 10 ? 'Add a description with at least 10 characters.' : '',
            !free && (!Number.isFinite(numericPrice) || numericPrice <= 0) ? 'Add a price or tap Free.'
                : customMeetup && !meetupLabel ? 'Enter your custom meetup location.' : '',
        ];
        if (errors[step]) {
            setMessage(errors[step]);
        } else {
            setMessage('');
            setStep(step + 1);
        }
    }

    async function post() {
        if (publishing.current || !kind || !categoryValue) return;
        publishing.current = true;
        setBusy(true);
        setMessage('');
        try {
            const listing = await createListing({
                title, description, price: numericPrice, category: categoryValue,
            });
            if (image) {
                try {
                    await uploadListingImage(listing.listing_id, image);
                } catch (error) {
                    try {
                        await deleteListing(listing.listing_id);
                    } catch {
                        setPostedId(listing.listing_id);
                        setMessage('Your listing was posted, but the photo could not be attached.');
                        return;
                    }
                    throw error;
                }
            }
            setPostedId(listing.listing_id);
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Could not publish the listing. Try again.');
        } finally {
            publishing.current = false;
            setBusy(false);
        }
    }

    function reset() {
        setStep(0);
        setKind(null);
        setTitle('');
        setDescription('');
        setCategory('');
        setCondition('');
        setPrice('');
        setFree(false);
        setRateUnit('hour');
        setMeetup('');
        setCustomMeetup(false);
        setCustomLocation('');
        setDates([]);
        setSelectedTimes([]);
        setImage(null);
        setMessage('');
        setPostedId(null);
    }

    function goBack() {
        if (step === 0) {
            if (router.canGoBack()) router.back();
            else router.replace('/Listings');
        } else {
            setMessage('');
            setStep(step - 1);
        }
    }

    function chooseMeetup(value: string) {
        setMeetup(value);
        setCustomMeetup(false);
        setMessage('');
    }

    return <PaperForm pageKey={postedId ? 'posted' : step}
        header={!postedId && <View style={styles.top}>
            <FormBack onPress={goBack} disabled={busy} />
            <View accessible accessibilityLabel={'Step ' + (step + 1) + ' of 5: ' + steps[step]} style={styles.progress}>
                {steps.map((label, index) => <View key={label} style={[styles.dot, index <= step && styles.filledDot]} />)}
            </View>
        </View>}
        footer={!postedId && <>
            {!!message && <Text accessibilityRole="alert" style={paperFormStyles.error}>{message}</Text>}
            <FormAction onPress={step === 4 ? post : next} disabled={busy}>{busy ? 'Posting…' : step === 4 ? 'Post it!' : step === 3 ? 'Review!' : 'Next!'}</FormAction>
        </>}
    >
        {postedId ? <View style={styles.done}>
            <FormStamp title="POSTED!" caption="DORMDEAL BOARD" />
            <FormMotion delay={350}>
                <Text accessibilityRole="header" style={[paperFormStyles.heading, styles.doneHeading]}>it’s on the board</Text>
                <Text style={[paperFormStyles.body, styles.center]}>Replies will land in your messages.</Text>
            </FormMotion>
            <FormMotion variant="wiggle" delay={500} style={paperFormStyles.note}><Text style={paperFormStyles.noteText}>Arrange a meetup somewhere public and busy.</Text></FormMotion>
            {!!message && <Text accessibilityRole="alert" style={paperFormStyles.error}>{message}</Text>}
            <FormMotion delay={650}><FormAction onPress={() => router.replace(`/Store/Listing/Marketplace/live-${postedId}`)}>See it on the board!</FormAction></FormMotion>
            <Pressable accessibilityRole="button" onPress={reset} style={styles.linkButton}><Text style={paperFormStyles.link}>Post another</Text></Pressable>
        </View> : <View style={styles.form}>
            <Text accessibilityRole="header" style={[paperFormStyles.heading, styles.heading]}>new post</Text>
            {step === 0 && <>
                <Text style={styles.section}>what are you posting?</Text>
                {(['item', 'service'] as const).map((value, index) => <FormMotion key={value} delay={120 + index * 100}>
                    <FormMotion variant="pop" trigger={Number(kind === value)}>
                        <Pressable accessibilityRole="radio" accessibilityState={{ checked: kind === value }}
                        onPress={() => chooseType(value)} style={[paperFormStyles.card, styles.typeCard, kind === value && styles.typeSelected]}>
                        <View style={styles.tape} />
                        <View style={styles.illustration}>
                            {value === 'item' ? <>
                                <View style={[styles.photoFrame, styles.rearFrame]} />
                                <View style={styles.photoFrame}><Ionicons name="pricetags" color={colors.white} size={40} /></View>
                            </> : <Ionicons name="school" color={colors.maroon} size={96} />}
                        </View>
                        <View style={styles.typeHeader}>
                            <Text style={styles.typeTitle}>{value === 'item' ? 'I’m selling' : 'A service'}</Text>
                            {kind === value && <FormMotion variant="badge" style={styles.check}><Ionicons name="checkmark" size={20} color={colors.white} /></FormMotion>}
                        </View>
                        <Text style={styles.copy}>{value === 'item'
                            ? 'Textbooks, dorm furniture, electronics, anything that won’t fit in the move-out car.'
                            : 'Tutoring, rides, haircuts, study guides, move-out help: share what you’re good at.'}</Text>
                        </Pressable>
                    </FormMotion>
                </FormMotion>)}
            </>}
            {step === 1 && <>
                <Text style={styles.section}>Photo</Text>
                <View style={styles.photoBlock}>
                    {image ? <FormMotion key={image.uri} style={[paperFormStyles.card, styles.photoPreview]}>
                        <Image source={{ uri: image.uri }} style={styles.image} accessibilityLabel="Selected listing photo" />
                        <View style={styles.chips}>
                            <Chip label="Replace" selected={false} onPress={pickPhoto} />
                            <Chip label="Remove" selected={false} onPress={() => setImage(null)} />
                        </View>
                    </FormMotion> : <Pressable accessibilityRole="button" onPress={pickPhoto} style={styles.addPhoto}>
                        <Ionicons name="camera-outline" size={34} color={colors.maroon} />
                        <Text style={styles.section}>add a photo!</Text>
                        <Text style={styles.copy}>Optional · choose from your library</Text>
                    </Pressable>}
                    <PhotoDecorations />
                </View>
                <Text style={styles.section}>give it a title</Text>
                <TextInput accessibilityLabel="Listing title" style={[styles.field, styles.yellow]} value={title} maxLength={40}
                    placeholder={service ? 'e.g. Calc II tutoring' : 'e.g. Mini fridge, 3.1 cu ft'} placeholderTextColor={colors.muted} onChangeText={setTitle} />
                <Text style={styles.counter}>{title.length}/40</Text>
                <Text style={styles.section}>{service ? 'describe your service' : 'give a description!'}</Text>
                <TextInput accessibilityLabel="Listing description" style={[styles.field, styles.description]} value={description} maxLength={200} multiline
                    placeholder={service ? 'What you cover, how sessions work, what to bring…' : 'What are you selling? Size, edition, what’s included…'}
                    placeholderTextColor={colors.muted} onChangeText={setDescription} />
                <Text style={styles.counter}>{description.length}/200</Text>
                <Text style={styles.section}>pick a category</Text>
                <View style={styles.chips}>{choices.map(([label]) => <Chip key={label} label={label} selected={category === label} onPress={() => setCategory(label)} />)}</View>
                {!service && <>
                    <Text style={styles.section}>what condition is it in?</Text>
                    <View style={styles.chips}>{conditions.map((value) => <Chip key={value} label={value} selected={condition === value} onPress={() => setCondition(value)} />)}</View>
                </>}
            </>}
            {step === 2 && <>
                <Text style={styles.section}>{service ? 'set your rate' : 'set your price'}</Text>
                <PriceTag>
                    <View style={styles.priceField}>
                        <Text style={styles.price}>$</Text>
                        <TextInput accessibilityLabel={service ? 'Rate in dollars' : 'Price in dollars'} style={[styles.price, styles.priceInput]} value={free ? '0' : price}
                            inputMode="decimal" placeholder="0" placeholderTextColor={colors.muted} maxLength={9} onChangeText={(value) => {
                                if (/^\d*(?:\.\d{0,2})?$/.test(value.replace(',', '.'))) {
                                    setFree(false);
                                    setPrice(value.replace(',', '.'));
                                }
                            }} />
                        {service && !free && <Text style={styles.priceUnit}>{rateUnits.find(([unit]) => unit === rateUnit)?.[1]}</Text>}
                    </View>
                </PriceTag>
                <View style={styles.chips}>
                    {['5', '10', '20', '50'].map((amount) => <Chip key={amount} label={'$' + amount} selected={!free && price === amount}
                        onPress={() => { setPrice(amount); setFree(false); }} />)}
                    <Chip label="Free" selected={free} onPress={() => { setFree(!free); setPrice(''); }} />
                </View>
                {service && !free && <View style={styles.chips}>
                    {rateUnits.map(([value, label]) => <Chip key={value} label={label} selected={rateUnit === value} onPress={() => setRateUnit(value)} />)}
                </View>}
                <View style={styles.paymentNote}><Ionicons name="information-circle-outline" size={20} color={colors.maroon} />
                    <Text style={styles.flexCopy}>Payment is settled in chat when you meet. DormDeal doesn’t handle money.</Text></View>
                <Text style={styles.section}>pick a meetup spot</Text>
                <MeetupMap selected={customMeetup ? '' : meetup} onSelect={chooseMeetup} />
                <Text style={styles.copy}>Campus schematic</Text>
                <View style={styles.chips}>{spots.map(({ label }) => <Chip key={label} label={label} selected={!customMeetup && meetup === label} onPress={() => chooseMeetup(label)} />)}</View>
                <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: customMeetup }}
                    onPress={() => { setCustomMeetup((selected) => !selected); setMessage(''); }}
                    style={[paperFormStyles.card, styles.customOption, customMeetup && styles.typeSelected]}>
                    <View style={[styles.customCheck, customMeetup && styles.selectedChip]}>
                        {customMeetup && <Ionicons name="checkmark" size={18} color={colors.white} />}
                    </View>
                    <Text style={styles.optionTitle}>Custom location</Text>
                </Pressable>
                {customMeetup && <FormMotion>
                    <TextInput accessibilityLabel="Custom meetup location" value={customLocation} maxLength={120}
                        onChangeText={(value) => { setCustomLocation(value); setMessage(''); }}
                        placeholder="Enter a meetup location" placeholderTextColor={colors.muted} style={[styles.field, styles.customInput]} />
                </FormMotion>}
            </>}
            {step === 3 && <>
                <Text style={styles.section}>when are you free?</Text>
                <Availability dates={dates} onToggle={(key) => setDates((current) =>
                    current.includes(key) ? current.filter((value) => value !== key) : [...current, key].sort())} />
                <Text style={styles.copy}>{dates.length ? dates.map(displayDate).join(', ') : 'Tap the days you can meet.'}</Text>
                <Text style={[styles.section, styles.center]}>what times work?</Text>
                <View style={[styles.chips, styles.timeChips]}>{times.map((time) => <Chip key={time} label={time} selected={selectedTimes.includes(time)}
                    onPress={() => setSelectedTimes((current) => current.includes(time) ? current.filter((value) => value !== time) : [...current, time])} />)}</View>
            </>}
            {step === 4 && <>
                <Text style={styles.section}>looks good?</Text>
                <Text style={styles.copy}>Your title, description, category, price and photo will be published. Add any other details buyers need to your description.</Text>
                <View style={styles.review}>
                    <View style={[paperFormStyles.card, styles.previewCard]}>
                        {image ? <Image source={{ uri: image.uri }} style={styles.previewImage} /> :
                            <View style={styles.previewPlaceholder}><Ionicons name="image-outline" size={28} color={colors.white} /></View>}
                        <Text style={styles.optionTitle}>{title.trim()}</Text>
                        <Text style={styles.reviewPrice}>{priceText}</Text>
                    </View>
                    <View style={styles.reviewInfo}>
                        {[
                            ['Price', priceText], ['Category', category], ['Condition', condition],
                            ['About', description.trim()], ['Meetup', meetupLabel], ['Free on', dates.map(displayDate).join(', ')],
                            ['Times', selectedTimes.join(', ')],
                        ].filter(([, value]) => value).map(([label, value]) => <View key={label} style={styles.reviewRow}>
                            <Text style={styles.reviewLabel}>{label}</Text><Text style={styles.reviewValue}>{value}</Text>
                        </View>)}
                    </View>
                </View>
            </>}
        </View>}
    </PaperForm>;
}

const styles = StyleSheet.create({
    top: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    progress: { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 12, paddingRight: 48 },
    dot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: colors.maroon },
    filledDot: { backgroundColor: colors.maroon },
    form: { gap: 13 },
    heading: { fontSize: 46, lineHeight: 49 },
    section: { fontFamily: 'Caveat', fontWeight: '700', fontSize: 32, lineHeight: 34, color: colors.maroon },
    typeCard: { borderWidth: 3, borderColor: colors.ink, backgroundColor: '#FFFDF8', padding: 14, marginVertical: 5 },
    typeSelected: { borderColor: colors.maroon, backgroundColor: '#FFF7DD' },
    tape: { position: 'absolute', right: 20, top: -10, width: 68, height: 19, backgroundColor: '#FBE27ADD', transform: [{ rotate: '4deg' }], zIndex: 1 },
    illustration: { minHeight: 110, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 9 },
    photoFrame: { width: 104, height: 88, borderWidth: 5, borderBottomWidth: 14, borderColor: colors.white, backgroundColor: colors.maroon, justifyContent: 'center', alignItems: 'center', transform: [{ rotate: '-7deg' }] },
    rearFrame: { position: 'absolute', left: 65, backgroundColor: colors.maroonLight, transform: [{ rotate: '8deg' }] },
    typeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
    typeTitle: { fontFamily: 'Outfit', fontWeight: '800', fontSize: 28, color: colors.ink },
    check: { width: 29, height: 29, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.maroon },
    copy: { fontFamily: 'Outfit', fontSize: 15, lineHeight: 20, color: colors.muted },
    flexCopy: { flex: 1, fontFamily: 'Outfit', fontSize: 14, lineHeight: 20, color: colors.ink },
    addPhoto: { minHeight: 160, justifyContent: 'center', alignItems: 'center', gap: 4, borderWidth: 3, borderStyle: 'dashed', borderColor: colors.maroon, backgroundColor: colors.cream },
    photoBlock: { position: 'relative', marginTop: 5 },
    photoDecorations: { ...StyleSheet.absoluteFill, zIndex: 2 },
    paperclip: { position: 'absolute', top: -20, left: '27%', transform: [{ rotate: '-30deg' }] },
    photoTape: { position: 'absolute', top: -12, right: 14, width: 92, height: 27, backgroundColor: '#FBE27AE6', transform: [{ rotate: '2deg' }], justifyContent: 'center' },
    tapeSeam: { borderTopWidth: 2, borderStyle: 'dashed', borderColor: '#00000030' },
    photoPreview: { gap: 8, padding: 8 },
    image: { width: '100%', aspectRatio: 2, backgroundColor: colors.maroon },
    field: { minHeight: 53, borderBottomWidth: 3, borderColor: colors.ink, borderRadius: 6, padding: 12, fontFamily: 'Outfit', fontSize: 19, color: colors.ink },
    yellow: { backgroundColor: '#F7E26B' },
    description: { minHeight: 140, textAlignVertical: 'top', backgroundColor: colors.white, fontFamily: 'Caveat', fontSize: 23 },
    counter: { alignSelf: 'flex-end', fontFamily: 'Outfit', fontSize: 13, color: colors.muted, marginTop: -8 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    timeChips: { justifyContent: 'center' },
    chip: { paddingHorizontal: 11, paddingVertical: 8, minHeight: 40, borderRadius: 5, borderWidth: 2, borderColor: colors.maroon, justifyContent: 'center' },
    chipText: { fontFamily: 'Outfit', fontSize: 14, fontWeight: '700', color: colors.maroon },
    selectedChip: { backgroundColor: colors.maroon },
    selectedText: { color: colors.white },
    priceTag: { width: '100%', maxWidth: 366, aspectRatio: 366 / 140, justifyContent: 'center', marginTop: 5, transform: [{ rotate: '-1.5deg' }] },
    priceTagArt: { ...StyleSheet.absoluteFill },
    priceField: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingLeft: '23%', paddingRight: '7%' },
    price: { fontFamily: 'Outfit', fontWeight: '800', fontSize: 46, color: colors.maroon },
    priceInput: { flex: 1, minWidth: 0 },
    priceUnit: { fontFamily: 'Caveat', color: colors.maroon, fontSize: 19, fontWeight: '700', maxWidth: '35%' },
    paymentNote: { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: colors.goldLight, padding: 11 },
    map: { width: '100%', maxWidth: 480, borderWidth: 3, borderColor: colors.ink, backgroundColor: '#E4EBD5' },
    mapCanvas: { width: '100%', aspectRatio: 342 / 255, position: 'relative' },
    mapLabel: { position: 'absolute', top: 7, left: 7, backgroundColor: colors.goldLight, padding: 5, fontFamily: 'Outfit', fontWeight: '800', fontSize: 11, color: colors.ink },
    compass: { position: 'absolute', right: 7, bottom: 7, padding: 6, borderRadius: 20, borderWidth: 1, borderColor: colors.ink, backgroundColor: colors.cream, fontFamily: 'Outfit', fontWeight: '800', fontSize: 12, color: colors.ink },
    pin: { position: 'absolute', width: 44, height: 44, marginLeft: -22, marginTop: -36, alignItems: 'center', justifyContent: 'center' },
    customOption: { minHeight: 51, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 2, borderColor: colors.maroon, borderRadius: 6, paddingHorizontal: 12 },
    customCheck: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.maroon, borderRadius: 4 },
    customInput: { backgroundColor: colors.white, borderWidth: 2, borderColor: colors.maroon, fontSize: 17 },
    calendar: { borderWidth: 2, borderColor: colors.ink, paddingHorizontal: 5, paddingBottom: 7 },
    calendarTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    monthButton: { width: 43, height: 44, alignItems: 'center', justifyContent: 'center' },
    disabled: { opacity: 0.35 },
    calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    dayCell: { width: '14.28%', minHeight: 40, justifyContent: 'center', alignItems: 'center' },
    weekday: { fontFamily: 'Outfit', color: colors.muted, fontSize: 12 },
    day: { width: '98%', maxWidth: 40, aspectRatio: 1, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    selectedDay: { backgroundColor: colors.maroon },
    dayText: { fontFamily: 'Outfit', fontWeight: '600', fontSize: 16, color: colors.ink },
    todayText: { color: colors.maroon },
    optionTitle: { fontFamily: 'Outfit', fontWeight: '700', fontSize: 16, color: colors.ink },
    review: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginTop: 10 },
    previewCard: { width: '43%', padding: 7, gap: 6, transform: [{ rotate: '-2deg' }] },
    previewImage: { width: '100%', aspectRatio: 1.25 },
    previewPlaceholder: { aspectRatio: 1.25, backgroundColor: colors.maroon, alignItems: 'center', justifyContent: 'center' },
    reviewPrice: { fontFamily: 'Outfit', fontSize: 18, fontWeight: '800', color: colors.maroon },
    reviewInfo: { flex: 1, gap: 4 },
    reviewRow: { paddingBottom: 5, borderBottomWidth: 1, borderColor: '#C9BEB1', borderStyle: 'dashed' },
    reviewLabel: { fontFamily: 'Caveat', fontSize: 19, color: colors.muted },
    reviewValue: { fontFamily: 'Outfit', fontWeight: '700', fontSize: 14, color: colors.ink },
    done: { flex: 1, justifyContent: 'center', gap: 21, paddingVertical: 15 },
    doneHeading: { fontSize: 38, lineHeight: 41, textAlign: 'center' },
    center: { textAlign: 'center' },
    linkButton: { minHeight: 42, justifyContent: 'center' },
});

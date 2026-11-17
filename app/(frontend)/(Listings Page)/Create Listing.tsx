import {
    Children,
    isValidElement,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";
import {
    Animated,
    Easing,
    Image,
    PanResponder,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import Svg, { Circle, Path, Polygon } from "react-native-svg";
import {
    FormAction,
    FormBack,
    FormStamp,
    PaperForm,
    paperFormStyles,
} from "../../../src/components/paper-form";
import { FormMotion } from "../../../src/components/form-motion";
import {
    createListing,
    deleteListing,
    uploadListingImage,
} from "../../../lib/api/listings";
import type { ListingCategory } from "../../../lib/api/types";
import { colors } from "../../root_styles";

type ListingKind = "item" | "service";

const categories = {
    item: [
        ["Textbooks", "textbooks"],
        ["Dorm & furniture", "furniture"],
        ["Electronics", "electronics"],
        ["Clothing", "clothing"],
        ["Kitchen", "dorm_supplies"],
        ["Lab & art supplies", "other"],
        ["Other", "other"],
    ],
    service: [
        ["Tutoring", "other"],
        ["Rides", "other"],
        ["Haircuts", "other"],
        ["Move-out help", "other"],
        ["Study guides", "textbooks"],
        ["Other", "other"],
    ],
} satisfies Record<ListingKind, [string, ListingCategory][]>;

const conditions = ["New", "Like new", "Good", "Well loved"];
const times = ["Morning", "Afternoon", "Evening"];
const rateUnits = [
    ["hour", "Per hour"],
    ["session", "Per session"],
    ["flat", "Flat rate"],
] as const;
const spots = [
    { label: "McDermott Library", x: "50%", y: "27%" },
    { label: "Student Union", x: "47%", y: "51%" },
    { label: "Activity Center", x: "76%", y: "67%" },
    { label: "Residence hall lobby", x: "22%", y: "77%" },
] as const;
const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const steps = ["Type", "Details", "Price and meetup", "Availability", "Review"];

function dateKey(date: Date) {
    return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
        .map((part) => String(part).padStart(2, "0"))
        .join("-");
}

function displayDate(value: string) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
    });
}

function Chip({
    label,
    selected,
    onPress,
}: {
    label: string;
    selected: boolean;
    onPress: () => void;
}) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={onPress}
            style={[styles.chip, selected && styles.selectedChip]}
        >
            <Text style={[styles.chipText, selected && styles.selectedText]}>
                {label}
            </Text>
        </Pressable>
    );
}

function StepSequence({ children }: { children: ReactNode }) {
    return (
        <>
            {Children.toArray(children).map((child, index) => (
                <FormMotion
                    key={
                        isValidElement(child) && child.key !== null
                            ? child.key
                            : index
                    }
                    delay={120 + index * 90}
                >
                    {child}
                </FormMotion>
            ))}
        </>
    );
}

function ProgressBar({ step }: { step: number }) {
    const [progress] = useState(() => new Animated.Value(step + 1));

    useEffect(() => {
        const animation = Animated.timing(progress, {
            toValue: step + 1,
            duration: 360,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
        });
        animation.start();
        return () => animation.stop();
    }, [progress, step]);

    return (
        <View
            accessible
            accessibilityLabel={`Step ${step + 1} of 5: ${steps[step]}`}
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: 5, now: step + 1 }}
            style={styles.progress}
        >
            {steps.map((label, index) => (
                <View key={label} style={styles.dot}>
                    <Animated.View
                        style={[
                            styles.dotFill,
                            {
                                width: progress.interpolate({
                                    inputRange: [index, index + 1],
                                    outputRange: ["0%", "100%"],
                                    extrapolate: "clamp",
                                }),
                            },
                        ]}
                    />
                </View>
            ))}
        </View>
    );
}

function PhotoDecorations() {
    return (
        <View
            pointerEvents="none"
            accessible={false}
            style={styles.photoDecorations}
        >
            <View style={styles.paperclip}>
                <Svg width={28} height={48} viewBox="0 0 28 48">
                    <Path
                        d="M10 40V12a6 6 0 0 1 12 0v26a3.5 3.5 0 0 1-7 0V14"
                        fill="none"
                        stroke="#818181"
                        strokeWidth={3}
                        strokeLinecap="round"
                    />
                </Svg>
            </View>
            <View style={styles.photoTape}>
                <View style={styles.tapeSeam} />
            </View>
        </View>
    );
}

function PriceTag({ children }: { children: React.ReactNode }) {
    return (
        <View style={styles.priceTag}>
            <View
                pointerEvents="none"
                accessible={false}
                style={styles.priceTagArt}
            >
                <Svg width="100%" height="100%" viewBox="0 0 366 140">
                    <Polygon
                        points="68,2 364,2 364,138 68,138 26,70"
                        fill="#FFFAF0"
                        stroke={colors.maroon}
                        strokeWidth={3}
                        strokeLinejoin="round"
                    />
                    <Polygon
                        points="72,12 354,12 354,128 72,128 40,70"
                        fill="none"
                        stroke={colors.maroon}
                        strokeWidth={1.5}
                        strokeDasharray="6 5"
                        opacity={0.55}
                    />
                    <Circle
                        cx={54}
                        cy={70}
                        r={8}
                        fill="#E8E3DA"
                        stroke={colors.maroon}
                        strokeWidth={2.5}
                    />
                    <Path
                        d="M0 3C26 11 50 34 54 70C57 80 64 88 72 90"
                        fill="none"
                        stroke={colors.ink}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                    />
                </Svg>
            </View>
            {children}
        </View>
    );
}

const mapTiles = Array.from({ length: 25 }, (_, index) => [
    15152 + (index % 5),
    26409 + Math.floor(index / 5),
]);

function MeetupMap({
    selected,
    onSelect,
    customMode,
    customPin,
    onCustomPin,
}: {
    selected: string;
    onSelect: (spot: string) => void;
    customMode: boolean;
    customPin: { x: number; y: number } | null;
    onCustomPin: (pin: { x: number; y: number }) => void;
}) {
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const offsetRef = useRef(offset);
    const offsetAtGestureStart = useRef(offset);
    const clamp = (value: number) => Math.max(-100, Math.min(100, value));
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gesture) =>
                Math.abs(gesture.dx) > 4 || Math.abs(gesture.dy) > 4,
            onPanResponderGrant: () => {
                offsetAtGestureStart.current = offsetRef.current;
            },
            onPanResponderMove: (_, gesture) => {
                const next = {
                    x: clamp(offsetAtGestureStart.current.x + gesture.dx),
                    y: clamp(offsetAtGestureStart.current.y + gesture.dy),
                };
                offsetRef.current = next;
                setOffset(next);
            },
        }),
    ).current;
    return (
        <View style={styles.map}>
            <Pressable
                {...panResponder.panHandlers}
                onPress={(event) =>
                    customMode &&
                    onCustomPin({
                        x: event.nativeEvent.locationX - offsetRef.current.x,
                        y: event.nativeEvent.locationY - offsetRef.current.y,
                    })
                }
                style={styles.mapCanvas}
            >
                <View
                    pointerEvents="none"
                    style={[
                        styles.mapLayer,
                        {
                            transform: [
                                { translateX: offset.x },
                                { translateY: offset.y },
                            ],
                        },
                    ]}
                >
                    {mapTiles.map(([x, y], index) => (
                        <Image
                            key={`${x}-${y}`}
                            source={{
                                uri: `https://tile.openstreetmap.org/16/${x}/${y}.png`,
                            }}
                            style={[
                                styles.mapTile,
                                {
                                    left: `${((index % 5) - 1) * 33.333}%`,
                                    top: `${(Math.floor(index / 5) - 1) * 33.333}%`,
                                },
                            ]}
                        />
                    ))}
                    <Text style={styles.mapLabel}>UT DALLAS</Text>
                    {customMode && customPin && (
                        <View
                            style={[
                                styles.pin,
                                { left: customPin.x, top: customPin.y },
                            ]}
                        >
                            <Ionicons
                                name="location"
                                size={36}
                                color={colors.maroon}
                            />
                        </View>
                    )}
                </View>
                {!customMode && (
                    <View pointerEvents="box-none" style={styles.mapLayer}>
                        {spots.map(({ label, x, y }) => (
                        <Pressable
                            key={label}
                            accessibilityRole="button"
                            accessibilityLabel={label}
                            accessibilityState={{
                                selected: selected === label,
                            }}
                            onPress={() => onSelect(label)}
                            style={[styles.pin, { left: x, top: y }]}
                        >
                            <Ionicons
                                name={
                                    selected === label
                                        ? "location"
                                        : "location-outline"
                                }
                                size={32}
                                color={colors.maroon}
                            />
                        </Pressable>
                        ))}
                    </View>
                )}
            </Pressable>
            <Text style={styles.mapAttribution}>
                © OpenStreetMap contributors ·{" "}
                {customMode
                    ? "Tap to drop your pin, or drag around UTD"
                    : "Choose a campus pickup spot"}
            </Text>
        </View>
    );
}

function Availability({
    dates,
    onToggle,
}: {
    dates: string[];
    onToggle: (key: string) => void;
}) {
    const today = new Date();
    const todayKey = dateKey(today);
    const [offset, setOffset] = useState(0);
    const month = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    const count = new Date(
        month.getFullYear(),
        month.getMonth() + 1,
        0,
    ).getDate();
    const days = Array.from(
        { length: month.getDay() + count },
        (_, index) => index - month.getDay() + 1,
    );

    return (
        <View style={[paperFormStyles.card, styles.calendar]}>
            <View style={styles.calendarTop}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Previous month"
                    onPress={() => setOffset(offset - 1)}
                    disabled={offset === 0}
                    style={[
                        styles.monthButton,
                        offset === 0 && styles.disabled,
                    ]}
                >
                    <Ionicons
                        name="chevron-back"
                        size={20}
                        color={colors.maroon}
                    />
                </Pressable>
                <Text style={styles.optionTitle}>
                    {month.toLocaleDateString(undefined, {
                        month: "long",
                        year: "numeric",
                    })}
                </Text>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Next month"
                    onPress={() => setOffset(offset + 1)}
                    style={styles.monthButton}
                >
                    <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={colors.maroon}
                    />
                </Pressable>
            </View>
            <View style={styles.calendarGrid}>
                {weekdays.map((day) => (
                    <View key={day} style={styles.dayCell}>
                        <Text style={styles.weekday}>{day}</Text>
                    </View>
                ))}
                {days.map((day) => {
                    if (day < 1)
                        return <View key={day} style={styles.dayCell} />;
                    const key = dateKey(
                        new Date(month.getFullYear(), month.getMonth(), day),
                    );
                    const selected = dates.includes(key);
                    return (
                        <View key={day} style={styles.dayCell}>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={displayDate(key)}
                                accessibilityState={{ selected }}
                                disabled={key < todayKey}
                                onPress={() => onToggle(key)}
                                style={[
                                    styles.day,
                                    selected && styles.selectedDay,
                                    key < todayKey && styles.disabled,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.dayText,
                                        key === todayKey && styles.todayText,
                                        selected && styles.selectedText,
                                    ]}
                                >
                                    {day}
                                </Text>
                            </Pressable>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

export default function CreateListing() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [pageDirection, setPageDirection] = useState<"forward" | "back">(
        "forward",
    );
    const [kind, setKind] = useState<ListingKind | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [condition, setCondition] = useState("");
    const [price, setPrice] = useState("");
    const [free, setFree] = useState(false);
    const [rateUnit, setRateUnit] =
        useState<(typeof rateUnits)[number][0]>("hour");
    const [meetup, setMeetup] = useState("");
    const [customMeetup, setCustomMeetup] = useState(false);
    const [customLocation, setCustomLocation] = useState("");
    const [dates, setDates] = useState<string[]>([]);
    const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
    const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(
        null,
    );
    const [postedId, setPostedId] = useState<number | null>(null);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [customPin, setCustomPin] = useState<{ x: number; y: number } | null>(
        null,
    );
    const publishing = useRef(false);
    const service = kind === "service";
    const meetupLabel = customMeetup ? customLocation.trim() : meetup;
    const choices = categories[kind ?? "item"];
    const categoryValue = choices.find(([label]) => label === category)?.[1];
    const numericPrice = free ? 0 : Number(price);
    const priceText = free
        ? "Free"
        : "$" +
          (price || "0") +
          (service
              ? { hour: "/hr", session: "/session", flat: "" }[rateUnit]
              : "");

    function chooseType(value: ListingKind) {
        if (value !== kind) {
            setKind(value);
            setCategory("");
            setCondition("");
        }
        setMessage("");
        setFieldErrors({});
    }

    async function pickPhoto() {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });
            if (!result.canceled) {
                setImage(result.assets[0]);
                setFieldErrors((current) => ({ ...current, photo: "" }));
            }
        } catch {
            setMessage("Could not open your photo library. Try again.");
        }
    }

    function next() {
        const errors: Record<string, string> = {};
        if (step === 0 && !kind) errors.kind = "Choose what you are posting.";
        if (step === 1) {
            if (!image) errors.photo = "Add a photo before you continue.";
            if (title.trim().length < 3)
                errors.title = "Use at least 3 characters.";
            if (description.trim().length < 10)
                errors.description = "Use at least 10 characters.";
            if (!categoryValue) errors.category = "Choose a category.";
        }
        if (step === 2) {
            if (!free && (!Number.isFinite(numericPrice) || numericPrice <= 0))
                errors.price = "Add a price or choose Free.";
            if (customMeetup && !meetupLabel && !customPin)
                errors.meetup = "Enter a location or drop a pin on the map.";
            if (!customMeetup && !meetup)
                errors.meetup = "Choose a pickup spot.";
        }
        if (Object.keys(errors).length) {
            setFieldErrors(errors);
            setMessage("");
        } else {
            setMessage("");
            setFieldErrors({});
            setPageDirection("forward");
            setStep(step + 1);
        }
    }

    async function post() {
        if (publishing.current || !kind || !categoryValue) return;
        publishing.current = true;
        setBusy(true);
        setMessage("");
        setFieldErrors({});
        try {
            const listing = await createListing({
                title,
                description,
                price: numericPrice,
                category: categoryValue,
            });
            if (image) {
                try {
                    await uploadListingImage(listing.listing_id, image);
                } catch (error) {
                    try {
                        await deleteListing(listing.listing_id);
                    } catch {
                        setPostedId(listing.listing_id);
                        setMessage(
                            "Your listing was posted, but the photo could not be attached.",
                        );
                        return;
                    }
                    throw error;
                }
            }
            setPostedId(listing.listing_id);
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Could not publish the listing. Try again.",
            );
        } finally {
            publishing.current = false;
            setBusy(false);
        }
    }

    function reset() {
        setPageDirection("forward");
        setStep(0);
        setKind(null);
        setTitle("");
        setDescription("");
        setCategory("");
        setCondition("");
        setPrice("");
        setFree(false);
        setRateUnit("hour");
        setMeetup("");
        setCustomMeetup(false);
        setCustomLocation("");
        setCustomPin(null);
        setDates([]);
        setSelectedTimes([]);
        setImage(null);
        setMessage("");
        setFieldErrors({});
        setPostedId(null);
    }

    function goBack() {
        if (step === 0) {
            if (router.canGoBack()) router.back();
            else router.replace("/Listings");
        } else {
            setMessage("");
            setPageDirection("back");
            setStep(step - 1);
        }
    }

    function chooseMeetup(value: string) {
        setMeetup(value);
        setCustomMeetup(false);
        setCustomPin(null);
        setMessage("");
        setFieldErrors({});
    }

    return (
        <PaperForm
            pageKey={postedId ? "posted" : step}
            stageVariant={
                postedId
                    ? "fade"
                    : pageDirection === "forward"
                      ? "notebookForward"
                      : "notebookBack"
            }
            header={
                !postedId && (
                    <View style={styles.top}>
                        <FormBack onPress={goBack} disabled={busy} />
                        <ProgressBar step={step} />
                    </View>
                )
            }
            footer={
                !postedId && (
                    <>
                        {!!message && (
                            <Text
                                accessibilityRole="alert"
                                style={paperFormStyles.error}
                            >
                                {message}
                            </Text>
                        )}
                        <FormAction
                            onPress={step === 4 ? post : next}
                            disabled={busy}
                        >
                            {busy
                                ? "Posting…"
                                : step === 4
                                  ? "Post it!"
                                  : step === 3
                                    ? "Review!"
                                    : "Next!"}
                        </FormAction>
                    </>
                )
            }
        >
            {postedId ? (
                <View style={styles.done}>
                    <FormStamp title="POSTED!" caption="DORMDEAL BOARD" />
                    <FormMotion delay={350}>
                        <Text
                            accessibilityRole="header"
                            style={[
                                paperFormStyles.heading,
                                styles.doneHeading,
                            ]}
                        >
                            it’s on the board
                        </Text>
                        <Text style={[paperFormStyles.body, styles.center]}>
                            Replies will land in your messages.
                        </Text>
                    </FormMotion>
                    <FormMotion delay={500}>
                        <View
                            style={[
                                paperFormStyles.note,
                                styles.safetyNote,
                            ]}
                        >
                            <Text style={paperFormStyles.noteText}>
                                Arrange a meetup somewhere public and busy.
                            </Text>
                        </View>
                    </FormMotion>
                    {!!message && (
                        <Text
                            accessibilityRole="alert"
                            style={paperFormStyles.error}
                        >
                            {message}
                        </Text>
                    )}
                    <FormMotion delay={650}>
                        <FormAction
                            onPress={() =>
                                router.replace(
                                    `/Store/Listing/Marketplace/live-${postedId}`,
                                )
                            }
                        >
                            See it on the board!
                        </FormAction>
                    </FormMotion>
                    <FormMotion delay={725}>
                        <FormAction onPress={() => router.replace("/home")}>
                            Go home
                        </FormAction>
                    </FormMotion>
                    <FormMotion delay={800}>
                        <FormAction onPress={reset}>Post another</FormAction>
                    </FormMotion>
                </View>
            ) : (
                <View style={styles.notebook}>
                    <View pointerEvents="none" style={styles.notebookMargin} />
                    <View pointerEvents="none" style={styles.notebookRings}>
                        {Array.from({ length: 8 }, (_, index) => (
                            <View key={index} style={styles.notebookRing} />
                        ))}
                    </View>
                    <View pointerEvents="none" style={styles.notebookRules}>
                        {Array.from({ length: 14 }, (_, index) => (
                            <View key={index} style={styles.notebookRule} />
                        ))}
                    </View>
                    <View style={styles.form}>
                    <Text
                        accessibilityRole="header"
                        style={[paperFormStyles.heading, styles.heading]}
                    >
                        {step === 0 ? "new listing notebook" : "new post"}
                    </Text>
                    {step === 0 && (
                        <>
                            <Text style={styles.section}>
                                where are you selling?
                            </Text>
                            {(["item", "service"] as const).map(
                                (value, index) => (
                                    <FormMotion
                                        key={value}
                                        delay={120 + index * 100}
                                    >
                                        <FormMotion
                                            variant="pop"
                                            trigger={Number(kind === value)}
                                        >
                                            <Pressable
                                                accessibilityRole="radio"
                                                accessibilityState={{
                                                    checked: kind === value,
                                                }}
                                                onPress={() =>
                                                    chooseType(value)
                                                }
                                                style={[
                                                    paperFormStyles.card,
                                                    styles.typeCard,
                                                    kind === value &&
                                                        styles.typeSelected,
                                                ]}
                                            >
                                                <View style={styles.tape} />
                                                <View
                                                    style={styles.illustration}
                                                >
                                                    {value === "item" ? (
                                                        <>
                                                            <View
                                                                style={[
                                                                    styles.photoFrame,
                                                                    styles.rearFrame,
                                                                ]}
                                                            />
                                                            <View
                                                                style={[
                                                                    styles.photoFrame,
                                                                    styles.leftFrame,
                                                                ]}
                                                            />
                                                            <View
                                                                style={
                                                                    styles.photoFrame
                                                                }
                                                            >
                                                                <Ionicons
                                                                    name="pricetags"
                                                                    color={
                                                                        colors.white
                                                                    }
                                                                    size={40}
                                                                />
                                                            </View>
                                                        </>
                                                    ) : (
                                                        <Ionicons
                                                            name="school"
                                                            color={
                                                                colors.maroon
                                                            }
                                                            size={96}
                                                        />
                                                    )}
                                                </View>
                                                <View style={styles.typeHeader}>
                                                    <Text
                                                        style={styles.typeTitle}
                                                    >
                                                        {value === "item"
                                                            ? "Marketplace"
                                                            : "Service"}
                                                    </Text>
                                                    {kind === value && (
                                                        <FormMotion
                                                            variant="badge"
                                                            style={styles.check}
                                                        >
                                                            <Ionicons
                                                                name="checkmark"
                                                                size={20}
                                                                color={
                                                                    colors.white
                                                                }
                                                            />
                                                        </FormMotion>
                                                    )}
                                                </View>
                                            </Pressable>
                                        </FormMotion>
                                    </FormMotion>
                                ),
                            )}
                            {!!fieldErrors.kind && (
                                <Text style={styles.fieldError}>
                                    {fieldErrors.kind}
                                </Text>
                            )}
                        </>
                    )}
                    {step === 1 && (
                        <StepSequence>
                            <View key="photo-group" style={styles.stepGroup}>
                                <Text style={styles.section}>photo</Text>
                                <View style={styles.photoBlock}>
                                {image ? (
                                    <FormMotion
                                        key={image.uri}
                                        style={[
                                            paperFormStyles.card,
                                            styles.photoPreview,
                                        ]}
                                    >
                                        <Image
                                            source={{ uri: image.uri }}
                                            style={styles.image}
                                            accessibilityLabel="Selected listing photo"
                                        />
                                        <View style={styles.chips}>
                                            <Chip
                                                label="Replace"
                                                selected={false}
                                                onPress={pickPhoto}
                                            />
                                            <Chip
                                                label="Remove"
                                                selected={false}
                                                onPress={() => setImage(null)}
                                            />
                                        </View>
                                    </FormMotion>
                                ) : (
                                    <Pressable
                                        accessibilityRole="button"
                                        onPress={pickPhoto}
                                        style={styles.addPhoto}
                                    >
                                        <Ionicons
                                            name="camera-outline"
                                            size={34}
                                            color={colors.maroon}
                                        />
                                        <Text style={styles.section}>
                                            add a photo!
                                        </Text>
                                        <Text style={styles.copy}>
                                            Required · choose from your library
                                        </Text>
                                    </Pressable>
                                )}
                                <PhotoDecorations />
                                </View>
                                {!!fieldErrors.photo && (
                                    <Text style={styles.fieldError}>
                                        {fieldErrors.photo}
                                    </Text>
                                )}
                            </View>
                            <View key="title-group" style={styles.stepGroup}>
                                <Text style={styles.section}>title</Text>
                                <TextInput
                                accessibilityLabel="Listing title"
                                style={[
                                    styles.field,
                                    styles.yellow,
                                    fieldErrors.title && styles.invalid,
                                ]}
                                value={title}
                                maxLength={40}
                                placeholder={
                                    service
                                        ? "e.g. Calc II tutoring"
                                        : "e.g. Mini fridge, 3.1 cu ft"
                                }
                                placeholderTextColor={colors.muted}
                                onChangeText={(value) => {
                                    setTitle(value);
                                    setFieldErrors((current) => ({
                                        ...current,
                                        title: "",
                                    }));
                                }}
                                />
                                <Text style={styles.counter}>
                                    {title.length}/40
                                </Text>
                                {!!fieldErrors.title && (
                                <Text
                                    style={[
                                        styles.fieldError,
                                        styles.detailsFieldError,
                                    ]}
                                >
                                    {fieldErrors.title}
                                </Text>
                                )}
                            </View>
                            <View key="description-group" style={styles.stepGroup}>
                                <Text style={styles.section}>description</Text>
                                <TextInput
                                accessibilityLabel="Listing description"
                                style={[
                                    styles.field,
                                    styles.description,
                                    fieldErrors.description && styles.invalid,
                                ]}
                                value={description}
                                maxLength={200}
                                multiline
                                placeholder={
                                    service
                                        ? "What you cover, how sessions work, what to bring…"
                                        : "What are you selling? Size, edition, what’s included…"
                                }
                                placeholderTextColor={colors.muted}
                                onChangeText={(value) => {
                                    setDescription(value);
                                    setFieldErrors((current) => ({
                                        ...current,
                                        description: "",
                                    }));
                                }}
                                />
                                <Text style={styles.counter}>
                                    {description.length}/200
                                </Text>
                                {!!fieldErrors.description && (
                                <Text
                                    style={[
                                        styles.fieldError,
                                        styles.detailsFieldError,
                                    ]}
                                >
                                    {fieldErrors.description}
                                </Text>
                                )}
                            </View>
                            <View key="category-group" style={styles.stepGroup}>
                                <Text style={styles.section}>category</Text>
                                <Text style={styles.copy}>choose one</Text>
                                <View
                                style={[
                                    styles.chips,
                                    fieldErrors.category && styles.invalidGroup,
                                ]}
                                >
                                {choices.map(([label]) => (
                                    <Chip
                                        key={label}
                                        label={label}
                                        selected={category === label}
                                        onPress={() => {
                                            setCategory(label);
                                            setFieldErrors((current) => ({
                                                ...current,
                                                category: "",
                                            }));
                                        }}
                                    />
                                ))}
                                </View>
                                {!!fieldErrors.category && (
                                    <Text style={styles.fieldError}>
                                        {fieldErrors.category}
                                    </Text>
                                )}
                            </View>
                            {!service && (
                                <View
                                    key="condition-group"
                                    style={[
                                        styles.stepGroup,
                                        styles.conditionGroup,
                                    ]}
                                >
                                    <Text style={styles.section}>
                                        condition
                                    </Text>
                                    <View style={styles.chips}>
                                        {conditions.map((value) => (
                                            <Chip
                                                key={value}
                                                label={value}
                                                selected={condition === value}
                                                onPress={() =>
                                                    setCondition(value)
                                                }
                                            />
                                        ))}
                                    </View>
                                </View>
                            )}
                        </StepSequence>
                    )}
                    {step === 2 && (
                        <StepSequence>
                            <Text style={styles.section}>
                                {service ? "set your rate" : "set your price"}
                            </Text>
                            <PriceTag>
                                <View style={styles.priceField}>
                                    <Text style={styles.price}>$</Text>
                                    <TextInput
                                        accessibilityLabel={
                                            service
                                                ? "Rate in dollars"
                                                : "Price in dollars"
                                        }
                                        style={[
                                            styles.price,
                                            styles.priceInput,
                                        ]}
                                        value={free ? "0" : price}
                                        inputMode="decimal"
                                        placeholder="0"
                                        placeholderTextColor={colors.muted}
                                        maxLength={9}
                                        onChangeText={(value) => {
                                            if (
                                                /^\d*(?:\.\d{0,2})?$/.test(
                                                    value.replace(",", "."),
                                                )
                                            ) {
                                                setFree(false);
                                                setPrice(
                                                    value.replace(",", "."),
                                                );
                                                setFieldErrors((current) => ({
                                                    ...current,
                                                    price: "",
                                                }));
                                            }
                                        }}
                                    />
                                    {service && !free && (
                                        <Text style={styles.priceUnit}>
                                            {
                                                rateUnits.find(
                                                    ([unit]) =>
                                                        unit === rateUnit,
                                                )?.[1]
                                            }
                                        </Text>
                                    )}
                                </View>
                            </PriceTag>
                            <View style={styles.chips}>
                                {["5", "10", "20", "50"].map((amount) => (
                                    <Chip
                                        key={amount}
                                        label={"$" + amount}
                                        selected={!free && price === amount}
                                        onPress={() => {
                                            setPrice(amount);
                                            setFree(false);
                                            setFieldErrors((current) => ({
                                                ...current,
                                                price: "",
                                            }));
                                        }}
                                    />
                                ))}
                                <Chip
                                    label="Free"
                                    selected={free}
                                    onPress={() => {
                                        setFree(!free);
                                        setPrice("");
                                        setFieldErrors((current) => ({
                                            ...current,
                                            price: "",
                                        }));
                                    }}
                                />
                            </View>
                            {!!fieldErrors.price && (
                                <Text style={styles.fieldError}>
                                    {fieldErrors.price}
                                </Text>
                            )}
                            {service && !free && (
                                <View style={styles.chips}>
                                    {rateUnits.map(([value, label]) => (
                                        <Chip
                                            key={value}
                                            label={label}
                                            selected={rateUnit === value}
                                            onPress={() => setRateUnit(value)}
                                        />
                                    ))}
                                </View>
                            )}
                            <View style={styles.paymentNote}>
                                <Ionicons
                                    name="information-circle-outline"
                                    size={20}
                                    color={colors.maroon}
                                />
                                <Text style={styles.flexCopy}>
                                    Payment is handled privately. DormDeal
                                    doesn’t handle money.
                                </Text>
                            </View>
                            <Text style={styles.section}>
                                where to meet?
                            </Text>
                            <MeetupMap
                                selected={customMeetup ? "" : meetup}
                                onSelect={chooseMeetup}
                                customMode={customMeetup}
                                customPin={customPin}
                                onCustomPin={(pin) => {
                                    setCustomPin(pin);
                                    setFieldErrors((current) => ({
                                        ...current,
                                        meetup: "",
                                    }));
                                }}
                            />
                            <View style={styles.chips}>
                                {spots.map(({ label }) => (
                                    <Chip
                                        key={label}
                                        label={label}
                                        selected={
                                            !customMeetup && meetup === label
                                        }
                                        onPress={() => chooseMeetup(label)}
                                    />
                                ))}
                            </View>
                            <Pressable
                                accessibilityRole="checkbox"
                                accessibilityState={{ checked: customMeetup }}
                                onPress={() => {
                                    setCustomMeetup((selected) => !selected);
                                    setMessage("");
                                    setFieldErrors((current) => ({
                                        ...current,
                                        meetup: "",
                                    }));
                                }}
                                style={[
                                    paperFormStyles.card,
                                    styles.customOption,
                                    customMeetup && styles.typeSelected,
                                ]}
                            >
                                <View
                                    style={[
                                        styles.customCheck,
                                        customMeetup && styles.selectedChip,
                                    ]}
                                >
                                    {customMeetup && (
                                        <Ionicons
                                            name="checkmark"
                                            size={18}
                                            color={colors.white}
                                        />
                                    )}
                                </View>
                                <Text style={styles.optionTitle}>
                                    Custom location
                                </Text>
                            </Pressable>
                            {customMeetup && (
                                <FormMotion>
                                    <TextInput
                                        accessibilityLabel="Custom meetup location"
                                        value={customLocation}
                                        maxLength={120}
                                        onChangeText={(value) => {
                                            setCustomLocation(value);
                                            setMessage("");
                                            setFieldErrors((current) => ({
                                                ...current,
                                                meetup: "",
                                            }));
                                        }}
                                        placeholder="Enter a meetup location"
                                        placeholderTextColor={colors.muted}
                                        style={[
                                            styles.field,
                                            styles.customInput,
                                            fieldErrors.meetup &&
                                                styles.invalid,
                                        ]}
                                    />
                                </FormMotion>
                            )}
                            {!!fieldErrors.meetup && (
                                <Text style={styles.fieldError}>
                                    {fieldErrors.meetup}
                                </Text>
                            )}
                        </StepSequence>
                    )}
                    {step === 3 && (
                        <StepSequence>
                            <Text style={styles.section}>
                                when are you free?
                            </Text>
                            <Availability
                                dates={dates}
                                onToggle={(key) =>
                                    setDates((current) =>
                                        current.includes(key)
                                            ? current.filter(
                                                  (value) => value !== key,
                                              )
                                            : [...current, key].sort(),
                                    )
                                }
                            />
                            <Text style={styles.copy}>
                                {dates.length
                                    ? dates.map(displayDate).join(", ")
                                    : "tap the days you can meet."}
                            </Text>
                            <Text style={[styles.section, styles.center]}>
                                what times work?
                            </Text>
                            <View style={[styles.chips, styles.timeChips]}>
                                {times.map((time) => (
                                    <Chip
                                        key={time}
                                        label={time}
                                        selected={selectedTimes.includes(time)}
                                        onPress={() =>
                                            setSelectedTimes((current) =>
                                                current.includes(time)
                                                    ? current.filter(
                                                          (value) =>
                                                              value !== time,
                                                      )
                                                    : [...current, time],
                                            )
                                        }
                                    />
                                ))}
                            </View>
                        </StepSequence>
                    )}
                    {step === 4 && (
                        <StepSequence>
                            <Text style={styles.section}>looks good?</Text>
                            <Text style={styles.copy}>
                                Your title, description, category, price and
                                photo will be published. Add any other details
                                buyers need to your description.
                            </Text>
                            <View style={styles.review}>
                                <View
                                    style={[
                                        paperFormStyles.card,
                                        styles.previewCard,
                                    ]}
                                >
                                    {image ? (
                                        <Image
                                            source={{ uri: image.uri }}
                                            style={styles.previewImage}
                                        />
                                    ) : (
                                        <View style={styles.previewPlaceholder}>
                                            <Ionicons
                                                name="image-outline"
                                                size={28}
                                                color={colors.white}
                                            />
                                        </View>
                                    )}
                                    <Text style={styles.optionTitle}>
                                        {title.trim()}
                                    </Text>
                                    <Text style={styles.reviewPrice}>
                                        {priceText}
                                    </Text>
                                </View>
                                <View style={styles.reviewInfo}>
                                    {[
                                        ["Price", priceText],
                                        ["Category", category],
                                        ["Condition", condition],
                                        ["About", description.trim()],
                                        ["Meetup", meetupLabel],
                                        [
                                            "Free on",
                                            dates.map(displayDate).join(", "),
                                        ],
                                        ["Times", selectedTimes.join(", ")],
                                    ]
                                        .filter(([, value]) => value)
                                        .map(([label, value]) => (
                                            <View
                                                key={label}
                                                style={styles.reviewRow}
                                            >
                                                <Text
                                                    style={styles.reviewLabel}
                                                >
                                                    {label}
                                                </Text>
                                                <Text
                                                    style={styles.reviewValue}
                                                >
                                                    {value}
                                                </Text>
                                            </View>
                                        ))}
                                </View>
                            </View>
                        </StepSequence>
                    )}
                    </View>
                </View>
            )}
        </PaperForm>
    );
}

const styles = StyleSheet.create({
    top: { flexDirection: "row", alignItems: "center", gap: 16 },
    progress: {
        flex: 1,
        paddingRight: 48,
        flexDirection: "row",
        justifyContent: "center",
        gap: 12,
    },
    dot: {
        width: 24,
        height: 12,
        borderRadius: 3,
        borderWidth: 2,
        borderColor: colors.maroon,
        overflow: "hidden",
    },
    dotFill: { height: "100%", backgroundColor: colors.maroon },
    notebook: {
        position: "relative",
        minHeight: "100%",
        overflow: "hidden",
        backgroundColor: "#FFFDF7",
        borderWidth: 1,
        borderColor: "#E5DDD0",
        boxShadow: "0px 3px 8px rgba(48, 31, 20, 0.12)",
        paddingTop: 22,
        paddingRight: 18,
        paddingBottom: 26,
        paddingLeft: 42,
    },
    notebookMargin: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 29,
        width: 2,
        backgroundColor: "#E7A7A7",
    },
    notebookRings: {
        position: "absolute",
        top: 22,
        bottom: 18,
        left: -8,
        justifyContent: "space-between",
    },
    notebookRing: {
        width: 24,
        height: 12,
        borderWidth: 3,
        borderColor: colors.ink,
        borderRadius: 6,
        backgroundColor: colors.cream,
    },
    notebookRules: {
        position: "absolute",
        top: 76,
        right: 0,
        bottom: 14,
        left: 32,
        justifyContent: "space-between",
    },
    notebookRule: { height: 1, backgroundColor: "#DDE9F2" },
    form: { gap: 13 },
    heading: { fontSize: 46, lineHeight: 49 },
    section: {
        fontFamily: "Caveat",
        fontWeight: "700",
        fontSize: 32,
        lineHeight: 34,
        color: colors.maroon,
    },
    typeCard: {
        borderWidth: 2,
        borderColor: colors.ink,
        backgroundColor: "#FFFDF8",
        padding: 14,
        marginVertical: 5,
        alignItems: "center",
    },
    typeSelected: { borderColor: colors.maroon, backgroundColor: "#FFF7DD" },
    tape: {
        position: "absolute",
        right: 20,
        top: -10,
        width: 68,
        height: 19,
        backgroundColor: "#FBE27ADD",
        transform: [{ rotate: "4deg" }],
        zIndex: 1,
    },
    illustration: {
        minHeight: 110,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 8,
        paddingVertical: 9,
    },
    photoFrame: {
        width: 104,
        height: 88,
        borderWidth: 5,
        borderBottomWidth: 14,
        borderColor: colors.white,
        backgroundColor: colors.maroon,
        justifyContent: "center",
        alignItems: "center",
        transform: [{ rotate: "-7deg" }],
    },
    rearFrame: {
        position: "absolute",
        right: 48,
        backgroundColor: colors.maroonLight,
        transform: [{ rotate: "8deg" }],
    },
    leftFrame: {
        position: "absolute",
        left: 48,
        backgroundColor: colors.tileRed,
        transform: [{ rotate: "-8deg" }],
    },
    typeHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 4,
        gap: 8,
    },
    typeTitle: {
        fontFamily: "Outfit",
        fontWeight: "800",
        fontSize: 28,
        color: colors.ink,
    },
    check: {
        width: 29,
        height: 29,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.maroon,
    },
    copy: {
        fontFamily: "Outfit",
        fontSize: 15,
        lineHeight: 20,
        color: colors.muted,
    },
    flexCopy: {
        flex: 1,
        fontFamily: "Outfit",
        fontSize: 14,
        lineHeight: 20,
        color: colors.ink,
    },
    addPhoto: {
        minHeight: 160,
        justifyContent: "center",
        alignItems: "center",
        gap: 4,
        borderWidth: 3,
        borderStyle: "dashed",
        borderColor: colors.maroon,
        backgroundColor: colors.cream,
    },
    photoBlock: { position: "relative", marginTop: 5 },
    photoDecorations: { ...StyleSheet.absoluteFill, zIndex: 2 },
    paperclip: {
        position: "absolute",
        top: -20,
        left: "27%",
        transform: [{ rotate: "-30deg" }],
    },
    photoTape: {
        position: "absolute",
        top: -12,
        right: 14,
        width: 92,
        height: 27,
        backgroundColor: "#FBE27AE6",
        transform: [{ rotate: "2deg" }],
        justifyContent: "center",
    },
    tapeSeam: {
        borderTopWidth: 2,
        borderStyle: "dashed",
        borderColor: "#00000030",
    },
    photoPreview: { gap: 8, padding: 8 },
    image: { width: "100%", aspectRatio: 2, backgroundColor: colors.maroon },
    field: {
        minHeight: 53,
        borderBottomWidth: 3,
        borderColor: colors.ink,
        borderRadius: 6,
        padding: 12,
        fontFamily: "Outfit",
        fontSize: 19,
        color: colors.ink,
    },
    yellow: { backgroundColor: "#F7E26B" },
    description: {
        minHeight: 140,
        textAlignVertical: "top",
        backgroundColor: colors.white,
        fontFamily: "Outfit",
        fontSize: 19,
    },
    counter: {
        alignSelf: "flex-end",
        fontFamily: "Outfit",
        fontSize: 13,
        color: colors.muted,
        marginTop: -8,
    },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    stepGroup: { gap: 13 },
    conditionGroup: { marginBottom: 18 },
    timeChips: { justifyContent: "center" },
    chip: {
        paddingHorizontal: 11,
        paddingVertical: 8,
        minHeight: 40,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: colors.maroon,
        justifyContent: "center",
    },
    chipText: {
        fontFamily: "Outfit",
        fontSize: 14,
        fontWeight: "700",
        color: colors.maroon,
    },
    selectedChip: { backgroundColor: colors.maroon },
    selectedText: { color: colors.white },
    priceTag: {
        width: "100%",
        maxWidth: 366,
        aspectRatio: 366 / 140,
        justifyContent: "center",
        marginTop: 5,
        transform: [{ rotate: "-1.5deg" }],
    },
    priceTagArt: { ...StyleSheet.absoluteFill },
    priceField: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingLeft: "23%",
        paddingRight: "7%",
    },
    price: {
        fontFamily: "Outfit",
        fontWeight: "800",
        fontSize: 46,
        color: colors.maroon,
    },
    priceInput: { flex: 1, minWidth: 0 },
    priceUnit: {
        fontFamily: "Caveat",
        color: colors.maroon,
        fontSize: 19,
        fontWeight: "700",
        maxWidth: "35%",
    },
    paymentNote: {
        flexDirection: "row",
        alignItems: "center",
        gap: 9,
        backgroundColor: colors.goldLight,
        padding: 11,
    },
    map: {
        width: "100%",
        maxWidth: 480,
        borderWidth: 3,
        borderColor: colors.ink,
        backgroundColor: "#E4EBD5",
    },
    mapCanvas: {
        width: "100%",
        aspectRatio: 342 / 255,
        position: "relative",
        overflow: "hidden",
    },
    mapLayer: { ...StyleSheet.absoluteFill },
    mapTile: { position: "absolute", width: "33.34%", height: "33.34%" },
    mapLabel: {
        position: "absolute",
        top: 7,
        left: 7,
        backgroundColor: colors.goldLight,
        padding: 5,
        fontFamily: "Outfit",
        fontWeight: "800",
        fontSize: 11,
        color: colors.ink,
    },
    mapAttribution: {
        fontFamily: "Outfit",
        fontSize: 10,
        color: colors.muted,
        paddingTop: 3,
    },
    pin: {
        position: "absolute",
        width: 44,
        height: 44,
        marginLeft: -22,
        marginTop: -36,
        alignItems: "center",
        justifyContent: "center",
    },
    customOption: {
        minHeight: 51,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        borderWidth: 2,
        borderColor: colors.maroon,
        borderRadius: 6,
        paddingHorizontal: 12,
    },
    customCheck: {
        width: 24,
        height: 24,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: colors.maroon,
        borderRadius: 4,
    },
    customInput: {
        backgroundColor: colors.white,
        borderWidth: 2,
        borderColor: colors.maroon,
        fontSize: 17,
    },
    invalid: { borderColor: "#B33B3B", backgroundColor: "#FBE9E9" },
    invalidGroup: {
        borderLeftWidth: 3,
        borderLeftColor: "#B33B3B",
        paddingLeft: 7,
    },
    fieldError: {
        fontFamily: "Outfit",
        fontSize: 13,
        fontWeight: "700",
        color: "#B33B3B",
        marginTop: -6,
    },
    detailsFieldError: {
        marginTop: -16,
    },
    calendar: {
        borderWidth: 2,
        borderColor: colors.ink,
        paddingHorizontal: 5,
        paddingBottom: 7,
    },
    calendarTop: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    monthButton: {
        width: 43,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
    },
    disabled: { opacity: 0.35 },
    calendarGrid: { flexDirection: "row", flexWrap: "wrap" },
    dayCell: {
        width: "14.28%",
        minHeight: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    weekday: { fontFamily: "Outfit", color: colors.muted, fontSize: 12 },
    day: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    selectedDay: { backgroundColor: colors.maroon },
    dayText: {
        fontFamily: "Outfit",
        fontWeight: "600",
        fontSize: 16,
        color: colors.ink,
    },
    todayText: { color: colors.maroon },
    optionTitle: {
        fontFamily: "Outfit",
        fontWeight: "700",
        fontSize: 16,
        color: colors.ink,
    },
    review: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 14,
        marginTop: 10,
    },
    previewCard: {
        width: "43%",
        padding: 7,
        gap: 6,
        transform: [{ rotate: "-2deg" }],
    },
    previewImage: { width: "100%", aspectRatio: 1.25 },
    previewPlaceholder: {
        aspectRatio: 1.25,
        backgroundColor: colors.maroon,
        alignItems: "center",
        justifyContent: "center",
    },
    reviewPrice: {
        fontFamily: "Outfit",
        fontSize: 18,
        fontWeight: "800",
        color: colors.maroon,
    },
    reviewInfo: { flex: 1, gap: 4 },
    reviewRow: {
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderColor: "#C9BEB1",
        borderStyle: "dashed",
    },
    reviewLabel: { fontFamily: "Caveat", fontSize: 19, color: colors.muted },
    reviewValue: {
        fontFamily: "Outfit",
        fontWeight: "700",
        fontSize: 14,
        color: colors.ink,
    },
    done: { flex: 1, justifyContent: "center", gap: 21, paddingVertical: 15 },
    doneHeading: { fontSize: 38, lineHeight: 41, textAlign: "center" },
    center: { textAlign: "center" },
    safetyNote: { transform: [{ rotate: "0.75deg" }] },
});

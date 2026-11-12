export type TransitionId = 'door' | 'sticky' | 'stamp' | 'plane';
export type TransitionSource = { pathname: string; stageBottom?: number };

type TransitionHost = (from: TransitionSource, to: string, id?: TransitionId) => Promise<void>;

let host: TransitionHost | undefined;
let cancelActiveTransition: (() => void) | undefined;
let busy = false;
let K = 1;
let activeTransition: TransitionId | undefined;
let navigationSequence = 0;
const completionListeners = new Set<(id: TransitionId) => void>();

export const d = (ms: number) => ms * K;
export const rnd = (a: number, b: number) => a + Math.random() * (b - a);
export const pick = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)];
export const easeIO = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
export const easeO = (t: number) => 1 - Math.pow(1 - t, 3);
export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function setTransitionSpeed(factor: number) {
    if (Number.isFinite(factor) && factor > 0 && !busy) K = factor;
}

export function registerTransitionHost(next: TransitionHost, cancel: () => void) {
    host = next;
    cancelActiveTransition = cancel;
    return () => {
        if (host === next) {
            host = undefined;
            cancelActiveTransition = undefined;
        }
    };
}

/** Lets destination screens defer their own entrance animation until the overlay is gone. */
export function isTransitionPending(id: TransitionId) {
    return busy && activeTransition === id;
}

export function subscribeToTransitionComplete(listener: (id: TransitionId) => void) {
    completionListeners.add(listener);
    return () => completionListeners.delete(listener);
}

export function notifyTransitionComplete(id: TransitionId) {
    completionListeners.forEach((listener) => listener(id));
}

export async function navigateWithTransition(fromScreen: TransitionSource, toScreen: string, transitionId?: TransitionId) {
    if (!host || (!busy && fromScreen.pathname === toScreen)) return;
    if (busy) cancelActiveTransition?.();
    const sequence = ++navigationSequence;
    busy = true;
    activeTransition = transitionId;
    try {
        await host(fromScreen, toScreen, transitionId);
    } finally {
        if (sequence === navigationSequence) {
            activeTransition = undefined;
            busy = false;
        }
    }
}

export const tabTransitions: Partial<Record<string, TransitionId>> = {
    '/Store': 'sticky',
    '/Contacts': 'plane',
};

/** Named transitions always win. The door can be disabled for every remaining tab. */
export function getTabTransition(destination: string): TransitionId | undefined {
    return tabTransitions[destination] ?? (getDoorTransitionEnabled() ? 'door' : undefined);
}

const doorTransitionKey = 'dormdeal:door-transition-enabled';
let doorTransitionEnabled: boolean | undefined;

export function getDoorTransitionEnabled() {
    if (doorTransitionEnabled !== undefined) return doorTransitionEnabled;
    try {
        const saved = globalThis.localStorage?.getItem(doorTransitionKey);
        return saved === null ? true : saved === '1';
    } catch { return true; }
}

export function setDoorTransitionEnabled(enabled: boolean) {
    doorTransitionEnabled = enabled;
    try { globalThis.localStorage?.setItem(doorTransitionKey, enabled ? '1' : '0'); }
    catch { /* Keep the setting for the current app session. */ }
}

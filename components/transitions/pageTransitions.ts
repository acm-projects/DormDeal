export type TransitionId = 'sticky' | 'plane';
export type TransitionSource = { pathname: string; stageBottom?: number };

type TransitionHost = (from: TransitionSource, to: string, id?: TransitionId) => Promise<void>;

let host: TransitionHost | undefined;
let cancelActiveTransition: (() => void) | undefined;
let busy = false;
let K = 1;
let navigationSequence = 0;

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

export async function navigateWithTransition(fromScreen: TransitionSource, toScreen: string, transitionId?: TransitionId) {
    if (!host || (!busy && fromScreen.pathname === toScreen)) return;
    if (busy) cancelActiveTransition?.();
    const sequence = ++navigationSequence;
    busy = true;
    try {
        await host(fromScreen, toScreen, transitionId);
    } finally {
        if (sequence === navigationSequence) {
            busy = false;
        }
    }
}

export const tabTransitions: Partial<Record<string, TransitionId>> = {
    '/Store': 'sticky',
    '/Contacts': 'plane',
};

/** Only tabs with a named transition receive an animation. */
export function getTabTransition(destination: string): TransitionId | undefined {
    return tabTransitions[destination];
}

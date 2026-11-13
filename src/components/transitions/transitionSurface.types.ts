import type { TransitionId } from "./pageTransitions";

export type Snapshot = string | HTMLElement;

export type TransitionScene = {
    from: Snapshot;
    to?: Snapshot;
    id: TransitionId;
    width: number;
    height: number;
    bottom: number;
    ready: () => void;
    complete: () => void;
};

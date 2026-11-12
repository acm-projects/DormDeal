import { useLayoutEffect, useRef } from 'react';
import type { View } from 'react-native';
import { runBrowserTransition } from './browserTransitions';
import type { Snapshot, TransitionScene } from './transitionSurface.types';
import './pageTransitions.css';

export async function captureScreen(view: View): Promise<Snapshot> {
    const node = view as unknown as HTMLElement;
    const clone = node.cloneNode(true) as HTMLElement;
    const { width, height } = node.getBoundingClientRect();
    Object.assign(clone.style, { width: width + 'px', height: height + 'px', flex: 'none' });
    const originalElements = node.querySelectorAll('*');
    clone.querySelectorAll('*').forEach((element, index) => {
        const original = originalElements[index];
        if (original && (original.scrollLeft || original.scrollTop)) {
            element.setAttribute('data-dd-scroll', original.scrollLeft + ',' + original.scrollTop);
        }
    });
    return clone;
}

export function releaseScreen(_snapshot: Snapshot) {}

function attach(wrapper: HTMLDivElement, snapshot: HTMLElement) {
    wrapper.replaceChildren(snapshot);
    snapshot.querySelectorAll('[data-dd-scroll]').forEach((element) => {
        const [left, top] = element.getAttribute('data-dd-scroll')!.split(',').map(Number);
        element.scrollLeft = left;
        element.scrollTop = top;
    });
}

export function TransitionSurface({ scene }: { scene: TransitionScene }) {
    const stage = useRef<HTMLDivElement>(null);
    const from = useRef<HTMLDivElement>(null);
    const to = useRef<HTMLDivElement>(null);
    const { from: outgoing, to: incoming, id, ready, complete } = scene;

    useLayoutEffect(() => {
        if (from.current) attach(from.current, outgoing as HTMLElement);
        ready();
    }, [outgoing, ready]);

    useLayoutEffect(() => {
        if (!incoming || !stage.current || !from.current || !to.current) return;
        const destination = to.current;
        destination.classList.add('anim');
        attach(destination, incoming as HTMLElement);
        void runBrowserTransition(stage.current, from.current, destination, id)
            .catch((error) => console.warn('Page transition failed', error))
            .finally(complete);
    }, [incoming, id, complete]);

    return (
        <div ref={stage} className="dd-transition-stage" style={{ bottom: scene.bottom }} aria-hidden="true">
            <div ref={from} className="screen active" inert />
            <div ref={to} className="screen" inert />
        </div>
    );
}

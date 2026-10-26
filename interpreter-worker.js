importScripts('algo.js');

let session = null;
let sourceCode = '';

self.addEventListener('message', (event) => {
    if (!event.data) {
        return;
    }

    try {
        if (event.data.type === 'init') {
            sourceCode = event.data.sourceCode;
            session = AlgoEngine.createSession(sourceCode);
            self.postMessage({ type: 'ready', state: session.snapshot() });
        } else if (event.data.type === 'step' && session) {
            const state = session.step();
            self.postMessage({ type: state.finished ? 'complete' : 'state', state });
        } else if (event.data.type === 'run' && session) {
            while (!session.finished) session.step();
            self.postMessage({ type: 'complete', state: session.snapshot() });
        } else if (event.data.type === 'back' && session) {
            const targetStep = Math.max(0, session.currentStep - 1);
            session = AlgoEngine.createSession(sourceCode);
            while (session.currentStep < targetStep) session.step();
            self.postMessage({ type: 'state', state: session.snapshot() });
        }
    } catch (error) {
        self.postMessage({
            type: 'error',
            message: error instanceof Error ? error.message : String(error)
        });
    }
});

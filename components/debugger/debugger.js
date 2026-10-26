class DebuggerComponent extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        $.get('components/debugger/debugger.html', (html) => {
            this.shadowRoot.innerHTML = html;
            
            // Wire up the settings gear button from inside the shadow root
            const btnSettings = this.shadowRoot.getElementById('debug-settings');
            if (btnSettings) {
                $(btnSettings).on('click', () => {
                    const settingsWidget = document.getElementById('my-settings-widget');
                    if (settingsWidget && typeof settingsWidget.openModal === 'function') {
                        settingsWidget.openModal();
                    }
                });
            }
        });
    }
}
customElements.define('debugger-component', DebuggerComponent);

window.DebuggerController = class DebuggerController {
    constructor(editor) {
        this.editor = editor;
        this.worker = null;
        this.state = null;

        // Query main page/global status elements
        this.$status =$('#debug-status');
        this.$location =$('#debug-location');
        this.$hiddenOutputDisplay =$('#output-display');

        // Query elements from inside the respective Shadow DOM components
        const debuggerComp = document.querySelector('debugger-component');
        const outputComp = document.querySelector('output-component');
        const memoryComp = document.querySelector('memory-component');

        const dRoot = debuggerComp ? debuggerComp.shadowRoot : null;
        const oRoot = outputComp ? outputComp.shadowRoot : null;

        this.$stepCount = oRoot ? $(oRoot.getElementById('debug-step-count')) :$('#debug-step-count');
        this.$output = oRoot ? $(oRoot.getElementById('debug-output')) :$('#debug-output');

        this.$btnBack = dRoot ? $(dRoot.getElementById('step-back')) :$('#step-back');
        this.$btnForward = dRoot ? $(dRoot.getElementById('step-forward')) :$('#step-forward');
        this.$btnRun = dRoot ? $(dRoot.getElementById('debug-run')) :$('#debug-run');
        this.$btnReset = dRoot ? $(dRoot.getElementById('debug-reset')) :$('#debug-reset');

        this.bindEvents();
        this.reset();
    }

    bindEvents() {
        // --- STEP FORWARD ---
        this.$btnForward.on('click', () => {
            this.setAllExecutionButtonsLoading(true, this.$btnForward);
            this.post('step');
        });
        
        // --- STEP BACK ---
        this.$btnBack.on('click', () => {
            this.setAllExecutionButtonsLoading(true, this.$btnBack);
            this.post('back');
        });

        // --- RESET ---
        this.$btnReset.on('click', () => this.reset());
        
        // --- RUN ---
        this.$btnRun.on('click', () => {
            this.setAllExecutionButtonsLoading(true, this.$btnRun);

            if (!this.worker || this.state?.finished) {
                this.bootWorker(() => this.post('run'));
            } else {
                this.post('run');
            }
        });
    }

    // Locks or unlocks all 3 execution buttons at once, showing a spinner on the active one
    setAllExecutionButtonsLoading(isLoading, $activeBtn = null) {
        const buttons = [this.$btnBack, this.$btnForward, this.$btnRun];

        buttons.forEach($btn => {
            if (!$btn || !$btn.length) return;
            $btn.prop('disabled', isLoading);
            
            // If this is the specific button that was clicked, toggle its spinner state
            if ($activeBtn && $btn.is($activeBtn)) {
                $btn.find('.spinner-border').toggleClass('d-none', !isLoading);$btn.find('.btn-icon').toggleClass('d-none', isLoading);
            } else if (!isLoading) {
                // Ensure other buttons clear any lingering spinners when resetting state
                $btn.find('.spinner-border').addClass('d-none');$btn.find('.btn-icon').removeClass('d-none');
            }
        });
    }

    post(action) {
        this.worker?.postMessage({ type: action });
    }

    reset() {
        this.worker?.terminate();
        this.worker = null;
        this.state = null;

        if (this.$btnBack?.length) this.$btnBack.prop('disabled', true);
        if (this.$btnForward?.length) this.$btnForward.prop('disabled', true);
        if (this.$btnRun?.length) this.$btnRun.prop('disabled', true);
        
        // Clear all spinners on reset
        this.setAllExecutionButtonsLoading(false);
        
        if (this.editor && typeof this.editor.renderHighlights === 'function') {
            this.editor.renderHighlights(null); 
        }
        this.bootWorker(); 
    }

    bootWorker(onReadyCallback) {
        if (this.worker) this.worker.terminate();

        const handleMessage = (event) => {
            const { type, state, output, message } = event.data;
            
            if (type === 'error') {
                this.showError(message);
                return;
            }

            if (state) {
                this.state = state;
                this.updateUI();
            }

            if (type === 'ready' && onReadyCallback) onReadyCallback();
            if (type === 'complete' && output && this.$hiddenOutputDisplay.length) {
                this.$hiddenOutputDisplay.val(output.join('\n'));
            }
        };

        if (window.location.protocol === 'file:') {
            this.worker = this.createStaticPolyfill(handleMessage);
        } else {
            this.worker = new Worker(new URL('interpreter-worker.js', document.baseURI));
            this.worker.addEventListener('message', handleMessage);
            this.worker.addEventListener('error', (e) => this.showError(e.message || 'Worker crashed.'));
        }

        const code = this.editor && typeof this.editor.getCode === 'function' ? this.editor.getCode() : "";
        this.worker.postMessage({ type: 'init', sourceCode: code });
    }

    updateUI() {
        this.$status.text(this.state.finished ? 'Finished' : this.state.step === 0 ? 'Paused before start' : 'Paused');
        this.$location.text(this.state.currentLine ? `Next: line ${this.state.currentLine}` : 'Program complete');
        this.$stepCount.text(`Step ${this.state.step}`);
        this.$output.text(this.state.output || 'No output yet.');
        
        // Pass variables directly to the intelligent memory component
        const memoryComp = document.querySelector('memory-component');
        if (memoryComp && typeof memoryComp.update === 'function') {
            memoryComp.update(this.state.variables);
        }

        // Re-enable/disable based on current state rules once calculation finishes
        if (this.$btnBack?.length) this.$btnBack.prop('disabled', this.state.step === 0);
        if (this.$btnForward?.length) this.$btnForward.prop('disabled', this.state.finished);
        if (this.$btnRun?.length) this.$btnRun.prop('disabled', false);

        // Clear all loading spinners and restore icons across all action buttons
        this.setAllExecutionButtonsLoading(false);

        if (this.editor && typeof this.editor.renderHighlights === 'function') {
            this.editor.renderHighlights(this.state);
        }
    }

    showError(message) {
        this.$status.text('Error');
        this.$output.text(`Error: ${message}`);
        
        if (this.$btnForward?.length) this.$btnForward.prop('disabled', true);
        if (this.$btnRun?.length) this.$btnRun.prop('disabled', true);
        if (this.$btnBack?.length) this.$btnBack.prop('disabled', true);

        // Clear all spinners on error state
        this.setAllExecutionButtonsLoading(false);
        
        const match = message.match(/line\s+(\d+)/i);
        const errorLine = match ? parseInt(match[1], 10) : null;
        
        if (this.editor && typeof this.editor.renderHighlights === 'function') {
            this.editor.renderHighlights(this.state, errorLine);
        }
    }

    createStaticPolyfill(dispatch) {
        let session = null;
        let sourceCode = '';
        let terminated = false;
        
        const emit = (type, state, output, message) => {
            if (!terminated) dispatch({ data: { type, state, output, message } });
        };
        
        return {
            terminate: () => { terminated = true; session = null; },
            postMessage: (message) => {
                if (terminated) return;
                try {
                    if (message.type === 'init') {
                        sourceCode = message.sourceCode;
                        session = AlgoEngine.createSession(sourceCode);
                        emit('ready', session.snapshot());
                    } else if (message.type === 'step' && session) {
                        const state = session.step();
                        emit(state.finished ? 'complete' : 'state', state);
                    } else if (message.type === 'run' && session) {
                        while (!session.finished) session.step();
                        emit('complete', session.snapshot());
                    } else if (message.type === 'back' && session) {
                        const targetStep = Math.max(0, session.currentStep - 1);
                        session = AlgoEngine.createSession(sourceCode);
                        while (session.currentStep < targetStep) session.step();
                        emit('state', session.snapshot());
                    }
                } catch (error) {
                    emit('error', null, null, error instanceof Error ? error.message : String(error));
                }
            }
        };
    }
};
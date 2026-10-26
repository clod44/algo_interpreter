class SettingsComponent extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });

        $.get('components/settings/settings.html', (html) => {
            this.shadowRoot.innerHTML = html;
            this.initElements();
            this.initThemeState();
            this.bindEvents();
            this.apply();
        });
    }

    initElements() {
        this.$dialog =$(this.shadowRoot.getElementById('debug-settings-dialog'));
        this.$toggleTheme =$(this.shadowRoot.getElementById('toggle-theme'));
        this.$outputChars =$(this.shadowRoot.getElementById('output-chars'));
        this.$outputCharsValue =$(this.shadowRoot.getElementById('output-chars-value'));
    }

    initThemeState() {
        const isDark = $('html').attr('data-bs-theme') === 'dark';
        this.$toggleTheme.prop('checked', isDark);
    }

    bindEvents() {
        this.$dialog.on('close', () => this.apply());
        this.$toggleTheme.on('change', () => this.apply());
        this.$outputChars.on('input change', () => this.apply());
        $(this.shadowRoot.querySelectorAll('.form-check-input')).on('change', () => this.apply());$(window).on('resize', () => this.apply());
    }

    openModal() {
        if (this.$dialog && this.$dialog.length) {
            this.$dialog.get(0)?.showModal();
        }
    }

    apply() {
        if (!this.$dialog || !this.$dialog.length) return;

        const isDark = this.$toggleTheme.is(':checked');$('html').attr('data-bs-theme', isDark ? 'dark' : 'light');

        const showCode = this.shadowRoot.getElementById('toggle-code')?.checked ?? true;
        const showOutput = this.shadowRoot.getElementById('toggle-output')?.checked ?? true;
        const showMemory = this.shadowRoot.getElementById('toggle-memory')?.checked ?? true;

        $('#panel-code').toggleClass('d-none', !showCode);
        $('output-component').toggleClass('d-none', !showOutput);$('memory-component').toggleClass('d-none', !showMemory);
        
        // Output width character scaling
        const chars = this.$outputChars.val();
        this.$outputCharsValue.text(chars);
        
        // Target the debug-output inside the output-component's Shadow DOM
        const outputEl = document.querySelector('output-component');
        const debugOutputEl = outputEl?.shadowRoot?.getElementById('debug-output');

        if (debugOutputEl) {
            const $debugOutput =$(debugOutputEl);
            const width = $debugOutput.width();
            if (width > 0) {
                const fontSize = Math.min(14, Math.max(8, (width - 16) / Number(chars) * 1.65));
                $debugOutput.css('font-size', `${fontSize}px`);
            }
        }
    }
}

customElements.define('settings-component', SettingsComponent);
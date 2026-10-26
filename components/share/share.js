class ShareComponent extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.b64SafeLimit = 1000;
        this.editor = null;

        // Use jQuery to load the HTML file cleanly into the shadow root
        $.get('components/share/share.html', (html) => {
            this.shadowRoot.innerHTML = html;

            this.$btnShareLink = this.shadowRoot.getElementById('btn-share-link');
            this.$btnCopyB64 = this.shadowRoot.getElementById('btn-copy-b64');
            this.$btnLoadB64 = this.shadowRoot.getElementById('btn-load-b64');

            $(this.$btnShareLink).on('click', () => this.handleShareLink());
            $(this.$btnCopyB64).on('click', () => this.handleCopyB64());
            $(this.$btnLoadB64).on('click', () => this.handleLoadB64());
        }).fail((jqXHR, textStatus, errorThrown) => {
            console.error("Failed to load share.html component via jQuery:", textStatus, errorThrown);
        });
    }

    setEditor(editor) {
        this.editor = editor;
        this.checkUrlHash();
    }

    checkUrlHash() {
        const hash = window.location.hash;
        if (hash.includes('code=')) {
            try {
                const base64Code = hash.split('code=')[1];
                const decodedCode = this.decodeBase64(base64Code);
                if (decodedCode && this.editor) {
                    setTimeout(() => this.editor.setCode(decodedCode), 100);
                }
            } catch (e) {
                console.error("Failed to parse shared code from URL:", e);
            }
        }
    }

    handleShareLink() {
        if (!this.editor) return;
        const code = this.editor.getCode();
        if (!code.trim()) return;

        const base64Code = this.encodeBase64(code);
        if (base64Code.length > this.b64SafeLimit) {
            alert(`It's too long (${base64Code.length} chars). Copy the base64 code instead using the B64 button!`);
            return;
        }

        const shareUrl = `${window.location.origin}${window.location.pathname}#code=${base64Code}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            this.flashButton(this.$btnShareLink, 'Copied');
        }).catch(() => alert("Failed to copy link to clipboard."));
    }

    handleCopyB64() {
        if (!this.editor) return;
        const code = this.editor.getCode();
        if (!code.trim()) return;

        const base64Code = this.encodeBase64(code);
        navigator.clipboard.writeText(base64Code).then(() => {
            this.flashButton(this.$btnCopyB64, 'Copied');
        }).catch(() => alert("Failed to copy base64 string."));
    }

    handleLoadB64() {
        if (!this.editor) return;
        const rawB64 = prompt("Paste your Base64 project code string below:");
        if (!rawB64 || !rawB64.trim()) return;

        try {
            const decodedCode = this.decodeBase64(rawB64.trim());
            if (decodedCode) {
                this.editor.setCode(decodedCode);
            }
        } catch (e) {
            alert("Invalid Base64 string. Could not decode code.");
        }
    }

    flashButton($btn, successText) {
        const $el = $($btn);
        const originalHtml = $el.html();$el.html(`<i class="bi bi-check-lg text-success"></i> ${successText}`);
        setTimeout(() => $el.html(originalHtml), 1500);
    }

    encodeBase64(str) {
        const utf8Bytes = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
            return String.fromCharCode('0x' + p1);
        });
        return btoa(utf8Bytes);
    }

    decodeBase64(base64Str) {
        return decodeURIComponent(atob(base64Str).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    }
}

customElements.define('share-component', ShareComponent);
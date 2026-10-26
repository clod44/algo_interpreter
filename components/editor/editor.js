// Define the custom CodeMirror 5 syntax mode for Algo
CodeMirror.defineSimpleMode("algo", {
    start: [
        {regex: /\/\/.*/, token: "comment"},
        {regex: /"[^"\\]*(?:\\.[^"\\]*)*"/, token: "string"},
        {regex: /'[^'\\]*(?:\\.[^'\\]*)*'/, token: "string"},
        {regex: /"[^"\r\n]*$/, token: "string", next: "multiline_double"},
        {regex: /'[^'\r\n]*$/, token: "string", next: "multiline_single"},
        {regex: /\b(START|FINISH|ECHO|LINE|IF|THEN|ELSE|GO)\b/, token: "keyword"},
        {regex: /\b\d+(?:\.\d+)?\b/, token: "number"},
        {regex: /(\+=|-=|\*=|=|<|>|==)/, token: "operator"},
        {regex: /[a-zA-Z_][a-zA-Z0-9_]*/, token: "variable"}
    ],
    multiline_double: [
        {regex: /[^"]*"/, token: "string", next: "start"},
        {regex: /.*/, token: "string"}
    ],
    multiline_single: [
        {regex: /[^']*'/, token: "string", next: "start"},
        {regex: /.*/, token: "string"}
    ],
    meta: {
        lineComment: "//"
    }
});

// Register CodeMirror Autocomplete Helper
CodeMirror.registerHelper("hint", "algo", function(editor) {
    const cur = editor.getCursor();
    const token = editor.getTokenAt(cur);
    const currentWord = token.type === "variable" || token.type === null ? token.string.trim() : "";
    
    const keywords = ['START', 'FINISH', 'ECHO', 'LINE', 'IF', 'THEN', 'ELSE', 'GO'];
    const docText = editor.getValue();
    const matches = docText.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];
    const suggestions = Array.from(new Set([...keywords, ...matches]));
    
    const filtered = suggestions.filter(item => 
        item.toLowerCase().startsWith(currentWord.toLowerCase())
    );

    return {
        list: filtered,
        from: CodeMirror.Pos(cur.line, token.start),
        to: CodeMirror.Pos(cur.line, token.end)
    };
});

class EditorComponent extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.cm = null;
        this.onCodeChangeCallback = null;

        $.get('components/editor/editor.html', (html) => {
            this.shadowRoot.innerHTML = html;

            const textarea = this.shadowRoot.getElementById('code-input');
            
            // Initialize CodeMirror after a brief macro-task frame
            setTimeout(() => {
                this.cm = CodeMirror.fromTextArea(textarea, {
                    lineNumbers: true,
                    tabSize: 4,
                    indentUnit: 4,
                    mode: "algo",
                    lineWrapping: false,
                    extraKeys: {"Ctrl-Space": "autocomplete"}
                });

                this.cm.on("inputRead", (cm, change) => {
                    if (!cm.state.completionActive && /^[a-zA-Z]$/.test(change.text[0])) {
                        CodeMirror.commands.autocomplete(cm, null, { completeSingle: false });
                    }
                });

                this.cm.on('change', () => {
                    if (typeof this.onCodeChangeCallback === 'function') {
                        this.onCodeChangeCallback();
                    }
                });

                // Force CodeMirror to calculate its layout and size correctly
                this.cm.refresh();

                // Wire up the nested share widget if present in the header
                const shareWidget = this.shadowRoot.getElementById('my-share-widget');
                if (shareWidget && typeof shareWidget.setEditor === 'function') {
                    shareWidget.setEditor(this);
                }
            }, 50);
        });
    }

    onChange(callback) {
        this.onCodeChangeCallback = callback;
    }

    getCode() {
        return this.cm ? this.cm.getValue() : "";
    }

    setCode(code) {
        if (this.cm) {
            this.cm.setValue(code);
            if (typeof this.onCodeChangeCallback === 'function') {
                this.onCodeChangeCallback();
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    renderHighlights(debugState = null, errorLine = null) {
        if (!this.cm) return;

        this.cm.eachLine(line => {
            this.cm.removeLineClass(line, 'background', 'current');
            this.cm.removeLineClass(line, 'background', 'last');
            this.cm.removeLineClass(line, 'background', 'error');
        });

        if (debugState?.currentLine) {
            this.cm.addLineClass(debugState.currentLine - 1, 'background', 'current');
        }
        if (debugState?.lastLine) {
            this.cm.addLineClass(debugState.lastLine - 1, 'background', 'last');
        }
        if (errorLine) {
            this.cm.addLineClass(errorLine - 1, 'background', 'error');
        }
    }
}

customElements.define('editor-component', EditorComponent);
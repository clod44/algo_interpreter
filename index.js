class App {
    constructor() {
        const waitForReady = () => {
            const editorWidget = document.getElementById('my-editor-widget');
            
            // Wait until the editor element exists AND has its custom methods initialized
            if (!editorWidget || typeof editorWidget.onChange !== 'function') {
                requestAnimationFrame(waitForReady);
                return;
            }

            this.editor = editorWidget;

            this.editor.onChange(() => {
                this.debugger.reset();
            });

            this.debugger = new DebuggerController(this.editor);

            const galleryWidget = document.getElementById('my-gallery-widget');
            if (galleryWidget && typeof galleryWidget.setEditor === 'function') {
                galleryWidget.setEditor(this.editor);
            }
        };

        requestAnimationFrame(waitForReady);
    }
}

$(() => {
    window.interpreterApp = new App();
});
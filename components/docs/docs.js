class DocsComponent extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        $.get('components/docs/docs.html', (html) => {
            this.shadowRoot.innerHTML = html;
        });
    }
}
customElements.define('docs-component', DocsComponent);
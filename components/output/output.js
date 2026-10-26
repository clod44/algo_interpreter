class OutputComponent extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        $.get('components/output/output.html', (html) => {
            this.shadowRoot.innerHTML = html;
        });
    }
}
customElements.define('output-component', OutputComponent);
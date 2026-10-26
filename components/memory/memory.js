class MemoryComponent extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        
        $.get('components/memory/memory.html', (html) => {
            this.shadowRoot.innerHTML = html;
            this.$variables =$(this.shadowRoot.getElementById('debug-variables'));
        });
    }

    update(variables = {}) {
        if (!this.$variables) return;

        const memoryRows = Object.entries(variables).map(([name, value]) => `
            <tr>
                <td class="font-monospace py-1 ps-2 text-body">${name}</td>
                <td class="font-monospace py-1 pe-2 text-end fw-bold text-primary">${String(value)}</td>
            </tr>
        `).join('');

        const memoryTableHtml = `
            <table class="table table-sm table-striped table-borderless align-middle mb-0" style="font-size: 11px;">
                <thead>
                    <tr class="border-bottom border-secondary-subtle">
                        <th class="text-secondary fw-semibold py-1 ps-2 text-uppercase" style="font-size: 0.6rem; letter-spacing: 0.5px;">Name</th>
                        <th class="text-end text-secondary fw-semibold py-1 pe-2 text-uppercase" style="font-size: 0.6rem; letter-spacing: 0.5px;">Value</th>
                    </tr>
                </thead>
                <tbody>
                    ${memoryRows || '<tr><td colspan="2" class="text-center text-secondary py-2">No variables</td></tr>'}
                </tbody>
            </table>
        `;
        
        this.$variables.html(memoryTableHtml);
    }
}

customElements.define('memory-component', MemoryComponent);
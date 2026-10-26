class GalleryComponent extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.editor = null;

        $.get('components/gallery/gallery.html', (html) => {
            this.shadowRoot.innerHTML = html;
            this.initElements();
            this.bindEvents();
            this.render();
        });
    }

    setEditor(editor) {
        this.editor = editor;
        this.render();
    }

    initElements() {
        this.$grid =$(this.shadowRoot.getElementById('examples-grid'));
        this.$search =$(this.shadowRoot.getElementById('example-search'));
        this.$count =$(this.shadowRoot.getElementById('examples-count'));
    }

    bindEvents() {
        $(this.shadowRoot).on('input', '#example-search', () => this.filter());
    }

    render() {
        if (typeof examples === 'undefined' || !this.$grid  || !this.$grid.length) return;

        const cards = examples.map((example, index) => {
            const $col =$('<div>', {
                class: 'col example-card',
                'data-search': `${example.title} ${example.description}`.toLowerCase()
            });

            const $card =$('<div>', {
                class: 'card h-100 border-secondary-subtle shadow-sm list-group-item-action',
                style: 'cursor: pointer;'
            }).on('click', () => {
                if (this.editor) this.editor.setCode(example.code);
            });

            $card.html(`
                <div class="card-body p-2 d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-start mb-1 gap-2">
                        <div class="fw-bold lh-sm text-body" style="font-size: 0.8rem;">${example.title}</div>
                        <span class="badge text-bg-secondary" style="font-size: 0.6rem;">${index + 1}</span>
                    </div>
                    <div class="text-secondary mt-auto" style="font-size: 0.75rem; line-height: 1.3;">
                        ${example.description}
                    </div>
                </div>
            `);

            return $col.append($card);
        });

        this.$grid.empty().append(cards);
        this.filter();

        if (this.editor && !this.editor.getCode().trim() && examples.length > 0) {
            this.editor.setCode(examples[0].code);
        }
    }

    filter() {
        if (!this.$search || !this.$grid) return;

        const query = this.$search.val().trim().toLowerCase();
        let visibleCount = 0;
        
        this.$grid.find('.example-card').each(function() {
            const visible = !query || $(this).data('search').includes(query);$(this).toggleClass('d-none', !visible);
            if (visible) visibleCount++;
        });
        
        this.$count.text(`${visibleCount} of ${examples?.length || 0}`);
    }
}

customElements.define('gallery-component', GalleryComponent);
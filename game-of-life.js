const template = document.createElement("template");
template.innerHTML = `
<span class="wrapper">
    <div>
        <canvas id="canvas-id"></canvas>
    </div>    
    <div id="label-id">
        Größe 
    </div>
    <div id="label-stats-id">
    </div>
    <div>
        <input type="range" min="5" max="100" value="10" id="slider-id"></input> 
    </div>
</span>
`;

class GameOfLife extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));

        this._canvas = this._shadowRoot.getElementById("canvas-id");
        this._canvasCtx = this._canvas.getContext("2d");
        this._slider = this._shadowRoot.getElementById("slider-id");
        this._label = this._shadowRoot.getElementById("label-id");
        this._statisticsLabel = this._shadowRoot.getElementById("label-stats-id");

        this._slider.addEventListener("change", () => {
            this._init(true);
        })
    }

    /** Callback methods */

    connectedCallback() {
        this._init();
    }

    disconnectedCallback() {
        this._destroy();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name == "size") {
            this._init(true);
        }
    }

    /** Custom methods */

    _init(isSizeUpdate) {
        clearTimeout(this._loopTimeout);
        let size = 0;
        if (isSizeUpdate) {
            size = this._getSliderValue();
        } else {
            size = this.hasAttribute("size") ? this._getSizeAttribute() : this._getSliderValue();
        }
        this._label.innerText = "Größe: " + size + "x" + size;
        this._canvas.width = size * 5;
        this._canvas.height = size * 5;
        this._iterate(this._initFields(size), 0);
    }

    _iterate(fields, count) {
        this._statisticsLabel.innerText = "Iteration: " + count;
        let changes = 0;
        for (let x = 0; x < fields.length; x++) {
            for (let y = 0; y < fields[x].length; y++) {
                let field = fields[x][y];
                let wasThisFieldAlive = field.isAlive;
                var lt = this._getFieldStatus(fields, x - 1, y + 1);
                var lc = this._getFieldStatus(fields, x - 1, y);
                var lb = this._getFieldStatus(fields, x - 1, y - 1);
                var mt = this._getFieldStatus(fields, x, y + 1);
                var mb = this._getFieldStatus(fields, x, y - 1);
                var rt = this._getFieldStatus(fields, x + 1, y + 1);
                var rc = this._getFieldStatus(fields, x + 1, y);
                var rb = this._getFieldStatus(fields, x + 1, y - 1);
                let numberOfAliveNeighbours = lt + lc + lb + mb + mt + rt + rc + rb;
                if (numberOfAliveNeighbours > 3) {
                    if (field.isAlive) field.isAlive = false;
                } else if (numberOfAliveNeighbours == 3) {
                    field.isAlive = true;
                } else if (numberOfAliveNeighbours == 2) {
                    if (field.isAlive) field.isAlive = true;
                } else if (numberOfAliveNeighbours < 2) {
                    if (field.isAlive == true) field.isAlive = false;
                }
                fields[x][y] = field;
                if (wasThisFieldAlive != field.isAlive) changes++;
                this._draw(fields[x][y]);
            }
        }
        if (changes === 0) {
            this._label.innerText += " - Keine Änderung mehr :-)";
            return;
        }
        this._loopTimeout = setTimeout(() => { this._iterate(fields, ++count); }, 100);
    }

    _destroy() {
        clearTimeout(this._loopTimeout);
    }

    _getFieldStatus(fields, x, y) {
        if (fields && fields[x] && fields[x][y]) {
            return (fields[x][y].isAlive) ? 1 : 0;
        } else {
            return 0;
        }
    }

    _getSliderValue() {
        return parseInt(this._slider.value);
    }

    _getSizeAttribute() {
        return parseInt(this.getAttribute("size"));
    }

    _initFields(size) {
        let fields = new Array(size);
        for (let x = 0; x < fields.length; x++) {
            fields[x] = new Array(size);
            for (let y = 0; y < fields[x].length; y++) {
                let field = {};
                field.isAlive = Math.random() > 0.5;
                field.x = x * 5;
                field.y = y * 5;
                fields[x][y] = field;
            }
        }
        return fields;
    }

    _draw(field) {
        this._canvasCtx.fillStyle = field.isAlive ? "#0074D9" : "#FF4136";
        this._canvasCtx.fillRect(field.x, field.y, 5, 5);
    }

}
window.customElements.define('game-of-life', GameOfLife);
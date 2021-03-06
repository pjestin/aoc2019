const path = require('path'),
    intcode = require('../lib/intcode');

function paintPanels(filePath, paintStart) {
    let position = { x: 0, y: 0 };
    let direction = { x: 0, y: -1 };
    let paintedPanels = paintStart ? { '{"x":0,"y":0}': 1 } : {};
    let computer = {
        memory: intcode.getIntcodeInput(path.join(__dirname, filePath)),
        input: [],
        index: 0,
        relativeBase: 0,
        output: []
    }
    while (!computer.done) {
        const stringPosition = JSON.stringify(position);
        computer.input.push(stringPosition in paintedPanels ? paintedPanels[stringPosition] : 0);
        intcode.runIntcode(computer);
        paintedPanels[stringPosition] = computer.output[0];
        direction = computer.output[1] === 1
            ? { x: -direction.y, y: direction.x }
            : { x: direction.y, y: -direction.x };
        position = { x: position.x + direction.x, y: position.y + direction.y };
        computer.output = [];
    }
    return paintedPanels;
}

function getPanelDisplay(filePath) {
    const paintedPanels = paintPanels(filePath, true);
    const panelPositions = Object.keys(paintedPanels).map(JSON.parse);
    const panelXs = panelPositions.map(position => position.x);
    const panelYs = panelPositions.map(position => position.y);
    const minX = Math.min(...panelXs);
    const maxX = Math.max(...panelXs);
    const minY = Math.min(...panelYs);
    const maxY = Math.max(...panelYs);
    let panels = new Array(maxY - minY + 1).fill([]);
    for (let i = 0; i < panels.length; ++i) {
        panels[i] = new Array(maxX - minX + 1).fill(0);
    }

    Object.keys(paintedPanels).forEach(stringPosition => {
        const position = JSON.parse(stringPosition);
        panels[-minY + position.y][-minX + position.x] = paintedPanels[stringPosition];
    });

    return '\n' + panels.map(row =>
        row.map(panel => panel === 1 ? '█' : '░')
            .reduce((acc, cur) => acc + cur, '')
    )
        .reduce((acc, cur) => acc + cur + '\n', '');
}

module.exports = { paintPanels, getPanelDisplay };

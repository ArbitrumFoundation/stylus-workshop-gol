// Utility to generate Game of Life SVG from seed, size, generations, cell_size

interface GameOfLifeParams {
  seed: number;
  size: number;
  generations: number;
  cell_size: number;
}

export function generateGameOfLifeSVG({ seed, size, generations, cell_size }: GameOfLifeParams): string {
  // Initialize grid
  let grid: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  // Seed first generation
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const v = ((x ^ y) + ((x | y) & (size - 1)) + seed) & (size - 1);
      if (v < size / 3) {
        grid[y][x] = true;
      }
    }
  }

  // Prepare SVG
  let svg = `<svg viewBox='0 0 ${size * cell_size} ${size * cell_size}' xmlns='http://www.w3.org/2000/svg'><style>
    @keyframes gol_pulse {0%{opacity:0}20%{opacity:1}80%{opacity:1}100%{opacity:0}}
    @keyframes gol_last {0%{opacity:0}20%{opacity:1}100%{opacity:1}}
    .gol-cell {fill:#000;opacity:0;animation:gol_pulse 500ms forwards}
    .gol-cell.last {animation:gol_last 500ms forwards}
  </style>`;

  // Render generations
  for (let gen = 0; gen < generations; gen++) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (grid[y][x]) {
          svg += `<rect class='gol-cell${gen === generations - 1 ? ' last' : ''}' x='${x * cell_size + 1}' y='${y * cell_size + 1}' width='${cell_size - 1}' height='${cell_size - 1}' style='animation-delay:${gen * 8}ms'/>`;
        }
      }
    }
    // Compute next generation
    let next: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        let live = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dy === 0 && dx === 0) continue;
            const ny = y + dy;
            const nx = x + dx;
            if (ny >= 0 && ny < size && nx >= 0 && nx < size && grid[ny][nx]) live++;
          }
        }
        if (grid[y][x]) {
          next[y][x] = live === 2 || live === 3;
        } else {
          next[y][x] = live === 3;
        }
      }
    }
    grid = next;
  }

  svg += '</svg>';
  return svg;
}

const Utils = {
  mtRandom: (max?: number): number =>
    max === undefined ? Math.random() : Math.floor(Math.random() * max),
};

 /**
 * Generates a count based on a weighted random selection
 * Calculates the cumulative weight and selects a count based on a random weight
 *
 * @param weightTable - A 2D array where the first column contains the counts and the second column contains the corresponding weights
 * @returns The count associated with the selected weight
 * @throws Error in case the weight table is invalid or selection fails
 */


function generateCountFromWeight(weightTable: number[][]): number {
    const totalWeight = weightTable.reduce((acc, [, weight]) => acc + weight, 0);
  
    const randomWeight = Math.floor(Math.random() * totalWeight);
  
    let cumulativeWeight = 0;
  
    for (let i = 0; i < weightTable.length; i++) {
      const [count, weight] = weightTable[i];
      cumulativeWeight += weight;
  
      if (randomWeight < cumulativeWeight) {
        return count; 
      }
    }
  
    throw new Error("Failed to determine count from weight table.");
  }
  
/**
 * Places symbols randomly on the reel window based on the weighted selection
 * Randomly selects positions on the reel window to place symbols while avoiding exclusions
 *
 * @param reelWindow - A 2D array representing the reel window where symbols are placed
 * @param symbolToPlace - The symbol that needs to be placed in the reel window
 * @param weightTable - A 2D array representing the weight table used to determine how many symbols to place
 * @param excludedSymbols - An optional array of symbols that should not be placed
 * @returns The updated reel window with the symbols placed
 * @throws Error in case the number of symbols to place exceeds the available positions
 */

function placeSymbolsRandomly_1(
    reelWindow: number[][],
    symbolToPlace: number,
    weightTable: number[][],
    excludedSymbols: number[] = []
  ): number[][] {
      const countToPlace = generateCountFromWeight(weightTable);
  
      let totalPositions = 0;
      reelWindow.forEach((reel) => {
        totalPositions += reel.length;
      });
  
      if (countToPlace > totalPositions) {
        throw new Error(
          `Number of ${symbolToPlace}s to place exceeds total positions available.`
        );
      }
  
      const occupiedPositions = new Set<string>();
  
      for (let i = 0; i < countToPlace; i++) {
        let placed = false;
        while (!placed) {
          const col = Utils.mtRandom(reelWindow.length);
          const row = Utils.mtRandom(reelWindow[col].length);
          const positionKey = `${row},${col}`;
  
          if (
            !occupiedPositions.has(positionKey) &&
            !excludedSymbols.includes(reelWindow[col][row])
          ) {
            reelWindow[col][row] = symbolToPlace;
            occupiedPositions.add(positionKey);
            placed = true;
          }
        }
      }
    
    return reelWindow;
  
  }

/**
 * Places a specified number of symbols randomly in valid positions on the reel window
 * Selects positions that are unoccupied and not part of the excluded symbols list
 *
 * @param reelWindow - A 2D array representing the reel window where symbols are placed
 * @param symbolToPlace - The symbol that needs to be placed in the reel window
 * @param Num_Syms_To_Place - The number of symbols to place in the reel window
 * @param excludedSymbols - An optional array of symbols that should not be placed
 * @returns The updated reel window with the symbols placed
 */
  
  function placeSymbolsRandomly_2(
    reelWindow: number[][],
    symbolToPlace: number,
    Num_Syms_To_Place: number,
    excludedSymbols: number[] = []
  ): number[][] {
    let countToPlace = Num_Syms_To_Place;
  
    const validPositions: [number, number][] = [];
    for (let col = 0; col < reelWindow.length; col++) {
      for (let row = 0; row < reelWindow[col].length; row++) {
        if (!excludedSymbols.includes(reelWindow[col][row])) {
          validPositions.push([row, col]);
        }
      }
    }
  
    if (countToPlace > validPositions.length) {
        countToPlace = 0;
     }
  
    for (let i = 0; i < countToPlace; i++) {
      const randomIndex = Utils.mtRandom(validPositions.length);
      const [row, col] = validPositions[randomIndex];
  
      reelWindow[col][row] = symbolToPlace;
      validPositions.splice(randomIndex, 1); 
    }
  
    return reelWindow;
  }

  /**
 * Places a specified number of symbols randomly in valid positions on the reel window
 * Symbols are placed based on weighted probabilities, avoiding excluded symbols
 *
 * @param reelWindow - A 2D array representing the reel window where symbols are placed
 * @param symbolToPlace - The symbol that needs to be placed in the reel window
 * @param Num_Syms_To_Place - The number of symbols to place in the reel window
 * @param weights - A 2D array representing the weights for each position in the reel window
 * @param excludedSymbols - An optional array of symbols that should not be placed
 * @returns The updated reel window with the symbols placed
 */
  
  function placeSymbolsRandomly_3(
    reelWindow: number[][],
    symbolToPlace: number,
    Num_Syms_To_Place: number,
    weights: number[][], 
    excludedSymbols: number[] = []
  ): number[][] {
    let countToPlace = Num_Syms_To_Place;
  
    const validPositions: { row: number; col: number; weight: number }[] = [];
    let totalWeight = 0;
  
    for (let col = 0; col < reelWindow.length; col++) {
      for (let row = 0; row < reelWindow[col].length; row++) {
        if (!excludedSymbols.includes(reelWindow[col][row])) {
          const weight = weights[row][col];
          if (weight > 0) { 
            validPositions.push({ row, col, weight });
            totalWeight += weight;
          }
        }
      }
    }
  
    if (countToPlace > validPositions.length) {
      countToPlace = validPositions.length;
    }
  
    for (let i = 0; i < countToPlace; i++) {
      const rand = Math.random() * totalWeight;
  
      let cumulativeWeight = 0;
      let selectedIndex = -1;
      for (let j = 0; j < validPositions.length; j++) {
        cumulativeWeight += validPositions[j].weight;
        if (rand <= cumulativeWeight) {
          selectedIndex = j;
          break;
        }
      }
  
      if (selectedIndex === -1) {
        // Fallback in case of rounding errors
        selectedIndex = validPositions.length - 1;
      }
  
      const { row, col, weight } = validPositions[selectedIndex];
  
      // Place the symbol
      reelWindow[col][row] = symbolToPlace;
  
      totalWeight -= weight;
      validPositions.splice(selectedIndex, 1);
    }
  
    return reelWindow;
  }

  


export{
    
    placeSymbolsRandomly_1,
    placeSymbolsRandomly_2,
    placeSymbolsRandomly_3,
    generateCountFromWeight,
   
}

const Utils = {
    mtRandom: (max?: number): number =>
      max === undefined ? Math.random() : Math.floor(Math.random() * max),

  };

  const Config = {
    NumReels: 5,
    NumRows: 3,

  };

  /**
 * Generate the reel window based on the reel strips and reel stops
 * Extracts a portion of each reel strip to form the window for the reels
 *
 * @param reelStrips - A 2D array representing the strips of symbols for each reel
 * @param reelStops - An array representing the starting positions for each reel to create the window
 * @returns A 2D array representing the reel window formed by extracting symbols from each reel strip
 */

function getReelWindow(reelStrips: number[][], reelStops: number[]): number[][] {
 return reelStops.map((stop, i) => reelStrips[i].slice(stop, stop + Config.NumRows));
}
  
/**
 * Generates random reel stops for each reel strip
 * Determines the starting positions for the reel window in each reel strip
 *
 * @param reelstrips - A 2D array representing the strips of symbols for each reel
 * @returns An array of random starting positions for each reel strip to form the reel window
 */

function generateReelStops(reelstrips: number[][]): number[] {
 return Array.from({ length: Config.NumReels }, (_, i) => {
  return Utils.mtRandom(reelstrips[i].length - (Config.NumRows - 1));
   });
}

/**
 * Creates a deep copy of a 2D array
 *
 * @param original - A 2D array to be copied
 * @returns A new 2D array with the same elements as the original
 */

function deepCopyArrayOfList(original: number[][]): number[][] {
    const copy: number[][] = new Array(original.length);
    for (let i = 0; i < original.length; i++) {
      copy[i] = [...original[i]]; // Create a new array with the same elements to avoid reference sharing
    }
    return copy;
  }


  /**
 * Places symbols on a random payline within the reel window
 * Chooses a random payline and places the specified number of symbols at random positions
 *
 * @param reelWindow - A 2D array representing the reel window where symbols are placed
 * @param payLines - A 2D array representing paylines 
 * @param numSymbolsToPlace - The number of symbols to place on the randomly selected payline
 * @returns The updated reel window with symbols placed along the selected payline
 * @throws Error if the selected payline does not have enough positions for the symbols
 */

  function placeSymbolsOnRandomPayline(
    reelWindow: number[][],
    payLines: number[][],
    numSymbolsToPlace: number
  ): number[][] {
    // Create a deep copy of the reelWindow to avoid mutating the original
    const updatedReelWindow = deepCopyArrayOfList(reelWindow);
  
    // Choose a random payline
    const randomPaylineIndex = Math.floor(Math.random() * payLines.length);
    const payline = payLines[randomPaylineIndex];
  
    // Check if the payline has enough positions
    if (payline.length < numSymbolsToPlace) {
      throw new Error("Selected payline does not have enough positions to place the symbols.");
    }
  
    // Generate a random symbol from 1 to 11
    const symbolToPlace = Math.floor(Math.random() * 11) + 1;
  
    // Place the symbol along the payline
    for (let reel = 0; reel < numSymbolsToPlace; reel++) {
      let row:number = Math.floor((payline[reel]/5)); // Get the row index from the payline
      updatedReelWindow[reel][row] = symbolToPlace;
    }
  
    return updatedReelWindow;
  }

export{
    getReelWindow,
    generateReelStops,
    placeSymbolsOnRandomPayline,
    deepCopyArrayOfList
}
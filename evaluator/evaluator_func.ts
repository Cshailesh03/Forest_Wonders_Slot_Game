import SLOT from "../settings";
import { WinningLineDetail } from "types";


const payLines = SLOT.payLines;
const payTable = SLOT.payTable;

const Config = {
  NumReels: 5,
  NumRows: 3,
  NumSymbols: Object.keys(SLOT.symbols).length,
  NumLines: SLOT.payLines.length,
};

/**
 * Evaluates the winning lines on a slot machine and calculates total winnings, symbol-specific RTP, and detailed information about each winning payline.
 *
 * @param ReelWindow - A 2D array representing the current state of the reel window,
 *                     where each sub-array corresponds to the symbols visible on a specific reel.
 * @returns containing:
 *          1. total_LinesWin (number) - The accumulated total winnings across all paylines.
 *          2. SymbolRTP_current (number[]) - An array where each index represents a symbol, 
 *             and its value is the RTP contribution for that symbol.
 *          3. WinningLinesDetails (WinningLineDetail[]) - An array of objects, where each object 
 *             contains detailed information about a winning payline (e.g., symbol, payline, 
 *             count of matched symbols, coordinates of the matched symbols, and win amount).
 */



function LinesEvaluator(ReelWindow: number[][]): [number, number[], WinningLineDetail[]] {
  let total_LinesWin = 0;
  const SymbolRTP_current = new Array(Config.NumSymbols).fill(0); 
  const WinningLinesDetails: WinningLineDetail[] = []; 

  payLines.forEach((line, lineIndex) => {
    let currentPayLine = line.map((_, reel) => ReelWindow[reel][Math.floor(line[reel] / Config.NumReels)]);
    let firstSymIndex = currentPayLine.findIndex((sym) => sym !== 0);
    if (firstSymIndex === -1) {
      firstSymIndex = 0;
    }
    let firstSym = currentPayLine[firstSymIndex];

    if (firstSym === 12) {
      return;
    }

    let wildCount = 0;
    let symCount = 0;
    const symbolCoordinates: [number, number][] = []; 

    for (let i = 0; i < currentPayLine.length; i++) {
      if (currentPayLine[i] === 0 || currentPayLine[i] === firstSym) {
        symCount++;
        symbolCoordinates.push([i, Math.floor(line[i] / Config.NumReels)]);
      } else {
        break;
      }
    }

    for (let i = 0; i < currentPayLine.length; i++) {
      if (currentPayLine[i] === 0) {
        wildCount++;
      } else {
        break;
      }
    }

    const wildWin = wildCount >= 3 ? (payTable[0][wildCount - 3]) : 0;
    const symWin = symCount >= 3 ? (payTable[firstSym][symCount - 3]) : 0;

    if (symCount >= 3) {
      SymbolRTP_current[firstSym] += symWin;
    }
    if (wildCount >= 3) {
      SymbolRTP_current[0] += wildWin;
    }

    const lineWin = Math.max(symWin, wildWin);
    total_LinesWin += lineWin;

    if (lineWin > 0) {
      WinningLinesDetails.push({
        symbol: symWin >= wildWin ? firstSym : 0,
        payline: line,
        symCount: symWin >= wildWin ? symCount : wildCount,
        symbolCoordinates: symbolCoordinates,
        win: lineWin,
      });
    }
  });

  return [total_LinesWin, SymbolRTP_current, WinningLinesDetails];
}

 /**
 * Counts the occurrences of a specific symbol in the reel window
 * Iterates through each reel and counts how many times the given symbol appears
 *
 * @param ReelWindow - A 2D array representing the current reel window
 * @param symbol - The symbol to count in the reel window
 * @returns The total count of the specified symbol across all reels
 */

function pictureCount(ReelWindow: number[][], symbol: number): number {
    let count = 0;
  
    for (let i = 0; i < Config.NumReels; i++) {
      count += ReelWindow[i].filter((s) => s === symbol).length;
    }
  
    return count;
  }


  export {LinesEvaluator,pictureCount,WinningLineDetail}
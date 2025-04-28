

export type spinResponse = [
  userId : string, // useID
  betValue : number, // bet value
  finalWin : number, // final win
  isFg : number, //isFG
  win:{
    winWithoutMult : number, // win
    multSym : number, //mult_sym
    winningSyms : number[], //winning symbol
    multValue : number, // mult
    multHit : boolean,
  },
  freespin: {
    remaining: number;
    total?: number; // total spin count
  },
  balance: {
    previous: number;
    current: number;
  },
  SpinResult : {
    reelWindow : number[][],
    winD:WinningLineDetail[],
  }
]

export interface SpinType {
  baseGame: boolean;
  freeGameTriggered: boolean ;
  freeSpin: boolean;
}
export interface WinningLineDetail {
  symbol: number;
  payline: number[];
  symCount: number;
  symbolCoordinates: [number, number][];
  win: number;
}


export interface ReelWindow {
  symbolsReelwindow: number[][];
  multiplierSymbol: number;
  multiplierValue: number;
}

export interface WinDetails {
  winningSymbols: number[];
  winInfo: {
    symbol: number;
    count: number;
    hittingPayLine: number[];
    symbolCoordinates: [number, number][];
    win: number;
  }[];
  linesWin: number;
  multiplierHit: boolean;
  finalWin: number;
}

export interface ParseWindowLogResult {
  spinType: SpinType;
  reelWindow: ReelWindow;
  win: WinDetails | null;
  freeSpinRemaning:number
}

export type reelStrips = [
  reelStripsBg1: number[][],
  reelStripsFg1: number[][],
  reelStripsFg2: number[][],
  reelStripsFg3: number[][],
]

export type fgMultTable = [
    fgMultiplierWt1 :number [][],
    fgMultiplierWt2 :number [][],
    fgWildPlWt :number [][],
    fgMultiplierWt1Bf :number [][],
    fgMultiplierWt2Bf :number [][],
]

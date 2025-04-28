import SLOT from "./settings";
import {getReelWindow,generateReelStops,deepCopyArrayOfList,placeSymbolsOnRandomPayline} from "./generate reelwindow/generatereelwindow"
import { LinesEvaluator as linesEvaluator,pictureCount ,WinningLineDetail as winningLineDetail} from "./evaluator/evaluator_func";
import { placeSymbolsRandomly_1 as placeSymbolsRandomly1,placeSymbolsRandomly_2 as placeSymbolsRandomly2,placeSymbolsRandomly_3 as placeSymbolsRandomly3,generateCountFromWeight } from "./reelwindow modification/placeSymbols";
import {WinDetails, spinResponse, SpinType, ReelWindow, ParseWindowLogResult, reelStrips, fgMultTable} from "./types"


export default class Game
{
    private config = {
        numReels: 5,
        numRows: 3,
        bet: 20,
        numSymbols: Object.keys(SLOT.symbols).length,
        numLines: SLOT.payLines.length,
        userId : "August",
        balance : {
          previous:100000,
          current:100000
        }
      };

    private isBonus: boolean = true;
    public isSimulations: boolean = false;

    private simulationResults: spinResponse[] = [];

    private reelStrip: reelStrips;

    private fgMultTables: fgMultTable;

    constructor() {
        this.reelStrip = [
            SLOT.reelSets.reelStripsBg1, 
            SLOT.reelSets.reelStripsFg1, 
            SLOT.reelSets.reelStripsFg2, 
            SLOT.reelSets.reelStripsFg3, 
        ];

        this.fgMultTables = [
          SLOT.weights.fgMtWt1,
          SLOT.weights.fgMtWt2,
          SLOT.weights.fgWildPlacingWt,
          SLOT.weights.fgMtWt1Bf,
          SLOT.weights.fgMtWt2Bf,
        ];

}
    private gameState = {
        totalBet: 0,
        totalWin: 0,
        totalBgWin: 0,
        bgHits: 0,
        numSims: 0,
        fgCount: 0,
        reelWindow: [] as number[][],
        symbolRTP: new Array(this.config.numSymbols).fill(0),
        totalFreespin: 0,
        fgHits: 0,
        fgMultHits:0,
        fgNumWildLastspin:0,
        isFreeGameHit: false,
    };

    private utils = {
        mtRandom: (max?: number): number =>
          max === undefined ? Math.random() : Math.floor(Math.random() * max),
        logProgress: (current: number, total: number, rtp: number): void => {
          console.log(`Progress: ${(current / total) * 100}% | RTP: ${rtp.toFixed(2)}%`);
        },
      
        logResults: (): void => {
          console.log(`Base Game Hit Rate: ${(this.gameState.bgHits / this.gameState.numSims).toFixed(2)}`);
          console.log(`Base Game RTP: ${((100 * this.gameState.totalBgWin) / (this.config.bet * this.gameState.numSims)).toFixed(2)}%`);
          console.log(`Free Game Odds: ${(this.gameState.numSims / this.gameState.fgCount).toFixed(2)}`);
        },
    };

    Bonus(numSpins: number): number {

        let fgWin: number = 0;
        let reelWindow: number[][];
        let numWilds = 0;
        let multSym:number = 0;
        let winPotential = 100*this.config.bet;
        let wildStart = this.utils.mtRandom(numSpins);
        
      
        for (let i = 0; i < numSpins; i++) {
      
          this.gameState.totalFreespin++;
          let multiplierTriggered: boolean = false;
          let winWithoutMult = 0;
          let freeSpinRemaning = numSpins - i;      
          let winData: [number, number[], winningLineDetail[]];
          let win:number = 0;
          let mult:number = this.utils.mtRandom(10000) < 9000 ? generateCountFromWeight(this.fgMultTables[0]) : generateCountFromWeight(this.fgMultTables[1]);
          if(fgWin < winPotential)
          {
            let reelstops: number[] = generateReelStops(this.reelStrip[1]); 
            reelWindow = getReelWindow(this.reelStrip[1], reelstops);
          }
          else{
            reelWindow = this.utils.mtRandom(100) < 50 ? getReelWindow(this.reelStrip[2], generateReelStops(this.reelStrip[2])) : getReelWindow(this.reelStrip[3], generateReelStops(this.reelStrip[3]));
          }
      
          if(fgWin < 10*this.config.bet)
            {
              reelWindow = placeSymbolsOnRandomPayline(reelWindow,SLOT.payLines,3+2*(this.utils.mtRandom(2)));
            }
          
          if((i > wildStart) && fgWin < winPotential && this.utils.mtRandom(100) < 57)
          {     
            reelWindow = placeSymbolsRandomly2(reelWindow,0,this.utils.mtRandom(100) < 50 ? 1: 2,[0]);
          }
      
          if(numWilds > 0)
          {
            if(fgWin < winPotential)
            {
              reelWindow = placeSymbolsRandomly2(reelWindow,0,numWilds,[0]);
            }
            else{
              reelWindow = placeSymbolsRandomly3(reelWindow,0,numWilds,this.fgMultTables[2],[0]);
            }
            
          }
      
          winData = linesEvaluator(reelWindow);
      
       
      
          const nonZeroIndices = winData[1]
          .map((value, index) => (value !== 0 ? index : -1))
          .filter(index => index !== -1);
      
          winWithoutMult = winData[0];
      
          if(winWithoutMult > 0 && this.utils.mtRandom(100) < 50 && fgWin < winPotential) 
          {
              multSym = nonZeroIndices[this.utils.mtRandom(nonZeroIndices.length)];
          }
          else{
            multSym = generateCountFromWeight(SLOT.weights.fgMultSym);
          }
      
          if (nonZeroIndices.includes(multSym)) {
          win += winData[0] * mult; 
          multiplierTriggered = true
          this.gameState.fgMultHits++;
      
          } else {
          win += winData[0]; 
          }

          this.config.balance.previous = this.config.balance.current
          this.config.balance.current += win
          
          if(!this.isSimulations){
            const copyOfCurrentReelWindow: number[][] = deepCopyArrayOfList(reelWindow);
            let spinResult = {
              reelWindow : copyOfCurrentReelWindow,
              winD : winData[2]
            }
            const temp = {
              winWithoutMult:winWithoutMult,
              multSym:multSym,
              winningSyms:nonZeroIndices,
              multValue:mult,
              multHit:multiplierTriggered
            }
            let totalSpin = 10
            const freespinTemp = {
              remaining:freeSpinRemaning,
              total:totalSpin
            }
            let balance = {
              previous : this.config.balance.previous,
              current : this.config.balance.current,
            }
            this.simulationResults.push([this.config.userId,0,win,1,temp,freespinTemp,balance,spinResult]);
          }
      
      
          if(win > 0)
          {
            this.gameState.fgHits++;
          }
      
          fgWin += win;
      
          numWilds = pictureCount(reelWindow,0);
        
        }
      
        this.gameState.fgNumWildLastspin += numWilds;
      
        fgWin = Math.min(10000*this.config.bet,fgWin);
      
        return fgWin;
      };

    BuyBonus(numSpins: number): number {
        let fgWin: number = 0;
        let reelWindow: number[][];
        let numWilds = 0;
        let multiplierTriggered: boolean = false;
        let multSym:number = 0;
        let winPotential = 100*20;
        let wildStart = this.utils.mtRandom(numSpins);
        this.gameState.isFreeGameHit = false
        for (let i = 0; i < numSpins; i++) {
      
          this.gameState.totalFreespin++;
      
          let winWithoutMult = 0;
          let freeSpinRemaning = numSpins - i;
          let isRetrigger: boolean = false;
      
          let winData: [number, number[], winningLineDetail[]];
      
          let multiplier:number = 1;
      
          let win:number = 0;
      
          let mult:number = this.utils.mtRandom(10000) < 9000 ? generateCountFromWeight(this.fgMultTables[3]) : generateCountFromWeight(this.fgMultTables[4]);
          
          if(fgWin < winPotential)
          {
            reelWindow = getReelWindow(this.reelStrip[1], generateReelStops(this.reelStrip[1]));
          }
          else{
            reelWindow = this.utils.mtRandom(100) < 50 ? getReelWindow(this.reelStrip[2], generateReelStops(this.reelStrip[2])) : getReelWindow(this.reelStrip[3], generateReelStops(this.reelStrip[3]));
          }
      
          if(fgWin < 10*20)
            {
              reelWindow = placeSymbolsOnRandomPayline(reelWindow,SLOT.payLines,3+2*(this.utils.mtRandom(2)));
            }
          
          if((i > wildStart) && fgWin < winPotential && this.utils.mtRandom(1000) < 575)
          {     
            reelWindow = placeSymbolsRandomly2(reelWindow,0,this.utils.mtRandom(100) < 50 ? 1: 2,[0]);
          }
      
          if(numWilds > 0)
          {
            if(fgWin < winPotential)
            {
              reelWindow = placeSymbolsRandomly2(reelWindow,0,numWilds,[0]);
            }
            else{
              reelWindow = placeSymbolsRandomly3(reelWindow,0,numWilds,this.fgMultTables[2],[0]);
            }
            
          }
      
          winData = linesEvaluator(reelWindow);
      
          const nonZeroIndices = winData[1]
          .map((value, index) => (value !== 0 ? index : -1))
          .filter(index => index !== -1); 
      
          winWithoutMult = winData[0];
      
          if(winWithoutMult > 0 && this.utils.mtRandom(100) < 50 && fgWin < winPotential) 
          {
              multSym = nonZeroIndices[this.utils.mtRandom(nonZeroIndices.length)];
          }
          else{
            multSym = generateCountFromWeight(SLOT.weights.fgMultSym);
          }
      
          if (nonZeroIndices.includes(multSym)) {
          win += winData[0] * mult;
          multiplierTriggered = true
          this.gameState.fgMultHits++;
      
          } else {
          win += winData[0]; 
          }
          this.config.balance.previous = this.config.balance.current
          this.config.balance.current += win
          
          if(!this.isSimulations){
            const copyOfCurrentReelWindow: number[][] = deepCopyArrayOfList(reelWindow);
            let spinResult = {
              reelWindow : copyOfCurrentReelWindow,
              winD : winData[2]
            }
            const temp = {
              winWithoutMult:winWithoutMult,
              multSym:multSym,
              winningSyms:nonZeroIndices,
              multValue:mult,
              multHit:multiplierTriggered
            }
            let totalSpin = 10
            const freespinTemp = {
              remaining:freeSpinRemaning,
              total:totalSpin
            }
            
            let balance = {
              previous : this.config.balance.previous,
              current : this.config.balance.current,
            }
            this.simulationResults.push([this.config.userId,0,win,1,temp,freespinTemp,balance,spinResult]);
          }
          if(win > 0)
          {
            this.gameState.fgHits++;
          }
      
          fgWin += win;
      
          numWilds = pictureCount(reelWindow,0);
        
        }
      
        this.gameState.fgNumWildLastspin += numWilds;
      
        fgWin = Math.min(10000*20,fgWin);
      
        return fgWin;
      }


    Spin(): void {
        
        this.simulationResults = []
      
        !this.isSimulations?this.gameState.numSims = 1 : this.gameState.numSims = 10000000;
        this.gameState.reelWindow = Array.from({ length: this.config.numReels }, () => []);
        this.gameState.symbolRTP.fill(0);
        console.log(`Running ${this.gameState.numSims.toLocaleString()} simulations...`);
        
        for (let s = 1; s <= this.gameState.numSims; s++) {

          this.config.balance.previous = this.config.balance.current 
          this.config.balance.current -= this.config.bet 
          
          const currentRTP = (this.gameState.totalWin / this.gameState.totalBet) * 100;
          let isFreeGame: boolean = false;
          let fgWin: number =0;
          let win =0;
          let winData: [number, number[], winningLineDetail[]];
      
          if (this.isSimulations && s % Math.ceil(this.gameState.numSims / 10) === 0) {
            this.utils.logProgress(s, this.gameState.numSims, currentRTP );
          }
          
          this.gameState.reelWindow = getReelWindow(this.reelStrip[0], generateReelStops(this.reelStrip[0]));
      
          if(this.isBonus)
          {
      
            this.gameState.reelWindow = placeSymbolsRandomly1(this.gameState.reelWindow,12,SLOT.weights.bgScWtBf,[]); 
          }
          else{
            this.gameState.reelWindow = placeSymbolsRandomly1(this.gameState.reelWindow,12,SLOT.weights.bgScWt,[]); 
          }
         
      
          if(pictureCount(this.gameState.reelWindow,12) >=3)
          {
      
            isFreeGame = true;
          }
      
          winData = linesEvaluator(this.gameState.reelWindow);
          
          win = winData[0];
          
          const nonZeroIndices = winData[1]
          .map((value, index) => (value !== 0 ? index : -1))
          .filter(index => index !== -1); 

          this.config.balance.previous = this.config.balance.current
          this.config.balance.current += win
         
            if(!this.isSimulations){
              const copyOfCurrentReelWindow: number[][] = deepCopyArrayOfList(this.gameState.reelWindow);
              let spinResult = {
                reelWindow : copyOfCurrentReelWindow,
                winD : winData[2]
              }
              const temp = {
                winWithoutMult:NaN,
                multSym:NaN,
                winningSyms:nonZeroIndices,
                multValue:NaN,
                multHit:false
              }
              let totalSpin = 10
              const freespinTemp = {
                remaining:NaN,
                total:0
              }
              let balance = {
                previous : this.config.balance.previous,
                current : this.config.balance.current,
              }
              this.simulationResults.push([this.config.userId,this.config.bet,win,1,temp,freespinTemp,balance,spinResult]);
            }
      
            this.gameState.totalBgWin += win;
      
          if (win > 0)
            {
                this.gameState.bgHits++;
            } 
      
          // let fW :number = 0 ;`
      
          if(isFreeGame)
          {
            this.gameState.fgCount++;
      
            fgWin += this.isBonus ? this.BuyBonus(10) : this.Bonus(10);
            
          }
      
          win += fgWin;
      
          win = Math.min(win, 10000*(this.config.bet));
      
          this.gameState.totalWin += win;
          this.gameState.totalBet += this.config.bet;
        }

        if(!this.isSimulations){
        // this.simulationResults.forEach((window)=>{
        // console.log(JSON.stringify(parseWindowLog(window), null, 2));
        // }
        
        logSpinResponseDetails(this.simulationResults)
      
      }
      if(this.isSimulations){
      this.utils.logResults()
      }
    }


}


function logSpinResponseDetails(spinResponses: spinResponse[]): void {
  console.log("Spin Response Details:");

  // Iterate over the array of spinResponses
  spinResponses.forEach((spin, spinIndex) => {
    console.log(`\n\nSpin Response #${spinIndex + 1}:\n\n`);

    // Destructure the current spinResponse
    const [
      userId,
      betValue,
      finalWin,
      isFg,
      win,
      freespin,
      balance,
      spinResult,
    ] = spin;

    // Print user details
    console.log(`  User ID: ${userId}`);
    console.log(`  Bet Value: ${betValue}`);
    console.log(`  Final Win: ${finalWin}`);
    console.log(`  Is Free Game (isFG): ${isFg === 1 ? "Yes" : "No"}`);

    // Print win details
    console.log("  Win Details:");
    console.log(`    Win Without Multiplier: ${win.winWithoutMult}`);
    console.log(`    Multiplier Symbol: ${win.multSym}`);
    console.log(`    Winning Symbols: ${win.winningSyms.join(", ")}`);
    console.log(`    Multiplier Value: ${win.multValue}`);
    console.log(`    Multiplier Hit: ${win.multHit ? "Yes" : "No"}`);

    // Print free spin details
    console.log("  Free Spin Details:");
    console.log(`    Remaining Spins: ${freespin.remaining}`);
    console.log(`    Total Spins: ${freespin.total || "Not specified"}`);

    // Print balance details
    console.log("  Balance Details:");
    console.log(`    Previous Balance: ${balance.previous}`);
    console.log(`    Current Balance: ${balance.current}`);

    // Print spin result details
    console.log("  Spin Result Details:");
    console.log("    Reel Window:");
    spinResult.reelWindow.forEach((row, rowIndex) => {
      console.log(`      Reel ${rowIndex + 1}: ${row.join(", ")}`);
    });

    console.log("    Winning Line Details:");
    spinResult.winD.forEach((detail, detailIndex) => {
      console.log(`      Detail ${detailIndex + 1}:`);
      console.log(`        Symbol: ${detail.symbol}`);
      console.log(`        Payline: ${detail.payline.join(", ")}`);
      console.log(`        Symbol Count: ${detail.symCount}`);
      console.log(
        `        Symbol Coordinates: ${detail.symbolCoordinates
          .map((coord) => `[${coord.join(", ")}]`)
          .join(", ")}`
      );
      console.log(`        Win: ${detail.win}`);
    });
  });
}



const GameInstance = new Game();
import * as readline from "readline";

if(!GameInstance.isSimulations){

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "",
});


console.log("Press Enter to execute the code or Ctrl+C to exit...");

rl.on("line", (line: string) => {
  if (line.trim() === "") {
    console.log("Enter key pressed. Executing code...");
    GameInstance.Spin();
  } else {
    console.log(`Received input: "${line.trim()}"`); 
  }
});

}
else
GameInstance.Spin();



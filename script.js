class AviatorGame {
    constructor() {
        this.balance = 1000;
        this.currentBet = 0;
        this.currentMultiplier = 1.00;
        this.gameState = 'waiting'; // waiting, betting, flying, crashed
        this.crashPoint = 0;
        this.gameInterval = null;
        this.history = [2.45, 1.23, 5.67, 1.89, 3.21];
        
        this.initializeElements();
        this.attachEventListeners();
        this.updateUI();
    }
    
    initializeElements() {
        this.balanceEl = document.getElementById('balance');
        this.multiplierEl = document.getElementById('multiplier');
        this.gameStatusEl = document.getElementById('gameStatus');
        this.betAmountEl = document.getElementById('betAmount');
        this.placeBetBtn = document.getElementById('placeBetBtn');
        this.cashOutBtn = document.getElementById('cashOutBtn');
        this.potentialWinEl = document.getElementById('potentialWin');
        this.planeEl = document.getElementById('plane');
        this.historyListEl = document.getElementById('historyList');
    }
    
    attachEventListeners() {
        this.placeBetBtn.addEventListener('click', () => this.placeBet());
        this.cashOutBtn.addEventListener('click', () => this.cashOut());
        this.betAmountEl.addEventListener('input', () => this.updatePotentialWin());
    }
    
    placeBet() {
        const betAmount = parseInt(this.betAmountEl.value);
        
        if (betAmount < 10 || betAmount > 500) {
            alert('Bet amount must be between $10 and $500');
            return;
        }
        
        if (betAmount > this.balance) {
            alert('Insufficient balance!');
            return;
        }
        
        if (this.gameState !== 'waiting') {
            alert('Wait for the current round to finish!');
            return;
        }
        
        this.currentBet = betAmount;
        this.balance -= betAmount;
        this.gameState = 'betting';
        
        this.updateUI();
        this.startRound();
    }
    
    startRound() {
        // Generate random crash point between 1.01 and 10.00
        this.crashPoint = this.generateCrashPoint();
        this.currentMultiplier = 1.00;
        this.gameState = 'flying';
        
        // Reset plane position
        this.planeEl.style.bottom = '20px';
        this.planeEl.style.left = '20px';
        this.planeEl.classList.add('flying');
        this.multiplierEl.classList.add('pulsing');
        
        this.gameStatusEl.textContent = 'Flying... Cash out anytime!';
        this.placeBetBtn.disabled = true;
        this.cashOutBtn.disabled = false;
        
        // Start the flight animation
        const duration = this.calculateFlightDuration();
        this.planeEl.style.animationDuration = duration + 'ms';
        
        // Start multiplier increase
        this.gameInterval = setInterval(() => {
            this.updateMultiplier();
        }, 100);
        
        // Schedule crash
        setTimeout(() => {
            this.crash();
        }, duration);
    }
    
    generateCrashPoint() {
        // Weighted random generation for more realistic crash points
        const rand = Math.random();
        
        if (rand < 0.5) {
            // 50% chance of crash between 1.01 and 2.00
            return 1.01 + Math.random() * 0.99;
        } else if (rand < 0.8) {
            // 30% chance of crash between 2.00 and 5.00
            return 2.00 + Math.random() * 3.00;
        } else {
            // 20% chance of crash between 5.00 and 10.00
            return 5.00 + Math.random() * 5.00;
        }
    }
    
    calculateFlightDuration() {
        // Duration based on crash point (longer for higher multipliers)
        return Math.min(2000 + (this.crashPoint - 1) * 1000, 15000);
    }
    
    updateMultiplier() {
        if (this.gameState !== 'flying') return;
        
        const elapsed = Date.now() - this.roundStartTime;
        const progress = elapsed / this.calculateFlightDuration();
        
        this.currentMultiplier = 1 + (this.crashPoint - 1) * progress;
        
        if (this.currentMultiplier >= this.crashPoint) {
            this.currentMultiplier = this.crashPoint;
        }
        
        this.multiplierEl.textContent = this.currentMultiplier.toFixed(2) + 'x';
        this.updatePotentialWin();
        
        // Update plane position
        const maxHeight = 250;
        const maxLeft = 90;
        const newBottom = 20 + (maxHeight * progress);
        const newLeft = 20 + (maxLeft * progress);
        
        this.planeEl.style.bottom = Math.min(newBottom, maxHeight) + 'px';
        this.planeEl.style.left = Math.min(newLeft, maxLeft) + '%';
    }
    
    cashOut() {
        if (this.gameState !== 'flying') return;
        
        const winAmount = Math.floor(this.currentBet * this.currentMultiplier);
        this.balance += winAmount;
        
        this.gameStatusEl.textContent = `Cashed out at ${this.currentMultiplier.toFixed(2)}x! Won $${winAmount}`;
        this.gameStatusEl.style.color = '#4CAF50';
        
        this.endRound();
    }
    
    crash() {
        if (this.gameState !== 'flying') return;
        
        this.gameState = 'crashed';
        this.currentMultiplier = this.crashPoint;
        this.multiplierEl.textContent = this.crashPoint.toFixed(2) + 'x';
        
        this.gameStatusEl.textContent = `Crashed at ${this.crashPoint.toFixed(2)}x!`;
        this.gameStatusEl.style.color = '#f44336';
        
        // Add crash effect
        this.planeEl.style.transform = 'rotate(45deg)';
        this.multiplierEl.style.color = '#f44336';
        
        this.endRound();
    }
    
    endRound() {
        clearInterval(this.gameInterval);
        
        this.planeEl.classList.remove('flying');
        this.multiplierEl.classList.remove('pulsing');
        this.cashOutBtn.disabled = true;
        
        // Add to history
        this.history.unshift(this.crashPoint);
        if (this.history.length > 10) {
            this.history.pop();
        }
        
        this.updateHistory();
        this.updateUI();
        
        // Reset for next round
        setTimeout(() => {
            this.resetRound();
        }, 3000);
    }
    
    resetRound() {
        this.gameState = 'waiting';
        this.currentBet = 0;
        this.currentMultiplier = 1.00;
        
        this.multiplierEl.textContent = '1.00x';
        this.multiplierEl.style.color = '#fff';
        this.gameStatusEl.textContent = 'Place your bet to start!';
        this.gameStatusEl.style.color = '#fff';
        
        this.planeEl.style.transform = 'rotate(-15deg)';
        this.planeEl.style.bottom = '20px';
        this.planeEl.style.left = '20px';
        
        this.placeBetBtn.disabled = false;
        this.updateUI();
    }
    
    updatePotentialWin() {
        if (this.currentBet > 0) {
            const potential = Math.floor(this.currentBet * this.currentMultiplier);
            this.potentialWinEl.textContent = potential;
        } else {
            const betAmount = parseInt(this.betAmountEl.value) || 0;
            this.potentialWinEl.textContent = betAmount;
        }
    }
    
    updateHistory() {
        this.historyListEl.innerHTML = '';
        this.history.forEach(crash => {
            const item = document.createElement('span');
            item.className = 'history-item';
            item.textContent = crash.toFixed(2) + 'x';
            
            if (crash >= 3.0) {
                item.classList.add('high');
            } else if (crash < 1.5) {
                item.classList.add('low');
            }
            
            this.historyListEl.appendChild(item);
        });
    }
    
    updateUI() {
        this.balanceEl.textContent = this.balance;
        this.updatePotentialWin();
        
        // Update bet amount limits based on balance
        this.betAmountEl.max = Math.min(500, this.balance);
        
        if (this.balance < 10) {
            this.placeBetBtn.disabled = true;
            this.gameStatusEl.textContent = 'Insufficient balance! Game over.';
            this.gameStatusEl.style.color = '#f44336';
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.aviatorGame = new AviatorGame();
    
    // Store start time for multiplier calculation
                          window.aviatorGame.roundStartTime = Date.now();
});

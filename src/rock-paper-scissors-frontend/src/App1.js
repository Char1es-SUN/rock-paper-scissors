import { HttpAgent, Actor } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { rock_paper_scissors_backend } from "../../declarations/rock-paper-scissors-backend";

export class Game {
    constructor() {
        this.wins = 0;
        this.losses = 0;
        this.initializeGame();
    }

    async initializeGame() {
        this.resultDiv = document.getElementById('result');
        this.winsSpan = document.getElementById('wins');
        this.lossesSpan = document.getElementById('losses');

        // Initialize Internet Identity
        await this.authenticateUser();

        // Add event listeners to all choice buttons
        document.querySelectorAll('.choice').forEach(button => {
            button.addEventListener('click', (e) => {
                const choice = parseInt(e.target.dataset.choice);
                this.play(choice);
            });
        });
    }

    async initAuth() {
        this.authClient = await AuthClient.create();
        
        const isAuthenticated = await this.authClient.isAuthenticated();
        this.isAuthenticated = isAuthenticated;
    
        if (isAuthenticated) {
            const identity = this.authClient.getIdentity();
            this.principal = identity.getPrincipal().toString();
        }
    }

    async login() {
        const daysToAdd = BigInt(1);
        const EIGHT_HOURS_IN_NANOSECONDS = BigInt(8 * 60 * 60 * 1000000000);
        
        await this.authClient?.login({
          identityProvider: process.env.II_URL || "https://identity.ic0.app",
          maxTimeToLive: daysToAdd * EIGHT_HOURS_IN_NANOSECONDS,
          onSuccess: async () => {
            setIsAuthenticated(true);
            const identity = authClient.getIdentity();
            const principal = identity.getPrincipal().toString();
            setPrincipal(principal);
          },
        });
      }
      
    async logout() {
        await this.authClient?.logout();
        this.isAuthenticated = false;
        this.principal = null;
      }


    async play(choice) {
        try {
            const result = await this.backend.playGame(choice);
            this.resultDiv.textContent = result.message;

            if (result.won) {
                this.wins++;
                this.winsSpan.textContent = this.wins;
            } else if (!result.message.includes("Draw")) {
                this.losses++;
                this.lossesSpan.textContent = this.losses;
            }

            this.animateResult();

        } catch (error) {
            this.resultDiv.textContent = 'Error playing game: ' + error.message;
        }
    }

    animateResult() {
        this.resultDiv.style.animation = 'none';
        this.resultDiv.offsetHeight; // Trigger reflow
        this.resultDiv.style.animation = 'fadeIn 0.5s ease-in';
    }
}

export default Game;
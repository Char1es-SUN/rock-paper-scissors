import { AuthClient } from "@dfinity/auth-client";
import { rock_paper_scissors_backend } from "../../declarations/rock-paper-scissors-backend";

export class Game {
    constructor() {
        this.wins = 0;
        this.losses = 0;
        this.authClient = null;
        this.isAuthenticated = false;
        this.principal = null;
        this.loginButton = null;
        this.logoutButton = null;
        this.initializeGame();
    }

    async initializeGame() {
        // Initialize DOM elements
        this.resultDiv = document.getElementById('result');
        this.winsSpan = document.getElementById('wins');
        this.lossesSpan = document.getElementById('losses');

        // Add login/logout buttons initialization
        this.loginButton = document.getElementById('loginButton');
        this.logoutButton = document.getElementById('logoutButton');
        
        // Add click handlers for auth buttons
        this.loginButton?.addEventListener('click', () => this.login());
        this.logoutButton?.addEventListener('click', () => this.logout());

        // Initialize auth
        await this.initAuth();
        
        // Update UI based on auth status
        this.updateAuthButtons();

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
    
        this.isAuthenticated = await this.authClient.isAuthenticated();
    
        if (this.isAuthenticated) {
            const identity = this.authClient.getIdentity();
            this.principal = identity.getPrincipal().toString();
            document.getElementById('user-id').textContent = `Logged in as: ${this.principal}`;
        }

        // Add this at the end of initAuth
        this.updateAuthButtons();
    }
    
    async login() {
        const daysToAdd = BigInt(1);
        const EIGHT_HOURS_IN_NANOSECONDS = BigInt(8 * 60 * 60 * 1000000000);
        
        await this.authClient?.login({
            identityProvider: process.env.II_URL || "https://identity.ic0.app",
            maxTimeToLive: daysToAdd * EIGHT_HOURS_IN_NANOSECONDS,
            onSuccess: async () => {
                this.isAuthenticated = true;
                const identity = this.authClient.getIdentity();
                this.principal = identity.getPrincipal().toString();
                document.getElementById('user-id').textContent = `Logged in as: ${this.principal}`;
                this.updateAuthButtons();
            },
        });
    }
    
    async logout() {
        await this.authClient?.logout();
        this.isAuthenticated = false;
        this.principal = null;
        document.getElementById('user-id').textContent = 'Not logged in';
        this.updateAuthButtons();
    }

    async play(choice) {
        try {
            // Call the backend canister
            const result = await rock_paper_scissors_backend.playGame(choice);
            
            // Update result message
            this.resultDiv.textContent = result.message;
            
            // Update scores
            if (result.won) {
                this.wins++;
                this.winsSpan.textContent = this.wins;
            } else if (!result.message.includes("Draw")) {
                this.losses++;
                this.lossesSpan.textContent = this.losses;
            }

            // Trigger animation
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

    updateAuthButtons() {
        if (this.loginButton && this.logoutButton) {
            this.loginButton.style.display = this.isAuthenticated ? 'none' : 'block';
            this.logoutButton.style.display = this.isAuthenticated ? 'block' : 'none';
        }
    }
}

export default Game;
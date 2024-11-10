import Debug "mo:base/Debug";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Text "mo:base/Text";
import Random "mo:base/Random";
import Result "mo:base/Result";
import Blob "mo:base/Blob";
import Array "mo:base/Array";

actor RockPaperScissors {
    // Store the latest random seed
    private stable var currentSeed : ?Blob = null;

    // Define game choices
    private let ROCK : Nat = 1;
    private let PAPER : Nat = 2; 
    private let SCISSORS : Nat = 3;

    // Generate computer's choice (1-3)
    private func generateComputerChoice() : async Nat {
        // Get raw entropy from IC
        let entropy = await Random.blob();
        
        // Update our seed
        currentSeed := ?entropy;

        // Convert first byte to number between 1-3
        let randomBytes = Blob.toArray(entropy);
        if (randomBytes.size() > 0) {
            (Nat8.toNat(randomBytes[0]) % 3) + 1;
        } else {
            // Fallback to timestamp-based randomness
            let timestamp = Int.abs(Time.now());
            (timestamp % 3) + 1;
        };
    };

    // Determine winner
    private func determineWinner(player : Nat, computer : Nat) : Bool {
        if (player == computer) {
            return false; // Draw counts as a loss
        };

        switch(player) {
            case (1) { // Rock
                computer == 3 // Wins against Scissors
            };
            case (2) { // Paper
                computer == 1 // Wins against Rock
            };
            case (3) { // Scissors
                computer == 2 // Wins against Paper
            };
            case (_) {
                false
            };
        };
    };

    // Play a round of Rock Paper Scissors
    public shared func playGame(userChoice : Nat) : async {
        won: Bool;
        message: Text;
    } {
        // Validate input
        if (userChoice < 1 or userChoice > 3) {
            return {
                won = false;
                message = "Invalid choice! Please pick 1 (Rock), 2 (Paper), or 3 (Scissors)";
            };
        };

        // Get computer's choice
        let computerChoice = await generateComputerChoice();
        
        // Convert choices to text for message
        let userText = switch(userChoice) {
            case (1) "Rock";
            case (2) "Paper";
            case (3) "Scissors";
            case (_) "Invalid";
        };

        let computerText = switch(computerChoice) {
            case (1) "Rock";
            case (2) "Paper";
            case (3) "Scissors";
            case (_) "Invalid";
        };

        // Determine winner
        let playerWon = determineWinner(userChoice, computerChoice);

        if (userChoice == computerChoice) {
            return {
                won = false;
                message = "Draw! You both chose " # userText;
            };
        };

        if (playerWon) {
            return {
                won = true;
                message = "You win! " # userText # " beats " # computerText;
            };
        };

        return {
            won = false;
            message = "You lose! " # computerText # " beats " # userText;
        };
    };

    // Optional: Get the last used random seed (for verification/debugging)
    public query func getLastSeed() : async ?Blob {
        currentSeed
    };
}
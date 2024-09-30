const dialogueArea = document.getElementById('dialogue-area');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Predefined messages for new users
const predefinedMessages = [
    "Cop: Halt! Who goes there? This is a restricted area! What are you doing here?!",
];

// Load dialogue history from localStorage or initialize with predefined messages for new users
let dialogueHistory = JSON.parse(localStorage.getItem('dialogueHistory')) || [];

// Check if the user is new (no dialogue history in localStorage)
if (dialogueHistory.length === 0) {
    dialogueHistory = predefinedMessages;
    localStorage.setItem('dialogueHistory', JSON.stringify(dialogueHistory)); // Save predefined messages to localStorage
}

// Function to append a dialogue message to the chat area
function appendDialogue(text, isUser) {
    const message = document.createElement('div');
    message.textContent = text;
    message.className = isUser ? 'user-message' : 'bot-message';
    dialogueArea.appendChild(message);
    dialogueArea.scrollTop = dialogueArea.scrollHeight; 
}

// Function to load dialogue history on page load
function loadDialogueHistory() {
    dialogueHistory.forEach((entry) => {
        // Check if entry contains a colon to avoid split issues
        if (entry.includes(': ')) {
            const [role, text] = entry.split(': ', 2);
            appendDialogue(`${role}: ${text}`, role === 'You');
        } else {
            appendDialogue(entry, false);  // Default to bot-message if format is incorrect
        }
    });
}

// Function to handle sending a message
async function handleSendMessage() {
    const input = userInput.value.trim();
    if (input) {
        appendDialogue(`You: ${input}`, true);
        userInput.value = '';
        dialogueHistory.push(`You: ${input}`);

        const response = await generateResponse(input);
        appendDialogue(`Cop: ${response}`, false);
        dialogueHistory.push(`Cop: ${response}`);

        // Save dialogue history to localStorage
        localStorage.setItem('dialogueHistory', JSON.stringify(dialogueHistory));


        if (response.toLowerCase().includes("game is over")) {
            await sleep(3000);
            const userConfirmed = confirm("Game is over! Press OK");
            if (userConfirmed) {
                localStorage.removeItem('dialogueHistory');
                location.reload(); // Reload the page to reset the dialogue
            }
        }
    }
}

// Event listeners for sending messages
sendButton.addEventListener('click', handleSendMessage);

userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        handleSendMessage();
    }
});

// Function to fetch response from server
async function generateResponse(userInput) {
    const url = "/generate";
    const body = JSON.stringify({ prompt: userInput });

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: body,
        });

        const data = await response.json();
        if (response.ok) {
            return data.text;
        } else {
            console.error("Error:", data);
            return "There was an error generating a response.";
        }
    } catch (error) {
        console.error("Error:", error);
        return "Failed to communicate with the server.";
    }
}

// Load the dialogue history when the page loads
window.onload = loadDialogueHistory;

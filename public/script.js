const dialogueArea = document.getElementById('dialogue-area');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const predefinedMessages = [
    "Cop: Halt! Who goes there? This is a restricted area! What are you doing here?!",
];

let dialogueHistory = JSON.parse(localStorage.getItem('dialogueHistory')) || [];

if (dialogueHistory.length === 0) {
    dialogueHistory = predefinedMessages;
    localStorage.setItem('dialogueHistory', JSON.stringify(dialogueHistory));
}

function appendDialogue(text, isUser) {
    const message = document.createElement('div');
    message.textContent = text;
    message.className = isUser ? 'user-message' : 'bot-message';
    dialogueArea.appendChild(message);
    dialogueArea.scrollTop = dialogueArea.scrollHeight; 
}

function loadDialogueHistory() {
    dialogueHistory.forEach((entry) => {
        if (entry.includes(': ')) {
            const [role, text] = entry.split(': ', 2);
            appendDialogue(`${role}: ${text}`, role === 'You');
        } else {
            appendDialogue(entry, false);
        }
    });
}

async function handleSendMessage() {
    const input = userInput.value.trim();
    if (input) {
        appendDialogue(`You: ${input}`, true);
        userInput.value = '';
        dialogueHistory.push(`You: ${input}`);

        const response = await generateResponse(input);
        appendDialogue(`Cop: ${response}`, false);
        dialogueHistory.push(`Cop: ${response}`);

        localStorage.setItem('dialogueHistory', JSON.stringify(dialogueHistory));

        if (response.toLowerCase().includes("game is over")) {
            await sleep(3000);
            const userConfirmed = confirm("Game is over! Press OK");
            if (userConfirmed) {
                localStorage.removeItem('dialogueHistory');
                location.reload();
            }
        }
    }
}

sendButton.addEventListener('click', handleSendMessage);

userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        handleSendMessage();
    }
});

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

window.onload = loadDialogueHistory;

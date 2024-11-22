// Initialize Jitsi Meet API globally
const domain = "meet.jit.si";
let api; // Declare api globally
let pollVotes = {}; // Store poll votes
let participants = []; // To store participants' information

// Function to initialize the meeting
function initializeMeeting() {
    const options = {
        roomName: "EnhancedConferenceRoom",
        width: "100%",
        height: 500,
        parentNode: document.querySelector('#meet'),
        configOverwrite: {
            speakerSelection: false // Disable speaker selection if not needed
        },
    };

    // Initialize the Jitsi API if it's not already initialized
    if (!api) {
        api = new JitsiMeetExternalAPI(domain, options);
        console.log('Jitsi Meet API initialized');

        // Event listener to check when the conference is ready
        api.addEventListener('readyToClose', () => {
            console.log('Jitsi Meet API initialized and ready!');
        });

        // Ensure the video conference has been joined
        api.addEventListener('videoConferenceJoined', () => {
            console.log('Video conference successfully joined!');
            enableControls(); // Enable controls after the meeting starts
        });

        // Handle chat messages sent in Jitsi
        api.addEventListener('chatMessageReceived', (event) => {
            console.log('Received chat message: ', event.message);
            displayChatMessage(event.message); // Display the message in your interface
        });

        // Handle poll messages in Jitsi (custom handling)
        api.addEventListener('endpointTextMessageReceived', (event) => {
            if (event.text.startsWith("Poll:")) {
                // Check if it's a poll message and display it
                displayPollResultsFromJitsi(event.text);
            }
        });

        // Track participants joining and leaving
        api.addEventListener('participantJoined', (event) => {
            const participant = event.id; // Get participant's ID
            participants.push(participant); // Add participant to the list
            displayParticipants(); // Update the participant list display
        });

        api.addEventListener('participantLeft', (event) => {
            const participant = event.id; // Get participant's ID
            const index = participants.indexOf(participant);
            if (index > -1) {
                participants.splice(index, 1); // Remove participant from the list
                displayParticipants(); // Update the participant list display
            }
        });
    }
}

// Function to enable controls after the meeting starts
function enableControls() {
    document.getElementById('toggleAudio').disabled = false;
    document.getElementById('toggleVideo').disabled = false;
    document.getElementById('shareScreen').disabled = false;
    document.getElementById('startRecording').disabled = false;
    document.getElementById('stopRecording').disabled = false;
}

// Display chat message in your custom UI
function displayChatMessage(message) {
    const messagesDiv = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.textContent = `Jitsi: ${message}`;
    messageDiv.classList.add('message'); // Add a class for styling
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto-scroll to the latest message
}

// Display Poll Results from Jitsi
function displayPollResultsFromJitsi(pollMessage) {
    const pollResultsDiv = document.getElementById('pollResults');
    pollResultsDiv.innerHTML = ''; // Clear existing results
    
    const messageParts = pollMessage.split('\n');
    const pollQuestion = messageParts[0]; // First line is the poll question
    const pollOptions = messageParts.slice(1); // Remaining lines are the options
    
    const pollTitleDiv = document.createElement('div');
    pollTitleDiv.textContent = pollQuestion;
    pollResultsDiv.appendChild(pollTitleDiv);

    // Display each option as a result
    pollOptions.forEach(option => {
        const resultDiv = document.createElement('div');
        resultDiv.textContent = option; // This could include the number of votes if you manage them
        pollResultsDiv.appendChild(resultDiv);
    });
}

// Display Participants List
function displayParticipants() {
    const participantsDiv = document.getElementById('participants');
    participantsDiv.innerHTML = ''; // Clear existing list

    const titleDiv = document.createElement('div');
    titleDiv.textContent = 'Participants:';
    participantsDiv.appendChild(titleDiv);

    // Display each participant
    participants.forEach(participant => {
        const participantDiv = document.createElement('div');
        participantDiv.textContent = participant; // Participant ID or name (customize as needed)
        participantsDiv.appendChild(participantDiv);
    });
}

// Wait for the DOM to be fully loaded and initialize the meeting automatically
document.addEventListener('DOMContentLoaded', () => {
    // Automatically initialize the meeting as soon as the page is loaded
    initializeMeeting();

    // Toggle Audio
    const toggleAudioButton = document.getElementById('toggleAudio');
    if (toggleAudioButton) {
        toggleAudioButton.addEventListener('click', () => {
            executeApiCommand('toggleAudio'); // Toggle audio using Jitsi Meet API
        });
    }

    // Toggle Video
    const toggleVideoButton = document.getElementById('toggleVideo');
    if (toggleVideoButton) {
        toggleVideoButton.addEventListener('click', () => {
            executeApiCommand('toggleVideo'); // Toggle video using Jitsi Meet API
        });
    }

    // Screen Sharing
    const shareScreenButton = document.getElementById('shareScreen');
    if (shareScreenButton) {
        shareScreenButton.addEventListener('click', () => {
            executeApiCommand('toggleShareScreen'); // Share screen with Jitsi Meet API
        });
    }

    // Start Recording
    const startRecordingButton = document.getElementById('startRecording');
    if (startRecordingButton) {
        startRecordingButton.addEventListener('click', () => {
            executeApiCommand('startRecording', { mode: 'file' }); // Start recording with Jitsi Meet API
            startRecordingButton.disabled = true; // Disable start recording button
            document.getElementById('stopRecording').disabled = false; // Enable stop recording button
            alert("Recording started...");
        });
    }

    // Stop Recording
    const stopRecordingButton = document.getElementById('stopRecording');
    if (stopRecordingButton) {
        stopRecordingButton.addEventListener('click', () => {
            executeApiCommand('stopRecording'); // Stop recording with Jitsi Meet API
            startRecordingButton.disabled = false; // Enable start recording button
            stopRecordingButton.disabled = true; // Disable stop recording button
            alert("Recording stopped...");
        });
    }

    // Polling Functionality
    const createPollButton = document.getElementById('createPoll');
    if (createPollButton) {
        createPollButton.addEventListener('click', () => {
            const pollQuestion = prompt('Enter your poll question:');
            if (pollQuestion) {
                const options = prompt('Enter poll options (comma separated):');
                const pollOptions = options ? options.split(',').map(option => option.trim()) : [];
                
                if (pollOptions.length > 0) {
                    displayPoll(pollQuestion, pollOptions); // Display poll in the app
                    sendPollToJitsi(pollQuestion, pollOptions); // Send poll to Jitsi
                }
            }
        });
    }

    // Dark Mode Toggle
    const darkModeToggleButton = document.getElementById('darkModeToggle');
    if (darkModeToggleButton) {
        darkModeToggleButton.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode'); // Toggle dark mode
        });
    }
});

// Check if Jitsi API is initialized before using it
function executeApiCommand(command, args = {}) {
    if (api) {
        api.executeCommand(command, args);
    } else {
        console.log('Jitsi API is not initialized yet');
    }
}

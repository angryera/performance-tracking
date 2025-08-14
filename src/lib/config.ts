// config.ts - Application Configuration

export const config = {
    // VAPI Configuration
    vapi: {
        publicKey: "a33bcaa3-fb93-472c-aaea-b3d3186e796d",
        assistants: {
            train: "f39e948b-f333-4a57-8ba8-6b01147f05db",
            practice: "33753ff6-b2dc-45d0-8f4d-12db7525c640",
            repmatch: "beb65fdb-aabc-4c5c-a3f5-63629e3ea094"
        }
    },

    // Anam AI Configuration
    anam: {
        apiKey: "ZjVlZjhmOGQtNWMxYi00ODMxLTg3ZDQtZDYxNWExN2NkZjBiOnE2S0hVeGVWeEdDVGpESFhVNHkwS0Zia1MwRENkc0MxYURNdWFNU3RrT3M9",        
        apiUrl: "https://api.anam.ai/v1/auth/session-token",
        persona: {
            name: "Agent",
            llmId: "939de489-1b11-4b91-94b1-0e37223721ca",
            avatarId: "195d733e-58a9-40bb-a049-ac344fa70b7f",
            voiceId: "1c6fa8a7-9aa4-4a17-a75e-3e5eb863fccf",
            systemPrompt: `Your job is to role play as a potential customer. DO NOT EVER TRAIN OR HELP! YOU ARE NOT THE SALES REP! YOU ARE THE CUSTOMER! DONT BREAK CHARACTER

            The goal is for the sales rep to get to practice. As they do things in line with the training information from the vector database of training info that you have, you should allow them to move forward. If they are not following the sales training recommendations, you can be a little more difficult. 
            
            Make sure to not be too easy to sell. Many customers are resistant at first and give objections.

Always respond in a conversational, realistic and clear tone. Ask follow-up questions if reps seem confused or hesitate.

Start by saying "Hi there, how can I help you?

`.trim()
        }
    },

    // Backend API Configuration
    api: {
        endpoints: {
            analyzeTranscript: "/analyze-transcript"
        }
    },

    // UI Configuration
    ui: {
        // Training mode cards configuration
        trainingModes: [
            {
                id: "train",
                title: "Train",
                subtitle: "Master product knowledge & sales techniques",
                icon: "/Train.png",
                gradient: "from-cyan-500 to-purple-600"
            },
            {
                id: "practice",
                title: "Practice",
                subtitle: "Perfect your pitch with AI roleplay",
                icon: "/practice.png",
                gradient: "from-cyan-500 to-purple-600"
            },
            {
                id: "sell",
                title: "Sell",
                subtitle: "Live simulation with video customer",
                icon: "/sell.png",
                gradient: "from-cyan-500 to-purple-600"
            },
            {
                id: "repmatch",
                title: "Rep Match",
                subtitle: "Find your next sales opportunity",
                icon: "/repmatch.png",
                gradient: "from-cyan-500 to-purple-600"
            }
        ],

        // App branding
        branding: {
            title: "LevelRep",
            subtitle: "Next-Gen Training Platform",
        },

        // Timeouts and delays
        timeouts: {
            errorToastDuration: 5000, // 5 seconds
            defaultDelay: 100
        }
    },

    // Video configuration
    video: {
        elementId: "persona-video",
        maxWidth: "100%",
        height: "24rem" // h-96 equivalent
    }
};

export default config; 
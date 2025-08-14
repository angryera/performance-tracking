import { config } from "@/lib/config";

const createSessionToken = async () => {
  try {
    console.log('🔑 Creating Anam session token...')
    console.log('API URL:', config.anam.apiUrl)
    console.log('Persona config:', config.anam.persona)
    
    const response = await fetch(config.anam.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.anam.apiKey}`,
      },
      body: JSON.stringify({
        personaConfig: config.anam.persona,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Anam API error:', response.status, errorText)
      throw new Error(`Anam API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json();
    console.log('✅ Anam session token created successfully')
    return data.sessionToken;
  } catch (error) {
    console.error('❌ Failed to create Anam session token:', error)
    throw error
  }
};

export default createSessionToken;

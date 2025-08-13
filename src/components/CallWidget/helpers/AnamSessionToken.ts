import { config } from "@/lib/config";

const createSessionToken = async () => {
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

  const data = await response.json();
  return data.sessionToken;
};

export default createSessionToken;

import api from "./api";

export interface CopilotRequest {
  message: string;
  persona: string;
  language: string;
}

export async function askCopilot(data: CopilotRequest) {
  const response = await api.post("/ai/assist", data);
  return response.data;
}
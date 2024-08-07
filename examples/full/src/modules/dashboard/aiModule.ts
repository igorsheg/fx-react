import { createFXModule } from "fx-react";
import { configModule } from "../config";
import { loggerModule } from "../logger";
import { performanceModule } from "../performance";

export const aiRecommendationModule = createFXModule({
  name: 'aiRecommendation',
  dependencies: [configModule, loggerModule, performanceModule],
  provides: {
    getRecommendation: (deps) => async (userData: { userId: string, interactionHistory: string[] }, dashboardState: { widgets: string[] }) => {
      const { openAiApiKey, openAiApiUrl } = deps.config;
      const { logger, performance } = deps;

      return await performance.measureTime('AI Recommendation', async () => {
        try {
          const prompt = `
            Given the following user data and dashboard state, suggest a dashboard optimization:
            User Data: ${JSON.stringify(userData)}
            Current Dashboard State: ${JSON.stringify(dashboardState)}
            
            **YOU MOST PROVIDE YOUR RECOMMENDATION IN THE FOLLOWING JSON FORMAT**:
            {
              "type": "add_widget" | "remove_widget" | "reorder_widgets",
              "widget": "string" (name of the widget to add or remove, if applicable),
              "reason": "string" (brief explanation for the recommendation)
            }
          `;

          const response = await fetch(`${openAiApiUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${openAiApiKey}`,
            },
            body: JSON.stringify({
              model: "gpt-4o",
              messages: [{ role: "user", content: prompt }],
              temperature: 0,
              max_tokens: 512,
            }),
          });

          if (!response.ok) {
            throw new Error(`OpenAI API request failed: ${response.statusText}`);
          }

          const data = await response.json();
          const recommendationString = data.choices[0].message.content.trim();
          const recommendation = JSON.parse(recommendationString);

          logger.log(`AI recommendation generated: ${JSON.stringify(recommendation)}`);
          return recommendation;
        } catch (error) {
          logger.error(`Error generating AI recommendation: ${error}`);
          return { type: 'no_change', reason: 'Error in AI recommendation' };
        }
      });
    },
  },
  invokes: [
    () => console.log("Hey")
  ]
});

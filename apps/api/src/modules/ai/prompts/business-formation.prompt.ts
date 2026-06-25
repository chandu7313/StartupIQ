import { BusinessFormationAgentInput } from '../ai.types';
import { getCountryContext, getCountryCurrency, getLanguageInstruction } from './country-context';

export function getBusinessFormationPrompt(input: BusinessFormationAgentInput, searchContext: string = ''): string {
  const { currency, symbol } = getCountryCurrency(input.country || input.geography);
  const countryContext = getCountryContext({ country: input.country || input.geography, state: input.state, language: input.language });
  const langInstruction = getLanguageInstruction(input.language);

  return `You are a top-tier Corporate Lawyer and Business Strategy Consultant.
Your task is to recommend the optimal legal structure, banking setup, and brand positioning for a new business.

STARTUP IDEA:
${input.ideaDescription}

INDUSTRY: ${input.industry}
BUSINESS TYPE: ${input.businessType || 'business'}
TEAM SIZE: ${input.teamSize}
GEOGRAPHY: ${input.geography}
COUNTRY: ${input.country || input.geography}
STATE/REGION: ${input.state || 'N/A'}

${searchContext}

${countryContext}

INSTRUCTIONS:
1. Recommend the single best legal structure (e.g., LLC, C-Corp, Pvt Ltd) based on the country, state, team size, and industry.
2. Provide at least 2 alternative structures with pros and cons.
3. Provide Banking Setup recommendations relevant to the geography (e.g., local banks that support startups well).
4. Create a Business Model Canvas and a Lean Canvas specifically tailored to this idea.
5. Provide Branding Suggestions including name options, positioning, and color palettes.
6. Provide monetary values in ${currency} (${symbol}).
7. Return the response strictly as a JSON object matching the requested schema. No markdown fences.

${langInstruction}
`;
}

import { OperationsAgentInput } from '../ai.types';
import { getCountryContext, getCountryCurrency, getLanguageInstruction } from './country-context';

export function getOperationsPrompt(input: OperationsAgentInput): string {
  const { currency, symbol } = getCountryCurrency(input.country || input.geography);
  const countryContext = getCountryContext({ country: input.country || input.geography, state: input.state, language: input.language });
  const langInstruction = getLanguageInstruction(input.language);

  return `You are an expert Chief Operating Officer (COO).
Your job is to build a complete operational playbook, team plan, tech stack, and launch roadmap for a new startup.

STARTUP IDEA:
${input.ideaDescription}

INDUSTRY: ${input.industry}
BUSINESS TYPE: ${input.businessType || 'business'}
TEAM SIZE: ${input.teamSize}
GEOGRAPHY: ${input.geography}
COUNTRY: ${input.country || input.geography}
STATE/REGION: ${input.state || 'N/A'}

${countryContext}

INSTRUCTIONS:
1. Define clear Infrastructure requirements (office, warehouse, equipment) with realistic cost estimates in ${currency}.
2. Build a Team Plan including an org structure description and a phased hiring roadmap.
3. Recommend a specific Technology Stack tailored to the business type (tech vs non-tech). Include software tools relevant to this geography.
4. Provide a Supplier/Procurement strategy and identify potential supply chain risks.
5. Create at least 3 detailed Standard Operating Procedures (SOPs) critical for this specific business.
6. Generate a comprehensive Launch Checklist (at least 5 steps) with logical dependencies and durations (e.g., "2 weeks").
7. Return the response strictly as a JSON object matching the requested schema. No markdown fences.

${langInstruction}
`;
}

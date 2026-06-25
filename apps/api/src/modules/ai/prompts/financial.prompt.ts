import { FinancialAgentInput } from '../ai.types';
import { getCountryContext, getCountryCurrency, getLanguageInstruction } from './country-context';

export function getFinancialPrompt(input: FinancialAgentInput): string {
  const { currency, symbol } = getCountryCurrency(input.country || input.geography);
  const countryContext = getCountryContext({ country: input.country || input.geography, language: input.language });
  const langInstruction = getLanguageInstruction(input.language);

  const marketData = input.marketData
    ? `MARKET SIZING:\nTAM: ${input.marketData.tam.currency}${input.marketData.tam.value}\nSAM: ${input.marketData.sam.currency}${input.marketData.sam.value}\nSOM: ${input.marketData.som.currency}${input.marketData.som.value}`
    : '';

  return `You are an expert Startup CFO. Your job is to generate REALISTIC financial assumptions for a deterministic financial model.
Do NOT attempt to calculate 3-year projections or break-even points yourself. Just provide the raw assumptions based on industry benchmarks.

STARTUP IDEA:
${input.ideaDescription}

INDUSTRY: ${input.industry}
TEAM SIZE: ${input.teamSize}
BUDGET/CAPITAL: ${input.budget}
GEOGRAPHY: ${input.geography}
COUNTRY: ${input.country || input.geography}

${marketData}

${countryContext}

INSTRUCTIONS:
1. Provide highly realistic assumptions for a business of this type in this geography.
2. Ensure CAC and LTV assumptions align with the industry standard.
3. Ensure monthly fixed costs and variable cost margins are appropriate for the team size and business model.
4. List specific startup setup costs (e.g., equipment, deposits, legal fees).
5. Suggest 3 realistic funding options for this stage and geography.
6. Provide all monetary values as pure numbers (e.g., 5000) representing ${currency}.
7. Return the response strictly as a JSON object matching the requested schema. No markdown fences.

${langInstruction}
`;
}

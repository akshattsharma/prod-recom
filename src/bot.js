import data from "./replies.json";

export const GREETING = data.greeting;
export const STARTERS = data.starters;

const words = (t) => ` ${t.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()} `;
const mentions = (text, keywords) => keywords.some((k) => text.includes(` ${k} `));

// "500-1000", "under 800", "$1,200", "2k" -> a single number to match against the tiers
function parseBudget(input) {
  const cleaned = input
    .replace(/,/g, "")
    .replace(/(\d+(?:\.\d+)?)\s*k\b/gi, (_, n) => String(Number(n) * 1000));
  const nums = (cleaned.match(/\d+(?:\.\d+)?/g) || []).map(Number);
  if (!nums.length) return null;
  const value = nums.length > 1 ? (Math.min(...nums) + Math.max(...nums)) / 2 : nums[0];
  return value > 0 ? value : null;
}

// Returns { text, ctx }. ctx remembers the product so the user can try other budgets.
export function getReply(input, ctx) {
  const text = words(input);
  if (!text.trim()) return { text: data.fallback, ctx };

  const product = data.products.find((p) => mentions(text, p.keywords));
  if (product) return { text: product.prompt, ctx: { product: product.id } };

  if (ctx && ctx.product) {
    const current = data.products.find((p) => p.id === ctx.product);
    const value = parseBudget(input);
    if (current && value !== null) {
      const tier = current.tiers.find((t) => value >= t.min && (t.max === null || value < t.max));
      if (tier) return { text: tier.answer, ctx };
    }
  }

  const talk = data.smallTalk.find((t) => mentions(text, t.keywords));
  if (talk) return { text: talk.answer, ctx };

  return { text: data.fallback, ctx };
}

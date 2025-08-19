# RAD Security Dashboard - Technical Summary

## Architecture Overview
I built the dashboard with Vite + TypeScript. Vite gave me fast dev builds and smooth hot reloading, which was helpful for working on real-time features. TypeScript added the type safety I wanted for handling alert data structures — catching mistakes early instead of at runtime.  

For styling, I went with Tailwind CSS to move quickly while keeping components consistent. On top of that, shadcn/ui provided accessible, ready-to-use components so I could focus on dashboard logic instead of re-implementing accessibility.  

## State Management & Data Flow
I chose Zustand over Redux. The app didn’t need heavy middleware or time-travel debugging, and Zustand kept the setup lightweight while still giving me strong TypeScript support.  

Instead of one big store, I split state into smaller slices:  
- **Tenant/Project** – global context that scopes everything else  
- **Alerts** – both static data and live updates  
- **AI Assistant** – conversation state, isolated from alert logic  

This kept the code easy to test and avoided unnecessary re-renders. Structuring it this way also mirrored how a multi-tenant, RBAC-style system would actually behave: users only see what’s relevant to their context.  

## AI Assistant Integration
For the assistant, I integrated OpenAI’s API instead of mocking responses. That made the feature more than just a placeholder — the assistant actually works with the same alert data shown in the dashboard. I ran the API calls through Vercel serverless functions, which let me keep the frontend clean while still following a realistic integration pattern.  

To improve UX I used OpenAI’s streaming responses, so answers appear in real time rather than waiting for a full block of text. The result feels responsive and closer to how you’d want an AI helper to work in production.  

For the model, I went with gpt-4o-mini because it was affordable and I already had tokens on hand. If cost wasn’t part of the equation, I’d probably use one of the newer flagship models like GPT-5 or Claude Opus 4.1, since both handle reasoning and long context better for more complex analysis.

## Real-time Data & Visualizations
For the threat stream, I set up polling via Vercel API endpoints. It’s a simple pattern, but it clearly demonstrates live updates and how tenant/project scoping flows through the app. While approaches like SSE or WebSockets could be more efficient, I felt that polling fit the scope well and still shows how the dashboard handles incoming alerts for this assignment.  

On the visualization side I used Recharts. It integrates smoothly with React, handles responsive layouts, and updates automatically when the underlying data changes — perfect for switching tenants or watching new alerts stream in.  

## Challenges & Tradeoffs
- The main challenge was balancing realism with simplicity. For example, I kept filtering logic in the alert store itself instead of breaking it out, since the two were tightly coupled. It made the store less modular, but easier to reason about.  
- Because this is a frontend-only project, all filtering, sorting, and pagination happen client-side. That works fine here, but at scale those would belong server-side for performance.  
- For real-time updates, I stuck with polling to keep things straightforward. In production, I’d use SSE or WebSockets for smoother, lower-latency streaming.  

## Future Improvements
- Add error boundaries and loading states to make the app more resilient in production.  
- Expand test coverage with integration and E2E tests using Playwright.  
- Improve performance with memoization of filtered/sorted data and virtualization for handling larger alert volumes.
- Even though this is a frontend assignment, it’s important for me to call out API security — in a real app I’d add authentication, tenant scoping, and rate limiting to ensure only authorized users can access data safely.
- Make the charts interactive — for example, clicking on a day in the graph could automatically filter alerts for that day, or clicking a slice of the pie could filter by that category. This would make it easier to explore and drill down into the data directly from the visualizations.
- **AI specific improvements**
  - Optimize token usage further — right now I only send summarized alerts and the last five conversation turns, but this could be improved with rolling summaries, compact JSON, and caching. This would keep requests smaller and make the assistant faster and cheaper to run.
  - Introduce response caching — repeated or similar queries could be served from a cache (potentially with semantic search), reducing unnecessary API calls.
  - Add persistent memory scoped to user/project/tenant, so past conversations and insights can be referenced in future chats. Short-term context could live in Redis for speed, while longer-term facts or embeddings could be stored in a database.
  - Add guardrails to keep the assistant focused on security topics — for example, filtering out off-topic or disallowed requests and running responses through a moderation check so it avoids things like mature or other inappropriate content.
  - Add privacy guardrails by stripping out sensitive details before sending data to the model, and by using placeholders or IDs that can be filled back in after the response. Store only what’s necessary for future chats, and keep it encrypted and scoped so user and project data stays protected.


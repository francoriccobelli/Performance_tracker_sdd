# StudioPulse: System Specification

## 1. Technical Stack
- React (Vite) + Tailwind CSS
- Lucide-React (Icons)
- Recharts (Data Visualization: Radar & Bar)
- LocalStorage/Persistence (Phase 1); Firebase/SQL (Phase 2)

## 2. Core Functional Modules
- **Employee Roster:** Full CRUD for managing Software and Design team members.
- **The 60/40 Math Engine:**
    - Inputs: Velocity (%), Quality (%), Presence (%), Milestone Impact (%).
    - Peer Ratings: Excellence (1-5), Collaboration (1-5), Ownership (1-5).
    - Output: A single weighted Pulse Score (0-100).
- **Interactive Radar Chart:** A skill matrix visualization mapping the 7 core dimensions of an R&D professional.
- **Sign-off Workflow:** A verification system that logs when a review is finalized and acknowledged.

## 3. UI/UX Style Guide (Studio Dark)
- **Primary Background:** #020617 (Slate-950)
- **Component Surface:** #0f172a (Slate-900)
- **Accent Indigo:** #6366f1 (Indigo-500)
- **Accent Emerald:** #10b981 (Emerald-500)
- **Accent Amber:** #f59e0b (Amber-500)
- **Typography:** Inter (Sans) for UI; JetBrains Mono (or System Mono) for all numerical data.
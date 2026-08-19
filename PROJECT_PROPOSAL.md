# PROJECT PROPOSAL: UniFinance

## 1. Title of the Project
**UniFinance: An AI-Powered Personal Finance Platform**

---

## 2. Problem Statement
Managing personal finances effectively remains a significant challenge for individuals due to:
* **Manual Data Entry Overhead:** Traditional tracking tools require users to manually input every single transaction, which is time-consuming, tedious, and prone to errors. This leads to user fatigue and abandonment of financial tracking.
* **Lack of Real-time Budgeting Controls:** Users typically realize they have overspent only at the end of the month. Proactive alerts and category-specific budget tracking are often absent, leading to poor financial discipline.
* **Siloed and Inconvenient Receipt Tracking:** Physically keeping paper receipts or trying to organize digital image logs is cumbersome. Critical expense information (tax data, warranties, transaction proof) is frequently lost.
* **Absence of Actionable Financial Intelligence:** Standard tools offer flat data representation (bar charts and list views) but do not provide personalized, context-aware analysis to help users understand *why* they overspend or *how* to optimize their money.
* **Security & Scalability Risks:** Public finance portals often process sensitive banking information without robust client-side control or rate limiting, exposing them to credential stuffing and malicious scraper bots.

---

## 3. Objectives of the Project
The primary objectives of UniFinance are to:
1. **Develop a Consolidated Financial Dashboard:** Provide a responsive visual interface representing a user’s dynamic cash flow (income vs. expenses, net balance, and interactive monthly charts).
2. **Automate Expense Logging via AI-OCR:** Eliminate manual entry by allowing users to upload transaction receipts. An integrated Large Language Model (LLM) extracts the merchant, total amount, transaction date, and appropriate category in real time.
3. **Implement Proactive Budget Alerts:** Enable users to set custom budgets per expense category and receive automated email warnings when their spending crosses predefined safety thresholds (e.g., 80% or 100% of the budget).
4. **Automate Recurring Transactions:** Set up cron-like scheduling for recurring income/expenses (salaries, subscriptions, rent) to ensure financial statements are kept up-to-date automatically.
5. **Generate AI-Powered Financial Health Reports:** Deliver automated monthly financial summaries directly to the user's inbox, analyzing spending patterns and providing actionable optimization tips.
6. **Ensure Enterprise-Grade Security and Rate Limiting:** Protect APIs and auth flows from automated attacks, bots, and brute force requests using modern edge protection systems.

---

## 4. Technology Stack
* **Programming Languages:** JavaScript, TypeScript, SQL, HTML5, CSS3
* **Frameworks & UI Library:**
  * **Next.js 15 (App Router):** Leveraging Server Actions for secure backend data mutation without client-side API exposure.
  * **React 19:** Utilizing concurrent rendering capabilities for smooth user experiences.
  * **Tailwind CSS 4 & shadcn/ui:** Styling and accessible UI components (built on Radix UI primitives).
* **Database & ORM:**
  * **Prisma ORM:** For type-safe database queries and automated schema migrations.
  * **SQLite:** Local file-based, SQL-compliant relational database (ideal for zero-configuration, self-hosted deployments).
* **AI Engine:**
  * **Groq Cloud API (Llama 3 Model):** High-speed LLM inference utilized for extracting structured metadata from receipt images and performing monthly financial digest analyses.
* **Background Tasks & Jobs Orchestration:**
  * **Inngest:** Event-driven background job orchestrator for managing cron-like schedules (executing recurring transactions and queueing monthly report builds).
* **Transactional Email Platform:**
  * **Resend API:** Dedicated email delivery platform for sending real-time budget threshold warnings and compiled monthly HTML digests.
* **Security & Auth:**
  * **Arcjet:** Next-generation application security for rate-limiting (token bucket algorithm), bot protection, and API shielding.
  * **Jose JWT:** Custom authentication utilizing signed JSON Web Tokens for lightweight, fast session validation.
  * **Google OAuth 2.0:** Secure single-sign-on integration for seamless user registration and login.

---

## 5. Domain / Area of Application
* **Primary Domain:** Financial Technology (FinTech) & Personal Finance Management (PFM).
* **Sub-domains:** Human-Computer Interaction (HCI), Applied Artificial Intelligence (AI-driven OCR and text analytics), and Distributed Web Engineering (background task scheduling and secure microservices).

---

## 6. Expected Outcomes
* **Outcome 1 (Core Web Portal):** A deployable web application that is fully responsive across desktop, tablet, and mobile browsers.
* **Outcome 2 (Secure Access System):** A secure, single-sign-on system (Google OAuth) and JWT session management using HTTP-only cookies.
* **Outcome 3 (Real-time Analytics):** An interactive, real-time analytics dashboard with dynamic visual charts displaying cash flows and current net balances.
* **Outcome 4 (AI Receipt Processor):** A high-accuracy receipt processing pipeline capable of turning raw images or PDFs into structured database records in under 3 seconds.
* **Outcome 5 (Automated Notifications & Reports):** Automated email notification system triggering budget alerts and transmitting PDF/HTML monthly financial health statements.

---

## 7. Mapping Requirements

### A. Mapping with Sustainable Development Goals (SDGs)
By providing users with tools for financial literacy, budgeting, and waste reduction, UniFinance directly maps to the following United Nations Sustainable Development Goals:

| SDG | Goal Name | Target Mapping | UniFinance Implementation / Impact |
|---|---|---|---|
| **SDG 1** | **No Poverty** | **Target 1.4:** Ensure all men and women have access to basic services, ownership, control over land, and financial services. | Dematerializes and democratizes wealth-management tools, allowing users of all economic backgrounds to track cash flow, plan savings, and avoid debt traps. |
| **SDG 4** | **Quality Education** | **Target 4.4:** Substantially increase the number of youth and adults who have relevant skills, including technical and vocational skills, for employment and entrepreneurship. | Integrates AI-driven insights that educate users on financial literacy, savings strategies, and smart budgeting principles. |
| **SDG 8** | **Decent Work and Economic Growth** | **Target 8.10:** Strengthen the capacity of domestic financial institutions to encourage and expand access to banking, insurance, and financial services for all. | Encourages savings and micro-investments by identifying redundant expenses and structuring personal budget limits, fostering broader financial inclusion. |
| **SDG 12** | **Responsible Consumption and Production** | **Target 12.8:** Ensure that people everywhere have the relevant information and awareness for sustainable development and lifestyles in harmony with nature. | Promotes "mindful consumption" by categorizing personal spending habits (e.g., dining out, travel, energy bills) and raising alerts on excesses, helping users lower resource waste. |

---

### B. Mapping with Program Outcomes (POs)
For engineering programs, the UniFinance project maps closely to several core Program Outcomes (POs):

* **PO1: Engineering Knowledge:**
  * *Application:* Integrating computer science foundations (Next.js, relational database schemas, SQL database designs) and software architectures (JWT auth proxy patterns) to build a multi-layered FinTech system.
* **PO2: Problem Analysis:**
  * *Application:* Identifying performance bottlenecks in OCR extraction times and resolving rate-limit bottlenecks by implementing Arcjet middleware. Conducting security threat analysis on financial APIs.
* **PO3: Design/Development of Solutions:**
  * *Application:* Designing a complete software system from scratch—spanning the relational schema (Prisma + SQLite), server-side endpoints, dynamic dashboard views, background queues (Inngest), and transaction processing flows.
* **PO4: Conduct Investigations of Complex Problems:**
  * *Application:* Formulating experiments using LLM prompts to find the optimal prompt template for high-accuracy receipt extraction across diverse font sizes, currencies, and languages.
* **PO5: Modern Tool Usage:**
  * *Application:* Selecting and utilizing state-of-the-art tools such as Next.js 15, Groq Cloud API, Resend, Arcjet security middlewares, and Prisma ORM to create an industry-standard modern web application.
* **PO11: Project Management and Finance:**
  * *Application:* Organizing and tracking project iterations. Furthermore, the domain of the application directly targets financial math (interest rate accruals, savings rate calculation, transaction categorization, and budget allocation models).
* **PO12: Life-long Learning:**
  * *Application:* Adapting to rapidly changing cloud deployment paradigms, serverless architectures, and next-gen AI inference pipelines (Groq API).

---

### C. Mapping with Program Specific Outcomes (PSOs)
The project demonstrates alignment with core Computer Science & IT Program Specific Outcomes (PSOs):

* **PSO1: Software Development & Engineering Practices:**
  * *Application:* Creating clean, maintainable, modular, and typed code (TypeScript) with an auth-proxy design pattern, secure cookies, and structural separations of server actions, app routes, and frontend components.
* **PSO2: Data Engineering & Applied Intelligence:**
  * *Application:* Managing and structured-querying relational transactional data (Prisma/SQL) and integrating AI capabilities (LLM receipt scanning, semantic summaries) to build an intelligent software ecosystem.

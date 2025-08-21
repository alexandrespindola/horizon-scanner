# **Horizon Scanner: Predictive Market Opportunity Engine**

## **Project Goal (Personal Context)**

The primary objective is to develop an elite portfolio project within 3 days for the Groupon technical interview. The project must demonstrate not only technical proficiency in the requested stack but also proactive business acumen, senior software architecture thinking, and a deep alignment with the company's "AI-First" philosophy.

## **Relevance to the Job Description (Groupon \- JS Automation Developer)**

This project directly addresses the core requirements and culture described in the job posting:

* **AI-First:** It utilizes a chain of multiple AI models for tasks that go beyond simple classification, focusing on predictive analysis.  
* **Autonomy and Impact:** It's a proactive system that creates new revenue opportunities, demonstrating the significant impact a single individual can have.  
* **Tech Stack:** It cohesively integrates Google Apps Script, N8N, AI (Gemini), and external APIs (Jira), exactly as requested.  
* **Problem-Solving:** It focuses on solving a strategic business problem (new partner acquisition) rather than just a technical task.

## **App Objective (The "What")**

The Horizon Scanner is an automated system that scans public data sources (social media, news) to detect emerging consumer trends in specific geographic locations. Upon identifying a trend with low offer coverage in the marketplace, it automatically generates a qualified "Opportunity Lead" for the sales team, turning market intelligence into commercial action.

## **Core Tech Stack**

* **Human Interface:** Google Sheets  
* **Trigger and Feedback Loop:** Google Apps Script  
* **Workflow Orchestration:** N8N (self-hosted via Cloudflare Tunnel)  
* **Message Queue (Resilience):** RabbitMQ (via Heroku/CloudAMQP)  
* **Data Normalization Service:** Deno Deploy (TypeScript)  
* **Artificial Intelligence:** Google Gemini (Analysis & Embedding Generation)  
* **Intelligent Database:** Supabase (PostgreSQL with pgvector extension)  
* **External Intelligence Sources:** Reddit, Brave Search, Firecrawl  
* **Final Business Action:** Jira

## **High-Level Architecture**

graph TD  
    A\[Google Sheets \+ Apps Script\] \-- 1\. Initiate Mission \--\> B(N8N \- Ingestion);  
    B \-- 2\. Publish to Queue \--\> C{RabbitMQ};  
    C \-- 3\. Consume from Queue \--\> D(N8N \- Worker);  
    D \-- 4\. Collect Data \--\> E(External Sources);  
    D \-- 5\. Normalize Text \--\> F(Deno Deploy API);  
    D \-- 6\. AI Analysis \--\> G(Google Gemini);  
    D \-- 7\. Insert & Find Opportunity \--\> H(Supabase \+ pgvector);  
    D \-- 8\. Generate AI Briefing \--\> G;  
    D \-- 9\. Create Task \--\> I(Jira);  
    D \-- 10\. Update Status \--\> A;

## **Documentation Structure**

To facilitate development, this project is broken down into the following documents:

* **1\. README.md** (This file): Overview, objectives, and stack.  
* **2\. ARCHITECTURE.md**: A deep dive into the architecture, data flow, and models.  
* **3\. SETUP\_GUIDE.md**: A step-by-step guide to configure the entire environment.  
* **4\. DEVELOPMENT\_PLAN.md**: Your 3-day roadmap for building the prototype.
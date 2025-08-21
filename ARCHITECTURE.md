# **System Architecture: Horizon Scanner**

## **Architectural Principles**

This system is designed based on the following modern software engineering principles:

* **Event-Driven:** The system is not a monolithic script. Communication between components is handled through events (messages), making it flexible and scalable.  
* **Decoupled and Resilient:** The use of a message queue (RabbitMQ) ensures that the ingestion of requests and the processing of data are independent. If the AI processor is slow or fails, new requests are not lost; they simply wait in the queue.  
* **Serverless-First & Self-Hosted Power:** Most components (Apps Script, Deno Deploy, Supabase) are serverless, eliminating infrastructure management. This is complemented by a powerful, self-hosted **N8N instance exposed via Cloudflare Tunnel**, offering unlimited control and customization.  
* **Composite AI (AI Chaining):** The system does not rely on a single AI model. It orchestrates a chain of calls to different models and services, each specialized in a task, to achieve a more sophisticated result.

## **Component Breakdown**

1. **Google Sheets (UI):**  
   * **Function:** The control panel for the sales manager. The simplicity of the interface hides the complexity of the backend.  
   * **Interaction:** The user simply enters a city and category and clicks a button.  
2. **Google Apps Script (Trigger and Feedback):**  
   * **Trigger:** An onOpen() function creates the custom menu. The menu function collects data from the active row and makes a UrlFetchApp.fetch() call to the N8N Ingestion webhook.  
   * **Feedback:** A second function, published as a Web App (doPost(e)), receives the final call from the N8N Worker to update the mission status in the spreadsheet.  
3. **N8N (Decoupled Workflows):**  
   * **Setup:** A self-hosted instance running locally, made publicly accessible and secure through a **Cloudflare Tunnel** at https://n8n.example.com/.  
   * **Workflow 1 (Ingestion):** Extremely lightweight. It receives the webhook from Apps Script, validates the data, and publishes a message to the RabbitMQ queue. It is the system's entry point.  
   * **Workflow 2 (Worker):** The workhorse. It is triggered by new messages in the RabbitMQ queue. It orchestrates the entire chain of calls: data collection, normalization, AI analysis, querying Supabase, and creating the task in Jira.  
4. **RabbitMQ (Message Queue):**  
   * **Function:** Acts as a buffer. It ensures that request spikes do not overload the system and allows the Worker to process missions in an orderly and asynchronous manner.  
   * **Setup:** Utilizes an existing instance on **Heroku (CloudAMQP)**, sufficient for development and testing.  
5. **API on Deno Deploy (Normalization Service):**  
   * **Function:** Receives the raw HTML scraped by Firecrawl. It uses libraries like Deno's native DOMParser to clean the HTML, extract only the main text, and return it in a clean JSON format. It is a specialized microservice.  
6. **Google Gemini (The Analytical Brain):**  
   * **Function 1 (Extraction):** Analyzes the clean text to extract named entities (names of dishes, restaurants, etc.).  
   * **Function 2 (Embedding):** Converts the trend's concept into a numerical vector for similarity search.  
   * **Function 3 (Generation):** Acts as a "virtual sales analyst" to write the final briefing for the Jira ticket.  
7. **Supabase \+ pgvector (The Smart Memory):**  
   * **Function:** It not only stores data but also the semantic "meaning" of that data through embeddings.  
   * **Table 1 (existing\_offer\_categories):** id, category\_name, category\_embedding (vector). This table is pre-populated with existing marketplace offer categories.  
   * **Table 2 (detected\_trends):** id, trend\_name, source\_urls (jsonb), trend\_embedding (vector), processed\_at.  
   * **The Magic Query (pgvector):** The N8N Worker executes a query that finds the trend\_embedding with the largest cosine distance (lowest similarity) from all existing category\_embedding.  
8. **Jira (The Final Action):**  
   * **Function:** The final destination of the process. It transforms the data insight into an actionable work item for a human.
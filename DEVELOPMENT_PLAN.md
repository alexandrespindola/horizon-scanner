# **3-Day Development Plan: Horizon Scanner Prototype**

This is an intensive plan to build a functional prototype in 3 days, focusing on the most complex and highest-risk parts first. This plan incorporates an advanced **AI Agent (MCP Server)** architecture.

### **Day 1: The System's Core (The AI Agent and its Tools)**

Today's goal is to build the intelligent core of the system: an AI Agent that can dynamically choose the right tool to accomplish its mission.

* (1h) Set up Supabase and CloudAMQP accounts. Create the tables in Supabase.  
* (4h) Build the **N8N Worker as an AI Agent (MCP Server)**:  
  * Configure the RabbitMQ trigger to receive the mission details.  
  * Add the **AI Agent** node. Define its main goal using variables from the trigger (e.g., "Find emerging consumer trends for '{{$json.category}}' in '{{$json.city}}'").  
  * **Build the Agent's Tools:**  
    * **Tool 1 (Social Media Scanner):** Create a chain with a Reddit node. Connect it to the AI Agent node and define it as a tool named scan\_social\_media with a clear description of its function.  
    * **Tool 2 (News & Blog Scanner):** Create a chain with Brave Search \-\> Firecrawl nodes. Connect it and define it as a tool named scan\_online\_articles.  
    * **Tool 3 (Internal Knowledge Check):** Create a chain with a Supabase node to query past trends. Define it as a tool named check\_internal\_database\_for\_similar\_trends.  
* (3h) Integrate the Agent's output with **Google Gemini** for final analysis and embedding generation.  
* (1h) Integrate the workflow with **Supabase** to insert the new trend data and implement the **vector similarity search** query with pgvector.  
* **End of Day Goal:** Have an N8N workflow that acts as an AI Agent. When manually triggered with a mission (e.g., "restaurants in Madrid"), it should correctly choose and execute a tool (like the Reddit scanner), process the output, and find an "opportunity gap" in Supabase.

### **Day 2: The Entry and Exit Doors (Interfaces & Actions)**

Today's goal is to connect the AI Agent to the outside world, both for receiving missions and for delivering actionable results.

* (2h) Develop and deploy the **normalization API on Deno Deploy**. Update the scan\_online\_articles tool in the N8N Agent to use this real API.  
* (3h) Build the interface in **Google Sheets** and the **Apps Script** trigger. Implement the function that sends the mission data to a webhook.  
* (2h) Build the **N8N Ingestion** workflow that receives the Apps Script webhook and publishes the mission message to RabbitMQ.  
* (2h) Implement the final part of the N8N Worker: the call to Gemini to generate the briefing and the task creation in **Jira** based on the Agent's final summary.  
* **End of Day Goal:** Have a functional, though not yet fully connected, end-to-end flow. Be able to start a mission in Sheets and see a task created in Jira, orchestrated by the AI Agent.

### **Day 3: Connection, Testing, and Presentation**

Today's goal is to tie all the pieces together, perform end-to-end testing, and prepare the narrative for the interview.

* (2h) Implement the **Feedback Loop**: the final call from the N8N Worker back to the Apps Script API to update the status in the Spreadsheet.  
* (3h) Conduct **end-to-end testing**. Initiate 5-10 different missions in Sheets. **Crucially, observe the N8N execution logs to verify that the AI Agent is choosing different tools based on the mission context.** Debug and refine the AI prompts and tool descriptions.  
* (1h) Record a short video or take screenshots of the system in action, highlighting the Agent's decision-making process.  
* (3h) Prepare the presentation:  
  * Refine the explanation of the "Idea" and "Business Value".  
  * Create a clear architecture diagram that emphasizes the AI Agent core.  
  * Practice explaining the data flow, focusing on **how the Agent dynamically selects tools**.  
  * Anticipate technical questions about agent reliability, prompt engineering, and the trade-offs of an agent-based vs. a linear workflow.  
* **End of Day Goal:** Have a functional prototype and a cohesive, impactful presentation ready for the technical interview.
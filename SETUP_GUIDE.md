# **Environment Setup Guide: Horizon Scanner**

This guide details the steps to configure all the necessary services for the prototype.

### **Prerequisites**

* Google Account  
* Self-hosted N8N instance with a public URL (via Cloudflare Tunnel)  
* Supabase Account  
* Deno Account (for Deno Deploy)  
* Heroku/CloudAMQP Account (for RabbitMQ)  
* Jira Developer Account  
* Node.js and npm installed locally  
* clasp installed globally (npm install \-g @google/clasp)

### **Step-by-Step Guide**

1. **Supabase:**  
   * Create a new project.  
   * Go to Database \> Extensions and enable the vector extension.  
   * In the SQL Editor, run the commands to create the existing\_offer\_categories and detected\_trends tables as defined in ARCHITECTURE.md.  
   * Save your Project URL and the anon public key (or the service\_role key for write operations).  
2. **RabbitMQ (CloudAMQP on Heroku):**  
   * From your Heroku account, provision the CloudAMQP add-on.  
   * In the CloudAMQP instance panel, note the connection URL (AMQP URL). It contains the username, password, host, etc.  
3. **Google Sheets & Apps Script:**  
   * Create a new Spreadsheet.  
   * Open the script editor and save the "Script ID" from the project settings.  
   * Locally, create a project folder.  
   * In the terminal, inside the folder, run clasp login and clasp clone "YOUR\_SCRIPT\_ID".  
   * Begin developing your .js and appsscript.json files.  
4. **N8N:**  
   * Ensure your self-hosted instance is running and accessible via your Cloudflare Tunnel URL.  
   * Create two new workflows: "Horizon Scanner \- Ingestion" and "Horizon Scanner \- Worker".  
   * **Ingestion Workflow:**  
     * Add a Webhook node. The production URL will be https://n8n-groupon.titansdev.es/webhook/....  
     * Add a RabbitMQ (Send) node. Configure it with your CloudAMQP URL.  
   * **Worker Workflow (Standard Approach):**  
     * Add a RabbitMQ Trigger node. Configure it to listen to the same queue.  
     * Add the Reddit, Brave Search, Firecrawl, HTTP Request (for Deno), Google Gemini, Supabase, and Jira nodes.  
     * Create the necessary credentials for each of these services within N8N.  
   * **Worker Workflow (Advanced AI Agent / MCP Server Approach):**  
     * This approach transforms the worker into an intelligent agent.  
     * **Trigger:** Start with the RabbitMQ Trigger node as before.  
     * **Main Node:** Add the **AI Agent** node. This will be your MCP.  
     * **Define the Tools:**  
       * **Tool 1 (Social Media Scanner):** Connect a **Reddit** node to the AI Agent node. In the AI Agent node's tool configuration, give this tool a name like scan\_social\_media\_for\_trends and a description like "Use this to find emerging trends and discussions on local subreddits for a specific city and topic."  
       * **Tool 2 (News & Blog Scanner):** Connect a chain of **Brave Search \-\> Firecrawl** nodes to the AI Agent. Name this tool scan\_news\_and\_blogs and describe it as "Use this to find and read recent news articles and blog posts about a specific topic in a given city."  
       * **Tool 3 (Internal Knowledge Check):** Connect a **Supabase** node (configured to query past trends) to the AI Agent. Name it check\_internal\_database and describe it as "Use this to check if a newly discovered trend is similar to something we have already analyzed."  
     * **Configure the Agent's Goal:** In the AI Agent node, you will give it a dynamic prompt based on the input from RabbitMQ, for example: *"You are a market opportunity analyst. Your goal is to find emerging consumer trends for the category '{{$json.category}}' in the city '{{$json.city}}'. You have several tools at your disposal. Choose the best tool or sequence of tools to accomplish this mission, then summarize your findings."*  
     * **Orchestration:** The rest of the workflow (calling Gemini for analysis, Supabase for storage, Jira for action) will be connected to the **output** of the AI Agent node, processing the intelligent summary it produces.  
5. **Deno Deploy:**  
   * Create a new project on Deno Deploy, linking it to your GitHub repository.  
   * Create a main.ts file locally with your API server code.  
   * Push to GitHub. Deno Deploy will automatically deploy it.  
   * Note the URL of your deployed API.  
6. **Secrets Management:**  
   * **Apps Script:** Use PropertiesService to securely store the N8N webhook URL.  
   * **N8N:** Use N8N's built-in credentials management for all API keys. Do not hardcode them in the nodes.
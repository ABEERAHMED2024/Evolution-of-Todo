// pages/api/ai-agent.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not available' });
  }

  const { message, conversationHistory } = req.body;

  try {
    // Check if the agent service is available
    const agentUrl = process.env.AGENT_API_URL || 'http://localhost:8001';
    
    // Try to reach the agent service
    try {
      const agentResponse = await fetch(`${agentUrl}/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversation_history: conversationHistory
        })
      });

      if (!agentResponse.ok) {
        throw new Error(`Agent service responded with status ${agentResponse.status}`);
      }

      const data = await agentResponse.json();
      res.status(200).json(data);
    } catch (agentError) {
      console.error('Error communicating with AI agent:', agentError);
      
      // Parse the user's message to determine intent
      const parsedMessage = parseMessage(message);
      
      // Handle different intents
      if (parsedMessage.intent === 'create_task') {
        // Create a task via the backend API
        const taskResponse = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: parsedMessage.title || 'New Task',
            description: parsedMessage.description || '',
            priority: parsedMessage.priority || 'medium',
            due_date: parsedMessage.due_date || null,
            tags: parsedMessage.tags || []
          })
        });
        
        if (taskResponse.ok) {
          const taskData = await taskResponse.json();
          res.status(200).json({ 
            response: `I've created the task "${taskData.title}" for you.`,
            action: 'task_created',
            task: taskData
          });
        } else {
          res.status(200).json({ 
            response: "I tried to create the task but encountered an issue. Could you please try again?",
            action: 'error'
          });
        }
      } else if (parsedMessage.intent === 'get_tasks') {
        // Get tasks from the backend API
        const tasksResponse = await fetch('/api/tasks');
        
        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json();
          if (tasksData.length > 0) {
            const taskTitles = tasksData.slice(0, 5).map(task => task.title).join(', ');
            res.status(200).json({ 
              response: `I found ${tasksData.length} tasks. Here are some: ${taskTitles}.`,
              action: 'tasks_listed',
              tasks: tasksData
            });
          } else {
            res.status(200).json({ 
              response: "You don't have any tasks at the moment. Would you like to create one?",
              action: 'no_tasks'
            });
          }
        } else {
          res.status(200).json({ 
            response: "I couldn't retrieve your tasks. Please try again.",
            action: 'error'
          });
        }
      } else if (parsedMessage.intent === 'update_task') {
        // Update a task via the backend API
        if (parsedMessage.taskId) {
          const updateResponse = await fetch(`/api/tasks?id=${parsedMessage.taskId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(parsedMessage.updates)
          });
          
          if (updateResponse.ok) {
            const taskData = await updateResponse.json();
            res.status(200).json({ 
              response: `I've updated the task "${taskData.title}" for you.`,
              action: 'task_updated',
              task: taskData
            });
          } else {
            res.status(200).json({ 
              response: "I tried to update the task but encountered an issue. Could you please try again?",
              action: 'error'
            });
          }
        } else {
          res.status(200).json({ 
            response: "I need to know which task to update. Could you please specify the task?",
            action: 'need_task_info'
          });
        }
      } else if (parsedMessage.intent === 'delete_task') {
        // Delete a task via the backend API
        if (parsedMessage.taskId) {
          const deleteResponse = await fetch(`/api/tasks?id=${parsedMessage.taskId}`, {
            method: 'DELETE'
          });
          
          if (deleteResponse.ok) {
            res.status(200).json({ 
              response: "I've deleted the task for you.",
              action: 'task_deleted'
            });
          } else {
            res.status(200).json({ 
              response: "I tried to delete the task but encountered an issue. Could you please try again?",
              action: 'error'
            });
          }
        } else {
          res.status(200).json({ 
            response: "I need to know which task to delete. Could you please specify the task?",
            action: 'need_task_info'
          });
        }
      } else {
        // Default response for unrecognized intents
        const defaultResponses = [
          "I'm your AI assistant. I can help you manage your tasks.",
          "Sure, I can help with that. Would you like me to create a task?",
          "I understand you want to manage your tasks. What would you like to do?",
          "I'm here to assist you with your productivity. How can I help?",
          "I can help you create, update, or manage your tasks. What do you need?"
        ];
        
        // Pick a response based on the user's message
        let responseText = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
        
        // More specific responses based on keywords
        if (message.toLowerCase().includes('create') || message.toLowerCase().includes('add')) {
          responseText = "I can help you create a task. What would you like to name it?";
        } else if (message.toLowerCase().includes('complete') || message.toLowerCase().includes('done')) {
          responseText = "I can help you mark a task as complete. Which task would you like to update?";
        } else if (message.toLowerCase().includes('delete') || message.toLowerCase().includes('remove')) {
          responseText = "I can help you delete a task. Which task would you like to remove?";
        } else if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
          responseText = "Hello! I'm your AI assistant. How can I help you manage your tasks today?";
        }
        
        res.status(200).json({ 
          response: responseText,
          simulated: true,
          message: "AI Agent service not available. Using enhanced simulated response."
        });
      }
    }
  } catch (error) {
    console.error('Unexpected error in AI agent API:', error);
    res.status(500).json({ 
      error: 'An unexpected error occurred',
      details: error.message 
    });
  }
}

// Function to parse user messages and determine intent
function parseMessage(message) {
  const lowerMsg = message.toLowerCase();
  
  // Check for create task intent
  if (lowerMsg.includes('create') || lowerMsg.includes('add') || lowerMsg.includes('make')) {
    // Extract task details
    const titleMatch = message.match(/(?:create|add|make)\s+(?:a\s+|an\s+|the\s+)?(.+?)(?:\s+task|\s+for|\s+by|\s+with|$)/i);
    const title = titleMatch && titleMatch[1] ? titleMatch[1].trim() : 'New Task';
    
    // Check for priority
    let priority = 'medium';
    if (lowerMsg.includes('high priority') || lowerMsg.includes('urgent') || lowerMsg.includes('important')) {
      priority = 'high';
    } else if (lowerMsg.includes('low priority') || lowerMsg.includes('not important')) {
      priority = 'low';
    }
    
    // Check for due date
    const dateMatch = message.match(/\b(\d{4}-\d{2}-\d{2})\b/);
    const dueDate = dateMatch ? dateMatch[1] : null;
    
    return {
      intent: 'create_task',
      title: title,
      priority: priority,
      due_date: dueDate,
      description: '',
      tags: []
    };
  }
  
  // Check for get tasks intent
  if (lowerMsg.includes('show') || lowerMsg.includes('list') || lowerMsg.includes('get') || lowerMsg.includes('see')) {
    return {
      intent: 'get_tasks'
    };
  }
  
  // Check for update task intent
  if (lowerMsg.includes('update') || lowerMsg.includes('change') || lowerMsg.includes('modify') || 
      lowerMsg.includes('complete') || lowerMsg.includes('done') || lowerMsg.includes('finish')) {
    // Extract task ID or title if mentioned
    let taskId = null;
    if (lowerMsg.includes('task') && /\d+/.test(lowerMsg)) {
      const idMatch = lowerMsg.match(/task\s+(\d+)/);
      if (idMatch) {
        taskId = idMatch[1];
      }
    }
    
    // Determine what to update
    const updates = {};
    if (lowerMsg.includes('complete') || lowerMsg.includes('done') || lowerMsg.includes('finish')) {
      updates.status = true;
    }
    
    return {
      intent: 'update_task',
      taskId: taskId,
      updates: updates
    };
  }
  
  // Check for delete task intent
  if (lowerMsg.includes('delete') || lowerMsg.includes('remove') || lowerMsg.includes('cancel')) {
    // Extract task ID or title if mentioned
    let taskId = null;
    if (lowerMsg.includes('task') && /\d+/.test(lowerMsg)) {
      const idMatch = lowerMsg.match(/task\s+(\d+)/);
      if (idMatch) {
        taskId = idMatch[1];
      }
    }
    
    return {
      intent: 'delete_task',
      taskId: taskId
    };
  }
  
  // Default return
  return {
    intent: 'unknown'
  };
}
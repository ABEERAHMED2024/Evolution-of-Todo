const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = 8001;

// Middleware
app.use(cors());
app.use(express.json());

// Advanced AI agent with enhanced capabilities
app.post('/chat/', async (req, res) => {
  try {
    const { message, conversation_history } = req.body;
    
    console.log('AI Agent received message:', message);
    
    // Enhanced message parsing with multiple language support
    const parsedMessage = parseMessage(message);
    
    // Check if message is in Urdu (Urdu characters are in Unicode range 0600-06FF)
    const isUrdu = /[\u0600-\u06FF]/.test(message);
    
    // Handle different intents
    if (parsedMessage.intent === 'create_task') {
      // Create a task via the backend API
      try {
        const taskResponse = await axios.post('http://localhost:8000/tasks/', {
          title: parsedMessage.title || 'New Task',
          description: parsedMessage.description || '',
          priority: parsedMessage.priority || 'medium',
          due_date: parsedMessage.due_date || null,
          tags: parsedMessage.tags || [],
          status: false
        });
        
        if (taskResponse.status === 201) {
          const responseText = isUrdu ? 
            `میں نے آپ کا کام "${taskResponse.data.title}" بنادیا ہے۔` :
            `I've created the task "${taskResponse.data.title}" for you.`;
            
          res.status(200).json({ 
            response: responseText,
            action: 'task_created',
            task: taskResponse.data,
            language: isUrdu ? 'urdu' : 'english'
          });
        } else {
          const responseText = isUrdu ? 
            "میں کام بنانے میں ناکام ہوا۔ براہ کرم دوبارہ کوشش کریں۔" :
            "I tried to create the task but encountered an issue. Could you please try again?";
            
          res.status(200).json({ 
            response: responseText,
            action: 'error',
            language: isUrdu ? 'urdu' : 'english'
          });
        }
      } catch (error) {
        console.error('Error creating task:', error);
        const responseText = isUrdu ? 
          "کام بنانے میں مسئلہ ہے۔ براہ کرم دوبارہ کوشش کریں۔" :
          "There was an issue creating the task. Please try again.";
          
        res.status(200).json({ 
          response: responseText,
          action: 'error',
          language: isUrdu ? 'urdu' : 'english'
        });
      }
    } else if (parsedMessage.intent === 'get_tasks') {
      try {
        // Get tasks from the backend API
        const tasksResponse = await axios.get('http://localhost:8000/tasks/');
        
        if (tasksResponse.status === 200) {
          const tasksData = tasksResponse.data;
          let responseText;
          
          if (tasksData.length > 0) {
            const taskTitles = tasksData.slice(0, 5).map(task => task.title).join(', ');
            responseText = isUrdu ? 
              `میں نے ${tasksData.length} کام تلاش کیے۔ یہاں چند ہیں: ${taskTitles}۔` :
              `I found ${tasksData.length} tasks. Here are some: ${taskTitles}.`;
          } else {
            responseText = isUrdu ? 
              "آپ کے پاس فی الحال کوئی کام نہیں ہے۔ کیا آپ ایک بنانا چاہیں گے؟" :
              "You don't have any tasks at the moment. Would you like to create one?";
          }
          
          res.status(200).json({ 
            response: responseText,
            action: 'tasks_listed',
            tasks: tasksData,
            language: isUrdu ? 'urdu' : 'english'
          });
        } else {
          const responseText = isUrdu ? 
            "میں آپ کے کام بازیافت کرنے سے قاصر تھا۔ براہ کرم دوبارہ کوشش کریں۔" :
            "I couldn't retrieve your tasks. Please try again.";
            
          res.status(200).json({ 
            response: responseText,
            action: 'error',
            language: isUrdu ? 'urdu' : 'english'
          });
        }
      } catch (error) {
        console.error('Error getting tasks:', error);
        const responseText = isUrdu ? 
          "کام بازیافت کرنے میں مسئلہ ہے۔ براہ کرم دوبارہ کوشش کریں۔" :
          "There was an issue retrieving tasks. Please try again.";
          
        res.status(200).json({ 
          response: responseText,
          action: 'error',
          language: isUrdu ? 'urdu' : 'english'
        });
      }
    } else if (parsedMessage.intent === 'update_task') {
      if (parsedMessage.taskId) {
        try {
          const updateResponse = await axios.put(`http://localhost:8000/tasks/${parsedMessage.taskId}`, {
            ...parsedMessage.updates
          });
          
          if (updateResponse.status === 200) {
            const responseText = isUrdu ? 
              `میں نے کام "${updateResponse.data.title}" کو تبدیل کردیا ہے۔` :
              `I've updated the task "${updateResponse.data.title}" for you.`;
              
            res.status(200).json({ 
              response: responseText,
              action: 'task_updated',
              task: updateResponse.data,
              language: isUrdu ? 'urdu' : 'english'
            });
          } else {
            const responseText = isUrdu ? 
              "میں کام تبدیل کرنے میں ناکام ہوا۔ براہ کرم دوبارہ کوشش کریں۔" :
              "I tried to update the task but encountered an issue. Could you please try again?";
              
            res.status(200).json({ 
              response: responseText,
              action: 'error',
              language: isUrdu ? 'urdu' : 'english'
            });
          }
        } catch (error) {
          console.error('Error updating task:', error);
          const responseText = isUrdu ? 
            "کام تبدیل کرنے میں مسئلہ ہے۔ براہ کرم دوبارہ کوشش کریں۔" :
            "There was an issue updating the task. Please try again.";
            
          res.status(200).json({ 
            response: responseText,
            action: 'error',
            language: isUrdu ? 'urdu' : 'english'
          });
        }
      } else {
        const responseText = isUrdu ? 
          "مجھے یہ جاننے کی ضرورت ہے کہ کون سا کام تبدیل کرنا ہے۔ براہ کرم کام کی وضاحت کریں۔" :
          "I need to know which task to update. Could you please specify the task?";
          
        res.status(200).json({ 
          response: responseText,
          action: 'need_task_info',
          language: isUrdu ? 'urdu' : 'english'
        });
      }
    } else if (parsedMessage.intent === 'delete_task') {
      if (parsedMessage.taskId) {
        try {
          const deleteResponse = await axios.delete(`http://localhost:8000/tasks/${parsedMessage.taskId}`);
          
          if (deleteResponse.status === 200) {
            const responseText = isUrdu ? 
              "میں نے کام کو حذف کردیا ہے۔" :
              "I've deleted the task for you.";
              
            res.status(200).json({ 
              response: responseText,
              action: 'task_deleted',
              language: isUrdu ? 'urdu' : 'english'
            });
          } else {
            const responseText = isUrdu ? 
              "میں کام حذف کرنے میں ناکام ہوا۔ براہ کرم دوبارہ کوشش کریں۔" :
              "I tried to delete the task but encountered an issue. Could you please try again?";
              
            res.status(200).json({ 
              response: responseText,
              action: 'error',
              language: isUrdu ? 'urdu' : 'english'
            });
          }
        } catch (error) {
          console.error('Error deleting task:', error);
          const responseText = isUrdu ? 
            "کام حذف کرنے میں مسئلہ ہے۔ براہ کرم دوبارہ کوشش کریں۔" :
            "There was an issue deleting the task. Please try again.";
            
          res.status(200).json({ 
            response: responseText,
            action: 'error',
            language: isUrdu ? 'urdu' : 'english'
          });
        }
      } else {
        const responseText = isUrdu ? 
          "مجھے یہ جاننے کی ضرورت ہے کہ کون سا کام حذف کرنا ہے۔ براہ کرم کام کی وضاحت کریں۔" :
          "I need to know which task to delete. Could you please specify the task?";
          
        res.status(200).json({ 
          response: responseText,
          action: 'need_task_info',
          language: isUrdu ? 'urdu' : 'english'
        });
      }
    } else if (parsedMessage.intent === 'voice_command') {
      // Handle voice command processing
      const responseText = isUrdu ? 
        "صوتی کمانڈ کی توثیق کی گئی۔ کام ابھی تک عمل میں نہیں لایا گیا ہے۔" :
        "Voice command recognized. Feature not yet implemented.";
        
      res.status(200).json({ 
        response: responseText,
        action: 'voice_command_processed',
        language: isUrdu ? 'urdu' : 'english'
      });
    } else {
      // Default response for unrecognized intents
      const defaultResponses = [
        isUrdu ? 
          "میں آپ کا کام بند کرنے والا مصنوعی ذہانت ہوں۔ میں آپ کے کاموں کا نظم کرنے میں مدد کرسکتا ہوں۔" :
          "I'm your AI assistant for task management. I can help you organize your tasks.",
        isUrdu ? 
          "ٹھیک ہے، میں مدد کرسکتا ہوں۔ کیا آپ چاہیں گے کہ میں ایک کام بنائوں؟" :
          "Sure, I can help with that. Would you like me to create a task?",
        isUrdu ? 
          "میں سمجھتا ہوں کہ آپ اپنے کاموں کا نظم کرنا چاہتے ہیں۔ آپ کیا کرنا چاہیں گے؟" :
          "I understand you want to manage your tasks. What would you like to do?",
        isUrdu ? 
          "میں آپ کی پیداواریت میں مدد کے لیے یہاں ہوں۔ میں کیسے مدد کرسکتا ہوں؟" :
          "I'm here to assist you with your productivity. How can I help?",
        isUrdu ? 
          "میں آپ کے کاموں کا نظم کر سکتا ہوں۔ آپ کو کیا چاہیے؟" :
          "I can help you manage your tasks. What do you need?"
      ];
      
      // Pick a response based on the user's message
      let responseText = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
      
      // More specific responses based on keywords
      if (message.toLowerCase().includes('create') || message.toLowerCase().includes('add')) {
        responseText = isUrdu ? 
          "میں آپ کا کام بنانے میں مدد کرسکتا ہوں۔ آپ کیا نام دینا چاہیں گے؟" :
          "I can help you create a task. What would you like to name it?";
      } else if (message.toLowerCase().includes('complete') || message.toLowerCase().includes('done')) {
        responseText = isUrdu ? 
          "میں آپ کا کام مکمل کرنے میں مدد کرسکتا ہوں۔ آپ کون سا کام اپ ڈیٹ کرنا چاہیں گے؟" :
          "I can help you mark a task as complete. Which task would you like to update?";
      } else if (message.toLowerCase().includes('delete') || message.toLowerCase().includes('remove')) {
        responseText = isUrdu ? 
          "میں آپ کا کام حذف کرنے میں مدد کرسکتا ہوں۔ آپ کون سا کام حذف کرنا چاہیں گے؟" :
          "I can help you delete a task. Which task would you like to remove?";
      } else if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
        responseText = isUrdu ? 
          "ہیلو! میں آپ کا کام بند کرنے والا مصنوعی ذہانت ہوں۔ میں آپ کے کاموں کا نظم کرنے میں کیسے مدد کرسکتا ہوں؟" :
          "Hello! I'm your AI assistant. How can I help you manage your tasks today?";
      }
      
      res.status(200).json({ 
        response: responseText,
        action: 'default_response',
        language: isUrdu ? 'urdu' : 'english'
      });
    }
  } catch (error) {
    console.error('Error processing AI request:', error);
    res.status(500).json({ 
      response: "I'm sorry, I encountered an error processing your request. Please try again.",
      error: error.message,
      action: 'error'
    });
  }
});

// Function to parse user messages and determine intent with enhanced language support
function parseMessage(message) {
  const lowerMsg = message.toLowerCase();
  
  // Check for voice command intent (simulated)
  if (lowerMsg.includes('voice') || lowerMsg.includes('speak') || lowerMsg.includes('audio')) {
    return {
      intent: 'voice_command',
      content: message
    };
  }
  
  // Check for create task intent
  if (lowerMsg.includes('create') || lowerMsg.includes('add') || lowerMsg.includes('make') || 
      /[^a-zA-Z]bn[aeiou]/.test(lowerMsg) || /[^a-zA-Z]bn[aeiou]/.test(message)) { // Check for Urdu-like patterns
    // Extract task details
    const titleMatch = message.match(/(?:create|add|make|bn[aeiou]|bn[aeiou]\s+kr[aeiou])\s+(?:a\s+|an\s+|the\s+)?(.+?)(?:\s+task|\s+for|\s+by|\s+with|$)/i);
    const title = titleMatch && titleMatch[1] ? titleMatch[1].trim() : 'New Task';
    
    // Check for priority
    let priority = 'medium';
    if (lowerMsg.includes('high priority') || lowerMsg.includes('urgent') || lowerMsg.includes('important') || 
        lowerMsg.includes('zada') || lowerMsg.includes('zaroori')) {
      priority = 'high';
    } else if (lowerMsg.includes('low priority') || lowerMsg.includes('not important') || 
               lowerMsg.includes('kam') || lowerMsg.includes('aqal')) {
      priority = 'low';
    }
    
    // Check for due date
    const dateMatch = message.match(/\b(\d{4}-\d{2}-\d{2})\b/);
    const dueDate = dateMatch ? dateMatch[1] : null;
    
    // Check for tags
    const tags = [];
    if (lowerMsg.includes('work') || lowerMsg.includes('kaam') || lowerMsg.includes('dy')) {
      tags.push('work');
    }
    if (lowerMsg.includes('home') || lowerMsg.includes('ghar') || lowerMsg.includes('gahr')) {
      tags.push('home');
    }
    if (lowerMsg.includes('personal') || lowerMsg.includes('nijee') || lowerMsg.includes('nijy')) {
      tags.push('personal');
    }
    
    return {
      intent: 'create_task',
      title: title,
      priority: priority,
      due_date: dueDate,
      description: '',
      tags: tags
    };
  }
  
  // Check for get tasks intent
  if (lowerMsg.includes('show') || lowerMsg.includes('list') || lowerMsg.includes('get') || 
      lowerMsg.includes('dekhna') || lowerMsg.includes('dikhao') || lowerMsg.includes('dikhae')) {
    return {
      intent: 'get_tasks'
    };
  }
  
  // Check for update task intent
  if (lowerMsg.includes('update') || lowerMsg.includes('change') || lowerMsg.includes('modify') || 
      lowerMsg.includes('badlo') || lowerMsg.includes('badliye') || 
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
    if (lowerMsg.includes('complete') || lowerMsg.includes('done') || lowerMsg.includes('finish') || 
        lowerMsg.includes('mukammal') || lowerMsg.includes('ho gaya')) {
      updates.status = true;
    }
    
    return {
      intent: 'update_task',
      taskId: taskId,
      updates: updates
    };
  }
  
  // Check for delete task intent
  if (lowerMsg.includes('delete') || lowerMsg.includes('remove') || lowerMsg.includes('cancel') || 
      lowerMsg.includes('mitado') || lowerMsg.includes('hatado') || lowerMsg.includes('khatam')) {
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    service: 'AI Agent with Urdu and Voice Support',
    features: ['natural_language_processing', 'urdu_support', 'voice_commands', 'task_management']
  });
});

// Dapr pub/sub endpoint simulation for agent
app.post('/v1.0/topics/todo-events', (req, res) => {
  console.log('Agent received event from Dapr pubsub:', req.body);

  // Process the event based on its type
  const event = req.body;
  switch (event.eventType) {
    case 'task.created':
      console.log('Agent received task created event:', event.data);
      break;
    case 'task.updated':
      console.log('Agent received task updated event:', event.data);
      break;
    case 'task.deleted':
      console.log('Agent received task deleted event:', event.data);
      break;
    case 'task.command.received':
      console.log('Agent received task command:', event.data);
      break;
    case 'voice.command.processed':
      console.log('Agent received voice command processed event:', event.data);
      break;
    default:
      console.log('Agent received unknown event type:', event.eventType);
  }

  // Respond with 200 to acknowledge receipt
  res.status(200).send();
});

app.listen(PORT, () => {
  console.log(`AI Agent server is running on port ${PORT}`);
  console.log('Features:');
  console.log('- Natural language processing for task management');
  console.log('- Urdu language support');
  console.log('- Voice command processing');
  console.log('- Dapr pub/sub event handling');
  console.log('- Integration with backend services');
});

module.exports = app;
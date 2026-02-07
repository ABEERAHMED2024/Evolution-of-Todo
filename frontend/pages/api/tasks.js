// pages/api/tasks.js
export default async function handler(req, res) {
  const baseUrl = process.env.BACKEND_API_URL || 'http://localhost:8000';
  
  try {
    let response;
    
    switch (req.method) {
      case 'GET':
        // Handle GET requests (fetch tasks)
        const { search, status, priority, sort_by } = req.query;
        let url = `${baseUrl}/tasks/?`;
        
        if (search) url += `search=${encodeURIComponent(search)}&`;
        if (status !== undefined && status !== 'all') url += `status=${status}&`;
        if (priority !== undefined && priority !== 'all') url += `priority=${priority}&`;
        if (sort_by) url += `sort_by=${sort_by}&`;
        
        response = await fetch(url);
        break;
        
      case 'POST':
        // Handle POST requests (create task)
        response = await fetch(`${baseUrl}/tasks/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(req.body)
        });
        break;
        
      case 'PUT':
        // Handle PUT requests (update task)
        const { id: updateId } = req.query;
        response = await fetch(`${baseUrl}/tasks/${updateId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(req.body)
        });
        break;
        
      case 'DELETE':
        // Handle DELETE requests (delete task)
        const { id: deleteId } = req.query;
        response = await fetch(`${baseUrl}/tasks/${deleteId}`, {
          method: 'DELETE'
        });
        break;
        
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    if (!response.ok) {
      throw new Error(`Backend service responded with status ${response.status}`);
    }
    
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error communicating with backend:', error);
    res.status(500).json({ 
      error: 'Failed to communicate with backend service',
      details: error.message 
    });
  }
}
import { apiClient } from './client'
import { Task, TaskCreate, TaskUpdate, TaskFilters, PaginationParams } from '@/types'

// Task API endpoints
export const TASKS_ENDPOINTS = {
  LIST: '/tasks',
  CREATE: '/tasks',
  GET: (id: string) => `/tasks/${id}`,
  UPDATE: (id: string) => `/tasks/${id}`,
  DELETE: (id: string) => `/tasks/${id}`,
  SEARCH: '/tasks/search',
  STATS: '/tasks/stats',
  EXPORT: '/tasks/export',
  BATCH: '/tasks/batch',
} as const

// Task API Service
export class TaskAPI {
  /**
   * Get all tasks with optional filtering and pagination
   */
  static async getTasks(
    filters: TaskFilters = {},
    pagination: PaginationParams = {}
  ): Promise<Task[]> {
    const params = new URLSearchParams()

    // Add filters to params
    if (filters.search) {
      params.append('search', filters.search)
    }

    if (filters.status !== undefined && filters.status !== 'all') {
      params.append('status', filters.status.toString())
    }

    if (filters.priority && filters.priority !== 'all') {
      params.append('priority', filters.priority)
    }

    if (filters.tags && filters.tags.length > 0) {
      filters.tags.forEach(tag => params.append('tags', tag))
    }

    if (filters.due_date?.from) {
      params.append('due_date_from', filters.due_date.from)
    }

    if (filters.due_date?.to) {
      params.append('due_date_to', filters.due_date.to)
    }

    // Add pagination
    if (pagination.skip !== undefined) {
      params.append('skip', pagination.skip.toString())
    }

    if (pagination.limit !== undefined) {
      params.append('limit', pagination.limit.toString())
    }

    const url = params.toString() ? `${TASKS_ENDPOINTS.LIST}?${params}` : TASKS_ENDPOINTS.LIST

    return apiClient.get<Task[]>(url)
  }

  /**
   * Get a single task by ID
   */
  static async getTask(id: string): Promise<Task> {
    if (!id) {
      throw new Error('Task ID is required')
    }

    return apiClient.get<Task>(TASKS_ENDPOINTS.GET(id))
  }

  /**
   * Create a new task
   */
  static async createTask(taskData: TaskCreate): Promise<Task> {
    // Validate required fields
    if (!taskData.title || taskData.title.trim() === '') {
      throw new Error('Task title is required')
    }

    // Sanitize and prepare data
    const sanitizedData: TaskCreate = {
      title: taskData.title.trim(),
      description: taskData.description?.trim() || undefined,
      priority: taskData.priority || 'medium',
      tags: taskData.tags?.filter(tag => tag.trim() !== '') || [],
      due_date: taskData.due_date || undefined,
    }

    return apiClient.post<Task>(TASKS_ENDPOINTS.CREATE, sanitizedData)
  }

  /**
   * Update an existing task
   */
  static async updateTask(id: string, updates: TaskUpdate): Promise<Task> {
    if (!id) {
      throw new Error('Task ID is required')
    }

    // Sanitize updates
    const sanitizedUpdates: TaskUpdate = {}

    if (updates.title !== undefined) {
      if (updates.title === '') {
        throw new Error('Task title cannot be empty')
      }
      sanitizedUpdates.title = updates.title.trim()
    }

    if (updates.description !== undefined) {
      sanitizedUpdates.description = updates.description?.trim() || null
    }

    if (updates.status !== undefined) {
      sanitizedUpdates.status = updates.status
    }

    if (updates.priority !== undefined) {
      sanitizedUpdates.priority = updates.priority
    }

    if (updates.tags !== undefined) {
      sanitizedUpdates.tags = updates.tags.filter(tag => tag.trim() !== '')
    }

    if (updates.due_date !== undefined) {
      sanitizedUpdates.due_date = updates.due_date
    }

    return apiClient.put<Task>(TASKS_ENDPOINTS.UPDATE(id), sanitizedUpdates)
  }

  /**
   * Delete a task
   */
  static async deleteTask(id: string): Promise<{ message: string }> {
    if (!id) {
      throw new Error('Task ID is required')
    }

    return apiClient.delete<{ message: string }>(TASKS_ENDPOINTS.DELETE(id))
  }

  /**
   * Toggle task completion status
   */
  static async toggleTask(id: string, completed: boolean): Promise<Task> {
    return this.updateTask(id, { status: completed })
  }

  /**
   * Mark task as completed
   */
  static async completeTask(id: string): Promise<Task> {
    return this.toggleTask(id, true)
  }

  /**
   * Mark task as incomplete
   */
  static async uncompleteTask(id: string): Promise<Task> {
    return this.toggleTask(id, false)
  }

  /**
   * Update task priority
   */
  static async updatePriority(id: string, priority: 'low' | 'medium' | 'high'): Promise<Task> {
    return this.updateTask(id, { priority })
  }

  /**
   * Add tags to a task
   */
  static async addTags(id: string, newTags: string[]): Promise<Task> {
    const task = await this.getTask(id)
    const existingTags = task.tags || []
    const uniqueTags = [...new Set([...existingTags, ...newTags.filter(tag => tag.trim() !== '')])]

    return this.updateTask(id, { tags: uniqueTags })
  }

  /**
   * Remove tags from a task
   */
  static async removeTags(id: string, tagsToRemove: string[]): Promise<Task> {
    const task = await this.getTask(id)
    const existingTags = task.tags || []
    const updatedTags = existingTags.filter(tag => !tagsToRemove.includes(tag))

    return this.updateTask(id, { tags: updatedTags })
  }

  /**
   * Set due date for a task
   */
  static async setDueDate(id: string, dueDate: string | null): Promise<Task> {
    return this.updateTask(id, { due_date: dueDate })
  }

  /**
   * Search tasks with advanced query
   */
  static async searchTasks(
    query: string,
    filters: Omit<TaskFilters, 'search'> = {},
    pagination: PaginationParams = {}
  ): Promise<{
    tasks: Task[]
    total: number
    query: string
    suggestions?: string[]
  }> {
    if (!query.trim()) {
      const tasks = await this.getTasks(filters, pagination)
      return {
        tasks,
        total: tasks.length,
        query: '',
      }
    }

    const params = new URLSearchParams()
    params.append('q', query.trim())

    // Add filters
    if (filters.status !== undefined && filters.status !== 'all') {
      params.append('status', filters.status.toString())
    }

    if (filters.priority && filters.priority !== 'all') {
      params.append('priority', filters.priority)
    }

    if (filters.tags && filters.tags.length > 0) {
      filters.tags.forEach(tag => params.append('tags', tag))
    }

    // Add pagination
    if (pagination.skip !== undefined) {
      params.append('skip', pagination.skip.toString())
    }

    if (pagination.limit !== undefined) {
      params.append('limit', pagination.limit.toString())
    }

    return apiClient.get<{
      tasks: Task[]
      total: number
      query: string
      suggestions?: string[]
    }>(`${TASKS_ENDPOINTS.SEARCH}?${params}`)
  }

  /**
   * Get tasks by tag
   */
  static async getTasksByTag(tag: string, pagination: PaginationParams = {}): Promise<Task[]> {
    return this.getTasks({ tags: [tag] }, pagination)
  }

  /**
   * Get tasks by priority
   */
  static async getTasksByPriority(
    priority: 'low' | 'medium' | 'high',
    pagination: PaginationParams = {}
  ): Promise<Task[]> {
    return this.getTasks({ priority }, pagination)
  }

  /**
   * Get completed tasks
   */
  static async getCompletedTasks(pagination: PaginationParams = {}): Promise<Task[]> {
    return this.getTasks({ status: true }, pagination)
  }

  /**
   * Get pending tasks
   */
  static async getPendingTasks(pagination: PaginationParams = {}): Promise<Task[]> {
    return this.getTasks({ status: false }, pagination)
  }

  /**
   * Get overdue tasks
   */
  static async getOverdueTasks(pagination: PaginationParams = {}): Promise<Task[]> {
    const today = new Date().toISOString().split('T')[0]
    return this.getTasks({
      status: false,
      due_date: { to: today }
    }, pagination)
  }

  /**
   * Get tasks due today
   */
  static async getTasksDueToday(pagination: PaginationParams = {}): Promise<Task[]> {
    const today = new Date().toISOString().split('T')[0]
    return this.getTasks({
      due_date: { from: today, to: today }
    }, pagination)
  }

  /**
   * Get tasks due this week
   */
  static async getTasksDueThisWeek(pagination: PaginationParams = {}): Promise<Task[]> {
    const today = new Date()
    const weekEnd = new Date(today)
    weekEnd.setDate(today.getDate() + 7)

    return this.getTasks({
      due_date: {
        from: today.toISOString().split('T')[0],
        to: weekEnd.toISOString().split('T')[0]
      }
    }, pagination)
  }

  /**
   * Get all unique tags from tasks
   */
  static async getAllTags(): Promise<string[]> {
    const tasks = await this.getTasks()
    const tagSet = new Set<string>()

    tasks.forEach(task => {
      task.tags?.forEach(tag => tagSet.add(tag))
    })

    return Array.from(tagSet).sort()
  }

  /**
   * Get task statistics
   */
  static async getTaskStats(): Promise<{
    total: number
    completed: number
    pending: number
    overdue: number
    byPriority: {
      high: number
      medium: number
      low: number
    }
    completionRate: number
  }> {
    try {
      return apiClient.get<{
        total: number
        completed: number
        pending: number
        overdue: number
        byPriority: {
          high: number
          medium: number
          low: number
        }
        completionRate: number
      }>(TASKS_ENDPOINTS.STATS)
    } catch (error) {
      // Fallback: calculate stats from all tasks
      const tasks = await this.getTasks()
      const total = tasks.length
      const completed = tasks.filter(task => task.status).length
      const pending = tasks.filter(task => !task.status).length

      const today = new Date().toISOString().split('T')[0]
      const overdue = tasks.filter(task =>
        !task.status &&
        task.due_date &&
        task.due_date < today
      ).length

      const byPriority = {
        high: tasks.filter(task => task.priority === 'high').length,
        medium: tasks.filter(task => task.priority === 'medium').length,
        low: tasks.filter(task => task.priority === 'low').length,
      }

      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

      return {
        total,
        completed,
        pending,
        overdue,
        byPriority,
        completionRate,
      }
    }
  }

  /**
   * Batch operations
   */
  static async batchDelete(taskIds: string[]): Promise<{ deleted: number; errors: string[] }> {
    if (taskIds.length === 0) {
      return { deleted: 0, errors: [] }
    }

    try {
      return apiClient.delete<{ deleted: number; errors: string[] }>(
        TASKS_ENDPOINTS.BATCH,
        {
          data: { operation: 'delete', task_ids: taskIds }
        }
      )
    } catch (error) {
      // Fallback: delete individually
      const results = await Promise.allSettled(
        taskIds.map(id => this.deleteTask(id))
      )

      const deleted = results.filter(result => result.status === 'fulfilled').length
      const errors = results
        .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
        .map(result => result.reason.message)

      return { deleted, errors }
    }
  }

  /**
   * Batch update completion status
   */
  static async batchToggle(taskIds: string[], completed: boolean): Promise<{ updated: number; errors: string[] }> {
    if (taskIds.length === 0) {
      return { updated: 0, errors: [] }
    }

    try {
      return apiClient.put<{ updated: number; errors: string[] }>(
        TASKS_ENDPOINTS.BATCH,
        {
          operation: 'toggle',
          task_ids: taskIds,
          status: completed
        }
      )
    } catch (error) {
      // Fallback: update individually
      const results = await Promise.allSettled(
        taskIds.map(id => this.toggleTask(id, completed))
      )

      const updated = results.filter(result => result.status === 'fulfilled').length
      const errors = results
        .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
        .map(result => result.reason.message)

      return { updated, errors }
    }
  }

  /**
   * Export tasks
   */
  static async exportTasks(format: 'json' | 'csv' | 'pdf' = 'json'): Promise<void> {
    try {
      await apiClient.downloadFile(
        `${TASKS_ENDPOINTS.EXPORT}?format=${format}`,
        `tasks_${new Date().toISOString().split('T')[0]}.${format}`
      )
    } catch (error) {
      // Fallback: export client-side
      const tasks = await this.getTasks()

      if (format === 'json') {
        this.downloadJSON(tasks, 'tasks')
      } else if (format === 'csv') {
        this.downloadCSV(tasks, 'tasks')
      }
    }
  }

  /**
   * Client-side JSON download helper
   */
  private static downloadJSON(data: any, filename: string): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /**
   * Client-side CSV download helper
   */
  private static downloadCSV(tasks: Task[], filename: string): void {
    const headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Tags', 'Due Date', 'Created', 'Updated']
    const rows = tasks.map(task => [
      task.id,
      task.title,
      task.description || '',
      task.status ? 'Completed' : 'Pending',
      task.priority,
      (task.tags || []).join('; '),
      task.due_date || '',
      task.created_at,
      task.updated_at,
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

// Export convenience functions
export const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  toggleTask,
  completeTask,
  uncompleteTask,
  updatePriority,
  addTags,
  removeTags,
  setDueDate,
  searchTasks,
  getTasksByTag,
  getTasksByPriority,
  getCompletedTasks,
  getPendingTasks,
  getOverdueTasks,
  getTasksDueToday,
  getTasksDueThisWeek,
  getAllTags,
  getTaskStats,
  batchDelete,
  batchToggle,
  exportTasks,
} = TaskAPI

export default TaskAPI

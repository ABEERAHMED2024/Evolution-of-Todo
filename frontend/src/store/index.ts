import { create } from 'zustand'
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { Task, TaskFilters, TaskSort, UIState, ChatMessage, UserSettings, Notification } from '@/types'

// Task Store Interface
interface TaskState {
  // Data
  tasks: Task[]
  selectedTask: Task | null
  filters: TaskFilters
  sort: TaskSort

  // UI State
  loading: boolean
  error: string | null
  lastFetched: number | null

  // Selection
  selectedTaskIds: string[]

  // Actions
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  removeTask: (id: string) => void
  setSelectedTask: (task: Task | null) => void

  // Filters and Sorting
  setFilters: (filters: Partial<TaskFilters>) => void
  clearFilters: () => void
  setSort: (sort: TaskSort) => void

  // Loading and Error States
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Selection Management
  selectTask: (id: string) => void
  deselectTask: (id: string) => void
  selectAllTasks: () => void
  clearSelection: () => void
  toggleTaskSelection: (id: string) => void

  // Computed Properties
  getFilteredTasks: () => Task[]
  getSortedTasks: (tasks: Task[]) => Task[]
  getTaskById: (id: string) => Task | undefined
  getTaskStats: () => {
    total: number
    completed: number
    pending: number
    overdue: number
    highPriority: number
    mediumPriority: number
    lowPriority: number
  }
}

// UI Store Interface
interface UIStateStore {
  // Theme and Layout
  theme: 'light' | 'dark' | 'system'
  sidebarOpen: boolean
  chatOpen: boolean
  settingsOpen: boolean

  // Loading States
  loading: boolean
  globalError: string | null

  // Modals
  modals: {
    taskCreate: boolean
    taskEdit: boolean
    taskDelete: boolean
    taskView: boolean
    settings: boolean
    help: boolean
  }

  // Mobile
  isMobile: boolean

  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  toggleTheme: () => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setChatOpen: (open: boolean) => void
  toggleChat: () => void
  setSettingsOpen: (open: boolean) => void
  toggleSettings: () => void

  setLoading: (loading: boolean) => void
  setGlobalError: (error: string | null) => void

  openModal: (modal: keyof UIStateStore['modals']) => void
  closeModal: (modal: keyof UIStateStore['modals']) => void
  closeAllModals: () => void

  setIsMobile: (isMobile: boolean) => void
}

// Chat Store Interface
interface ChatState {
  // Data
  messages: ChatMessage[]
  currentConversation: string | null
  conversations: Record<string, ChatMessage[]>

  // UI State
  isTyping: boolean
  loading: boolean
  error: string | null

  // Settings
  autoScroll: boolean
  soundEnabled: boolean

  // Actions
  addMessage: (message: ChatMessage) => void
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void
  removeMessage: (id: string) => void
  clearMessages: () => void

  setIsTyping: (typing: boolean) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  startNewConversation: () => void
  switchConversation: (id: string) => void
  deleteConversation: (id: string) => void

  setAutoScroll: (enabled: boolean) => void
  setSoundEnabled: (enabled: boolean) => void
}

// Settings Store Interface
interface SettingsState {
  settings: UserSettings
  loading: boolean
  error: string | null

  // Actions
  updateSettings: (updates: Partial<UserSettings>) => void
  resetSettings: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

// Notifications Store Interface
interface NotificationState {
  notifications: Notification[]

  // Actions
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  markAsRead: (id: string) => void
}

// Default values
const defaultFilters: TaskFilters = {
  search: '',
  status: 'all',
  priority: 'all',
  tags: [],
}

const defaultSort: TaskSort = {
  field: 'created_at',
  order: 'desc',
}

const defaultSettings: UserSettings = {
  theme: 'system',
  language: 'en',
  notifications: {
    enabled: true,
    sound: true,
    desktop: true,
    email: false,
  },
  tasks: {
    defaultPriority: 'medium',
    autoArchive: false,
    archiveDays: 30,
  },
  ai: {
    enabled: true,
    autoSuggest: true,
    voiceEnabled: false,
    language: 'en',
  },
  appearance: {
    density: 'comfortable',
    animations: true,
    reducedMotion: false,
  },
}

// Task Store
export const useTaskStore = create<TaskState>()(
  devtools(
    immer(
      subscribeWithSelector((set, get) => ({
        // Initial State
        tasks: [],
        selectedTask: null,
        filters: defaultFilters,
        sort: defaultSort,
        loading: false,
        error: null,
        lastFetched: null,
        selectedTaskIds: [],

        // Actions
        setTasks: (tasks) =>
          set((state) => {
            state.tasks = tasks
            state.lastFetched = Date.now()
          }),

        addTask: (task) =>
          set((state) => {
            state.tasks.unshift(task)
          }),

        updateTask: (id, updates) =>
          set((state) => {
            const index = state.tasks.findIndex((task) => task.id === id)
            if (index !== -1) {
              Object.assign(state.tasks[index], updates)
            }
            if (state.selectedTask?.id === id) {
              Object.assign(state.selectedTask, updates)
            }
          }),

        removeTask: (id) =>
          set((state) => {
            state.tasks = state.tasks.filter((task) => task.id !== id)
            if (state.selectedTask?.id === id) {
              state.selectedTask = null
            }
            state.selectedTaskIds = state.selectedTaskIds.filter((taskId) => taskId !== id)
          }),

        setSelectedTask: (task) =>
          set((state) => {
            state.selectedTask = task
          }),

        // Filters and Sorting
        setFilters: (filters) =>
          set((state) => {
            Object.assign(state.filters, filters)
          }),

        clearFilters: () =>
          set((state) => {
            state.filters = defaultFilters
          }),

        setSort: (sort) =>
          set((state) => {
            state.sort = sort
          }),

        // Loading and Error States
        setLoading: (loading) =>
          set((state) => {
            state.loading = loading
            if (loading) {
              state.error = null
            }
          }),

        setError: (error) =>
          set((state) => {
            state.error = error
            state.loading = false
          }),

        // Selection Management
        selectTask: (id) =>
          set((state) => {
            if (!state.selectedTaskIds.includes(id)) {
              state.selectedTaskIds.push(id)
            }
          }),

        deselectTask: (id) =>
          set((state) => {
            state.selectedTaskIds = state.selectedTaskIds.filter((taskId) => taskId !== id)
          }),

        selectAllTasks: () =>
          set((state) => {
            const filteredTasks = get().getFilteredTasks()
            state.selectedTaskIds = filteredTasks.map((task) => task.id)
          }),

        clearSelection: () =>
          set((state) => {
            state.selectedTaskIds = []
          }),

        toggleTaskSelection: (id) => {
          const { selectedTaskIds } = get()
          if (selectedTaskIds.includes(id)) {
            get().deselectTask(id)
          } else {
            get().selectTask(id)
          }
        },

        // Computed Properties
        getFilteredTasks: () => {
          const { tasks, filters } = get()
          return tasks.filter((task) => {
            // Search filter
            if (filters.search) {
              const searchLower = filters.search.toLowerCase()
              const matchesTitle = task.title.toLowerCase().includes(searchLower)
              const matchesDescription = task.description?.toLowerCase().includes(searchLower)
              const matchesTags = task.tags?.some((tag) =>
                tag.toLowerCase().includes(searchLower)
              )
              if (!matchesTitle && !matchesDescription && !matchesTags) {
                return false
              }
            }

            // Status filter
            if (filters.status !== 'all' && filters.status !== undefined) {
              if (task.status !== filters.status) {
                return false
              }
            }

            // Priority filter
            if (filters.priority && filters.priority !== 'all') {
              if (task.priority !== filters.priority) {
                return false
              }
            }

            // Tags filter
            if (filters.tags && filters.tags.length > 0) {
              const hasMatchingTag = filters.tags.some((filterTag) =>
                task.tags?.includes(filterTag)
              )
              if (!hasMatchingTag) {
                return false
              }
            }

            // Due date filter
            if (filters.due_date) {
              const taskDueDate = task.due_date
              if (!taskDueDate) {
                return false
              }

              if (filters.due_date.from && taskDueDate < filters.due_date.from) {
                return false
              }

              if (filters.due_date.to && taskDueDate > filters.due_date.to) {
                return false
              }
            }

            return true
          })
        },

        getSortedTasks: (tasks) => {
          const { sort } = get()
          return [...tasks].sort((a, b) => {
            let aValue: any = a[sort.field]
            let bValue: any = b[sort.field]

            // Handle null/undefined values
            if (aValue == null && bValue == null) return 0
            if (aValue == null) return sort.order === 'asc' ? 1 : -1
            if (bValue == null) return sort.order === 'asc' ? -1 : 1

            // Convert to comparable values
            if (typeof aValue === 'string') {
              aValue = aValue.toLowerCase()
              bValue = bValue.toLowerCase()
            }

            // Priority special handling
            if (sort.field === 'priority') {
              const priorityOrder = { low: 1, medium: 2, high: 3 }
              aValue = priorityOrder[aValue as keyof typeof priorityOrder]
              bValue = priorityOrder[bValue as keyof typeof priorityOrder]
            }

            // Status special handling (completed tasks last when sorting by status)
            if (sort.field === 'status') {
              aValue = aValue ? 1 : 0
              bValue = bValue ? 1 : 0
            }

            let comparison = 0
            if (aValue < bValue) comparison = -1
            if (aValue > bValue) comparison = 1

            return sort.order === 'asc' ? comparison : -comparison
          })
        },

        getTaskById: (id) => {
          return get().tasks.find((task) => task.id === id)
        },

        getTaskStats: () => {
          const { tasks } = get()
          const total = tasks.length
          const completed = tasks.filter((task) => task.status).length
          const pending = tasks.filter((task) => !task.status).length

          const today = new Date().toISOString().split('T')[0]
          const overdue = tasks.filter((task) =>
            !task.status && task.due_date && task.due_date < today
          ).length

          const highPriority = tasks.filter((task) => task.priority === 'high').length
          const mediumPriority = tasks.filter((task) => task.priority === 'medium').length
          const lowPriority = tasks.filter((task) => task.priority === 'low').length

          return {
            total,
            completed,
            pending,
            overdue,
            highPriority,
            mediumPriority,
            lowPriority,
          }
        },
      }))
    ),
    { name: 'task-store' }
  )
)

// UI Store
export const useUIStore = create<UIStateStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial State
        theme: 'system',
        sidebarOpen: true,
        chatOpen: false,
        settingsOpen: false,
        loading: false,
        globalError: null,
        modals: {
          taskCreate: false,
          taskEdit: false,
          taskDelete: false,
          taskView: false,
          settings: false,
          help: false,
        },
        isMobile: false,

        // Actions
        setTheme: (theme) =>
          set((state) => {
            state.theme = theme
          }),

        toggleTheme: () =>
          set((state) => {
            state.theme = state.theme === 'light' ? 'dark' : 'light'
          }),

        setSidebarOpen: (open) =>
          set((state) => {
            state.sidebarOpen = open
          }),

        toggleSidebar: () =>
          set((state) => {
            state.sidebarOpen = !state.sidebarOpen
          }),

        setChatOpen: (open) =>
          set((state) => {
            state.chatOpen = open
          }),

        toggleChat: () =>
          set((state) => {
            state.chatOpen = !state.chatOpen
          }),

        setSettingsOpen: (open) =>
          set((state) => {
            state.settingsOpen = open
          }),

        toggleSettings: () =>
          set((state) => {
            state.settingsOpen = !state.settingsOpen
          }),

        setLoading: (loading) =>
          set((state) => {
            state.loading = loading
          }),

        setGlobalError: (error) =>
          set((state) => {
            state.globalError = error
          }),

        openModal: (modal) =>
          set((state) => {
            state.modals[modal] = true
          }),

        closeModal: (modal) =>
          set((state) => {
            state.modals[modal] = false
          }),

        closeAllModals: () =>
          set((state) => {
            Object.keys(state.modals).forEach((key) => {
              state.modals[key as keyof typeof state.modals] = false
            })
          }),

        setIsMobile: (isMobile) =>
          set((state) => {
            state.isMobile = isMobile
            // Auto-close sidebar on mobile
            if (isMobile) {
              state.sidebarOpen = false
            }
          }),
      })),
      {
        name: 'ui-store',
        partialize: (state) => ({
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
        }),
      }
    ),
    { name: 'ui-store' }
  )
)

// Chat Store
export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial State
        messages: [],
        currentConversation: null,
        conversations: {},
        isTyping: false,
        loading: false,
        error: null,
        autoScroll: true,
        soundEnabled: true,

        // Actions
        addMessage: (message) =>
          set((state) => {
            state.messages.push(message)
            if (state.currentConversation) {
              if (!state.conversations[state.currentConversation]) {
                state.conversations[state.currentConversation] = []
              }
              state.conversations[state.currentConversation].push(message)
            }
          }),

        updateMessage: (id, updates) =>
          set((state) => {
            const messageIndex = state.messages.findIndex((msg) => msg.id === id)
            if (messageIndex !== -1) {
              Object.assign(state.messages[messageIndex], updates)
            }

            if (state.currentConversation && state.conversations[state.currentConversation]) {
              const convMessageIndex = state.conversations[state.currentConversation].findIndex(
                (msg) => msg.id === id
              )
              if (convMessageIndex !== -1) {
                Object.assign(
                  state.conversations[state.currentConversation][convMessageIndex],
                  updates
                )
              }
            }
          }),

        removeMessage: (id) =>
          set((state) => {
            state.messages = state.messages.filter((msg) => msg.id !== id)
            if (state.currentConversation && state.conversations[state.currentConversation]) {
              state.conversations[state.currentConversation] = state.conversations[
                state.currentConversation
              ].filter((msg) => msg.id !== id)
            }
          }),

        clearMessages: () =>
          set((state) => {
            state.messages = []
            if (state.currentConversation) {
              delete state.conversations[state.currentConversation]
            }
          }),

        setIsTyping: (typing) =>
          set((state) => {
            state.isTyping = typing
          }),

        setLoading: (loading) =>
          set((state) => {
            state.loading = loading
          }),

        setError: (error) =>
          set((state) => {
            state.error = error
          }),

        startNewConversation: () => {
          const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          set((state) => {
            state.currentConversation = conversationId
            state.conversations[conversationId] = []
            state.messages = []
          })
        },

        switchConversation: (id) =>
          set((state) => {
            state.currentConversation = id
            state.messages = state.conversations[id] || []
          }),

        deleteConversation: (id) =>
          set((state) => {
            delete state.conversations[id]
            if (state.currentConversation === id) {
              state.currentConversation = null
              state.messages = []
            }
          }),

        setAutoScroll: (enabled) =>
          set((state) => {
            state.autoScroll = enabled
          }),

        setSoundEnabled: (enabled) =>
          set((state) => {
            state.soundEnabled = enabled
          }),
      })),
      {
        name: 'chat-store',
        partialize: (state) => ({
          conversations: state.conversations,
          autoScroll: state.autoScroll,
          soundEnabled: state.soundEnabled,
        }),
      }
    ),
    { name: 'chat-store' }
  )
)

// Settings Store
export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      immer((set) => ({
        // Initial State
        settings: defaultSettings,
        loading: false,
        error: null,

        // Actions
        updateSettings: (updates) =>
          set((state) => {
            Object.assign(state.settings, updates)
          }),

        resetSettings: () =>
          set((state) => {
            state.settings = defaultSettings
          }),

        setLoading: (loading) =>
          set((state) => {
            state.loading = loading
          }),

        setError: (error) =>
          set((state) => {
            state.error = error
          }),
      })),
      {
        name: 'settings-store',
        partialize: (state) => ({ settings: state.settings }),
      }
    ),
    { name: 'settings-store' }
  )
)

// Notifications Store
export const useNotificationStore = create<NotificationState>()(
  devtools(
    immer((set) => ({
      // Initial State
      notifications: [],

      // Actions
      addNotification: (notification) =>
        set((state) => {
          const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          state.notifications.push({ ...notification, id })
        }),

      removeNotification: (id) =>
        set((state) => {
          state.notifications = state.notifications.filter((notif) => notif.id !== id)
        }),

      clearNotifications: () =>
        set((state) => {
          state.notifications = []
        }),

      markAsRead: (id) =>
        set((state) => {
          const notification = state.notifications.find((notif) => notif.id === id)
          if (notification) {
            // Mark as read logic (if needed)
          }
        }),
    })),
    { name: 'notification-store' }
  )
)

// Combine all stores for easy access
export const useStore = () => ({
  tasks: useTaskStore(),
  ui: useUIStore(),
  chat: useChatStore(),
  settings: useSettingsStore(),
  notifications: useNotificationStore(),
})

// Store cleanup function for testing
export const clearAllStores = () => {
  useTaskStore.persist.clearStorage()
  useUIStore.persist.clearStorage()
  useChatStore.persist.clearStorage()
  useSettingsStore.persist.clearStorage()
}

// Export store types
export type TaskStoreType = ReturnType<typeof useTaskStore>
export type UIStoreType = ReturnType<typeof useUIStore>
export type ChatStoreType = ReturnType<typeof useChatStore>
export type SettingsStoreType = ReturnType<typeof useSettingsStore>
export type NotificationStoreType = ReturnType<typeof useNotificationStore>

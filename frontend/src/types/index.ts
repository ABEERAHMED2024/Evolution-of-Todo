// Core Task Types
export interface Task {
  id: string
  title: string
  description: string | null
  status: boolean
  priority: 'low' | 'medium' | 'high'
  tags: string[]
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface TaskCreate {
  title: string
  description?: string
  priority?: 'low' | 'medium' | 'high'
  tags?: string[]
  due_date?: string
}

export interface TaskUpdate {
  title?: string
  description?: string | null
  status?: boolean
  priority?: 'low' | 'medium' | 'high'
  tags?: string[]
  due_date?: string | null
}

// Filter and Sort Types
export interface TaskFilters {
  search?: string
  status?: boolean | 'all'
  priority?: 'low' | 'medium' | 'high' | 'all'
  tags?: string[]
  due_date?: {
    from?: string
    to?: string
  }
}

export type TaskSortBy = 'created_at' | 'updated_at' | 'due_date' | 'priority' | 'title' | 'status'
export type SortOrder = 'asc' | 'desc'

export interface TaskSort {
  field: TaskSortBy
  order: SortOrder
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface TaskListResponse {
  tasks: Task[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface PaginationParams {
  skip?: number
  limit?: number
}

// AI Chat Types
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  typing?: boolean
  error?: boolean
}

export interface ChatConversation {
  id: string
  messages: ChatMessage[]
  created_at: string
  updated_at: string
  title?: string
}

export interface ChatRequest {
  message: string
  conversation_history?: Array<{
    role: string
    content: string
  }>
}

export interface ChatResponse {
  response: string
  conversation_id?: string
}

// Agent Health Types
export interface AgentHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  openai_available: boolean
  local_modules_available: boolean
  openai_configured: boolean
  openai_client_ready?: boolean
  backend_url: string
  agent_status?: 'ready' | 'limited'
}

export interface BackendHealth {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  version?: string
  database?: {
    connected: boolean
    ping?: number
  }
}

// UI State Types
export interface UIState {
  theme: 'light' | 'dark' | 'system'
  sidebarOpen: boolean
  chatOpen: boolean
  loading: boolean
  error: string | null
  success: string | null
}

export interface ModalState {
  isOpen: boolean
  type?: 'create' | 'edit' | 'delete' | 'view'
  data?: any
}

// Form Types
export interface TaskFormData {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  tags: string[]
  due_date: string
}

export interface FormErrors {
  [key: string]: string | string[]
}

export interface FormState<T = any> {
  data: T
  errors: FormErrors
  isDirty: boolean
  isSubmitting: boolean
  isValid: boolean
}

// Component Props Types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface TaskItemProps extends BaseComponentProps {
  task: Task
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
  onToggle?: (taskId: string, completed: boolean) => void
  variant?: 'default' | 'compact' | 'detailed'
}

export interface TaskListProps extends BaseComponentProps {
  tasks: Task[]
  loading?: boolean
  error?: string | null
  onTaskUpdate?: (task: Task) => void
  onTaskDelete?: (taskId: string) => void
  emptyMessage?: string
  showFilters?: boolean
}

export interface ChatProps extends BaseComponentProps {
  conversation?: ChatConversation
  onSendMessage?: (message: string) => void
  onNewConversation?: () => void
  loading?: boolean
  error?: string | null
}

// Navigation Types
export interface NavItem {
  id: string
  label: string
  href: string
  icon?: React.ComponentType<any>
  badge?: number | string
  disabled?: boolean
  children?: NavItem[]
}

export interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

// Notification Types
export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  persistent?: boolean
  actions?: Array<{
    label: string
    action: () => void
  }>
}

// Search Types
export interface SearchResult {
  id: string
  type: 'task' | 'chat' | 'tag'
  title: string
  description?: string
  highlight?: string
  score?: number
  data?: any
}

export interface SearchState {
  query: string
  results: SearchResult[]
  loading: boolean
  error: string | null
  filters: {
    types: string[]
    dateRange?: {
      from: string
      to: string
    }
  }
}

// Settings Types
export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  language: string
  notifications: {
    enabled: boolean
    sound: boolean
    desktop: boolean
    email: boolean
  }
  tasks: {
    defaultPriority: 'low' | 'medium' | 'high'
    autoArchive: boolean
    archiveDays: number
  }
  ai: {
    enabled: boolean
    autoSuggest: boolean
    voiceEnabled: boolean
    language: string
  }
  appearance: {
    density: 'compact' | 'comfortable' | 'spacious'
    animations: boolean
    reducedMotion: boolean
  }
}

// Analytics Types
export interface TaskStats {
  total: number
  completed: number
  pending: number
  overdue: number
  byPriority: {
    high: number
    medium: number
    low: number
  }
  byMonth: Array<{
    month: string
    created: number
    completed: number
  }>
  completionRate: number
  averageCompletionTime: number
}

// Keyboard Shortcut Types
export interface KeyboardShortcut {
  key: string
  description: string
  action: () => void
  category?: string
  enabled?: boolean
}

// Error Types
export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: string
  context?: {
    component?: string
    action?: string
    userId?: string
  }
}

// Voice Types
export interface VoiceSettings {
  enabled: boolean
  language: string
  rate: number
  pitch: number
  volume: number
}

export interface SpeechRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
}

// PWA Types
export interface PWAInstallPrompt {
  prompt: () => Promise<void>
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
}

// Export utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequireField<T, K extends keyof T> = T & Required<Pick<T, K>>
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// Generic API types
export type AsyncData<T> = {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export type MutationState<T = any> = {
  loading: boolean
  error: string | null
  data: T | null
  mutate: (variables: any) => Promise<T>
}

// Date utility types
export type DateRange = {
  from: Date | string
  to: Date | string
}

export type TimeUnit = 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'

// Component size variants
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type Variant = 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'

// Animation types
export type AnimationType = 'fade' | 'slide' | 'scale' | 'bounce' | 'spin' | 'pulse'

// Layout types
export interface LayoutProps {
  title?: string
  description?: string
  children: React.ReactNode
  showSidebar?: boolean
  showHeader?: boolean
  showFooter?: boolean
  className?: string
}

// Feature flag types
export interface FeatureFlags {
  aiChat: boolean
  voiceCommands: boolean
  darkMode: boolean
  analytics: boolean
  notifications: boolean
  pwa: boolean
  offlineMode: boolean
  multiLanguage: boolean
}

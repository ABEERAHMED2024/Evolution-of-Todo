# Data Model: Phase V Advanced Cloud Deployment

## Event
**Description**: A message published to Kafka via Dapr containing information about a system change
**Attributes**:
- eventId: Unique identifier for the event
- eventType: Type of event (e.g., "task.created", "task.updated", "task.deleted")
- source: Service that generated the event
- timestamp: When the event was created
- data: Payload containing relevant information for the event
- correlationId: Used to correlate related events in a workflow

## Dapr Sidecar
**Description**: A container running alongside each service to handle service communication, state management, and other concerns
**Configuration**:
- Component definitions for pub/sub, state management, and bindings
- Service invocation configuration
- Security settings for mTLS
- Observability configuration for tracing and metrics

## Agent Skill
**Description**: A reusable component that encapsulates specific functionality for the AI agent
**Attributes**:
- skillId: Unique identifier for the skill
- name: Human-readable name of the skill
- description: What the skill does
- inputs: Parameters required by the skill
- outputs: Results produced by the skill
- dependencies: Other skills or services required by this skill

## Voice Command
**Description**: A spoken instruction processed by speech recognition and converted to system actions
**Attributes**:
- commandId: Unique identifier for the command
- audioData: Raw audio data or reference to stored audio
- transcription: Text transcription of the spoken command
- confidence: Confidence score of the speech recognition
- intent: Identified intent from the command
- parameters: Extracted parameters from the command

## Cloud Resource
**Description**: Managed services in DigitalOcean (Kubernetes cluster, databases, etc.)
**Attributes**:
- resourceId: Unique identifier for the resource
- resourceType: Type of resource (e.g., "kubernetes_cluster", "database", "load_balancer")
- region: Geographic region where the resource is deployed
- configuration: Resource-specific configuration parameters
- status: Current operational status of the resource

## Subagent
**Description**: Specialized AI agents responsible for specific domains or tasks
**Attributes**:
- agentId: Unique identifier for the subagent
- name: Human-readable name of the subagent
- specialization: Domain or task the subagent specializes in
- capabilities: List of capabilities the subagent possesses
- communicationProtocol: How the subagent communicates with the main agent
- state: Current state of the subagent

## Task Event
**Description**: Specific event type related to task operations
**Attributes**:
- taskId: Identifier of the task associated with the event
- operation: Operation performed (create, update, delete, complete)
- userId: User who initiated the operation
- eventData: Additional data related to the task operation

## Urdu Text Processing Result
**Description**: Result of processing Urdu language input
**Attributes**:
- inputText: Original Urdu text input
- processedText: Processed text after normalization
- detectedIntent: Intent identified from the text
- extractedEntities: Named entities extracted from the text
- confidenceScore: Confidence in the processing result
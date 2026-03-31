// ─── Helpers ────────────────────────────────────────────────────────────────
const uuid = () => Math.random().toString(36).slice(2) + Date.now().toString(36)
const daysAgo = (d, h = 0, m = 0) => {
  const dt = new Date()
  dt.setDate(dt.getDate() - d)
  dt.setHours(dt.getHours() - h)
  dt.setMinutes(dt.getMinutes() - m)
  return dt.toISOString()
}
const addMinutes = (isoStr, min) => new Date(new Date(isoStr).getTime() + min * 60000).toISOString()

// ─── Reference Data ──────────────────────────────────────────────────────────
export const SERVICES = [
  'payment-service',
  'user-service',
  'api-gateway',
  'order-service',
  'notification-service',
  'inventory-service',
  'auth-service',
  'analytics-service',
]

export const CLUSTERS = ['prod-us-east', 'prod-ap-southeast', 'prod-eu-west', 'staging-us']
export const CLUSTER_TYPES = ['production', 'staging']
export const NAMESPACES = ['default', 'monitoring', 'payments', 'auth', 'orders', 'notifications']
export const ALERT_TYPES = ['CPU', 'Memory', 'Latency', 'ErrorRate', 'DiskIO', 'Replicas', 'Network']
export const SERVICE_TYPES = ['backend', 'frontend', 'database', 'cache', 'queue', 'gateway']
export const PRIORITIES = ['P1', 'P2', 'P3', 'P4']
export const ALERT_STATUSES = ['firing', 'resolved', 'pending']
export const TICKET_STATUSES = ['open', 'in_progress', 'escalated', 'closed']
export const INCIDENT_STATUSES = ['open', 'acknowledged', 'resolved']
export const OWNERS = [
  'alice@company.com',
  'bob@company.com',
  'charlie@company.com',
  'diana@company.com',
  'eve@company.com',
]

// ─── radar_alerts ────────────────────────────────────────────────────────────
export const alerts = [
  {
    id: 1, status: 'firing', metadata_name: 'payment-service', cluster_name: 'prod-us-east',
    alert_types: 'CPU', service_type: 'backend', priority: 'P1',
    starts_at: daysAgo(0, 2), ends_at: null, created_at: daysAgo(0, 2),
    replicas_available: 2, replicas_desired: 4, threshold_value: 95.5,
    cluster_type: 'production', namespace: 'payments',
    message_firing: 'CPU usage exceeded 95% on payment-service for 5 minutes',
    message_resolved: null, resource_free: '0.5 CPU', resource_request: '2 CPU',
    resource_usage: '1.9 CPU', panel_url: 'https://grafana.example.com/d/1', state: 'active',
    parent_alert: null, path: '/payment-service/cpu',
  },
  {
    id: 2, status: 'firing', metadata_name: 'api-gateway', cluster_name: 'prod-ap-southeast',
    alert_types: 'Latency', service_type: 'gateway', priority: 'P1',
    starts_at: daysAgo(0, 1), ends_at: null, created_at: daysAgo(0, 1),
    replicas_available: 3, replicas_desired: 3, threshold_value: 2500,
    cluster_type: 'production', namespace: 'default',
    message_firing: 'p99 latency exceeded 2500ms on api-gateway',
    message_resolved: null, resource_free: '1 CPU', resource_request: '4 CPU',
    resource_usage: '3.8 CPU', panel_url: 'https://grafana.example.com/d/2', state: 'active',
    parent_alert: null, path: '/api-gateway/latency',
  },
  {
    id: 3, status: 'resolved', metadata_name: 'user-service', cluster_name: 'prod-us-east',
    alert_types: 'Memory', service_type: 'backend', priority: 'P2',
    starts_at: daysAgo(1, 3), ends_at: daysAgo(1, 1), created_at: daysAgo(1, 3),
    replicas_available: 4, replicas_desired: 4, threshold_value: 88.0,
    cluster_type: 'production', namespace: 'default',
    message_firing: 'Memory usage exceeded 88% on user-service',
    message_resolved: 'Memory usage returned to normal after pod restart',
    resource_free: '512Mi', resource_request: '2Gi', resource_usage: '1.76Gi',
    panel_url: 'https://grafana.example.com/d/3', state: 'active',
    parent_alert: null, path: '/user-service/memory',
  },
  {
    id: 4, status: 'firing', metadata_name: 'order-service', cluster_name: 'prod-ap-southeast',
    alert_types: 'ErrorRate', service_type: 'backend', priority: 'P2',
    starts_at: daysAgo(0, 4), ends_at: null, created_at: daysAgo(0, 4),
    replicas_available: 3, replicas_desired: 3, threshold_value: 5.0,
    cluster_type: 'production', namespace: 'orders',
    message_firing: 'Error rate exceeded 5% on order-service HTTP endpoint /api/orders',
    message_resolved: null, resource_free: '2 CPU', resource_request: '3 CPU',
    resource_usage: '2.1 CPU', panel_url: 'https://grafana.example.com/d/4', state: 'active',
    parent_alert: null, path: '/order-service/error-rate',
  },
  {
    id: 5, status: 'resolved', metadata_name: 'notification-service', cluster_name: 'prod-eu-west',
    alert_types: 'Replicas', service_type: 'backend', priority: 'P3',
    starts_at: daysAgo(2, 5), ends_at: daysAgo(2, 3), created_at: daysAgo(2, 5),
    replicas_available: 1, replicas_desired: 3, threshold_value: null,
    cluster_type: 'production', namespace: 'notifications',
    message_firing: 'Deployment notification-service has only 1/3 replicas available',
    message_resolved: 'All 3 replicas are back online',
    resource_free: null, resource_request: null, resource_usage: null,
    panel_url: 'https://grafana.example.com/d/5', state: 'active',
    parent_alert: null, path: '/notification-service/replicas',
  },
  {
    id: 6, status: 'firing', metadata_name: 'inventory-service', cluster_name: 'prod-us-east',
    alert_types: 'DiskIO', service_type: 'database', priority: 'P2',
    starts_at: daysAgo(0, 3), ends_at: null, created_at: daysAgo(0, 3),
    replicas_available: 2, replicas_desired: 2, threshold_value: 90.0,
    cluster_type: 'production', namespace: 'default',
    message_firing: 'Disk I/O utilization at 92% on inventory-service database',
    message_resolved: null, resource_free: '50GB', resource_request: '500GB',
    resource_usage: '460GB', panel_url: 'https://grafana.example.com/d/6', state: 'active',
    parent_alert: null, path: '/inventory-service/disk',
  },
  {
    id: 7, status: 'resolved', metadata_name: 'auth-service', cluster_name: 'prod-ap-southeast',
    alert_types: 'CPU', service_type: 'backend', priority: 'P3',
    starts_at: daysAgo(3, 2), ends_at: daysAgo(3, 0), created_at: daysAgo(3, 2),
    replicas_available: 3, replicas_desired: 3, threshold_value: 80.0,
    cluster_type: 'production', namespace: 'auth',
    message_firing: 'CPU spike detected on auth-service due to token validation load',
    message_resolved: 'CPU usage normalized after cache warm-up',
    resource_free: '1 CPU', resource_request: '2 CPU', resource_usage: '1.6 CPU',
    panel_url: 'https://grafana.example.com/d/7', state: 'active',
    parent_alert: null, path: '/auth-service/cpu',
  },
  {
    id: 8, status: 'firing', metadata_name: 'analytics-service', cluster_name: 'staging-us',
    alert_types: 'Memory', service_type: 'backend', priority: 'P4',
    starts_at: daysAgo(0, 6), ends_at: null, created_at: daysAgo(0, 6),
    replicas_available: 1, replicas_desired: 2, threshold_value: 75.0,
    cluster_type: 'staging', namespace: 'monitoring',
    message_firing: 'Memory usage at 78% on analytics-service in staging',
    message_resolved: null, resource_free: '512Mi', resource_request: '2Gi',
    resource_usage: '1.56Gi', panel_url: 'https://grafana.example.com/d/8', state: 'active',
    parent_alert: null, path: '/analytics-service/memory',
  },
  {
    id: 9, status: 'resolved', metadata_name: 'payment-service', cluster_name: 'prod-us-east',
    alert_types: 'Latency', service_type: 'backend', priority: 'P1',
    starts_at: daysAgo(5, 3), ends_at: daysAgo(5, 1), created_at: daysAgo(5, 3),
    replicas_available: 4, replicas_desired: 4, threshold_value: 1500,
    cluster_type: 'production', namespace: 'payments',
    message_firing: 'p95 latency exceeded 1500ms on payment-service /api/charge',
    message_resolved: 'Latency normalized after DB query optimization',
    resource_free: null, resource_request: null, resource_usage: null,
    panel_url: 'https://grafana.example.com/d/9', state: 'active',
    parent_alert: null, path: '/payment-service/latency',
  },
  {
    id: 10, status: 'firing', metadata_name: 'api-gateway', cluster_name: 'prod-eu-west',
    alert_types: 'ErrorRate', service_type: 'gateway', priority: 'P2',
    starts_at: daysAgo(0, 5), ends_at: null, created_at: daysAgo(0, 5),
    replicas_available: 2, replicas_desired: 4, threshold_value: 3.5,
    cluster_type: 'production', namespace: 'default',
    message_firing: '4xx error rate at 4.2% on api-gateway prod-eu-west',
    message_resolved: null, resource_free: '2 CPU', resource_request: '4 CPU',
    resource_usage: '3.2 CPU', panel_url: 'https://grafana.example.com/d/10', state: 'active',
    parent_alert: null, path: '/api-gateway/error-rate',
  },
  {
    id: 11, status: 'resolved', metadata_name: 'order-service', cluster_name: 'prod-eu-west',
    alert_types: 'CPU', service_type: 'backend', priority: 'P3',
    starts_at: daysAgo(7, 4), ends_at: daysAgo(7, 2), created_at: daysAgo(7, 4),
    replicas_available: 3, replicas_desired: 3, threshold_value: 85.0,
    cluster_type: 'production', namespace: 'orders',
    message_firing: 'CPU at 87% on order-service during peak hours',
    message_resolved: 'CPU usage dropped after HPA scaled out',
    resource_free: '0.5 CPU', resource_request: '2 CPU', resource_usage: '1.74 CPU',
    panel_url: 'https://grafana.example.com/d/11', state: 'active',
    parent_alert: null, path: '/order-service/cpu',
  },
  {
    id: 12, status: 'firing', metadata_name: 'user-service', cluster_name: 'prod-eu-west',
    alert_types: 'Network', service_type: 'backend', priority: 'P3',
    starts_at: daysAgo(0, 1), ends_at: null, created_at: daysAgo(0, 1),
    replicas_available: 3, replicas_desired: 3, threshold_value: 1000,
    cluster_type: 'production', namespace: 'default',
    message_firing: 'Network throughput exceeded 1Gbps on user-service',
    message_resolved: null, resource_free: null, resource_request: null,
    resource_usage: '1.2Gbps', panel_url: 'https://grafana.example.com/d/12', state: 'active',
    parent_alert: null, path: '/user-service/network',
  },
]

// ─── radar_tickets ────────────────────────────────────────────────────────────
export const tickets = [
  {
    id: 1, alert_id: 1, deduplication_id: 'payment-service-CPU-prod-us-east-001',
    incident_id: 1, escalated_at: daysAgo(0, 1, 30), escalation_reason: 'P1 alert not acknowledged within 15 minutes',
    closure_at: null, closure_reason: null,
    priority: 'P1', status: 'escalated', created_at: daysAgo(0, 2), updated_at: daysAgo(0, 1, 30), version: 2,
  },
  {
    id: 2, alert_id: 2, deduplication_id: 'api-gateway-Latency-prod-ap-southeast-001',
    incident_id: 2, escalated_at: null, closure_at: null, closure_reason: null,
    priority: 'P1', status: 'in_progress', created_at: daysAgo(0, 1), updated_at: daysAgo(0, 0, 30), version: 2,
  },
  {
    id: 3, alert_id: 3, deduplication_id: 'user-service-Memory-prod-us-east-001',
    incident_id: 3, escalated_at: null,
    closure_at: daysAgo(1, 0, 30), closure_reason: 'Pod restarted successfully, memory usage normalized',
    priority: 'P2', status: 'closed', created_at: daysAgo(1, 3), updated_at: daysAgo(1, 0, 30), version: 3,
  },
  {
    id: 4, alert_id: 4, deduplication_id: 'order-service-ErrorRate-prod-ap-southeast-001',
    incident_id: 4, escalated_at: null, closure_at: null, closure_reason: null,
    priority: 'P2', status: 'in_progress', created_at: daysAgo(0, 4), updated_at: daysAgo(0, 2), version: 2,
  },
  {
    id: 5, alert_id: 5, deduplication_id: 'notification-service-Replicas-prod-eu-west-001',
    incident_id: null, escalated_at: null,
    closure_at: daysAgo(2, 2), closure_reason: 'Replicas recovered automatically',
    priority: 'P3', status: 'closed', created_at: daysAgo(2, 5), updated_at: daysAgo(2, 2), version: 2,
  },
  {
    id: 6, alert_id: 6, deduplication_id: 'inventory-service-DiskIO-prod-us-east-001',
    incident_id: 5, escalated_at: daysAgo(0, 2), escalation_reason: 'Database disk I/O critical, requires immediate attention',
    closure_at: null, closure_reason: null,
    priority: 'P2', status: 'escalated', created_at: daysAgo(0, 3), updated_at: daysAgo(0, 2), version: 2,
  },
  {
    id: 7, alert_id: 7, deduplication_id: 'auth-service-CPU-prod-ap-southeast-001',
    incident_id: null, escalated_at: null,
    closure_at: daysAgo(3, 0), closure_reason: 'CPU spike resolved after cache warm-up',
    priority: 'P3', status: 'closed', created_at: daysAgo(3, 2), updated_at: daysAgo(3, 0), version: 2,
  },
  {
    id: 8, alert_id: 8, deduplication_id: 'analytics-service-Memory-staging-us-001',
    incident_id: null, escalated_at: null, closure_at: null, closure_reason: null,
    priority: 'P4', status: 'open', created_at: daysAgo(0, 6), updated_at: null, version: 1,
  },
  {
    id: 9, alert_id: 10, deduplication_id: 'api-gateway-ErrorRate-prod-eu-west-001',
    incident_id: 6, escalated_at: null, closure_at: null, closure_reason: null,
    priority: 'P2', status: 'in_progress', created_at: daysAgo(0, 5), updated_at: daysAgo(0, 3), version: 2,
  },
  {
    id: 10, alert_id: 12, deduplication_id: 'user-service-Network-prod-eu-west-001',
    incident_id: null, escalated_at: null, closure_at: null, closure_reason: null,
    priority: 'P3', status: 'open', created_at: daysAgo(0, 1), updated_at: null, version: 1,
  },
]

// ─── radar_incidents ──────────────────────────────────────────────────────────
export const incidents = [
  {
    id: 1, ticket_id: 1, alert_id: 1, priority: 'P1', owner: 'alice@company.com',
    status: 'acknowledged', acknowledged_at: daysAgo(0, 1, 45), resolved_at: null,
    created_at: daysAgo(0, 2), updated_at: daysAgo(0, 1, 45), version: 2,
  },
  {
    id: 2, ticket_id: 2, alert_id: 2, priority: 'P1', owner: 'bob@company.com',
    status: 'open', acknowledged_at: null, resolved_at: null,
    created_at: daysAgo(0, 1), updated_at: daysAgo(0, 0, 30), version: 1,
  },
  {
    id: 3, ticket_id: 3, alert_id: 3, priority: 'P2', owner: 'charlie@company.com',
    status: 'resolved', acknowledged_at: daysAgo(1, 2, 30), resolved_at: daysAgo(1, 0, 45),
    created_at: daysAgo(1, 3), updated_at: daysAgo(1, 0, 45), version: 3,
  },
  {
    id: 4, ticket_id: 4, alert_id: 4, priority: 'P2', owner: 'diana@company.com',
    status: 'acknowledged', acknowledged_at: daysAgo(0, 3, 30), resolved_at: null,
    created_at: daysAgo(0, 4), updated_at: daysAgo(0, 3, 30), version: 2,
  },
  {
    id: 5, ticket_id: 6, alert_id: 6, priority: 'P2', owner: 'eve@company.com',
    status: 'acknowledged', acknowledged_at: daysAgo(0, 2, 30), resolved_at: null,
    created_at: daysAgo(0, 3), updated_at: daysAgo(0, 2, 30), version: 2,
  },
  {
    id: 6, ticket_id: 9, alert_id: 10, priority: 'P2', owner: 'alice@company.com',
    status: 'open', acknowledged_at: null, resolved_at: null,
    created_at: daysAgo(0, 5), updated_at: daysAgo(0, 3), version: 1,
  },
]

// ─── radar_incident_relations ─────────────────────────────────────────────────
export const incidentRelations = [
  { id: 1, parent_incident_id: 1, child_incident_id: 2, created_at: daysAgo(0, 1, 30) },
  { id: 2, parent_incident_id: 5, child_incident_id: 4, created_at: daysAgo(0, 2) },
]

// ─── radar_incident_comments ──────────────────────────────────────────────────
export const incidentComments = [
  {
    id: 1, incident_id: 1, author: 'alice@company.com',
    content: 'Investigating CPU spike. Looks like a sudden increase in transaction volume. Checking if it\'s related to a recent deployment.',
    created_at: daysAgo(0, 1, 50),
  },
  {
    id: 2, incident_id: 1, author: 'bob@company.com',
    content: 'Confirmed: deployment v2.4.1 was pushed 3 hours ago. Checking pod resource limits.',
    created_at: daysAgo(0, 1, 40),
  },
  {
    id: 3, incident_id: 1, author: 'alice@company.com',
    content: 'Found the issue - new feature enabled aggressive retry logic causing CPU thrash. Rollback initiated.',
    created_at: daysAgo(0, 1, 30),
  },
  {
    id: 4, incident_id: 2, author: 'bob@company.com',
    content: 'Latency spike detected on api-gateway AP cluster. Checking upstream dependencies.',
    created_at: daysAgo(0, 0, 55),
  },
  {
    id: 5, incident_id: 2, author: 'charlie@company.com',
    content: 'Upstream order-service also showing increased error rate. Possible cascade.',
    created_at: daysAgo(0, 0, 45),
  },
  {
    id: 6, incident_id: 3, author: 'charlie@company.com',
    content: 'Memory leak suspected in user-service. Initiated rolling restart.',
    created_at: daysAgo(1, 2, 45),
  },
  {
    id: 7, incident_id: 3, author: 'diana@company.com',
    content: 'Restart completed. Memory usage back to 45%. Will monitor for 30 minutes.',
    created_at: daysAgo(1, 1, 30),
  },
  {
    id: 8, incident_id: 3, author: 'charlie@company.com',
    content: 'Memory stable. Root cause: unbounded in-memory cache. Fix deployed in v1.8.3.',
    created_at: daysAgo(1, 0, 50),
  },
  {
    id: 9, incident_id: 4, author: 'diana@company.com',
    content: 'Error rate increasing on order-service. Traced to downstream payment-service timeout.',
    created_at: daysAgo(0, 3, 45),
  },
  {
    id: 10, incident_id: 4, author: 'alice@company.com',
    content: 'payment-service is also showing high CPU. These incidents may be correlated.',
    created_at: daysAgo(0, 3, 30),
  },
  {
    id: 11, incident_id: 5, author: 'eve@company.com',
    content: 'Disk I/O critical on inventory DB. Read latency at 450ms. Investigating slow queries.',
    created_at: daysAgo(0, 2, 45),
  },
  {
    id: 12, incident_id: 5, author: 'bob@company.com',
    content: 'Found 3 long-running queries without index. Query plan shows full table scan on orders_history.',
    created_at: daysAgo(0, 2, 15),
  },
  {
    id: 13, incident_id: 6, author: 'alice@company.com',
    content: 'EU gateway error rate spiking. Could be related to CDN misconfiguration after region failover.',
    created_at: daysAgo(0, 4, 30),
  },
]

// ─── radar_event_logs ─────────────────────────────────────────────────────────
export const eventLogs = [
  { id: uuid(), resource: 'alert', resource_id: 1, event_type: 'alert_fired', old_value: null, new_value: 'firing', created_at: daysAgo(0, 2) },
  { id: uuid(), resource: 'ticket', resource_id: 1, event_type: 'ticket_created', old_value: null, new_value: 'open', created_at: daysAgo(0, 2) },
  { id: uuid(), resource: 'incident', resource_id: 1, event_type: 'incident_created', old_value: null, new_value: 'open', created_at: daysAgo(0, 2) },
  { id: uuid(), resource: 'ticket', resource_id: 1, event_type: 'status_changed', old_value: 'open', new_value: 'escalated', created_at: daysAgo(0, 1, 30) },
  { id: uuid(), resource: 'incident', resource_id: 1, event_type: 'incident_acknowledged', old_value: 'open', new_value: 'acknowledged', created_at: daysAgo(0, 1, 45) },
  { id: uuid(), resource: 'alert', resource_id: 2, event_type: 'alert_fired', old_value: null, new_value: 'firing', created_at: daysAgo(0, 1) },
  { id: uuid(), resource: 'ticket', resource_id: 2, event_type: 'ticket_created', old_value: null, new_value: 'open', created_at: daysAgo(0, 1) },
  { id: uuid(), resource: 'incident', resource_id: 2, event_type: 'incident_created', old_value: null, new_value: 'open', created_at: daysAgo(0, 1) },
  { id: uuid(), resource: 'alert', resource_id: 3, event_type: 'alert_fired', old_value: null, new_value: 'firing', created_at: daysAgo(1, 3) },
  { id: uuid(), resource: 'incident', resource_id: 3, event_type: 'incident_acknowledged', old_value: 'open', new_value: 'acknowledged', created_at: daysAgo(1, 2, 30) },
  { id: uuid(), resource: 'incident', resource_id: 3, event_type: 'incident_resolved', old_value: 'acknowledged', new_value: 'resolved', created_at: daysAgo(1, 0, 45) },
  { id: uuid(), resource: 'alert', resource_id: 3, event_type: 'alert_resolved', old_value: 'firing', new_value: 'resolved', created_at: daysAgo(1, 1) },
  { id: uuid(), resource: 'ticket', resource_id: 3, event_type: 'ticket_closed', old_value: 'in_progress', new_value: 'closed', created_at: daysAgo(1, 0, 30) },
  { id: uuid(), resource: 'alert', resource_id: 4, event_type: 'alert_fired', old_value: null, new_value: 'firing', created_at: daysAgo(0, 4) },
  { id: uuid(), resource: 'ticket', resource_id: 4, event_type: 'ticket_created', old_value: null, new_value: 'open', created_at: daysAgo(0, 4) },
  { id: uuid(), resource: 'incident', resource_id: 4, event_type: 'incident_acknowledged', old_value: 'open', new_value: 'acknowledged', created_at: daysAgo(0, 3, 30) },
  { id: uuid(), resource: 'alert', resource_id: 6, event_type: 'alert_fired', old_value: null, new_value: 'firing', created_at: daysAgo(0, 3) },
  { id: uuid(), resource: 'ticket', resource_id: 6, event_type: 'ticket_created', old_value: null, new_value: 'open', created_at: daysAgo(0, 3) },
  { id: uuid(), resource: 'ticket', resource_id: 6, event_type: 'status_changed', old_value: 'open', new_value: 'escalated', created_at: daysAgo(0, 2) },
  { id: uuid(), resource: 'incident', resource_id: 5, event_type: 'incident_created', old_value: null, new_value: 'open', created_at: daysAgo(0, 3) },
]

// ─── Analytics computations ───────────────────────────────────────────────────
export function computeMTTA(incidentList) {
  const resolved = incidentList.filter(i => i.acknowledged_at)
  if (!resolved.length) return 0
  const sum = resolved.reduce((acc, i) => {
    return acc + (new Date(i.acknowledged_at) - new Date(i.created_at))
  }, 0)
  return Math.round(sum / resolved.length / 60000)
}

export function computeMTTR(incidentList) {
  const resolved = incidentList.filter(i => i.resolved_at)
  if (!resolved.length) return 0
  const sum = resolved.reduce((acc, i) => {
    return acc + (new Date(i.resolved_at) - new Date(i.created_at))
  }, 0)
  return Math.round(sum / resolved.length / 60000)
}

export function getAlertVolumeByDay(alertList, days = 14) {
  const result = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const count = alertList.filter(a => {
      const ad = new Date(a.created_at)
      return ad.toDateString() === d.toDateString()
    }).length
    result.push({ date: label, count: count + Math.floor(Math.random() * 3) })
  }
  return result
}

export function getMTTAByDay(incidentList, days = 14) {
  const result = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const dayIncidents = incidentList.filter(inc => {
      const cd = new Date(inc.created_at)
      return cd.toDateString() === d.toDateString() && inc.acknowledged_at
    })
    const mtta = dayIncidents.length
      ? Math.round(dayIncidents.reduce((s, i) => s + (new Date(i.acknowledged_at) - new Date(i.created_at)), 0) / dayIncidents.length / 60000)
      : Math.floor(Math.random() * 20) + 5
    result.push({ date: label, mtta })
  }
  return result
}

export function getMTTRByDay(incidentList, days = 14) {
  const result = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const dayIncidents = incidentList.filter(inc => {
      const cd = new Date(inc.created_at)
      return cd.toDateString() === d.toDateString() && inc.resolved_at
    })
    const mttr = dayIncidents.length
      ? Math.round(dayIncidents.reduce((s, i) => s + (new Date(i.resolved_at) - new Date(i.created_at)), 0) / dayIncidents.length / 60000)
      : Math.floor(Math.random() * 60) + 20
    result.push({ date: label, mttr })
  }
  return result
}

export function getPriorityBreakdown(list) {
  return PRIORITIES.map(p => ({
    priority: p,
    count: list.filter(i => i.priority === p).length,
  }))
}

// ─── Mock Metrics (CPU / Memory time series) ──────────────────────────────────
// Deterministic seed based on service name so values don't change on re-render
const seed = (str) => str.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
const seededRand = (s, i) => ((Math.sin(s * 9301 + i * 49297 + 233) * 1000) % 1 + 1) / 2

export function getMockMetrics(serviceName) {
  const s = seed(serviceName)
  const cpuBase = serviceName === 'payment-service' ? 82 :
    serviceName === 'api-gateway' ? 74 : serviceName === 'inventory-service' ? 55 : 40
  const memBase = serviceName === 'user-service' ? 76 :
    serviceName === 'payment-service' ? 60 : serviceName === 'analytics-service' ? 72 : 45
  const points = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setMinutes(d.getMinutes() - i)
    const label = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    const spike = i < 5 ? 15 : 0
    points.push({
      time: label,
      cpu: Math.min(99, Math.round(cpuBase + seededRand(s, i) * 12 + spike)),
      memory: Math.min(99, Math.round(memBase + seededRand(s + 1, i) * 10)),
    })
  }
  return points
}

// ─── Mock Pods Status ─────────────────────────────────────────────────────────
export function getMockPods(alert) {
  const available = alert?.replicas_available ?? 3
  const desired = alert?.replicas_desired ?? 3
  const names = ['payment', 'api-gw', 'order', 'user', 'inv', 'auth', 'notif', 'analytics']
  const base = alert?.metadata_name?.split('-')[0] || 'svc'
  return Array.from({ length: desired }, (_, i) => ({
    name: `${base}-svc-${Math.random().toString(36).slice(2, 7)}`,
    status: i < available ? 'Running' : 'CrashLoopBackOff',
    restarts: i < available ? Math.floor(Math.random() * 3) : 3 + Math.floor(Math.random() * 5),
    cpu: i < available ? `${Math.floor(seededRand(seed(base), i) * 400 + 50)}m` : '0m',
    memory: i < available ? `${Math.floor(seededRand(seed(base) + 1, i) * 300 + 100)}Mi` : '0Mi',
    node: `ip-10-0-${Math.floor(seededRand(seed(base), i + 5) * 200 + 1)}.ec2.internal`,
  }))
}

// ─── Mock Logs ────────────────────────────────────────────────────────────────
const LOG_MESSAGES = {
  'payment-service': [
    ['ERROR', 'Circuit breaker OPEN - downstream payment processor unreachable after 3 retries'],
    ['ERROR', 'Transaction TX-88219 failed: connection pool exhausted (95/100 connections used)'],
    ['WARN',  'High CPU throttling detected - cgroup limit reached at 2 vCPU'],
    ['WARN',  'Retry attempt 3/3 for charge request order #84521 - increasing latency'],
    ['INFO',  'Processing payment for order #84521 amount=$124.50'],
    ['INFO',  'Kafka message published: payment.initiated topic partition=3 offset=882910'],
    ['DEBUG', 'Database query: SELECT * FROM transactions WHERE id=$1 took 248ms'],
    ['INFO',  'Health check /healthz returned 200 OK in 2ms'],
  ],
  'api-gateway': [
    ['ERROR', 'Upstream timeout: payment-service /api/v2/charge responded after 5001ms (limit: 5000ms)'],
    ['ERROR', 'Circuit breaker HALF_OPEN - testing upstream order-service'],
    ['WARN',  'p99 latency threshold exceeded: 2847ms > 2500ms threshold'],
    ['WARN',  'Rate limit approaching: 4800/5000 rps on route /api/v2/orders'],
    ['INFO',  'Route /api/v2/users forwarded to user-service pod 10.0.4.22:8080'],
    ['INFO',  'TLS certificate renewed for api.example.com, expires 2027-03-30'],
    ['DEBUG', 'Load balancer health check: payment-service 2/4 pods healthy'],
  ],
  'order-service': [
    ['ERROR', 'HTTP 503 from payment-service after 5000ms timeout - error rate now 5.2%'],
    ['ERROR', 'Failed to reserve inventory for SKU-44821: inventory-service unavailable'],
    ['WARN',  'Order processing latency increased to 1840ms avg (normal: 250ms)'],
    ['INFO',  'Order #84521 created for user 12345, routed to payment-service'],
    ['INFO',  'Inventory reservation confirmed for 3 items in order #84520'],
    ['DEBUG', 'Cache miss for product catalog key: cat:electronics:page:3'],
  ],
  default: [
    ['ERROR', 'Unhandled exception in worker thread: NullPointerException at line 421'],
    ['WARN',  'Memory usage at 78% - approaching configured threshold of 80%'],
    ['WARN',  'Slow database query detected: 892ms for SELECT on events table'],
    ['INFO',  'Service started on port 8080, connected to PostgreSQL cluster'],
    ['INFO',  'Background job completed: processed 1240 records in 3.2s'],
    ['DEBUG', 'Cache warm-up complete: loaded 8820 entries in 412ms'],
  ],
}

export function getMockLogs(serviceName) {
  const msgs = LOG_MESSAGES[serviceName] || LOG_MESSAGES.default
  const now = new Date()
  return msgs.map((m, i) => {
    const d = new Date(now.getTime() - i * 47000 - Math.floor(seededRand(seed(serviceName), i) * 30000))
    return {
      id: i,
      timestamp: d.toISOString(),
      level: m[0],
      message: m[1],
      pod: `${serviceName.split('-')[0]}-${Math.random().toString(36).slice(2, 7)}`,
      ns: serviceName.includes('payment') ? 'payments' : serviceName.includes('order') ? 'orders' : 'default',
    }
  })
}

// ─── Mock Traces ──────────────────────────────────────────────────────────────
export function getMockTrace(serviceName) {
  const traceId = `${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`
  const totalMs = serviceName === 'payment-service' ? 2840 :
    serviceName === 'api-gateway' ? 3120 :
    serviceName === 'order-service' ? 2200 : 1500

  const spans = [
    { id: 'a', parent: null, service: 'api-gateway', operation: 'POST /api/v2/orders', start: 0, dur: totalMs, status: 'error', http: '503' },
    { id: 'b', parent: 'a', service: 'order-service', operation: 'createOrder', start: 12, dur: totalMs - 25, status: 'error', http: '500' },
    { id: 'c', parent: 'b', service: serviceName, operation: serviceName === 'payment-service' ? 'chargeCard' : 'processRequest', start: 35, dur: Math.round(totalMs * 0.7), status: 'error', http: '503' },
    { id: 'd', parent: 'c', service: 'postgres', operation: 'SELECT transactions LIMIT 1000', start: 80, dur: Math.round(totalMs * 0.35), status: 'ok', http: null },
    { id: 'e', parent: 'b', service: 'inventory-service', operation: 'reserveStock', start: 45, dur: 380, status: 'ok', http: '200' },
    { id: 'f', parent: 'b', service: 'redis', operation: 'GET session:user:12345', start: 20, dur: 4, status: 'ok', http: null },
  ]
  return { traceId, totalMs, spans }
}

// ─── Service Graph ────────────────────────────────────────────────────────────
export const serviceGraph = {
  nodes: [
    { id: 'client', label: 'Client', x: 60, y: 200, type: 'external' },
    { id: 'api-gateway', label: 'api-gateway', x: 200, y: 200, type: 'gateway' },
    { id: 'payment-service', label: 'payment-service', x: 380, y: 100, type: 'backend', alert: true },
    { id: 'order-service', label: 'order-service', x: 380, y: 200, type: 'backend', alert: true },
    { id: 'user-service', label: 'user-service', x: 380, y: 300, type: 'backend' },
    { id: 'inventory-service', label: 'inventory-service', x: 560, y: 200, type: 'backend', alert: true },
    { id: 'notification-service', label: 'notification-service', x: 560, y: 300, type: 'backend' },
    { id: 'postgres', label: 'postgres', x: 700, y: 150, type: 'database' },
    { id: 'redis', label: 'redis', x: 700, y: 280, type: 'cache' },
  ],
  edges: [
    { from: 'client', to: 'api-gateway', rps: 350, errorRate: 4.2, status: 'error' },
    { from: 'api-gateway', to: 'payment-service', rps: 120, errorRate: 8.5, status: 'error' },
    { from: 'api-gateway', to: 'order-service', rps: 85, errorRate: 5.1, status: 'error' },
    { from: 'api-gateway', to: 'user-service', rps: 230, errorRate: 0.3, status: 'ok' },
    { from: 'order-service', to: 'payment-service', rps: 85, errorRate: 7.2, status: 'error' },
    { from: 'order-service', to: 'inventory-service', rps: 80, errorRate: 1.2, status: 'warn' },
    { from: 'order-service', to: 'notification-service', rps: 60, errorRate: 0.5, status: 'ok' },
    { from: 'payment-service', to: 'postgres', rps: 120, errorRate: 0.2, status: 'ok' },
    { from: 'inventory-service', to: 'postgres', rps: 80, errorRate: 0.1, status: 'ok' },
    { from: 'user-service', to: 'redis', rps: 230, errorRate: 0.0, status: 'ok' },
  ],
}

// ─── Escalation Groups ────────────────────────────────────────────────────────
export const escalationGroups = [
  {
    id: 1,
    name: 'Platform SRE',
    description: 'Core platform reliability engineers responsible for infra and k8s',
    members: [
      { name: 'Alice Chen', email: 'alice@company.com', role: 'lead', channels: ['pagerduty', 'slack'] },
      { name: 'Bob Kumar', email: 'bob@company.com', role: 'member', channels: ['pagerduty', 'slack'] },
      { name: 'Charlie Park', email: 'charlie@company.com', role: 'member', channels: ['slack', 'email'] },
    ],
  },
  {
    id: 2,
    name: 'Payments Team',
    description: 'Engineers owning payment-service and transaction processing',
    members: [
      { name: 'Diana Reyes', email: 'diana@company.com', role: 'lead', channels: ['pagerduty', 'slack'] },
      { name: 'Eve Tanaka', email: 'eve@company.com', role: 'member', channels: ['pagerduty', 'email'] },
    ],
  },
  {
    id: 3,
    name: 'Backend Engineering',
    description: 'General backend services team covering order, user, and inventory services',
    members: [
      { name: 'Frank Liu', email: 'frank@company.com', role: 'lead', channels: ['slack', 'email'] },
      { name: 'Grace Kim', email: 'grace@company.com', role: 'member', channels: ['pagerduty', 'slack'] },
      { name: 'Henry Osei', email: 'henry@company.com', role: 'member', channels: ['slack'] },
      { name: 'Iris Novak', email: 'iris@company.com', role: 'member', channels: ['email', 'slack'] },
    ],
  },
  {
    id: 4,
    name: 'Management Escalation',
    description: 'Engineering managers and VPs for SEV1 / P1 escalations',
    members: [
      { name: 'James Wright', email: 'james@company.com', role: 'lead', channels: ['pagerduty', 'email'] },
      { name: 'Karen Patel', email: 'karen@company.com', role: 'member', channels: ['pagerduty', 'email'] },
    ],
  },
]

// ─── On-Call Schedules ────────────────────────────────────────────────────────
export const oncallSchedules = [
  {
    id: 1,
    name: 'Platform SRE Rotation',
    description: 'Weekly rotation for platform infrastructure on-call',
    timezone: 'Asia/Jakarta',
    rotation_type: 'weekly',
    active: true,
    current_oncall: 'alice@company.com',
    current_shift_end: 'Mon Apr 6, 08:00',
    rotation: [
      { user: 'alice@company.com', shift: 'Mar 30 – Apr 6' },
      { user: 'bob@company.com', shift: 'Apr 6 – Apr 13' },
      { user: 'charlie@company.com', shift: 'Apr 13 – Apr 20' },
    ],
  },
  {
    id: 2,
    name: 'Payments On-Call',
    description: 'Daily rotation for payment-service critical path',
    timezone: 'America/New_York',
    rotation_type: 'daily',
    active: true,
    current_oncall: 'diana@company.com',
    current_shift_end: 'Apr 1, 09:00',
    rotation: [
      { user: 'diana@company.com', shift: 'Mar 31' },
      { user: 'eve@company.com', shift: 'Apr 1' },
      { user: 'diana@company.com', shift: 'Apr 2' },
    ],
  },
  {
    id: 3,
    name: 'Backend Engineering Rotation',
    description: 'Weekly rotation for backend services',
    timezone: 'Europe/London',
    rotation_type: 'weekly',
    active: true,
    current_oncall: 'grace@company.com',
    current_shift_end: 'Apr 6, 09:00',
    rotation: [
      { user: 'frank@company.com', shift: 'Mar 23 – Mar 30' },
      { user: 'grace@company.com', shift: 'Mar 30 – Apr 6' },
      { user: 'henry@company.com', shift: 'Apr 6 – Apr 13' },
      { user: 'iris@company.com', shift: 'Apr 13 – Apr 20' },
    ],
  },
]

// ─── Escalation Policies ──────────────────────────────────────────────────────
export const escalationPolicies = [
  {
    id: 1,
    name: 'P1 Critical — Payments',
    description: 'Immediate escalation for P1 alerts on payment-service. Notifies on-call engineer, then payments team lead, then management.',
    active: true,
    priorities: ['P1'],
    repeat_times: 3,
    repeat_interval_min: 5,
    auto_resolve: true,
    created_at: daysAgo(30),
    updated_at: daysAgo(2),
    steps: [
      { assign_type: 'schedule', assignee: 'Payments On-Call', channel: 'pagerduty', timeout_min: 5 },
      { assign_type: 'user', assignee: 'diana@company.com', channel: 'pagerduty', timeout_min: 10 },
      { assign_type: 'group', assignee: 'Payments Team', channel: 'pagerduty', timeout_min: 15 },
      { assign_type: 'group', assignee: 'Management Escalation', channel: 'pagerduty', timeout_min: 30 },
    ],
  },
  {
    id: 2,
    name: 'P1 Critical — Platform',
    description: 'Escalation for P1 infrastructure and platform alerts. Starts with platform SRE on-call schedule.',
    active: true,
    priorities: ['P1'],
    repeat_times: 3,
    repeat_interval_min: 5,
    auto_resolve: true,
    created_at: daysAgo(45),
    updated_at: daysAgo(5),
    steps: [
      { assign_type: 'schedule', assignee: 'Platform SRE Rotation', channel: 'pagerduty', timeout_min: 5 },
      { assign_type: 'group', assignee: 'Platform SRE', channel: 'pagerduty', timeout_min: 15 },
      { assign_type: 'group', assignee: 'Management Escalation', channel: 'pagerduty', timeout_min: 30 },
    ],
  },
  {
    id: 3,
    name: 'P2 High — Backend Services',
    description: 'Escalation for P2 alerts on backend services. Notifies backend on-call, then team lead.',
    active: true,
    priorities: ['P2'],
    repeat_times: 2,
    repeat_interval_min: 15,
    auto_resolve: true,
    created_at: daysAgo(20),
    updated_at: daysAgo(1),
    steps: [
      { assign_type: 'schedule', assignee: 'Backend Engineering Rotation', channel: 'pagerduty', timeout_min: 15 },
      { assign_type: 'user', assignee: 'frank@company.com', channel: 'slack', timeout_min: 30 },
      { assign_type: 'group', assignee: 'Backend Engineering', channel: 'slack', timeout_min: 60 },
    ],
  },
  {
    id: 4,
    name: 'P3/P4 Low — Slack Notify',
    description: 'Low-priority alerts notify the relevant team via Slack only. No paging.',
    active: true,
    priorities: ['P3', 'P4'],
    repeat_times: 1,
    repeat_interval_min: 60,
    auto_resolve: true,
    created_at: daysAgo(60),
    updated_at: daysAgo(10),
    steps: [
      { assign_type: 'group', assignee: 'Backend Engineering', channel: 'slack', timeout_min: 60 },
      { assign_type: 'user', assignee: 'frank@company.com', channel: 'email', timeout_min: 120 },
    ],
  },
  {
    id: 5,
    name: 'API Gateway — All Priorities',
    description: 'Dedicated escalation for api-gateway alerts across all priorities.',
    active: false,
    priorities: ['P1', 'P2', 'P3'],
    repeat_times: 2,
    repeat_interval_min: 10,
    auto_resolve: false,
    created_at: daysAgo(15),
    updated_at: daysAgo(15),
    steps: [
      { assign_type: 'schedule', assignee: 'Platform SRE Rotation', channel: 'pagerduty', timeout_min: 10 },
      { assign_type: 'group', assignee: 'Platform SRE', channel: 'slack', timeout_min: 20 },
    ],
  },
]

// ─── Escalation Assignments ───────────────────────────────────────────────────
export const escalationAssignments = [
  {
    id: 1,
    policy_id: 1,
    policy_name: 'P1 Critical — Payments',
    resource_type: 'ticket',
    resource_id: 1,
    priority: 'P1',
    assign_type: 'schedule',
    assignee: 'Payments On-Call',
    current_step: 2,
    status: 'escalating',
    channel: 'pagerduty',
    assigned_at: daysAgo(0, 1, 30),
    acknowledged_at: null,
  },
  {
    id: 2,
    policy_id: 1,
    policy_name: 'P1 Critical — Payments',
    resource_type: 'incident',
    resource_id: 1,
    priority: 'P1',
    assign_type: 'user',
    assignee: 'diana@company.com',
    current_step: 2,
    status: 'escalating',
    channel: 'pagerduty',
    assigned_at: daysAgo(0, 1, 30),
    acknowledged_at: null,
  },
  {
    id: 3,
    policy_id: 2,
    policy_name: 'P1 Critical — Platform',
    resource_type: 'ticket',
    resource_id: 2,
    priority: 'P1',
    assign_type: 'schedule',
    assignee: 'Platform SRE Rotation',
    current_step: 1,
    status: 'pending',
    channel: 'pagerduty',
    assigned_at: daysAgo(0, 1),
    acknowledged_at: null,
  },
  {
    id: 4,
    policy_id: 2,
    policy_name: 'P1 Critical — Platform',
    resource_type: 'incident',
    resource_id: 2,
    priority: 'P1',
    assign_type: 'schedule',
    assignee: 'Platform SRE Rotation',
    current_step: 1,
    status: 'pending',
    channel: 'pagerduty',
    assigned_at: daysAgo(0, 1),
    acknowledged_at: null,
  },
  {
    id: 5,
    policy_id: 3,
    policy_name: 'P2 High — Backend Services',
    resource_type: 'ticket',
    resource_id: 4,
    priority: 'P2',
    assign_type: 'schedule',
    assignee: 'Backend Engineering Rotation',
    current_step: 1,
    status: 'acknowledged',
    channel: 'pagerduty',
    assigned_at: daysAgo(0, 4),
    acknowledged_at: daysAgo(0, 3, 30),
  },
  {
    id: 6,
    policy_id: 3,
    policy_name: 'P2 High — Backend Services',
    resource_type: 'incident',
    resource_id: 4,
    priority: 'P2',
    assign_type: 'user',
    assignee: 'diana@company.com',
    current_step: 1,
    status: 'acknowledged',
    channel: 'pagerduty',
    assigned_at: daysAgo(0, 4),
    acknowledged_at: daysAgo(0, 3, 30),
  },
  {
    id: 7,
    policy_id: 1,
    policy_name: 'P1 Critical — Payments',
    resource_type: 'ticket',
    resource_id: 6,
    priority: 'P2',
    assign_type: 'group',
    assignee: 'Platform SRE',
    current_step: 2,
    status: 'escalating',
    channel: 'pagerduty',
    assigned_at: daysAgo(0, 2),
    acknowledged_at: null,
  },
  {
    id: 8,
    policy_id: 3,
    policy_name: 'P2 High — Backend Services',
    resource_type: 'incident',
    resource_id: 5,
    priority: 'P2',
    assign_type: 'user',
    assignee: 'eve@company.com',
    current_step: 1,
    status: 'acknowledged',
    channel: 'slack',
    assigned_at: daysAgo(0, 3),
    acknowledged_at: daysAgo(0, 2, 30),
  },
  {
    id: 9,
    policy_id: 4,
    policy_name: 'P3/P4 Low — Slack Notify',
    resource_type: 'ticket',
    resource_id: 8,
    priority: 'P4',
    assign_type: 'group',
    assignee: 'Backend Engineering',
    current_step: 1,
    status: 'pending',
    channel: 'slack',
    assigned_at: daysAgo(0, 6),
    acknowledged_at: null,
  },
  {
    id: 10,
    policy_id: 3,
    policy_name: 'P2 High — Backend Services',
    resource_type: 'incident',
    resource_id: 6,
    priority: 'P2',
    assign_type: 'schedule',
    assignee: 'Backend Engineering Rotation',
    current_step: 1,
    status: 'pending',
    channel: 'pagerduty',
    assigned_at: daysAgo(0, 5),
    acknowledged_at: null,
  },
]

// ─── Lookup helpers ───────────────────────────────────────────────────────────
export function getAlertById(id) { return alerts.find(a => a.id === id) }
export function getTicketById(id) { return tickets.find(t => t.id === id) }
export function getIncidentById(id) { return incidents.find(i => i.id === id) }
export function getCommentsByIncidentId(id) { return incidentComments.filter(c => c.incident_id === id) }
export function getRelationsByIncidentId(id) {
  return incidentRelations.filter(r => r.parent_incident_id === id || r.child_incident_id === id)
}
export function getEventLogsByResource(resource, id) {
  return eventLogs.filter(e => e.resource === resource && e.resource_id === id)
}
export function getTicketByAlertId(alertId) { return tickets.find(t => t.alert_id === alertId) }
export function getIncidentByAlertId(alertId) { return incidents.find(i => i.alert_id === alertId) }
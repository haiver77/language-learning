# Kubernetes: A Topic-Organized Reference

Kubernetes is a distributed operating platform for containerized workloads. It schedules, runs, exposes, scales, updates, and repairs containerized applications across clusters of physical or virtual machines. Its central principle is **declarative reconciliation**: users define desired state, and Kubernetes continuously works to make the actual state converge toward it.

Kubernetes can operate across public cloud, private cloud, bare metal, compact edge sites, and cloud-native telecom infrastructure. This document is organized by topic rather than by presentation order, so related concepts sit together. The final [Dictionary](#dictionary) is an expanded, standalone reference that explains each concept, component, and subcomponent in depth.

## Table of Contents

1. [Foundations and Mental Model](#1-foundations-and-mental-model)
2. [Architecture Layers](#2-architecture-layers)
3. [The Control Plane](#3-the-control-plane)
4. [Worker Nodes and Node Agents](#4-worker-nodes-and-node-agents)
5. [The API Request Lifecycle](#5-the-api-request-lifecycle)
6. [Pods and Workload Controllers](#6-pods-and-workload-controllers)
7. [Object Organization](#7-object-organization)
8. [Networking](#8-networking)
9. [Services, Ingress, and Gateway APIs](#9-services-ingress-and-gateway-apis)
10. [Storage, Configuration, and Secrets](#10-storage-configuration-and-secrets)
11. [Scheduling, Resources, Scaling, and Disruption](#11-scheduling-resources-scaling-and-disruption)
12. [Security and Multi-Tenancy](#12-security-and-multi-tenancy)
13. [Observability and Troubleshooting](#13-observability-and-troubleshooting)
14. [Delivery and Extensibility](#14-delivery-and-extensibility)
15. [Telecom and Edge](#15-telecom-and-edge)
16. [Terminology Evolution](#16-terminology-evolution)
17. [Dictionary](#dictionary)

---

## 1. Foundations and Mental Model

### Containers vs. Kubernetes

Containers and Kubernetes solve different problems and complement each other.

- **Containers provide packaging.** A container packages application binaries and dependencies; the runtime creates isolated processes from container images.
- **Kubernetes provides distributed-system behavior.** It adds placement, replication, service discovery, health checking, replacement, scaling, rolling updates, resource governance, policy, and lifecycle management on top of containers.

Kubernetes does **not** replace application design, databases, observability, security engineering, image construction, or CI/CD. It coordinates those capabilities rather than providing them.

### The core building blocks

- A **cluster** is the complete Kubernetes environment.
- A **node** is a participating server (physical or virtual).
- A **Pod** is the smallest deployable unit.
- A **container** is the runtime process inside a Pod.
- A **control plane** makes cluster-wide decisions.
- A **worker node** executes application Pods.
- A **controller** continuously reconciles a resource relationship.

### The end-to-end mental model

This single loop describes how everything fits together:

1. Users **declare intent** through the API.
2. The **API server** authenticates, authorizes, admits, validates, and persists it.
3. **`etcd`** stores it durably.
4. **Controllers** reconcile it, creating or updating dependent objects.
5. The **scheduler** places Pods onto nodes.
6. **kubelets and runtimes** execute the containers.
7. **CNI and CSI** connect networking and storage.
8. **Status, events, metrics, logs, and audits** provide feedback.

The loop repeats whenever reality diverges from intent — after a failed container, deleted Pod, unavailable node, changed replica count, or changed configuration.

> **Key insight:** A successful API write means desired state was *accepted* — not that the image was pulled, the Pod was scheduled, the volume mounted, or the application became ready. Acceptance and readiness are distinct.

---

## 2. Architecture Layers

A complete Kubernetes architecture has five layers.

| Layer | What it contains |
|---|---|
| **Management** | Users, administrators, `kubectl`, CI/CD systems, GitOps controllers, operators, monitoring systems, and external automation. |
| **Control plane** | API server, authentication, authorization, admission, `etcd`, scheduler, controller manager, cloud-controller-manager, leader election, and control-plane certificates. |
| **Node** | kubelet, container runtime, operating-system services, kube-proxy or another service dataplane, CNI, CSI, device plugins, local storage, and hardware. |
| **Workload** | Pods, containers, Deployments, ReplicaSets, StatefulSets, DaemonSets, Jobs, CronJobs, Services, Ingress or Gateway resources, and application data. |
| **Integration** | Image registries, DNS, load balancers, storage systems, identity providers, certificate authorities, cloud controllers, telecom networks, and observability platforms. |

---

## 3. The Control Plane

The control plane is the cluster's decision-making and state-management system. It receives API requests, authenticates and authorizes them, invokes admission, validates resources, persists cluster state, schedules workloads, reconciles controllers, and reports status.

### Control-plane components

- **kube-apiserver** — the front door and communication hub for users, controllers, kubelets, schedulers, operators, webhooks, and external systems.
- **`etcd`** — the persistent, strongly consistent backing store for Kubernetes objects, metadata, status, secrets, leases, and configuration.
- **kube-scheduler** — assigns unscheduled Pods to feasible nodes.
- **kube-controller-manager** — runs the resource controllers that repair and update cluster state.
- **cloud-controller-manager** — provides cloud-specific node, route, load-balancer, and provider integration when applicable.

Control-plane components communicate through authenticated APIs and leases. TLS certificates, kubeconfigs, certificate authorities, and service-account keys are critical security assets.

### Node vs. logical service set

A **control-plane node** is a *host*: it has a node identity, operating system, kubelet, and control-plane components or workloads. A **control plane** is the *logical service set*: the collection of API, storage, scheduling, controller, authentication, admission, and integration services distributed across one or more hosts.

- In a **development cluster**, one machine can host the control plane and application workloads.
- In a **production cluster**, several control-plane nodes provide API-server redundancy and an `etcd` quorum.
- A **stacked topology** places `etcd` and control-plane components on the same hosts.
- A **separated topology** places control-plane functions and data storage on distinct infrastructure.

Control-plane nodes require protected CPU, memory, disk, network, certificate, and scheduling capacity, because the API server, `etcd`, scheduler, controller manager, kubelet, and critical add-ons all depend on them.

### etcd, high availability, and recovery

`etcd` determines cluster survivability:

- It stores resource specifications, metadata, status, secrets, leases, and other authoritative state. Normal components access it *through the API server*, not directly.
- It uses consensus and quorum, so loss of the tolerated failure threshold can prevent reliable writes and leave the control plane unable to process normal changes.
- Multiple API servers improve API availability; multiple scheduler and controller-manager instances commonly use **leader election**.
- `etcd` performance directly affects API latency, controller responsiveness, scheduling, and state propagation.

**Operational requirements:** backups, restore testing, encryption, certificate rotation, capacity monitoring, disk-performance monitoring, careful membership changes, and tested disaster recovery. Three control-plane nodes are commonly used to preserve quorum during one-node maintenance or failure; workload replicas must also be distributed across nodes and failure domains.

### How the scheduler and controller manager turn intent into a running app

- A new Pod starts without a node assignment. The scheduler **filters** nodes by resource requests, readiness, taints, tolerations, selectors, affinity, topology, volume constraints, and policy, then **scores** the feasible nodes, selects one, and writes the binding.
- The controller manager runs controllers for Deployments, ReplicaSets, StatefulSets, Jobs, Nodes, EndpointSlices, Namespaces, ServiceAccounts, garbage collection, and more.
- Controllers watch API resources, compare desired and observed state, create or update dependent objects, and repeat reconciliation until the system converges.
- Controllers must be **idempotent and retry-safe**. Controller failure may temporarily stop repair, scaling, or rollout behavior even if existing applications keep running.

Scheduling failures are diagnosed through events, resource requests, quotas, node conditions, taints, affinity, and storage topology.

---

## 4. Worker Nodes and Node Agents

A worker node supplies CPU, memory, kernel services, local storage, network interfaces, operating-system processes, and a container runtime. Pods are executed through a set of node agents and plugins.

- **kubelet** — receives assigned Pod specifications, prepares volumes and networking, invokes the runtime, runs lifecycle hooks and probes, and reports Pod and node status.
- **container runtime** — implements CRI behavior: image pulls, container creation, namespaces, cgroups, process lifecycle, logs, and runtime-state reporting.
- **kube-proxy** (or an alternative dataplane) — implements Service forwarding.
- **CNI** — configures Pod interfaces, addresses, routes, overlays or underlays, and possibly policy.
- **CSI** — attaches, mounts, resizes, snapshots, clones, and detaches storage.
- **device plugins** — expose GPUs, FPGAs, SmartNICs, or telecom acceleration hardware.

> **Key insight:** A node can be `Ready` while an application is failing. Node readiness, Pod readiness, container state, and business-level health must be interpreted separately.

### Static Pods

A **static Pod** is created by the kubelet from a local manifest rather than by a Deployment or another API controller; the API server exposes a mirror representation for observation. Static Pods can bootstrap essential control-plane components before the cluster API is fully operational. Their lifecycle depends on local files, kubelet configuration, certificates, runtime, and the operating system.

---

## 5. The API Request Lifecycle

Every API request passes through five stages before it affects the cluster.

1. **Authentication** — identifies the caller through certificates, bearer tokens, service accounts, OIDC, or another configured identity mechanism.
2. **Authorization** — determines whether that identity may perform a verb (`get`, `list`, `watch`, `create`, `update`, `patch`, `delete`) on a resource. RBAC is the common model.
3. **Admission** — mutates, validates, or rejects requests before persistence; examples include security policy, quotas, defaulting, image rules, and custom webhooks.
4. **Validation** — checks API schema, field values, immutable fields, resource references, and object-specific constraints.
5. **Persistence** — writes accepted objects to `etcd`. Controllers, schedulers, kubelets, and extensions then observe the changes through API watches.

### Worked example: a Deployment request

1. The request is authenticated, authorized, admitted, validated, and stored in `etcd`.
2. The **Deployment controller** creates a ReplicaSet.
3. The **ReplicaSet controller** creates Pods.
4. The **scheduler** binds them to nodes.
5. The selected **kubelet** invokes the runtime, **CNI** configures networking, **CSI** mounts storage, and the kubelet reports status and probe results.

---

## 6. Pods and Workload Controllers

### Pods

A **Pod** groups one or more tightly coupled containers that share networking, lifecycle, and selected volumes.

- **Init containers** prepare startup and run to completion before main containers start.
- **Sidecars** provide supporting functions alongside the main container.
- A Pod's identity and IP are normally disposable; controllers provide durability and recreate Pods as needed.

**Probes** govern lifecycle:

- **Startup probe** — protects slow initialization from premature liveness failures.
- **Readiness probe** — controls traffic eligibility.
- **Liveness probe** — determines whether restarting a container is appropriate.

### Workload controllers

| Controller | Purpose |
|---|---|
| **Deployment** | Interchangeable stateless replicas, rolling updates, revisions, and rollback. |
| **ReplicaSet** | Maintains a target count of matching Pods, normally managed by a Deployment. |
| **StatefulSet** | Stable ordinal identity, predictable startup and termination, stable network names, and per-replica storage. |
| **DaemonSet** | Node-local presence for logging, monitoring, networking, storage, and hardware agents. |
| **Job / CronJob** | Finite or scheduled work with retries, completion counts, deadlines, concurrency, and cleanup. |

---

## 7. Object Organization

Namespaces, labels, selectors, and owner references organize the platform.

- **Namespaces** scope names and group resources for administration, quotas, access control, policy, and service discovery.
- **Labels** provide stable identity for application, component, version, owner, environment, topology, tenant, and cost center.
- **Selectors** connect Services to Pods, Deployments to ReplicaSets, policies to workloads, scheduling rules to nodes, and monitoring systems to targets.
- **Annotations** store tool-specific or operational metadata and should not replace stable labels for identity.
- **Owner references** express resource relationships and allow garbage collection of dependent objects.

> **Key insight:** Namespaces are logical boundaries, not complete security or performance isolation. Stronger separation may require policies, node pools, runtime controls, storage boundaries, or separate clusters.

---

## 8. Networking

Kubernetes networking is a layered data path implemented by pluggable interfaces.

- The **Pod network** connects containers within Pods and Pods across nodes. The **node network** connects worker interfaces, switches, routers, overlays, underlays, and external networks.
- **CNI** configures Pod interfaces, IP addresses, routes, encapsulation or direct routing, and sometimes network policy.
- The **Service dataplane** translates stable Service addresses into selected Pod endpoints using iptables, IPVS, eBPF, or vendor-specific mechanisms.
- **NetworkPolicy** restricts selected ingress and egress flows by Pod, namespace, IP block, protocol, and port; enforcement depends on the CNI implementation.
- **Multus** can attach additional interfaces; SR-IOV, DPDK, device plugins, and specialized dataplanes support high-performance workloads.
- Telco platforms may separate management, signaling, control-plane, user-plane, synchronization, and high-throughput data traffic.

---

## 9. Services, Ingress, and Gateway APIs

These provide stable application connectivity while Pods are created, deleted, rescheduled, and scaled.

### Services

A Service gives clients a stable virtual endpoint for a changing set of backing Pods.

- **`ClusterIP`** — internal exposure (the default).
- **`NodePort`** — exposes a port on each eligible node.
- **`LoadBalancer`** — integrates external load-balancer infrastructure.
- **Headless** — exposes individual Pod addresses through DNS instead of a virtual IP.

**EndpointSlices** represent the current backends and include readiness, serving, and terminating information.

### Ingress and Gateway API

- **Ingress** describes HTTP/HTTPS routing; an **ingress controller** implements the proxying, TLS, load balancing, and provider integration.
- **Gateway API** provides richer, role-oriented resources for listeners, routes, backend references, traffic policies, and ownership.

### Troubleshooting connectivity

Verify DNS, listeners, certificates, routes, Service selectors, ports, EndpointSlices, network policy, load-balancer health, and application listeners.

> **Key insight:** Services and gateways do not automatically solve session state, protocol affinity, data consistency, TLS identity, retries, or application-level authorization.

---

## 10. Storage, Configuration, and Secrets

These separate application concerns from infrastructure.

### Storage

- Container filesystems are **ephemeral**. A **PersistentVolume (PV)** represents provisioned capacity; a **PersistentVolumeClaim (PVC)** requests capacity for an application.
- **StorageClasses** define driver, performance tier, topology, binding mode, reclaim policy, and provisioning behavior. **CSI** implements attach, mount, resize, snapshot, clone, and detach operations.
- StatefulSets commonly create one storage claim per replica, preserving storage identity across Pod recreation.

### Configuration and secrets

- **ConfigMaps** externalize non-sensitive configuration.
- **Secrets** hold sensitive values but require encryption at rest, RBAC, rotation, audit, and careful handling — **base64 is not encryption**.
- Environment variables are simple but may leak through diagnostics; mounted files can support structured configuration and rotation.

> **Key insight:** Application-level replication, backup, restore, consistency, encryption, latency, migration, and recovery remain application and storage-system responsibilities.

---

## 11. Scheduling, Resources, Scaling, and Disruption

These determine runtime behavior.

### Resources and QoS

- **Requests** influence scheduling; **limits** constrain runtime consumption.
- **QoS classes** — Guaranteed, Burstable, and BestEffort — affect behavior during pressure.

### Placement controls

- **Node selectors and affinity** express placement.
- **Anti-affinity and topology spread** distribute replicas.
- **Taints** repel workloads unless matching **tolerations** are present.
- **Priority and preemption** let critical workloads obtain capacity, but poorly designed priorities can cause cascading disruption.

### Pressure and eviction

The kubelet monitors memory, disk, PID, and other pressure signals and may evict Pods when thresholds are reached.

### Scaling

- **HorizontalPodAutoscaler** changes replica count using resource or custom metrics.
- **Vertical scaling** changes resource requests and may restart Pods.
- **Cluster autoscaling** adds or removes nodes.

### Preserving availability

PodDisruptionBudgets, rolling-update surge limits, readiness gates, graceful termination, and capacity headroom preserve availability during maintenance and releases.

---

## 12. Security and Multi-Tenancy

Security requires layered controls, no single mechanism is sufficient.

- **Authentication** identifies humans, automation, service accounts, components, and external systems. **RBAC** limits resources, namespaces, subresources, verbs, and identities.
- **Admission policies** enforce images, security contexts, labels, resource requirements, namespaces, quotas, and organizational rules before persistence.
- **Pod Security** controls privilege escalation, host namespaces, host access, capabilities, users, filesystems, and volume behavior.
- **TLS** protects API-server and component communication; certificate authorities, kubeconfigs, service-account keys, secrets, and audit logs require protection and rotation.

### Multi-tenancy

- **Namespaces** organize tenants; **ResourceQuotas** and **LimitRanges** control consumption; **NetworkPolicies** restrict east-west traffic.
- Dedicated nodes, taints, storage classes, runtimes, and separate clusters provide stronger isolation.
- Multi-tenancy must address noisy neighbors, failure domains, secrets, data residency, auditability, upgrade coordination, and operational ownership.

---

## 13. Observability and Troubleshooting

Observability must follow both the control path and the data path.

### What to observe at each layer

- **Control plane** — API latency and errors, admission latency, scheduler activity, controller queues, `etcd` health, leader election, certificates, and audit events.
- **Node** — CPU, memory, disk, PID pressure, kubelet health, runtime health, kernel messages, CNI state, CSI state, and hardware.
- **Workload** — logs, metrics, traces, restarts, readiness, liveness, startup time, resource usage, and business health.

### Troubleshooting playbooks

- **Pending Pod** — inspect events, requests, quotas, affinity, taints, tolerations, topology, and volume constraints.
- **Startup failure** — inspect images, credentials, init containers, volumes, environment, runtime errors, and probes.
- **Traffic failure** — trace client → DNS → Gateway/Ingress → Service → EndpointSlice → Pod → application listener.

### Tools

Use `kubectl` for API evidence, and `crictl`, `journalctl`, `systemctl`, `ip`, `iptables`, and `tcpdump` for node-level evidence.

---

## 14. Delivery and Extensibility

### Delivery

Manifests are versioned and reviewed. **Helm** packages charts; **Kustomize** provides overlays; **GitOps** reconciles Git with live state. Progressive delivery enables canary, blue-green, weighted rollout, shadow traffic, and rollback.

### Extensibility

**CustomResourceDefinitions (CRDs)** add domain APIs. **Operators** reconcile those resources into Kubernetes resources or external systems, encoding installation, backup, failover, upgrades, certificates, scaling, and repair.

### Production standards

Define supported versions, API deprecation policy, certificates, backups, recovery, policies, labels, ownership, resource requests, probes, disruption budgets, monitoring, logging, and failure tests.

---

## 15. Telecom and Edge

Cloud-native network functions (CNFs) and edge deployments impose demanding requirements:

- Bare metal, CPU pinning, hugepages, and NUMA placement.
- SR-IOV, Multus, DPDK, and device plugins.
- Multiple network interfaces and specialized dataplanes.
- Remote lifecycle management, compact footprints, local resiliency, and disconnected operation.

---

## 16. Terminology Evolution

Older Kubernetes material (and some older Ericsson documentation) uses legacy terms that map to current terminology.

| Legacy term | Current term | Notes |
|---|---|---|
| **Master node** | Control-plane node | A node hosting the API server, `etcd`, scheduler, controller manager, and sometimes cloud-controller components. The modern name reflects that the node provides cluster *control functions* rather than acting as a human-style "master." |
| **Minion** | Worker node | A node that runs application Pods. |
| **Master / master node / control plane** | Control plane | In older material these may all describe the same role; new material should use "control plane." |

A control-plane node may be dedicated to control-plane work or may also run application Pods in a small or specially configured cluster. Control-plane nodes commonly receive a `NoSchedule` taint so ordinary workloads stay on workers unless they have matching tolerations.

---

## Dictionary

A standalone reference. Each entry explains what the concept *is*, what role it plays, how it relates to neighboring concepts, and common pitfalls where relevant. Entries are grouped by theme and ordered so that foundational concepts precede the components that build on them.

### 17.1 Cluster, nodes, and topology

**Cluster**
The complete Kubernetes environment managed through one Kubernetes API endpoint. It combines a control plane, worker nodes, API resources, persistent state, networking, storage, security, observability, and platform integrations. Everything else in this dictionary exists *inside* a cluster.

**Node**
A physical or virtual machine that participates in the cluster. Each node runs a kubelet, a container runtime, and a service dataplane, and contributes compute, memory, networking, and storage. Nodes are either control-plane nodes, worker nodes, or both.

**Control plane**
The *logical* set of Kubernetes services that manage cluster state: API server, `etcd`, scheduler, controller manager, authentication, authorization, admission, and integration services. It is a service set, not a single machine; the same services can be spread across several hosts for availability.

**Control-plane node**
A *host* that runs one or more control-plane components. Distinguished from the control plane itself: the node is the physical/virtual machine, the control plane is the collection of services. Often tainted `NoSchedule` so application Pods stay on workers.

**Worker node**
A node that executes application Pods and provides their compute, networking, and storage. Runs kubelet, container runtime, kube-proxy (or an alternative dataplane), CNI, and CSI, plus optional device plugins.

**Master node** *(legacy)*
Older term for a control-plane node. Replaced because the node provides control functions rather than acting as a human-style master.

**Minion** *(legacy)*
Older term for a worker node.

**Stacked topology**
A high-availability layout where `etcd` runs on the same hosts as the other control-plane components. Simpler to operate but couples the datastore to the control-plane lifecycle.

**Separated (external etcd) topology**
A layout where `etcd` runs on hosts distinct from the rest of the control plane. More resilient and independently scalable, at the cost of more infrastructure.

**Failure domain**
A boundary (host, rack, zone, region) within which a single fault can take out everything inside it. Replicas and control-plane nodes are spread across failure domains so one fault cannot destroy quorum or availability.

### 17.2 Control-plane components

**kube-apiserver**
The HTTPS API endpoint and communication hub through which users and all Kubernetes components read or change cluster state. It runs the authentication → authorization → admission → validation → persistence pipeline and is the *only* component that talks to `etcd` directly in normal operation.

**Kubernetes API**
The resource-oriented interface used to describe and manage cluster objects. Everything is a resource with a `spec` (desired state) and usually a `status` (observed state); clients create, read, update, patch, delete, and watch these resources.

**`etcd`**
A distributed, strongly consistent key-value store used as Kubernetes' authoritative backing store. Holds object specs, metadata, status, secrets, leases, and configuration. Uses a consensus protocol (Raft) and requires a quorum of members to accept writes, so odd member counts (3, 5) are standard. Its latency and disk performance directly bound control-plane responsiveness.

**Quorum**
The majority of `etcd` members that must agree for a write to commit. With 3 members, quorum is 2 and the cluster tolerates 1 failure; with 5, quorum is 3 and it tolerates 2. Losing quorum stops reliable writes and freezes normal control-plane progress.

**kube-scheduler**
The control-plane component that selects a feasible node for each unscheduled Pod. It **filters** nodes against hard constraints (requests, taints, selectors, affinity, volume topology) then **scores** the survivors and binds the Pod to the best one. It decides *placement* only — it does not pull images or start containers.

**kube-controller-manager**
The process that hosts the built-in Kubernetes controllers (Deployment, ReplicaSet, StatefulSet, Job, Node, EndpointSlice, Namespace, ServiceAccount, garbage collection, and more) in a single binary.

**Controller**
A control loop that watches one or more resource types, compares desired state (`spec`) with observed state (`status`), and takes action to close the gap — then repeats forever. Controllers must be idempotent and retry-safe. This reconciliation loop is the mechanism behind Kubernetes' self-healing behavior.

**cloud-controller-manager**
A component that implements cloud-provider-specific behavior: labeling and lifecycle of nodes, configuring routes, provisioning external load balancers, and attaching provider volumes. It isolates provider logic from the core control plane.

**Leader election**
A coordination mechanism (usually built on `etcd` leases) that ensures only one active instance of a replicated controller or scheduler performs the work at a time, while standbys wait to take over. Enables high availability without duplicated or conflicting actions.

**Lease**
A lightweight, time-bound API object used for liveness signalling and leader election. Node heartbeats and control-plane leader election both rely on leases.

**Add-on**
An optional but often essential cluster capability deployed on top of core Kubernetes — DNS, metrics, ingress, storage drivers, policy engines, or monitoring. Add-ons are managed as ordinary workloads but the cluster depends on them.

### 17.3 Node agents and runtime

**kubelet**
The node agent that turns Pod specs into running containers. It prepares volumes and networking, invokes the runtime through the CRI, runs lifecycle hooks and probes, enforces evictions under resource pressure, and reports Pod and node status back to the API server.

**Container runtime**
The software that actually pulls images, creates containers, sets up namespaces and cgroups, manages process lifecycle, and reports runtime state (e.g., containerd, CRI-O). The kubelet drives it; it does the low-level work.

**CRI (Container Runtime Interface)**
The gRPC interface the kubelet uses to talk to a container runtime. Decouples Kubernetes from any single runtime implementation, so runtimes can be swapped without changing the kubelet.

**Container**
A process (or process group) created from a container image and isolated by the runtime using namespaces and cgroups. The unit of execution; Pods wrap one or more containers.

**Container image**
An immutable, layered package containing application code, binaries, libraries, and runtime dependencies. Images are pulled from registries and are the input from which containers are created.

**kube-proxy**
The traditional node component that implements Service forwarding by programming iptables or IPVS rules so traffic to a Service's virtual IP is distributed to healthy backend Pods. Modern eBPF dataplanes can replace it.

**Static Pod**
A Pod created directly by the kubelet from a node-local manifest file rather than through the API. Used to bootstrap control-plane components before the API is available. The API server shows a read-only "mirror" of it; its real lifecycle is tied to local files and the kubelet.

**device plugin**
A node-level extension that advertises specialized hardware (GPUs, FPGAs, SmartNICs, telecom accelerators) to the kubelet so Pods can request and be scheduled onto it.

**cgroups**
A Linux kernel feature that limits and accounts for a process group's resource usage (CPU, memory, I/O). Kubernetes enforces resource requests and limits through cgroups.

**namespace (Linux)**
A Linux kernel feature that isolates what a process can see (network, PIDs, mounts, users). Distinct from a Kubernetes Namespace — this is the OS-level isolation primitive containers are built on.

### 17.4 Pods and workload controllers

**Pod**
Kubernetes' smallest deployable unit: one or more containers that share a network identity (one IP), lifecycle, and selected volumes. Containers in a Pod are always co-scheduled on the same node. Pods are typically disposable — controllers recreate them rather than repairing them in place.

**Init container**
A container that runs to completion *before* the main application containers start, used for setup such as fetching config, running migrations, or waiting on dependencies. Init containers run sequentially and must all succeed.

**Sidecar**
A supporting container that runs alongside the main container in the same Pod, sharing its network and lifecycle — commonly used for proxies, log shippers, or secrets agents.

**Deployment**
A controller for stateless workloads. It manages ReplicaSets to provide interchangeable replicas, rolling updates, revision history, and rollback. The standard choice for stateless applications.

**ReplicaSet**
A controller that maintains a target number of matching Pod replicas, recreating them when they disappear. Normally created and managed by a Deployment rather than directly.

**StatefulSet**
A controller for workloads needing stable identity: predictable, ordered startup and termination; stable per-replica network names; and persistent per-replica storage that survives rescheduling. Used for databases, queues, and clustered systems.

**DaemonSet**
A controller that ensures a copy of a Pod runs on every eligible node (or node subset). Used for node-local agents such as log collectors, monitoring agents, CNI daemons, and storage drivers.

**Job**
A controller for finite work that must run to successful completion, with support for retries, parallelism, and completion counts.

**CronJob**
A controller that creates Jobs on a time schedule, with concurrency policy, deadlines, and history limits.

**Replica**
One running instance of a workload, normally represented by a single Pod. "Three replicas" means three Pods doing the same job.

**Revision**
A versioned snapshot of a workload's configuration, kept so rollouts can be inspected and rolled back.

**Startup probe**
A health check that protects slow-starting containers: liveness and readiness checks are suspended until the startup probe first succeeds, preventing premature restarts.

**Readiness probe**
A health check that determines whether a Pod should receive traffic. A failing readiness probe removes the Pod from Service endpoints without restarting it.

**Liveness probe**
A health check that determines whether a container is still healthy. A failing liveness probe causes the kubelet to restart the container.

### 17.5 Object model and organization

**Object**
Any Kubernetes API resource that describes desired state (`spec`), metadata, and usually observed state (`status`). Objects are persistent records of intent, not transient commands.

**`spec`**
The desired configuration of an object, written by a user or automation. Controllers work to make reality match the `spec`.

**`status`**
The observed state of an object, written by controllers, kubelets, or other components. Comparing `spec` to `status` is how you tell whether the system has converged.

**Namespace (Kubernetes)**
A logical scope for object names, policies, quotas, access control, and service discovery. Used to group and administer resources — but it is *not* a hard security or performance boundary on its own.

**Label**
A key-value attribute attached to objects for identity and grouping: application, component, version, environment, owner, topology, tenant, cost center. Labels are the primary mechanism for selection.

**Selector**
A matching rule that finds objects carrying particular labels. Selectors wire the system together: Services to Pods, Deployments to their Pods, policies to workloads, scheduling rules to nodes.

**Annotation**
Non-identifying metadata attached to an object for tools and integrations (build info, config checksums, controller hints). Unlike labels, annotations are not used for primary selection.

**Owner reference**
Metadata expressing a parent-child relationship between objects (e.g., a ReplicaSet owns its Pods). Enables cascading garbage collection: delete the owner and its dependents are cleaned up.

**ConfigMap**
An object for storing non-sensitive configuration data, consumed by Pods as environment variables or mounted files. Decouples configuration from images.

**Secret**
An object intended for sensitive values (tokens, keys, passwords). Note that Secrets are only base64-encoded by default — real protection requires encryption at rest, RBAC, rotation, and audit.

**ServiceAccount**
A Kubernetes identity used by Pods and automation when calling the API. Pods authenticate as their ServiceAccount, which RBAC then authorizes.

**Resource version**
A server-generated version string on every object, used for optimistic concurrency control and for resuming watches without missing changes.

**Condition**
A structured status statement describing an aspect of a resource's state (e.g., `Ready`, `Progressing`, `Available`, `Degraded`), typically with a status, reason, and timestamp.

**Garbage collection**
The control-plane process that deletes dependent objects when their owners are removed, driven by owner references.

### 17.6 Services, discovery, and external traffic

**Service**
A stable virtual endpoint for a changing set of matching Pods. Clients talk to the Service and are load-balanced to healthy backends, insulating them from Pod churn.

**ClusterIP**
The default Service type: a stable internal virtual IP reachable only inside the cluster.

**NodePort**
A Service type that opens a fixed port on every eligible node and forwards it to the Service, exposing it outside the cluster without external infrastructure.

**LoadBalancer**
A Service type that requests or connects to an external load balancer (often cloud-provided) to expose the Service with a public address.

**Headless Service**
A Service with no cluster IP; cluster DNS returns the individual Pod addresses directly. Used when clients need to reach specific Pods, as with StatefulSets.

**EndpointSlice**
An API resource listing the current backend endpoints for a Service, including readiness, serving, and terminating state. The scalable successor to the older Endpoints object.

**Service selector**
The label rule that determines which Pods back a Service. If the selector matches nothing, the Service has no endpoints and traffic fails.

**Kubernetes DNS**
Cluster DNS that resolves Service and Pod names to addresses (e.g., `my-svc.my-namespace.svc.cluster.local`), giving workloads stable names instead of fixed IPs.

**Ingress**
An API resource describing HTTP/HTTPS routing into cluster Services (host- and path-based rules, TLS). It is just a specification — it does nothing without an ingress controller.

**Ingress controller**
The actual implementation (e.g., NGINX, HAProxy, cloud gateways) that reads Ingress objects and performs the proxying, TLS termination, and load balancing.

**Gateway API**
A newer, more expressive and role-oriented set of APIs for traffic routing, separating infrastructure concerns (Gateway) from routing concerns (Routes) and supporting richer traffic policies than Ingress.

**Gateway**
A Gateway API resource representing a traffic listener and its infrastructure boundary (ports, protocols, TLS), typically owned by cluster/infra operators.

**Route (HTTPRoute, etc.)**
A Gateway API resource defining how requests are matched and forwarded to backends, typically owned by application teams.

**North-south traffic**
Traffic entering or leaving the cluster (clients to applications, or applications to external systems).

**East-west traffic**
Traffic between workloads or Services *inside* the cluster.

### 17.7 Networking and policy

**CNI (Container Network Interface)**
The plugin model Kubernetes uses to configure Pod networking: assigning IPs, creating interfaces, setting routes, and (depending on the plugin) enforcing network policy. Examples include Calico, Cilium, and Flannel.

**Pod network**
The flat network that gives every Pod its own IP and lets Pods communicate across nodes without NAT, as required by the Kubernetes networking model.

**Service dataplane**
The mechanism that translates a Service's stable virtual address into one of its backend Pod addresses — implemented with iptables, IPVS, eBPF, or vendor-specific logic.

**NetworkPolicy**
A resource that defines which ingress and egress traffic is permitted for selected Pods, by Pod, namespace, IP block, protocol, and port. Default-deny posture is built by applying policies. Enforcement depends on the CNI supporting it.

**NetworkPolicy selector**
The Pod, namespace, or IP-block matching rule a NetworkPolicy uses to decide which Pods it applies to and which peers are allowed.

**Multus**
A meta-CNI plugin that attaches multiple network interfaces to a Pod, used heavily in telecom/edge for separating management, control, and user-plane traffic.

**SR-IOV**
A hardware feature that partitions a physical network card into many virtual functions, giving Pods near-native network performance — common for high-throughput telecom workloads.

**DPDK**
A set of userspace libraries that bypass the kernel network stack for very high packet throughput, used by performance-critical network functions.

### 17.8 Storage and configuration

**CSI (Container Storage Interface)**
The plugin model Kubernetes uses to connect to storage systems, implementing attach, mount, resize, snapshot, clone, and detach. Decouples Kubernetes from specific storage vendors.

**PersistentVolume (PV)**
A piece of storage made available to the cluster, either pre-provisioned by an administrator or dynamically provisioned via a StorageClass. Represents the actual capacity.

**PersistentVolumeClaim (PVC)**
An application's request for storage of a certain size and access mode. A PVC binds to a matching PV; Pods mount the PVC, not the PV directly.

**StorageClass**
A description of how storage should be provisioned: driver, performance tier, topology, volume binding mode, and reclaim policy. Enables dynamic provisioning of PVs on demand.

**Reclaim policy**
What happens to a PV when its PVC is deleted — `Retain` (keep the data), `Delete` (remove the underlying volume). Governs whether data outlives the claim.

**Volume**
A directory, possibly backed by storage, accessible to the containers in a Pod. Ranges from ephemeral (`emptyDir`) to persistent (PVC-backed).

### 17.9 Scheduling, resources, and scaling

**Resource request**
The amount of CPU, memory, or other resource a container is guaranteed; the scheduler uses requests to decide which node a Pod fits on.

**Resource limit**
The maximum runtime consumption allowed for a container resource; exceeding a memory limit causes an OOM kill, exceeding a CPU limit causes throttling.

**QoS class**
A classification Kubernetes derives from requests and limits — **Guaranteed** (requests equal limits), **Burstable** (requests below limits), **BestEffort** (none set) — that governs eviction order under resource pressure.

**Taint**
An attribute on a node that repels Pods which do not explicitly tolerate it. Used to reserve nodes (e.g., control-plane nodes, GPU nodes).

**Toleration**
A declaration on a Pod that allows it to be scheduled onto a node with a matching taint. Taints and tolerations work as a pair.

**Affinity**
A rule expressing required (`requiredDuringScheduling`) or preferred (`preferredDuringScheduling`) placement — node affinity (Pod toward nodes) and Pod affinity (Pod toward other Pods).

**Anti-affinity**
A rule discouraging or preventing selected Pods from sharing a node or topology domain, used to spread replicas for resilience.

**Topology spread constraint**
A rule that distributes replicas evenly across topology domains (zones, racks, hosts) to limit the blast radius of a single-domain failure.

**Priority and preemption**
PriorityClasses rank Pods; when capacity is scarce, the scheduler can **preempt** (evict) lower-priority Pods to make room for higher-priority ones. Misconfigured priorities can cause cascading evictions.

**Eviction**
The kubelet's termination of Pods when a node is under memory, disk, or PID pressure, following QoS and priority ordering to protect node stability.

**HorizontalPodAutoscaler (HPA)**
A controller that adjusts a workload's replica count up or down based on CPU, memory, or custom metrics.

**Vertical scaling**
Changing a workload's resource requests and limits (often via a Vertical Pod Autoscaler), which may require restarting Pods to take effect.

**Cluster autoscaler**
A mechanism that adds nodes when Pods cannot be scheduled for lack of capacity and removes underused nodes when safe.

**PodDisruptionBudget (PDB)**
A policy that limits how many Pods of a workload may be voluntarily disrupted at once (during drains, upgrades), protecting availability during maintenance.

### 17.10 Security and access control

**Authentication**
The stage that establishes *who* is making a request — via client certificates, bearer tokens, service-account tokens, or OIDC. Identity only; it does not grant permissions.

**Authorization**
The stage that decides *whether* an authenticated identity may perform a verb on a resource. RBAC is the usual model.

**RBAC (Role-Based Access Control)**
Authorization based on Roles/ClusterRoles (sets of allowed verbs on resources) bound to subjects (users, groups, service accounts) via RoleBindings/ClusterRoleBindings. The standard way to grant least-privilege access.

**Admission control**
The stage, after authentication and authorization, where admission controllers and webhooks can mutate, validate, or reject a request before it is persisted — enforcing defaults, quotas, image rules, and security policy.

**Pod Security**
Controls (e.g., Pod Security Standards/Admission) that restrict Pod privileges: privilege escalation, host namespaces and host access, Linux capabilities, run-as users, read-only filesystems, and allowed volume types.

**TLS**
Transport Layer Security used to authenticate and encrypt communication between clients, components, and the API server. The cluster depends on a web of certificates and certificate authorities that must be protected and rotated.

**Certificate authority (CA)**
The trust root that signs the certificates used across the control plane. Compromise of a CA compromises cluster trust, so CA keys are among the most sensitive assets.

**ResourceQuota**
A namespace-scoped policy capping aggregate resource consumption (CPU, memory, object counts) for a tenant.

**LimitRange**
A namespace-scoped policy that sets default, minimum, and maximum resource requests/limits per Pod or container, keeping individual workloads within bounds.

**Audit log**
A chronological record of requests to the API server (who did what, when, and the outcome), essential for security forensics and compliance.

### 17.11 Delivery, extensibility, and platform engineering

**CRD (CustomResourceDefinition)**
An extension that registers a brand-new resource type with the Kubernetes API, so custom objects can be managed with the same tools and reconciliation model as built-in ones.

**Operator**
A controller-based application that encodes operational knowledge for a specific system — installing, configuring, backing up, upgrading, failing over, and repairing it — usually built on CRDs.

**Helm**
A packaging and templating tool that distributes Kubernetes resources as versioned, parameterized **charts**, simplifying installation and upgrades.

**Chart**
A Helm package: a bundle of templated manifests plus default values, installed as a named release.

**Kustomize**
A template-free configuration-composition tool that layers environment-specific **overlays** on top of a shared **base** set of manifests.

**GitOps**
An operating model where version-controlled desired state in Git is continuously reconciled into the live cluster by a controller (e.g., Argo CD, Flux). Git becomes the source of truth and the audit trail.

**Progressive delivery**
Release techniques — canary, blue-green, weighted rollout, shadow traffic — that expose new versions gradually and allow fast rollback, reducing release risk.

### 17.12 Telecom, edge, and hardware

**CNF (Cloud-native Network Function)**
A network function (firewall, router, 5G core element) implemented using cloud-native, containerized patterns and run on Kubernetes, replacing older VM-based VNFs.

**Bare-metal Kubernetes**
Kubernetes running directly on physical servers with no virtualization layer, chosen for performance, hardware access (SR-IOV, GPUs), and cost in telecom and high-performance environments.

**CPU pinning**
Binding a container's threads to specific CPU cores for predictable, low-latency performance, important for packet-processing workloads.

**Hugepages**
Larger-than-default memory pages that reduce memory-management overhead, requested by performance-sensitive workloads such as DPDK applications.

**NUMA placement**
Scheduling that keeps a workload's CPU, memory, and devices on the same Non-Uniform Memory Access node to avoid cross-node latency penalties.

---

**Final takeaway:** read the topic sections to understand *how* the pieces interact, and use the Dictionary as a quick-reference appendix when you encounter an unfamiliar term.

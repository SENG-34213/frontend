import {
  StudentProfile,
  Course,
  Assignment,
  Quiz,
  Examination,
  LearningMaterial,
  CalendarEvent,
  Conversation,
  Announcement,
  NotificationItem,
  ChatMessage,
} from "../types";

export const INITIAL_STUDENT_PROFILE: StudentProfile = {
  id: "std_alex_rivera_01",
  studentId: "MENT-2026-CS884",
  name: "Alex Rivera",
  email: "alex.rivera@mentify.edu",
  avatar: "",
  role: "STUDENT",
  institution: "Mentify Institute of Science & Technology",
  department: "Department of Computer Science & Engineering",
  degreeProgram: "B.S. in Computer Science (Honors)",
  semester: "Semester 7 (Fall 2026)",
  currentGpa: 3.88,
  creditsCompleted: 104,
  totalCreditsRequired: 128,
  academicAdvisor: {
    name: "Dr. Elena Rostova",
    email: "elena.rostova@mentify.edu",
    office: "Turing Hall, Suite 412",
  },
  phone: "+1 (555) 382-9014",
  bio: "Senior computer science student focused on distributed systems, machine learning pipelines, and cloud native architectures. President of the Mentify Open Source Club.",
  joinedDate: "August 2023",
};

export const INITIAL_COURSES: Course[] = [
  {
    id: "course-cs301",
    code: "CS 301",
    title: "Data Structures & Algorithmic Analysis",
    category: "Computer Science",
    description:
      "Advanced data structures including balanced search trees, B-Trees, graph traversals, amortized complexity analysis, dynamic programming, and greedy algorithms with rigorous verification.",
    instructor: {
      id: "inst-1",
      name: "Prof. Marcus Vance",
      title: "Associate Professor of Computer Science",
      avatar: "",
      department: "Algorithms & Theoretical CS",
      officeHours: "Tues & Thurs 2:00 PM – 4:00 PM",
      email: "m.vance@mentify.edu",
    },
    bannerColor: "from-indigo-600 to-indigo-900",
    enrolled: true,
    enrollmentStatus: "ACTIVE",
    progressPercentage: 68,
    lastAccessedLessonId: "les-cs301-3-2",
    lastAccessedLessonTitle: "Dijkstra and A* Shortest Path Graph Optimization",
    credits: 4,
    level: "Intermediate",
    schedule: "Mon, Wed, Fri · 10:00 AM – 11:30 AM",
    room: "Turing Hall 104",
    enrolledStudentsCount: 64,
    rating: 4.9,
    currentGrade: "A",
    currentScorePercentage: 94.2,
    modules: [
      {
        id: "mod-1",
        title: "Module 1: Asymptotic Notation & Balanced Trees",
        description:
          "Big-O, Omega, Theta formalisms, Master Theorem, and self-balancing Red-Black trees.",
        lessons: [
          {
            id: "les-cs301-1-1",
            moduleId: "mod-1",
            title: "1.1 Formal Rigor of Asymptotic Complexity",
            durationMinutes: 45,
            type: "video",
            completed: true,
            content: `In this lecture, we establish the strict mathematical bounds of algorithm efficiency. We analyze tight bounds $\\Theta(g(n))$, upper bounds $\\mathcal{O}(g(n))$, and lower bounds $\\Omega(g(n))$.

### Formal Definition of Big-O
A function $f(n) \\in \\mathcal{O}(g(n))$ if there exist positive constants $c$ and $n_0$ such that:
$$0 \\le f(n) \\le c \\cdot g(n) \\quad \\forall n \\ge n_0$$

### Key Complexity Classes
- $\\mathcal{O}(1)$: Constant time (hash table lookups, pointer dereferences)
- $\\mathcal{O}(\\log n)$: Logarithmic time (binary search, balanced tree lookups)
- $\\mathcal{O}(n)$: Linear time (array traversal, single accumulator passes)
- $\\mathcal{O}(n \\log n)$: Linearithmic (MergeSort, QuickSort average case, HeapSort)
- $\\mathcal{O}(n^2)$: Quadratic (nested loops, BubbleSort, naive pairwise comparisons)`,
            codeSnippet: {
              language: "python",
              code: `def binary_search(arr: list[int], target: int) -> int:
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
            },
          },
          {
            id: "les-cs301-1-2",
            moduleId: "mod-1",
            title: "1.2 Red-Black Trees & Left-Leaning Rotations",
            durationMinutes: 50,
            type: "interactive",
            completed: true,
            content: `Red-black trees guarantee $\\mathcal{O}(\\log n)$ worst-case time for insertion, deletion, and search. Every node is colored either red or black, satisfying four fundamental invariants:

1. Root is always black.
2. No two red nodes are adjacent (a red node cannot have a red child).
3. Every path from a node to any of its descendant null leaves contains the same number of black nodes (black-height).
4. Null leaf pointers are considered black nodes.`,
          },
        ],
      },
      {
        id: "mod-2",
        title: "Module 2: Advanced Graph Algorithms",
        description: "Breadth-First, Depth-First, Topological Sort, and Disjoint Set Union (DSU).",
        lessons: [
          {
            id: "les-cs301-2-1",
            moduleId: "mod-2",
            title: "2.1 Graph Representation & Topological Sorting",
            durationMinutes: 40,
            type: "video",
            completed: true,
            content: `Directed Acyclic Graphs (DAGs) model dependencies in builds, scheduling, and curriculum pre-requisites. Kahn's Algorithm leverages indegree tracking to achieve $\\mathcal{O}(V + E)$ topological ordering.`,
          },
          {
            id: "les-cs301-2-2",
            moduleId: "mod-2",
            title: "2.2 Disjoint Set Union (Union-Find) with Path Compression",
            durationMinutes: 35,
            type: "exercise",
            completed: true,
            content: `DSU achieves nearly $\\mathcal{O}(1)$ amortized runtime $(\\mathcal{O}(\\alpha(n)))$ using two optimizations: union by rank and path compression during Find operations.`,
            codeSnippet: {
              language: "typescript",
              code: `class UnionFind {
  private parent: number[];
  private rank: number[];

  constructor(size: number) {
    this.parent = Array.from({ length: size }, (_, i) => i);
    this.rank = new Array(size).fill(0);
  }

  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // Path compression
    }
    return this.parent[x];
  }

  union(x: number, y: number): boolean {
    const rootX = this.find(x);
    const rootY = this.find(y);
    if (rootX === rootY) return false;

    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
    } else {
      this.parent[rootY] = rootX;
      this.rank[rootX]++;
    }
    return true;
  }
}`,
            },
          },
        ],
      },
      {
        id: "mod-3",
        title: "Module 3: Shortest Paths & Minimum Spanning Trees",
        description: "Dijkstra, Bellman-Ford, Kruskal, and Prim algorithms with priority queues.",
        lessons: [
          {
            id: "les-cs301-3-1",
            moduleId: "mod-3",
            title: "3.1 Priority Queues & Min-Heap Foundations",
            durationMinutes: 30,
            type: "reading",
            completed: true,
            content: `Binary heaps represent complete binary trees mapped directly inside contiguous arrays. Index arithmetic provides parent at $\\lfloor(i-1)/2\\rfloor$, left child at $2i + 1$, and right child at $2i + 2$.`,
          },
          {
            id: "les-cs301-3-2",
            moduleId: "mod-3",
            title: "3.2 Dijkstra and A* Shortest Path Graph Optimization",
            durationMinutes: 55,
            type: "interactive",
            completed: false,
            content: `Dijkstra's algorithm solves the single-source shortest path problem on weighted directed graphs with non-negative edge weights. When augmented with an admissible heuristic $h(n) \\le h^*(n)$, A* heuristic search prunes redundant state space exploration dramatically.

### Complexity Analysis
- Using Min-Heap: $\\mathcal{O}((V + E) \\log V)$
- Using Fibonacci Heap: $\\mathcal{O}(E + V \\log V)$

### Key Invariant
At step $k$, the vertex extracted from the min-priority queue has its definitive minimum distance finalized. Negative cycle detection requires Bellman-Ford.`,
            codeSnippet: {
              language: "python",
              code: `import heapq

def dijkstra(graph: dict[str, list[tuple[str, int]]], start: str) -> dict[str, int]:
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    pq = [(0, start)]

    while pq:
        curr_dist, u = heapq.heappop(pq)
        if curr_dist > distances[u]:
            continue

        for v, weight in graph[u]:
            dist = curr_dist + weight
            if dist < distances[v]:
                distances[v] = dist
                heapq.heappush(pq, (dist, v))

    return distances`,
            },
            downloadableResources: [
              { name: "Dijkstra_Proof_and_Implementation.pdf", size: "2.4 MB", format: "PDF" },
              { name: "graph_benchmark_dataset.json", size: "840 KB", format: "JSON" },
            ],
          },
          {
            id: "les-cs301-3-3",
            moduleId: "mod-3",
            title: "3.3 Bellman-Ford & Negative Weight Cycle Detection",
            durationMinutes: 45,
            type: "video",
            completed: false,
            content: `Relaxing all $|V|-1$ edges ensures distance convergence. A subsequent $|V|$-th relaxation pass that still lowers distances proves the presence of a reachable negative-weight cycle.`,
          },
        ],
      },
    ],
  },
  {
    id: "course-cs440",
    code: "CS 440",
    title: "Applied Machine Learning & Neural Networks",
    category: "Artificial Intelligence",
    description:
      "Statistical learning theory, convex optimization, convolutional networks, attention mechanisms, transformers, and model evaluation metrics for enterprise AI deployments.",
    instructor: {
      id: "inst-2",
      name: "Dr. Sarah Lin-Wu",
      title: "Principal Research Fellow & Lecturer",
      avatar: "",
      department: "Data Science & Machine Intelligence",
      officeHours: "Wed 3:00 PM – 5:00 PM",
      email: "s.linwu@mentify.edu",
    },
    bannerColor: "from-purple-600 to-indigo-900",
    enrolled: true,
    enrollmentStatus: "ACTIVE",
    progressPercentage: 74,
    lastAccessedLessonId: "les-cs440-2-3",
    lastAccessedLessonTitle: "Self-Attention & Multi-Head Transformer Mathematics",
    credits: 4,
    level: "Advanced",
    schedule: "Tue, Thu · 11:00 AM – 12:30 PM",
    room: "Hopper Auditorium 201",
    enrolledStudentsCount: 52,
    rating: 4.95,
    currentGrade: "A-",
    currentScorePercentage: 91.8,
    modules: [
      {
        id: "mod-ml-1",
        title: "Module 1: Gradient Descent & Loss Landscapes",
        description: "Cross-entropy, backpropagation derivation, and Adam optimizer dynamics.",
        lessons: [
          {
            id: "les-cs440-1-1",
            moduleId: "mod-ml-1",
            title: "1.1 Vectorized Backpropagation Derivation",
            durationMinutes: 50,
            type: "video",
            completed: true,
            content: `We derive the chain rule for matrix calculus:
$$\\frac{\\partial L}{\\partial W^{(l)}} = \\delta^{(l)} \\cdot (a^{(l-1)})^T$$
where $\\delta^{(l)} = ((W^{(l+1)})^T \\delta^{(l+1)}) \\odot \\sigma'(z^{(l)})$. Vectorization avoids explicit Python loops, scaling across GPU tensor cores.`,
          },
        ],
      },
      {
        id: "mod-ml-2",
        title: "Module 2: Transformers & Sequence Models",
        description: "Scaled dot-product attention, positional embeddings, and rotary embeddings.",
        lessons: [
          {
            id: "les-cs440-2-3",
            moduleId: "mod-ml-2",
            title: "2.3 Self-Attention & Multi-Head Transformer Mathematics",
            durationMinutes: 60,
            type: "video",
            completed: false,
            content: `Attention is defined as:
$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$

Scaling by $\\frac{1}{\\sqrt{d_k}}$ prevents vanishing gradients in the softmax function for large inner-product dimensions.`,
            codeSnippet: {
              language: "python",
              code: `import torch
import torch.nn as nn
import math

class ScaledDotProductAttention(nn.Module):
    def __init__(self, d_k: int):
        super().__init__()
        self.scale = 1.0 / math.sqrt(d_k)

    def forward(self, q, k, v, mask=None):
        scores = torch.matmul(q, k.transpose(-2, -1)) * self.scale
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)
        attn_weights = torch.softmax(scores, dim=-1)
        return torch.matmul(attn_weights, v), attn_weights`,
            },
          },
        ],
      },
    ],
  },
  {
    id: "course-cs325",
    code: "CS 325",
    title: "Cloud Architecture & Distributed Systems",
    category: "Software Systems",
    description:
      "Consensus protocols (Raft, Paxos), CAP theorem, distributed transactions, event-driven messaging, Kafka streaming, container orchestration, and fault tolerance.",
    instructor: {
      id: "inst-3",
      name: "Dr. Tariq Al-Mansoor",
      title: "Distinguished Systems Architect & Professor",
      avatar: "",
      department: "Distributed Systems & Cloud Computing",
      officeHours: "Mon 1:00 PM – 3:00 PM",
      email: "t.almansoor@mentify.edu",
    },
    bannerColor: "from-blue-600 to-slate-900",
    enrolled: true,
    enrollmentStatus: "ACTIVE",
    progressPercentage: 55,
    lastAccessedLessonId: "les-cs325-2-1",
    lastAccessedLessonTitle: "Raft Leader Election & Log Replication",
    credits: 3,
    level: "Advanced",
    schedule: "Mon, Wed · 2:00 PM – 3:30 PM",
    room: "Shannon Hall 310",
    enrolledStudentsCount: 48,
    rating: 4.88,
    currentGrade: "A",
    currentScorePercentage: 93.0,
    modules: [
      {
        id: "mod-cs325-1",
        title: "Module 1: Consistency Models & CAP Theorem",
        description:
          "Linearizability vs Eventual Consistency, Vector Clocks, and Lamport Timestamps.",
        lessons: [
          {
            id: "les-cs325-1-1",
            moduleId: "mod-cs325-1",
            title: "1.1 Lamport Logical Clocks and Causality",
            durationMinutes: 40,
            type: "reading",
            completed: true,
            content: `Distributed nodes lack synchronized physical clocks due to relativistic clock drift and network jitter. Lamport clocks assign partial orders to events: if $a \\to b$, then $C(a) < C(b)$.`,
          },
        ],
      },
    ],
  },
  {
    id: "course-des210",
    code: "DES 210",
    title: "Design Systems & UI Engineering",
    category: "Human-Computer Interaction",
    description:
      "Design token architecture, accessibility compliance (WCAG 2.2 AA), component micro-interactions, responsive fluid typography, and design-to-code pipelines.",
    instructor: {
      id: "inst-4",
      name: "Claire Beauchamp",
      title: "Senior Lecturer in Human-Computer Interaction",
      avatar: "",
      department: "HCI & Interactive Design",
      officeHours: "Fri 10:00 AM – 12:00 PM",
      email: "c.beauchamp@mentify.edu",
    },
    bannerColor: "from-emerald-600 to-teal-950",
    enrolled: true,
    enrollmentStatus: "ACTIVE",
    progressPercentage: 82,
    lastAccessedLessonId: "les-des210-3-1",
    lastAccessedLessonTitle: "Focus Management & Keyboard Navigation Traps",
    credits: 3,
    level: "Intermediate",
    schedule: "Tue, Thu · 9:30 AM – 11:00 AM",
    room: "Design Studio Lab 12",
    enrolledStudentsCount: 38,
    rating: 4.92,
    currentGrade: "A+",
    currentScorePercentage: 97.5,
    modules: [
      {
        id: "mod-des-1",
        title: "Module 1: Design Tokens & Spatial Math",
        description: "Color contrast ratios, 8pt spatial grid, radius nesting mathematics.",
        lessons: [
          {
            id: "les-des-1-1",
            moduleId: "mod-des-1",
            title: "1.1 Nested Radius Mathematics",
            durationMinutes: 35,
            type: "video",
            completed: true,
            content: `The golden formula for nested containers:
$$r_{\\text{inner}} = r_{\\text{outer}} - \\text{padding}$$
When $r_{\\text{inner}} \\le 0$, inner corners should remain sharp.`,
          },
        ],
      },
    ],
  },
  {
    id: "course-cs412",
    code: "CS 412",
    title: "Database Internals & High-Throughput Engines",
    category: "Computer Science",
    description:
      "LSM Trees, B+ Tree indexing, Write-Ahead Logging (WAL), MVCC concurrency control, query plan execution and optimizer cost models.",
    instructor: {
      id: "inst-5",
      name: "Dr. Gregory Thorne",
      title: "Professor of Database Engineering",
      avatar: "",
      department: "Computer Systems Architecture",
      officeHours: "Wed 10:00 AM – 12:00 PM",
      email: "g.thorne@mentify.edu",
    },
    bannerColor: "from-amber-600 to-amber-950",
    enrolled: true,
    enrollmentStatus: "ACTIVE",
    progressPercentage: 42,
    credits: 3,
    level: "Advanced",
    schedule: "Mon, Wed · 4:00 PM – 5:30 PM",
    room: "Turing Hall 204",
    enrolledStudentsCount: 44,
    rating: 4.84,
    currentGrade: "B+",
    currentScorePercentage: 88.5,
    modules: [],
  },
  {
    id: "course-sec340",
    code: "SEC 340",
    title: "Applied Cryptography & Security Protocols",
    category: "Cybersecurity",
    description:
      "Public-key cryptography (RSA, Elliptic Curves), zero-knowledge proofs, TLS 1.3 handshake protocols, and authenticated symmetric encryption.",
    instructor: {
      id: "inst-6",
      name: "Dr. Angela Sterling",
      title: "Chair of Cybersecurity Systems",
      avatar: "",
      department: "Information Security & Privacy",
      officeHours: "Thu 1:00 PM – 3:00 PM",
      email: "a.sterling@mentify.edu",
    },
    bannerColor: "from-rose-600 to-slate-900",
    enrolled: true,
    enrollmentStatus: "ACTIVE",
    progressPercentage: 90,
    credits: 3,
    level: "Advanced",
    schedule: "Tue, Thu · 3:30 PM – 5:00 PM",
    room: "Diffie-Hellman Auditorium",
    enrolledStudentsCount: 56,
    rating: 4.96,
    currentGrade: "A",
    currentScorePercentage: 94.8,
    modules: [],
  },
  // Additional courses available for Explore & Enroll:
  {
    id: "course-exp-1",
    code: "CS 480",
    title: "Quantum Computing Algorithms & Qiskit",
    category: "Computer Science",
    description:
      "Qubits, superposition, entanglement, Grover search algorithm, Shor factoring, and quantum circuit simulation with IBM Qiskit framework.",
    instructor: {
      id: "inst-7",
      name: "Prof. Julian Vance",
      title: "Fellow of Quantum Informatics",
      avatar: "",
      department: "Quantum Information Lab",
      officeHours: "Tues 11:00 AM – 1:00 PM",
      email: "j.vance@mentify.edu",
    },
    bannerColor: "from-violet-700 to-purple-950",
    enrolled: false,
    enrollmentStatus: "AVAILABLE",
    progressPercentage: 0,
    credits: 4,
    level: "Advanced",
    schedule: "Wed, Fri · 1:00 PM – 2:30 PM",
    room: "Bohr Quantum Lab 4",
    enrolledStudentsCount: 32,
    rating: 4.91,
    modules: [],
  },
  {
    id: "course-exp-2",
    code: "BIO 310",
    title: "Computational Genomics & Sequence Alignment",
    category: "Bioinformatics",
    description:
      "Dynamic programming for Needleman-Wunsch & Smith-Waterman sequence alignment, BLAST heuristics, hidden Markov models for gene annotation, and phylogenetic trees.",
    instructor: {
      id: "inst-8",
      name: "Dr. Rachel Zimmerman",
      title: "Director of Computational Biology",
      avatar: "",
      department: "Bioinformatics & Systems Biology",
      officeHours: "Mon, Fri 9:00 AM – 10:30 AM",
      email: "r.zimmerman@mentify.edu",
    },
    bannerColor: "from-teal-600 to-emerald-950",
    enrolled: false,
    enrollmentStatus: "AVAILABLE",
    progressPercentage: 0,
    credits: 3,
    level: "Intermediate",
    schedule: "Mon, Wed · 11:00 AM – 12:30 PM",
    room: "Franklin BioLab 201",
    enrolledStudentsCount: 40,
    rating: 4.85,
    modules: [],
  },
  {
    id: "course-exp-3",
    code: "ENG 405",
    title: "Autonomous Robotics & SLAM Systems",
    category: "Robotics",
    description:
      "Simultaneous Localization and Mapping (SLAM), Extended Kalman Filtering, particle filters, LiDAR point cloud processing, and ROS 2 middleware.",
    instructor: {
      id: "inst-9",
      name: "Dr. Kenneth Sato",
      title: "Professor of Robotics & Mechatronics",
      avatar: "",
      department: "Robotics Engineering Lab",
      officeHours: "Thu 2:00 PM – 4:00 PM",
      email: "k.sato@mentify.edu",
    },
    bannerColor: "from-amber-600 to-orange-950",
    enrolled: false,
    enrollmentStatus: "AVAILABLE",
    progressPercentage: 0,
    credits: 4,
    level: "Advanced",
    schedule: "Tue, Thu · 1:00 PM – 2:30 PM",
    room: "Asimov Robotics Hangar",
    enrolledStudentsCount: 36,
    rating: 4.94,
    modules: [],
  },
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: "asg-1",
    courseId: "course-cs301",
    courseCode: "CS 301",
    courseTitle: "Data Structures & Algorithmic Analysis",
    title: "Assignment 4: Dijkstra & Multi-Destination Shortest Paths with Fibonacci Heap",
    description:
      "Implement a memory-efficient shortest path routing algorithm that processes directed weighted graphs with over 100,000 vertices.",
    instructions: `You must implement the Fibonacci Heap priority queue and benchmark its asymptotic performance against a standard binary min-heap for Dijkstra's algorithm.

### Requirements:
1. Support vertex extraction in amortized $\\mathcal{O}(\\log V)$ and decrease-key in $\\mathcal{O}(1)$.
2. Detect disconnected subgraphs and return infinite distance vectors.
3. Include unit tests demonstrating edge case handling (cycles, zero-weight edges, dense vs sparse connectivity).
4. Provide a 2-page empirical analysis PDF with runtime plots.`,
    dueDate: "2026-10-22T23:59:00",
    maxScore: 100,
    status: "PENDING",
    priority: "HIGH",
    rubricCriteria: [
      {
        criteria: "Fibonacci Heap Correctness",
        points: 40,
        description: "Passes all automated stress test cases with zero memory leaks.",
      },
      {
        criteria: "Dijkstra Asymptotic Benchmark",
        points: 30,
        description:
          "Demonstrates expected runtime scaling across sparse vs dense graph benchmarks.",
      },
      {
        criteria: "Empirical Performance Report",
        points: 20,
        description: "Clear charts, parameter analysis, and methodology documentation.",
      },
      {
        criteria: "Code Quality & Style",
        points: 10,
        description: "Clean modular architecture, typed interfaces, and unit tests.",
      },
    ],
    attachments: [
      { name: "assignment4_starter_pack.zip", size: "1.8 MB" },
      { name: "large_graph_benchmark.txt", size: "14.2 MB" },
    ],
  },
  {
    id: "asg-2",
    courseId: "course-cs440",
    courseCode: "CS 440",
    courseTitle: "Applied Machine Learning & Neural Networks",
    title: "Assignment 3: Transformer Encoder from Scratch with Multi-Head Attention",
    description:
      "Build a full PyTorch transformer encoder module without using torch.nn.Transformer or pre-built attention primitives.",
    instructions: `Implement:
1. Positional Encoding using sinusoidal basis functions.
2. Multi-Head Attention module with projection layers and scaling.
3. Layer Normalization and residual connections.
4. Train on the provided sequence translation mini-corpus and report perplexity.`,
    dueDate: "2026-10-25T18:00:00",
    maxScore: 100,
    status: "PENDING",
    priority: "MEDIUM",
    rubricCriteria: [
      {
        criteria: "Attention Mathematical Accuracy",
        points: 40,
        description: 'Exact mathematical compliance with "Attention Is All You Need".',
      },
      {
        criteria: "Gradient Verification",
        points: 30,
        description: "Loss converges cleanly without gradient explosion or vanishing.",
      },
      {
        criteria: "Mini-Corpus Perplexity",
        points: 20,
        description: "Achieves validation perplexity under 32.0 on test dataset.",
      },
      {
        criteria: "Documentation & Clean Code",
        points: 10,
        description: "Well-commented docstrings and test assertions.",
      },
    ],
    attachments: [
      { name: "transformer_starter.py", size: "8.4 KB" },
      { name: "translation_mini_dataset.parquet", size: "5.2 MB" },
    ],
  },
  {
    id: "asg-3",
    courseId: "course-des210",
    courseCode: "DES 210",
    courseTitle: "Design Systems & UI Engineering",
    title: "Milestone 2: Accessible Design Token System & WCAG 2.2 AA Contrast Audit",
    description:
      "Construct a multi-brand JSON token dictionary with semantic color mappings and audited dark mode contrast pairings.",
    instructions: "Submit your design token specification repository link and export audit report.",
    dueDate: "2026-10-14T23:59:00",
    maxScore: 100,
    status: "GRADED",
    priority: "MEDIUM",
    submittedDate: "2026-10-13T19:42:15",
    grade: 98,
    letterGrade: "A+",
    feedback:
      "Outstanding work Alex! Your token hierarchy separating primitive, semantic, and component tokens is exemplary. Your automated contrast audit script was adopted by two TA labs.",
    rubricCriteria: [
      {
        criteria: "Token Architecture Hierarchy",
        points: 40,
        description: "Clear abstraction layers from primitives to semantic tokens.",
      },
      {
        criteria: "Contrast Validation (WCAG 2.2 AA)",
        points: 40,
        description: "Every pairing guarantees >= 4.5:1 ratio.",
      },
      {
        criteria: "Documentation & Export System",
        points: 20,
        description: "Automated Style Dictionary generation.",
      },
    ],
    submittedFiles: [
      { name: "alex_rivera_token_system.json", size: "142 KB", uploadedAt: "2026-10-13 19:40" },
      { name: "wcag_audit_report_final.pdf", size: "3.1 MB", uploadedAt: "2026-10-13 19:42" },
    ],
  },
  {
    id: "asg-4",
    courseId: "course-cs325",
    courseCode: "CS 325",
    courseTitle: "Cloud Architecture & Distributed Systems",
    title: "Lab 2: Raft Consensus Election Protocol Implementation",
    description:
      "Implement election timer randomization, RequestVote RPCs, and state transitions for candidate, follower, and leader roles.",
    instructions:
      "Run against our automated chaos testing suite simulating network partitions and packet delays.",
    dueDate: "2026-10-16T23:59:00",
    maxScore: 100,
    status: "SUBMITTED",
    priority: "HIGH",
    submittedDate: "2026-10-16T21:15:00",
    rubricCriteria: [
      {
        criteria: "Split Vote Handling",
        points: 40,
        description: "Randomized election timer avoids split vote lockups.",
      },
      {
        criteria: "Network Partition Resiliency",
        points: 40,
        description: "Minority partition rejects stale writes cleanly.",
      },
      {
        criteria: "Concurrency Safety",
        points: 20,
        description: "Zero race conditions detected under Go race detector.",
      },
    ],
    submittedFiles: [
      { name: "raft_election_submission.tar.gz", size: "420 KB", uploadedAt: "2026-10-16 21:14" },
    ],
  },
];

export const INITIAL_QUIZZES: Quiz[] = [
  {
    id: "quiz-cs301-1",
    courseId: "course-cs301",
    courseCode: "CS 301",
    courseTitle: "Data Structures & Algorithmic Analysis",
    title: "Knowledge Check: Balanced Trees & Graph Foundations",
    description:
      "Test your understanding of Red-Black tree invariants, topological sorting complexity, and DSU path compression.",
    durationMinutes: 20,
    questionsCount: 5,
    totalPoints: 25,
    status: "AVAILABLE",
    dueDate: "2026-10-23T23:59:00",
    attemptsAllowed: 2,
    attemptsUsed: 0,
    questions: [
      {
        id: "q1",
        prompt:
          "In a standard Red-Black tree, what is the maximum possible height of a tree with n internal nodes?",
        type: "multiple-choice",
        options: [
          { id: "opt-a", text: "2 * log2(n + 1)" },
          { id: "opt-b", text: "log2(n)" },
          { id: "opt-c", text: "1.44 * log2(n)" },
          { id: "opt-d", text: "3 * log2(n)" },
        ],
        correctAnswerIds: ["opt-a"],
        explanation:
          "By the Red-Black tree black-height property, the shortest path has length bh(T) and the longest path has at most 2*bh(T), establishing height h <= 2 * log2(n + 1).",
        points: 5,
      },
      {
        id: "q2",
        prompt:
          "Which of the following operations run in amortized O(alpha(n)) time in Disjoint Set Union (DSU) when using both union by rank and path compression?",
        type: "multiple-choice",
        options: [
          { id: "opt-a", text: "Both Find and Union operations" },
          { id: "opt-b", text: "Only the Find operation" },
          { id: "opt-c", text: "Only the Union operation" },
          { id: "opt-d", text: "Neither, runtime is strictly O(log n)" },
        ],
        correctAnswerIds: ["opt-a"],
        explanation:
          "Both Find and Union invoke Find to locate root representatives, meaning both operations achieve amortized O(alpha(n)) where alpha is the inverse Ackermann function.",
        points: 5,
      },
      {
        id: "q3",
        prompt: "Select all valid invariants that MUST hold true in every valid Red-Black Tree:",
        type: "multi-select",
        options: [
          { id: "opt-a", text: "The root node is always Black." },
          { id: "opt-b", text: "Red nodes may never have Red child nodes." },
          { id: "opt-c", text: "Every leaf (NIL pointer) is considered Black." },
          { id: "opt-d", text: "All nodes on level 1 must be Red." },
        ],
        correctAnswerIds: ["opt-a", "opt-b", "opt-c"],
        explanation:
          "Invariants 1, 2, and 3 are foundational rules of Red-Black trees. Level 1 nodes can be black as long as black heights remain equal.",
        points: 5,
      },
      {
        id: "q4",
        prompt:
          "What is the asymptotic time complexity of Kahn's Algorithm for topological sorting on a directed graph G = (V, E) using adjacency lists?",
        type: "multiple-choice",
        options: [
          { id: "opt-a", text: "O(V + E)" },
          { id: "opt-b", text: "O(V * log V)" },
          { id: "opt-c", text: "O(V * E)" },
          { id: "opt-d", text: "O(V^2)" },
        ],
        correctAnswerIds: ["opt-a"],
        explanation:
          "Kahn's algorithm processes each vertex once and decrements each edge indegree once, yielding optimal linear O(V + E) runtime.",
        points: 5,
      },
      {
        id: "q5",
        prompt:
          "True or False: Dijkstra's algorithm with standard min-heaps guarantees correct shortest paths on graphs containing negative edge weights if there are no negative cycles.",
        type: "true-false",
        options: [
          { id: "opt-true", text: "True" },
          { id: "opt-false", text: "False" },
        ],
        correctAnswerIds: ["opt-false"],
        explanation:
          "False. Dijkstra greedily finalizes vertex distances once popped from the priority queue. A negative edge encountered later could invalidate previously finalized distances. Bellman-Ford must be used.",
        points: 5,
      },
    ],
  },
  {
    id: "quiz-cs440-1",
    courseId: "course-cs440",
    courseCode: "CS 440",
    courseTitle: "Applied Machine Learning & Neural Networks",
    title: "Quiz 2: Optimization, Cross-Entropy & Attention Mechanics",
    description:
      "Assessment covering gradient calculation, attention scaling rationale, and regularization techniques.",
    durationMinutes: 15,
    questionsCount: 4,
    totalPoints: 20,
    status: "COMPLETED",
    dueDate: "2026-10-12T23:59:00",
    attemptsAllowed: 1,
    attemptsUsed: 1,
    lastScore: 19,
    lastScorePercentage: 95,
    questions: [],
  },
];

export const INITIAL_EXAMINATIONS: Examination[] = [
  {
    id: "exam-1",
    courseId: "course-cs301",
    courseCode: "CS 301",
    courseTitle: "Data Structures & Algorithmic Analysis",
    title: "Midterm Examination: Theoretical Foundations & Graph Algorithms",
    type: "MIDTERM",
    scheduledDate: "2026-10-28",
    startTime: "10:00 AM – 12:00 PM",
    durationMinutes: 120,
    location: "Turing Examination Hall A (Section 4)",
    proctorName: "Prof. Marcus Vance & Head TAs",
    status: "UPCOMING",
    totalMarks: 100,
    weightPercentage: 25,
    rules: [
      "Proctored closed-book exam. Only one double-sided handwritten 8.5x11 inch formula cheat sheet is permitted.",
      "Laptops must remain locked in the secure examination browser kiosk mode.",
      "Calculators, smartwatches, and cellphones must be stowed in backpacks at the front of the hall.",
      "Students must present their active Mentify Student Photo ID card prior to starting.",
      "Once submitted or when the 120-minute countdown concludes, answers are immediately finalized and immutable.",
    ],
    questions: [
      {
        id: "eq1",
        prompt:
          "Prove the runtime of Dijkstra's algorithm when using a Fibonacci heap compared to a standard binary heap. Which term dominates in dense graphs where E is approximately V^2?",
        type: "multiple-choice",
        options: [
          {
            id: "eopt-1",
            text: "Fibonacci heap runs in O(E + V log V); for dense graphs, O(E) dominates and runs in O(V^2).",
          },
          {
            id: "eopt-2",
            text: "Binary heap runs in O(E log V); it is strictly faster than Fibonacci heap in dense graphs.",
          },
          {
            id: "eopt-3",
            text: "Both data structures run in identical O(V^2 log V) in all topological arrangements.",
          },
          { id: "eopt-4", text: "Fibonacci heap runs in O(V^3) due to cascading cuts." },
        ],
        correctAnswerIds: ["eopt-1"],
        explanation:
          "Because Fibonacci heap supports decrease-key in O(1) amortized time, the E decrease-key calls cost O(E) total. With V extract-mins at O(log V), total time is O(E + V log V). For dense graphs, O(V^2) dominates.",
        points: 25,
      },
      {
        id: "eq2",
        prompt:
          "Consider Kruskal's algorithm for Minimum Spanning Trees. What ensures that cycles are never formed during edge selection?",
        type: "multiple-choice",
        options: [
          {
            id: "eopt-a",
            text: "Disjoint Set Union (DSU) Find checks: if find(u) == find(v), the edge is discarded.",
          },
          {
            id: "eopt-b",
            text: "Topological sort verifies vertex degrees before each edge insertion.",
          },
          { id: "eopt-c", text: "Edges are sorted in descending order of weight." },
          {
            id: "eopt-d",
            text: "A depth-first search is executed from vertex 0 after every candidate edge.",
          },
        ],
        correctAnswerIds: ["eopt-a"],
        explanation:
          "The Disjoint Set Union structure checks whether endpoints u and v already reside within the same connected component. If find(u) == find(v), adding (u,v) would introduce a cycle.",
        points: 25,
      },
    ],
  },
  {
    id: "exam-2",
    courseId: "course-des210",
    courseCode: "DES 210",
    courseTitle: "Design Systems & UI Engineering",
    title: "Comprehensive Midterm: Design Tokens, Typography Scales & Accessibility Systems",
    type: "MIDTERM",
    scheduledDate: "2026-10-10",
    startTime: "09:00 AM – 10:30 AM",
    durationMinutes: 90,
    location: "Design Lab 4",
    proctorName: "Claire Beauchamp",
    status: "COMPLETED",
    totalMarks: 100,
    weightPercentage: 20,
    score: 96,
    scorePercentage: 96,
    letterGrade: "A+",
    rules: ["Open portfolio review and practical system token coding assessment."],
  },
];

export const INITIAL_MATERIALS: LearningMaterial[] = [
  {
    id: "mat-1",
    courseId: "course-cs301",
    courseCode: "CS 301",
    courseTitle: "Data Structures & Algorithmic Analysis",
    title: "Comprehensive Lecture Notes: Balanced Search Trees & Amortized Analysis",
    description:
      "Detailed formal lecture notes on Red-Black trees, Left-Leaning Red-Black variants, 2-3-4 trees equivalence, and potential method amortized bounds.",
    type: "PDF",
    fileSize: "4.8 MB",
    uploadedDate: "2026-10-11",
    downloadsCount: 142,
    previewUrl: "https://mentify.edu/materials/cs301-balanced-trees.pdf",
    contentSnippet: `Chapter 4: Balanced Binary Search Trees
Section 4.1: The Isomorphism with 2-3-4 Trees
Every Red-Black tree is structurally isomorphic to a 2-3-4 B-tree of minimum degree t=2.
A 3-node containing values [A, B] is represented as a black node containing B with a left red child containing A.
This direct mapping guarantees that the height of the RB tree never exceeds 2 * log2(n+1).

Section 4.2: The Four Rotations
- Left Rotation at node x
- Right Rotation at node y
- Double Rotation (Left-Right and Right-Left)
All rotations execute in strict O(1) time by re-pointing at most 6 pointers.`,
  },
  {
    id: "mat-2",
    courseId: "course-cs440",
    courseCode: "CS 440",
    courseTitle: "Applied Machine Learning & Neural Networks",
    title: "Transformer Architecture Mathematical Cheat Sheet & Tensor Dimensions",
    description:
      "Step-by-step matrix shape walkthrough for batch size B, sequence length S, hidden dimension D, and attention heads H.",
    type: "PDF",
    fileSize: "2.1 MB",
    uploadedDate: "2026-10-15",
    downloadsCount: 218,
    previewUrl: "https://mentify.edu/materials/transformer-math.pdf",
    contentSnippet: `Multi-Head Attention Tensor Dimensions:
Input X: (B, S, D)
Linear Projections W_q, W_k, W_v: (D, D)
Projected Q, K, V: (B, S, D) -> Reshape to (B, H, S, d_k) where d_k = D / H
Attention Scores: (B, H, S, d_k) @ (B, H, d_k, S) = (B, H, S, S)
Multiply by 1 / sqrt(d_k), Softmax over dim -1
Multiply by V: (B, H, S, S) @ (B, H, S, d_k) = (B, H, S, d_k)
Concatenate Heads: (B, S, D) followed by final projection W_o: (D, D)`,
  },
  {
    id: "mat-3",
    courseId: "course-cs325",
    courseCode: "CS 325",
    courseTitle: "Cloud Architecture & Distributed Systems",
    title: "Raft Consensus Protocol Visualization & Reference Implementation",
    description:
      "Clean Go source code for randomized timers, heartbeat exchanges, and state machine commit index updates.",
    type: "CODE",
    fileSize: "340 KB",
    uploadedDate: "2026-10-08",
    downloadsCount: 96,
  },
  {
    id: "mat-4",
    courseId: "course-des210",
    courseCode: "DES 210",
    courseTitle: "Design Systems & UI Engineering",
    title: "WCAG 2.2 AA Color Contrast & Focus Management Interactive Slide Deck",
    description:
      "Slides covering non-text contrast, target sizes (>=44x44px), focus trap loops, and ARIA live regions.",
    type: "SLIDES",
    fileSize: "12.4 MB",
    uploadedDate: "2026-10-04",
    downloadsCount: 168,
  },
  {
    id: "mat-5",
    courseId: "course-cs301",
    courseCode: "CS 301",
    courseTitle: "Data Structures & Algorithmic Analysis",
    title: "Graph Benchmarking Dataset: 100K Vertex Sparse Road Network",
    description:
      "Standard DIMACS-format road network dataset for benchmarking shortest path implementations.",
    type: "DOCUMENT",
    fileSize: "8.6 MB",
    uploadedDate: "2026-10-12",
    downloadsCount: 88,
  },
];

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: "cal-1",
    title: "CS 301: Advanced Graph Theory Lecture",
    courseCode: "CS 301",
    courseTitle: "Data Structures & Algorithmic Analysis",
    type: "CLASS",
    date: "2026-10-19",
    startTime: "10:00 AM",
    endTime: "11:30 AM",
    location: "Turing Hall 104",
    description: "Dijkstra optimizations, Fibonacci heaps, and bidirectional search.",
  },
  {
    id: "cal-2",
    title: "CS 440: Transformers & Attention Mechanisms",
    courseCode: "CS 440",
    courseTitle: "Applied Machine Learning",
    type: "CLASS",
    date: "2026-10-20",
    startTime: "11:00 AM",
    endTime: "12:30 PM",
    location: "Hopper Auditorium 201",
    description: "Cross-attention, flash attention kernels, and KV-cache optimization.",
  },
  {
    id: "cal-3",
    title: "Assignment 4 Due: Dijkstra Shortest Paths",
    courseCode: "CS 301",
    courseTitle: "Data Structures",
    type: "ASSIGNMENT_DUE",
    date: "2026-10-22",
    startTime: "11:59 PM",
    endTime: "11:59 PM",
    location: "Mentify Submission Portal",
    description: "Submit your code repository package and empirical runtime PDF analysis.",
  },
  {
    id: "cal-4",
    title: "CS 301 Knowledge Check Quiz Closes",
    courseCode: "CS 301",
    courseTitle: "Data Structures",
    type: "QUIZ",
    date: "2026-10-23",
    startTime: "11:59 PM",
    endTime: "11:59 PM",
    location: "Mentify Online Quiz Center",
    description: "20-minute timed quiz on balanced search trees and topological sorting.",
  },
  {
    id: "cal-5",
    title: "CS 301 Midterm Examination",
    courseCode: "CS 301",
    courseTitle: "Data Structures & Algorithmic Analysis",
    type: "EXAM",
    date: "2026-10-28",
    startTime: "10:00 AM",
    endTime: "12:00 PM",
    location: "Turing Examination Hall A",
    description: "Proctored 2-hour midterm examination covering Modules 1 through 3.",
  },
  {
    id: "cal-6",
    title: "Prof. Marcus Vance Office Hours",
    courseCode: "CS 301",
    courseTitle: "Data Structures",
    type: "OFFICE_HOURS",
    date: "2026-10-20",
    startTime: "02:00 PM",
    endTime: "04:00 PM",
    location: "Turing Hall Suite 402 / Mentify Virtual Room",
    description: "One-on-one assistance for Assignment 4 and midterm preparation.",
  },
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    participantId: "inst-1",
    participantName: "Prof. Marcus Vance",
    participantTitle: "Course Director · CS 301",
    participantAvatar: "",
    courseCode: "CS 301",
    unreadCount: 1,
    lastMessage:
      "Your approach to cascading cuts in the Fibonacci heap is solid, Alex. Remember to check edge cases with root removals.",
    lastMessageTime: "Today at 09:15 AM",
    messages: [
      {
        id: "m1",
        senderId: "std_alex_rivera_01",
        senderName: "Alex Rivera",
        senderAvatar: "",
        isSenderStudent: true,
        timestamp: "Yesterday at 04:30 PM",
        text: "Hello Professor Vance, for Assignment 4, should our Fibonacci heap implementation assume strictly non-negative edge weights or do we need to raise an exception if a negative weight is inserted?",
      },
      {
        id: "m2",
        senderId: "inst-1",
        senderName: "Prof. Marcus Vance",
        senderAvatar: "",
        isSenderStudent: false,
        timestamp: "Yesterday at 05:12 PM",
        text: "Hi Alex! Raising an InvalidArgumentException upon encountering negative weights is the best software engineering practice. Dijkstra is only valid on non-negative weights.",
      },
      {
        id: "m3",
        senderId: "inst-1",
        senderName: "Prof. Marcus Vance",
        senderAvatar: "",
        isSenderStudent: false,
        timestamp: "Today at 09:15 AM",
        text: "Your approach to cascading cuts in the Fibonacci heap is solid, Alex. Remember to check edge cases with root removals.",
      },
    ],
  },
  {
    id: "conv-2",
    participantId: "inst-2",
    participantName: "Dr. Sarah Lin-Wu",
    participantTitle: "Lecturer · CS 440",
    participantAvatar: "",
    courseCode: "CS 440",
    unreadCount: 0,
    lastMessage:
      "Office hours are confirmed for Wednesday at 3:00 PM if you want to test your attention layer on the cluster.",
    lastMessageTime: "Yesterday at 06:40 PM",
    messages: [
      {
        id: "m4",
        senderId: "inst-2",
        senderName: "Dr. Sarah Lin-Wu",
        senderAvatar: "",
        isSenderStudent: false,
        timestamp: "Yesterday at 06:40 PM",
        text: "Office hours are confirmed for Wednesday at 3:00 PM if you want to test your attention layer on the cluster.",
      },
    ],
  },
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-1",
    courseCode: "CS 301",
    courseTitle: "Data Structures & Algorithmic Analysis",
    instructorName: "Prof. Marcus Vance",
    instructorAvatar: "",
    title: "Midterm Examination Room Assignments & Formula Sheet Guidelines",
    content:
      "Please check your designated seating arrangement in Turing Hall A for the upcoming midterm on October 28. Remember that formula sheets must be physical handwritten paper; no printed sheets or tablet screens are permitted.",
    timestamp: "2 hours ago",
    priority: "URGENT",
  },
  {
    id: "ann-2",
    courseCode: "CS 440",
    courseTitle: "Applied Machine Learning",
    instructorName: "Dr. Sarah Lin-Wu",
    instructorAvatar: "",
    title: "GPU Cluster Quota Bump for Transformer Assignment",
    content:
      "We have doubled student A100 GPU cluster minutes for all enrolled students through next Sunday to support training runs on the mini translation dataset.",
    timestamp: "Yesterday at 3:20 PM",
    priority: "NORMAL",
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Assignment 4 Due in 5 Days",
    description:
      "CS 301: Dijkstra & Multi-Destination Shortest Paths with Fibonacci Heap is due Oct 22 at 11:59 PM.",
    timestamp: "1 hour ago",
    type: "DEADLINE",
    read: false,
    actionView: "assignments",
    targetId: "asg-1",
  },
  {
    id: "notif-2",
    title: "Grade Published: Milestone 2",
    description:
      "DES 210: Claire Beauchamp published your grade for Design Tokens (Score: 98/100, Grade: A+).",
    timestamp: "Yesterday",
    type: "GRADE",
    read: false,
    actionView: "grades",
  },
  {
    id: "notif-3",
    title: "New Announcement in CS 301",
    description:
      "Midterm Examination Room Assignments & Formula Sheet Guidelines posted by Prof. Marcus Vance.",
    timestamp: "2 hours ago",
    type: "ANNOUNCEMENT",
    read: false,
    actionView: "messages",
  },
  {
    id: "notif-4",
    title: "Upcoming Midterm Exam",
    description: "CS 301 Midterm is scheduled for Oct 28 at 10:00 AM in Turing Hall A.",
    timestamp: "3 days ago",
    type: "EXAM",
    read: true,
    actionView: "examinations",
    targetId: "exam-1",
  },
];

export const INITIAL_AI_CHATS: ChatMessage[] = [
  {
    id: "chat-1",
    sender: "assistant",
    text: `Hello Alex! I'm **Mentify AI**, your dedicated academic study companion. 

I'm indexed with your enrolled course syllabi, lecture notes, textbook references, and active assignments across **CS 301**, **CS 440**, **CS 325**, and **DES 210**. 

How can I accelerate your learning today?`,
    timestamp: "09:00 AM",
    suggestedQuestions: [
      "Explain why scaling by 1/sqrt(d_k) is required in Transformer attention",
      "Walk me through the amortized proof of Fibonacci Heap decrease-key",
      "How does Raft handle a split vote between two candidates?",
      "Generate 3 practice questions for my CS 301 midterm on Graph Algorithms",
    ],
  },
];

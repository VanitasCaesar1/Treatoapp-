# Design Document

## Overview

The Patient App is a Next.js 16 web application built with React 19, TypeScript, and Tailwind CSS. It leverages the existing WorkOS authentication infrastructure and integrates with the healthcare backend microservices through the API Gateway at port 8080. The application follows a modern, component-based architecture with server-side rendering, client-side interactivity, and real-time communication capabilities.

The design emphasizes user experience, performance, and maintainability by utilizing React Query for data fetching, shadcn/ui components for consistent UI, and a modular service layer for API communication.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Patient App (Next.js)                    │
├─────────────────────────────────────────────────────────────┤
│  Presentation Layer (React Components)                       │
│  ├─ Pages (App Router)                                       │
│  ├─ Components (UI + Feature)                                │
│  └─ Layouts                                                  │
├─────────────────────────────────────────────────────────────┤
│  State Management Layer                                      │
│  ├─ React Query (Server State)                               │
│  ├─ React Context (Client State)                             │
│  └─ WebSocket Manager (Real-time)                            │
├─────────────────────────────────────────────────────────────┤
│  Service Layer                                               │
│  ├─ API Client (HTTP)                                        │
│  ├─ WebSocket Client (Real-time)                             │
│  └─ WebRTC Manager (Video)                                   │
├─────────────────────────────────────────────────────────────┤
│  Authentication Layer (WorkOS)                               │
│  └─ JWT Token Management                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    API Gateway (Port 8080)
                            ↓
              Healthcare Backend Microservices
```

### Technology Stack

- **Framework**: Next.js 16 with App Router
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Component Library**: shadcn/ui (Radix UI primitives)
- **State Management**: TanStack React Query v5
- **Authentication**: WorkOS AuthKit
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Real-time**: WebSocket API
- **Video**: WebRTC API


## Components and Interfaces

### Directory Structure

```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   └── callback/
│       └── route.ts
├── (dashboard)/
│   ├── layout.tsx                    # Dashboard layout with navigation
│   ├── dashboard/
│   │   └── page.tsx                  # Main dashboard
│   ├── appointments/
│   │   ├── page.tsx                  # Appointments list
│   │   ├── book/
│   │   │   └── page.tsx              # Book appointment
│   │   └── [id]/
│   │       └── page.tsx              # Appointment details
│   ├── doctors/
│   │   ├── page.tsx                  # Doctor search
│   │   └── [id]/
│   │       └── page.tsx              # Doctor profile
│   ├── medical-records/
│   │   ├── page.tsx                  # Medical records list
│   │   └── [id]/
│   │       └── page.tsx              # Record details
│   ├── video/
│   │   └── [roomId]/
│   │       └── page.tsx              # Video consultation
│   ├── community/
│   │   ├── page.tsx                  # Social feed
│   │   └── post/
│   │       └── [id]/
│   │           └── page.tsx          # Post details
│   ├── medicines/
│   │   └── page.tsx                  # Medicine search
│   ├── templates/
│   │   ├── page.tsx                  # Templates list
│   │   └── [id]/
│   │       └── page.tsx              # Template details
│   └── profile/
│       └── page.tsx                  # User profile
├── api/
│   └── proxy/
│       └── [...path]/
│           └── route.ts              # API proxy to backend
├── layout.tsx
├── page.tsx                          # Landing page
└── globals.css

components/
├── ui/                               # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   ├── select.tsx
│   ├── calendar.tsx
│   ├── badge.tsx
│   ├── avatar.tsx
│   └── ...
├── features/
│   ├── appointments/
│   │   ├── appointment-card.tsx
│   │   ├── appointment-list.tsx
│   │   ├── booking-form.tsx
│   │   └── time-slot-picker.tsx
│   ├── doctors/
│   │   ├── doctor-card.tsx
│   │   ├── doctor-search-filters.tsx
│   │   ├── doctor-profile-header.tsx
│   │   └── schedule-viewer.tsx
│   ├── medical-records/
│   │   ├── record-card.tsx
│   │   ├── vitals-chart.tsx
│   │   ├── encounter-details.tsx
│   │   └── medical-history-timeline.tsx
│   ├── video/
│   │   ├── video-player.tsx
│   │   ├── video-controls.tsx
│   │   └── participant-list.tsx
│   ├── community/
│   │   ├── post-card.tsx
│   │   ├── post-composer.tsx
│   │   ├── comment-list.tsx
│   │   └── notification-bell.tsx
│   └── dashboard/
│       ├── dashboard-stats.tsx
│       ├── upcoming-appointments.tsx
│       ├── recent-vitals.tsx
│       └── quick-actions.tsx
├── layout/
│   ├── header.tsx
│   ├── sidebar.tsx
│   ├── navigation.tsx
│   └── footer.tsx
└── providers/
    ├── query-provider.tsx
    └── websocket-provider.tsx

lib/
├── api/
│   ├── client.ts                     # Base API client
│   ├── appointments.ts               # Appointment API calls
│   ├── doctors.ts                    # Doctor API calls
│   ├── patients.ts                   # Patient API calls
│   ├── medical-records.ts            # Medical records API calls
│   ├── video.ts                      # Video API calls
│   ├── social.ts                     # Social API calls
│   ├── medicines.ts                  # Medicine API calls
│   └── templates.ts                  # Template API calls
├── hooks/
│   ├── use-appointments.ts
│   ├── use-doctors.ts
│   ├── use-medical-records.ts
│   ├── use-video.ts
│   ├── use-social.ts
│   └── use-websocket.ts
├── services/
│   ├── websocket.ts                  # WebSocket manager
│   └── webrtc.ts                     # WebRTC manager
├── types/
│   ├── api.ts                        # API response types
│   ├── appointment.ts
│   ├── doctor.ts
│   ├── patient.ts
│   ├── medical-record.ts
│   └── social.ts
└── utils.ts
```

### Core Components

#### 1. API Client (`lib/api/client.ts`)

```typescript
interface APIClient {
  get<T>(endpoint: string, params?: Record<string, any>): Promise<T>
  post<T>(endpoint: string, data: any): Promise<T>
  put<T>(endpoint: string, data: any): Promise<T>
  delete<T>(endpoint: string): Promise<T>
}
```

Features:
- Automatic JWT token injection from WorkOS session
- Request/response interceptors
- Error handling and retry logic
- Base URL configuration for API Gateway

#### 2. WebSocket Manager (`lib/services/websocket.ts`)

```typescript
interface WebSocketManager {
  connect(url: string): void
  disconnect(): void
  subscribe(event: string, callback: (data: any) => void): void
  unsubscribe(event: string): void
  send(event: string, data: any): void
}
```

Features:
- Automatic reconnection
- Event-based message handling
- Connection state management
- Token authentication

#### 3. WebRTC Manager (`lib/services/webrtc.ts`)

```typescript
interface WebRTCManager {
  createRoom(roomId: string): Promise<void>
  joinRoom(roomId: string): Promise<void>
  leaveRoom(): void
  toggleAudio(): void
  toggleVideo(): void
  getLocalStream(): MediaStream | null
  getRemoteStreams(): MediaStream[]
}
```

Features:
- Peer connection management
- Media stream handling
- Signaling through WebSocket
- STUN/TURN server configuration


## Data Models

### TypeScript Interfaces

#### Patient

```typescript
interface Patient {
  id: string
  authId: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  dateOfBirth?: string
  gender?: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  emergencyContact?: {
    name: string
    relationship: string
    phone: string
  }
  medicalConditions?: string[]
  allergies?: string[]
  createdAt: string
  updatedAt: string
}
```

#### Doctor

```typescript
interface Doctor {
  id: string
  firstName: string
  lastName: string
  email: string
  specialty: string
  subSpecialties?: string[]
  licenseNumber: string
  yearsOfExperience: number
  education: string[]
  hospitalAffiliations: string[]
  rating?: number
  reviewCount?: number
  bio?: string
  languages?: string[]
  profileImage?: string
}

interface DoctorSchedule {
  id: string
  doctorId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  slotDuration: number
  isAvailable: boolean
}

interface ConsultationFee {
  id: string
  doctorId: string
  consultationType: string
  amount: number
  currency: string
}
```

#### Appointment

```typescript
interface Appointment {
  id: string
  patientId: string
  doctorId: string
  appointmentDate: string
  appointmentTime: string
  duration: number
  consultationType: 'in-person' | 'video' | 'phone'
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'
  reason?: string
  notes?: string
  videoRoomId?: string
  createdAt: string
  updatedAt: string
  doctor?: Doctor
  patient?: Patient
}
```

#### Medical Record

```typescript
interface MedicalEncounter {
  id: string
  patientId: string
  doctorId: string
  encounterDate: string
  encounterType: string
  chiefComplaint: string
  diagnosis: string[]
  treatment: string
  prescriptions: Prescription[]
  followUpDate?: string
  notes?: string
}

interface VitalSigns {
  id: string
  patientId: string
  recordedAt: string
  bloodPressureSystolic?: number
  bloodPressureDiastolic?: number
  heartRate?: number
  temperature?: number
  respiratoryRate?: number
  oxygenSaturation?: number
  weight?: number
  height?: number
  bmi?: number
}

interface Prescription {
  id: string
  medicineId: string
  medicineName: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
}
```

#### Social

```typescript
interface SocialPost {
  id: string
  authorId: string
  authorName: string
  authorAvatar?: string
  content: string
  tags: string[]
  category: string
  likesCount: number
  commentsCount: number
  isLiked: boolean
  isSaved: boolean
  createdAt: string
  updatedAt: string
}

interface Comment {
  id: string
  postId: string
  authorId: string
  authorName: string
  authorAvatar?: string
  content: string
  createdAt: string
}

interface Notification {
  id: string
  userId: string
  type: 'like' | 'comment' | 'follow' | 'appointment' | 'message'
  title: string
  message: string
  isRead: boolean
  link?: string
  createdAt: string
}
```

#### Video

```typescript
interface VideoRoom {
  id: string
  name: string
  appointmentId?: string
  maxUsers: number
  participants: Participant[]
  status: 'waiting' | 'active' | 'ended'
  createdAt: string
}

interface Participant {
  id: string
  userId: string
  userName: string
  role: 'patient' | 'doctor'
  isAudioEnabled: boolean
  isVideoEnabled: boolean
  joinedAt: string
}
```

#### Template

```typescript
interface MedicalTemplate {
  id: string
  title: string
  description: string
  category: string
  specialty: string
  content: TemplateField[]
  authorId: string
  authorName: string
  likesCount: number
  savesCount: number
  usageCount: number
  isLiked: boolean
  isSaved: boolean
  tags: string[]
  createdAt: string
}

interface TemplateField {
  id: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'date' | 'number'
  required: boolean
  options?: string[]
  placeholder?: string
}
```

#### Medicine

```typescript
interface Medicine {
  id: string
  name: string
  genericName: string
  manufacturer: string
  category: string
  form: string
  strength: string
  indications: string[]
  contraindications: string[]
  sideEffects: string[]
  dosageInstructions: string
}
```


## API Integration

### API Client Configuration

The API client communicates with the healthcare backend through the API Gateway at `http://localhost:8080` (configurable via environment variable).

#### Environment Variables

```env
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080
WORKOS_API_KEY=sk_test_...
WORKOS_CLIENT_ID=client_...
WORKOS_REDIRECT_URI=http://localhost:3000/callback
WORKOS_COOKIE_PASSWORD=<32-character-secret>
```

### API Endpoints Mapping

#### Authentication
- `POST /api/auth/login` - Handled by WorkOS
- `POST /api/auth/logout` - Handled by WorkOS
- `GET /api/auth/session` - Get current session

#### Patients
- `GET /api/patients/search?q={query}` - Search patients
- `GET /api/patients/:id` - Get patient profile
- `PUT /api/patients/:id` - Update patient profile
- `GET /api/patients/:id/medical-history` - Get medical history

#### Doctors
- `GET /api/doctors/search?specialty={}&location={}&date={}` - Search doctors
- `GET /api/doctors/:id` - Get doctor profile
- `GET /api/doctors/:id/schedules` - Get doctor schedules
- `GET /api/doctors/:id/fees` - Get consultation fees

#### Appointments
- `GET /api/appointments` - Get user appointments
- `GET /api/appointments/:id` - Get appointment details
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

#### Medical Records
- `GET /api/emr/patients/:id/encounters` - Get medical encounters
- `GET /api/emr/patients/:id/vitals` - Get vital signs history
- `GET /api/diagnosis/:id` - Get diagnosis details

#### Video
- `POST /api/v1/rooms` - Create video room
- `GET /api/v1/rooms/:id` - Get room details
- `GET /api/v1/rooms/:id/participants` - Get participants
- `GET /api/v1/turn/credentials` - Get TURN credentials
- `WS /api/v1/ws?room_id={roomId}` - WebSocket signaling

#### Social
- `GET /api/social/feed` - Get social feed
- `POST /api/social/posts` - Create post
- `GET /api/social/posts/:id` - Get post details
- `POST /api/social/posts/:id/like` - Like/unlike post
- `POST /api/social/posts/:id/comment` - Add comment
- `GET /api/social/posts/:id/comments` - Get comments
- `WS /api/social/ws` - WebSocket for real-time notifications

#### Templates
- `GET /api/templates/feed` - Get all templates
- `GET /api/templates/search?q={}` - Search templates
- `GET /api/templates/:id` - Get template details
- `POST /api/templates/:id/like` - Like template
- `POST /api/templates/:id/save` - Save template
- `POST /api/templates/:id/use` - Increment usage count

#### Medicines
- `GET /api/medicines/search?q={query}` - Search medicines

### React Query Hooks

#### Appointments

```typescript
// Get appointments
const { data: appointments, isLoading } = useAppointments()

// Get appointment by ID
const { data: appointment } = useAppointment(appointmentId)

// Create appointment
const { mutate: createAppointment } = useCreateAppointment()

// Cancel appointment
const { mutate: cancelAppointment } = useCancelAppointment()
```

#### Doctors

```typescript
// Search doctors
const { data: doctors, isLoading } = useSearchDoctors({
  specialty: 'cardiology',
  location: 'new-york',
  date: '2024-01-15'
})

// Get doctor profile
const { data: doctor } = useDoctor(doctorId)

// Get doctor schedules
const { data: schedules } = useDoctorSchedules(doctorId)
```

#### Medical Records

```typescript
// Get medical history
const { data: history } = useMedicalHistory(patientId)

// Get vitals
const { data: vitals } = useVitals(patientId)

// Get encounter details
const { data: encounter } = useEncounter(encounterId)
```

#### Social

```typescript
// Get social feed
const { data: feed, fetchNextPage } = useSocialFeed()

// Create post
const { mutate: createPost } = useCreatePost()

// Like post
const { mutate: likePost } = useLikePost()

// Add comment
const { mutate: addComment } = useAddComment()
```


## Error Handling

### Error Types

```typescript
interface APIError {
  status: number
  message: string
  code: string
  details?: Record<string, any>
}

type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
```

### Error Handling Strategy

#### 1. API Client Level

```typescript
// Automatic retry for network errors
const retryConfig = {
  retries: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  retryCondition: (error) => {
    return error.status >= 500 || error.code === 'NETWORK_ERROR'
  }
}

// Token refresh on 401
if (error.status === 401) {
  // Redirect to login
  window.location.href = '/login'
}

// Global error logging
logError(error, { context: 'API_CALL', endpoint, method })
```

#### 2. React Query Level

```typescript
// Global error handler
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      onError: (error) => {
        toast.error(getErrorMessage(error))
      }
    },
    mutations: {
      onError: (error) => {
        toast.error(getErrorMessage(error))
      }
    }
  }
})
```

#### 3. Component Level

```typescript
// Error boundaries for critical sections
<ErrorBoundary fallback={<ErrorFallback />}>
  <VideoConsultation />
</ErrorBoundary>

// Loading and error states
if (isLoading) return <LoadingSpinner />
if (error) return <ErrorMessage error={error} retry={refetch} />
```

### User-Friendly Error Messages

```typescript
const errorMessages: Record<ErrorCode, string> = {
  UNAUTHORIZED: 'Please log in to continue',
  FORBIDDEN: 'You don\'t have permission to access this resource',
  NOT_FOUND: 'The requested resource was not found',
  VALIDATION_ERROR: 'Please check your input and try again',
  SERVER_ERROR: 'Something went wrong. Please try again later',
  NETWORK_ERROR: 'Network connection issue. Please check your internet',
  TIMEOUT: 'Request timed out. Please try again'
}
```

## Testing Strategy

### Unit Testing

**Framework**: Jest + React Testing Library

**Coverage Areas**:
- Utility functions
- Custom hooks
- API client methods
- Component logic

**Example**:
```typescript
describe('useAppointments', () => {
  it('should fetch appointments successfully', async () => {
    const { result } = renderHook(() => useAppointments())
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(3)
  })
})
```

### Integration Testing

**Framework**: Playwright

**Coverage Areas**:
- User authentication flow
- Appointment booking flow
- Doctor search and profile viewing
- Medical records access
- Video consultation joining

**Example**:
```typescript
test('book appointment flow', async ({ page }) => {
  await page.goto('/doctors')
  await page.fill('[data-testid="search-input"]', 'cardiology')
  await page.click('[data-testid="doctor-card"]:first-child')
  await page.click('[data-testid="book-appointment"]')
  await page.selectOption('[data-testid="time-slot"]', '10:00')
  await page.click('[data-testid="confirm-booking"]')
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
})
```

### Component Testing

**Framework**: Storybook

**Coverage Areas**:
- UI components in isolation
- Different component states
- Accessibility testing
- Visual regression testing

### E2E Testing

**Framework**: Playwright

**Coverage Areas**:
- Critical user journeys
- Cross-browser compatibility
- Mobile responsiveness
- Performance benchmarks

## Performance Optimization

### 1. Code Splitting

```typescript
// Route-based code splitting (automatic with Next.js App Router)
const VideoConsultation = dynamic(() => import('@/components/features/video/video-player'))

// Component-based code splitting
const HeavyChart = dynamic(() => import('@/components/features/medical-records/vitals-chart'), {
  loading: () => <ChartSkeleton />
})
```

### 2. Data Fetching Optimization

```typescript
// Prefetch on hover
<Link 
  href={`/doctors/${doctor.id}`}
  onMouseEnter={() => queryClient.prefetchQuery(['doctor', doctor.id])}
>
  View Profile
</Link>

// Parallel data fetching
const [appointments, vitals, notifications] = await Promise.all([
  fetchAppointments(),
  fetchVitals(),
  fetchNotifications()
])

// Infinite scroll for feeds
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['social-feed'],
  queryFn: ({ pageParam = 1 }) => fetchFeed(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextPage
})
```

### 3. Caching Strategy

```typescript
// React Query cache configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  }
})

// Specific cache times for different data types
useQuery(['doctor', doctorId], fetchDoctor, {
  staleTime: 30 * 60 * 1000 // Doctors data rarely changes
})

useQuery(['appointments'], fetchAppointments, {
  staleTime: 1 * 60 * 1000 // Appointments need fresher data
})
```

### 4. Image Optimization

```typescript
// Next.js Image component with optimization
<Image
  src={doctor.profileImage}
  alt={doctor.name}
  width={200}
  height={200}
  placeholder="blur"
  priority={false}
/>
```

### 5. Bundle Size Optimization

- Tree shaking for unused code
- Dynamic imports for heavy libraries
- Optimize package imports (e.g., `lucide-react` optimization already configured)
- Remove console logs in production (already configured)

## Security Considerations

### 1. Authentication

- JWT tokens stored in HTTP-only cookies (handled by WorkOS)
- Automatic token refresh
- Secure session management
- CSRF protection

### 2. Authorization

- Role-based access control
- Organization-based data isolation
- Resource-level permissions
- Protected routes with middleware

### 3. Data Protection

- HTTPS only in production
- Sensitive data encryption
- No PII in logs
- Secure WebSocket connections

### 4. Input Validation

- Client-side validation with Zod
- Server-side validation (backend)
- XSS prevention
- SQL injection prevention (backend)

### 5. Security Headers

Already configured in `next.config.ts`:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Content-Security-Policy (to be added)

## Accessibility

### WCAG 2.1 AA Compliance

- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- Color contrast ratios
- Text alternatives for images
- Form labels and error messages

### Implementation

```typescript
// Accessible button
<button
  aria-label="Book appointment with Dr. Smith"
  aria-pressed={isBooked}
  disabled={isLoading}
>
  Book Appointment
</button>

// Accessible form
<form aria-labelledby="booking-form-title">
  <h2 id="booking-form-title">Book Appointment</h2>
  <label htmlFor="date">Select Date</label>
  <input
    id="date"
    type="date"
    aria-required="true"
    aria-invalid={!!errors.date}
    aria-describedby={errors.date ? "date-error" : undefined}
  />
  {errors.date && <span id="date-error" role="alert">{errors.date}</span>}
</form>
```

## Responsive Design

### Breakpoints

```typescript
// Tailwind CSS breakpoints
sm: 640px   // Mobile landscape
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Large desktop
2xl: 1536px // Extra large desktop
```

### Mobile-First Approach

- Design for mobile first, enhance for larger screens
- Touch-friendly UI elements (minimum 44x44px)
- Responsive navigation (hamburger menu on mobile)
- Optimized images for different screen sizes
- Responsive typography

## Real-Time Features

### WebSocket Integration

```typescript
// Social notifications
const { notifications, isConnected } = useWebSocket('/api/social/ws', {
  onMessage: (notification) => {
    toast.info(notification.message)
    queryClient.invalidateQueries(['notifications'])
  }
})

// Video signaling
const { send, subscribe } = useWebSocket(`/api/v1/ws?room_id=${roomId}`, {
  onMessage: handleSignalingMessage
})
```

### Optimistic Updates

```typescript
// Like post optimistically
const { mutate: likePost } = useMutation(likePostAPI, {
  onMutate: async (postId) => {
    await queryClient.cancelQueries(['post', postId])
    const previousPost = queryClient.getQueryData(['post', postId])
    
    queryClient.setQueryData(['post', postId], (old) => ({
      ...old,
      isLiked: !old.isLiked,
      likesCount: old.isLiked ? old.likesCount - 1 : old.likesCount + 1
    }))
    
    return { previousPost }
  },
  onError: (err, postId, context) => {
    queryClient.setQueryData(['post', postId], context.previousPost)
  }
})
```

## Deployment

### Build Configuration

```bash
# Production build
npm run build

# Start production server
npm start
```

### Environment Variables

Required for production:
- `NEXT_PUBLIC_API_GATEWAY_URL`
- `NEXT_PUBLIC_WS_URL`
- `WORKOS_API_KEY`
- `WORKOS_CLIENT_ID`
- `WORKOS_REDIRECT_URI`
- `WORKOS_COOKIE_PASSWORD`

### Hosting Recommendations

- **Vercel**: Optimal for Next.js (automatic deployments, edge functions)
- **AWS Amplify**: Good for AWS ecosystem integration
- **Netlify**: Alternative with good DX
- **Docker**: Self-hosted option

### CI/CD Pipeline

```yaml
# Example GitHub Actions workflow
- Build and test
- Run linting
- Run type checking
- Run unit tests
- Run E2E tests
- Build production bundle
- Deploy to staging
- Deploy to production (manual approval)
```

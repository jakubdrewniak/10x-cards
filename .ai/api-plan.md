# REST API Plan

## 1. Resources

- **Users**: Corresponds to the `users` table. Stores user information including id, email, encrypted_password, confirmed_at, and created_at. Managed by Supabase authentication.

- **Generations**: Maps to the `generations` table. Holds records of AI generation requests with details such as user_id, model used, generated flashcards count, accepted flashcards counts (unedited and edited), source text hash and length, generation duration, and timestamps.

- **Flashcards**: Based on the `flashcards` table. Contains flashcard content with fields for front and back text (with character limits), source (one of 'ai-full', 'ai-edited', 'manual'), timestamps, and foreign keys linking to a generation and a user. A trigger automatically updates the updated_at column.

- **Generation Error Logs**: Relates to the `generation_error_logs` table. Logs errors occurring during AI flashcard generation, including user_id, model, source text details, error code, error message, and a timestamp.

## 2. Endpoints

### 2.1. User Endpoints

1. **Register User**
   - **Method**: POST
   - **URL**: `/api/auth/register`
   - **Description**: Creates a new user account.
   - **Request JSON**:
     ```json
     {
       "name": "string",
       "email": "string",
       "password": "string",
       "confirmPassword": "string"
     }
     ```
   - **Response JSON**:
     ```json
     {
       "user": { "id": "uuid", "name": "string", "email": "string", "createdAt": "timestamp" },
       "token": "jwtToken"
     }
     ```
   - **Success Codes**: 201 Created
   - **Error Codes**: 400 Bad Request, 409 Conflict (if email already exists)

2. **Login User**
   - **Method**: POST
   - **URL**: `/api/auth/login`
   - **Description**: Authenticates a user and returns a JWT token.
   - **Request JSON**:
     ```json
     {
       "email": "string",
       "password": "string"
     }
     ```
   - **Response JSON**:
     ```json
     {
       "user": { "id": "uuid", "email": "string", "name": "string" },
       "token": "jwtToken"
     }
     ```
   - **Success Codes**: 200 OK
   - **Error Codes**: 400 Bad Request, 401 Unauthorized

3. **Logout User**
   - **Method**: POST
   - **URL**: `/api/auth/logout`
   - **Description**: Invalidates the current JWT token.
   - **Response JSON**:
     ```json
     { "message": "Logout successful" }
     ```
   - **Success Codes**: 200 OK

4. **Get User Profile**
   - **Method**: GET
   - **URL**: `/api/users/profile`
   - **Description**: Retrieves the profile details of the authenticated user.
   - **Response JSON**:
     ```json
     {
       "id": "uuid",
       "name": "string",
       "email": "string",
       "createdAt": "timestamp"
     }
     ```
   - **Success Codes**: 200 OK
   - **Error Codes**: 401 Unauthorized

5. **Update User Profile**
   - **Method**: PUT
   - **URL**: `/api/users/profile`
   - **Description**: Updates user profile information, such as name and password.
   - **Request JSON**:
     ```json
     {
       "name": "string",
       "currentPassword": "string",
       "newPassword": "string"
     }
     ```
   - **Response JSON**:
     ```json
     { "message": "Profile updated successfully" }
     ```
   - **Success Codes**: 200 OK
   - **Error Codes**: 400 Bad Request, 401 Unauthorized

### 2.2. Flashcard Endpoints

1. **List Flashcards**
   - **Method**: GET
   - **URL**: `/api/flashcards`
   - **Description**: Retrieves a paginated list of flashcards for the authenticated user.
   - **Query Parameters**: `page` (default: 1), `limit` (default: 10), `sortBy`, `order`, `filterSource` (values: `ai-full`, `ai-edited`, `manual`).
   - **Response JSON**:
     ```json
     {
       "flashcards": [
         {
           "id": "number",
           "front": "string",
           "back": "string",
           "source": "string",
           "generationId": "number or null",
           "createdAt": "timestamp",
           "updatedAt": "timestamp"
         }
       ],
       "pagination": { "page": 1, "limit": 10, "total": 100 }
     }
     ```
   - **Success Codes**: 200 OK

2. **Get Flashcard by ID**
   - **Method**: GET
   - **URL**: `/api/flashcards/:id`
   - **Description**: Retrieves details of a specific flashcard by its id.
   - **Response JSON**: Similar to the flashcard object in the list.
   - **Success Codes**: 200 OK
   - **Error Codes**: 404 Not Found

3. **Create Flashcard (Manual Creation)**
   - **Method**: POST
   - **URL**: `/api/flashcards`
   - **Description**: Creates a new flashcard manually.
   - **Request JSON**:
     ```json
     {
       "front": "string (max 200 characters)",
       "back": "string (max 500 characters)"
     }
     ```
   - **Response JSON**:
     ```json
     {
       "id": "number",
       "front": "string",
       "back": "string",
       "source": "manual",
       "createdAt": "timestamp",
       "updatedAt": "timestamp"
     }
     ```
   - **Success Codes**: 201 Created
   - **Error Codes**: 400 Bad Request

4. **Update Flashcard**
   - **Method**: PUT
   - **URL**: `/api/flashcards/:id`
   - **Description**: Updates an existing flashcard's content.
   - **Request JSON**:
     ```json
     {
       "front": "string (max 200 characters)",
       "back": "string (max 500 characters)"
     }
     ```
   - **Response JSON**:
     ```json
     { "message": "Flashcard updated successfully" }
     ```
   - **Success Codes**: 200 OK
   - **Error Codes**: 400 Bad Request, 404 Not Found, 401 Unauthorized

5. **Delete Flashcard**
   - **Method**: DELETE
   - **URL**: `/api/flashcards/:id`
   - **Description**: Deletes a specified flashcard.
   - **Response JSON**:
     ```json
     { "message": "Flashcard deleted successfully" }
     ```
   - **Success Codes**: 200 OK
   - **Error Codes**: 404 Not Found

6. **Bulk Delete Flashcards**
   - **Method**: DELETE
   - **URL**: `/api/flashcards`
   - **Description**: Deletes multiple flashcards at once based on a list of IDs.
   - **Request JSON**:
     ```json
     { "ids": ["number", "number", "..."] }
     ```
   - **Response JSON**:
     ```json
     { "message": "Selected flashcards deleted successfully" }
     ```
   - **Success Codes**: 200 OK
   - **Error Codes**: 400 Bad Request

### 2.3. AI Generation Endpoints (Generations)

1. **Generate Flashcards via AI**
   - **Method**: POST
   - **URL**: `/api/flashcards/generate`
   - **Description**: Submits source text for AI-based flashcard generation. Creates a new generation record and associated flashcards.
   - **Request JSON**:
     ```json
     {
       "text": "string (1000-10000 characters)",
       "difficulty": "string",  // optional field to indicate the complexity level
       "model": "string"          // specifies the AI model to use
     }
     ```
   - **Response JSON**:
     ```json
     {
       "generationId": "number",
       "flashcards": [
         {
           "front": "string",
           "back": "string",
           "source": "ai-full"  // or "ai-edited" if later modified
         }
       ]
     }
     ```
   - **Success Codes**: 200 OK or 201 Created
   - **Error Codes**: 400 Bad Request, 500 Internal Server Error

2. **Get Generation Details**
   - **Method**: GET
   - **URL**: `/api/generations/:id`
   - **Description**: Retrieves details about a specific AI generation process.
   - **Response JSON**:
     ```json
     {
       "id": "number",
       "userId": "uuid",
       "model": "string",
       "generatedCount": "number",
       "acceptedUneditedCount": "number",
       "acceptedEditedCount": "number",
       "sourceTextHash": "string",
       "sourceTextLength": "number",
       "generationDuration": "number",
       "createdAt": "timestamp",
       "updatedAt": "timestamp"
     }
     ```
   - **Success Codes**: 200 OK
   - **Error Codes**: 404 Not Found

### 2.4. Generation Error Log Endpoints

1. **List Generation Error Logs**
   - **Method**: GET
   - **URL**: `/api/generation-error-logs`
   - **Description**: Retrieves a list of error logs for AI generation failures.
   - **Response JSON**:
     ```json
     {
       "errorLogs": [
         {
           "id": "number",
           "userId": "uuid",
           "model": "string",
           "sourceTextHash": "string",
           "sourceTextLength": "number",
           "errorCode": "string",
           "errorMessage": "string",
           "createdAt": "timestamp"
         }
       ]
     }
     ```
   - **Success Codes**: 200 OK

2. **Log a Generation Error**
   - **Method**: POST
   - **URL**: `/api/generation-error-logs`
   - **Description**: Creates a new generation error log entry.
   - **Request JSON**:
     ```json
     {
       "model": "string",
       "sourceTextHash": "string",
       "sourceTextLength": "number",
       "errorCode": "string",
       "errorMessage": "string"
     }
     ```
   - **Response JSON**:
     ```json
     { "message": "Error log created successfully", "id": "number" }
     ```
   - **Success Codes**: 201 Created
   - **Error Codes**: 400 Bad Request

### 2.5. Learning Session Endpoints

1. **Retrieve Next Flashcard for Learning Session**
   - **Method**: GET
   - **URL**: `/api/session/flashcard`
   - **Description**: Fetches the next flashcard for the spaced repetition session based on review scheduling.
   - **Response JSON**:
     ```json
     {
       "flashcard": {
         "id": "number",
         "front": "string",
         "back": "string",
         "dueDate": "timestamp"  // Optional, if the scheduling algorithm provides it
       }
     }
     ```
   - **Success Codes**: 200 OK
   - **Error Codes**: 404 Not Found

2. **Submit Learning Session Response**
   - **Method**: POST
   - **URL**: `/api/session/flashcard/:id`
   - **Description**: Submits the user's rating/feedback for a flashcard in the learning session to update its review schedule.
   - **Request JSON**:
     ```json
     {
       "rating": "number"  // e.g., a scale of 1-5 indicating mastery
     }
     ```
   - **Response JSON**:
     ```json
     { "message": "Learning response recorded successfully" }
     ```
   - **Success Codes**: 200 OK
   - **Error Codes**: 400 Bad Request, 404 Not Found

## 3. Authentication and Authorization

- **Mechanism**: JWT-based authentication leveraging Supabase Auth.
- **Details**:
  - Upon successful login or registration, a JWT token is issued and must be included in the `Authorization` header (as a Bearer token) for protected endpoints.
  - The API validates the JWT to extract the user id and enforces Row-Level Security (RLS) in the database to ensure users access only their own data for resources such as flashcards, generations, and error logs.
  - Additional security measures (HTTPS, CORS, rate limiting) are applied at the API gateway level.

## 4. Validation and Business Logic

- **Validation Rules**:
  - **Flashcards**: Ensure `front` text is no more than 200 characters and `back` text is no more than 500 characters.
  - **AI Generation**: Input text must be between 1000 and 10000 characters.
  - **Generation Error Logs**: Validate that `sourceTextLength` falls within the acceptable range (1000-10000).
  - **Users**: Registration requires a valid email format and a password with a minimum of 8 characters.

- **Business Logic Implementation**:
  - **AI Generation**: When a user submits text for AI generation, a new generation record is created in the `generations` table. The AI service processes the text and generates flashcards which are stored in the `flashcards` table, linked via the `generationId`.
  - **Flashcard Review**: Users can review generated flashcards. They have the option to accept a flashcard as-is (recorded as `ai-full`) or edit it (updating the source to `ai-edited`).
  - **Pagination, Filtering, and Sorting**: The list endpoint for flashcards supports query parameters to enable efficient browsing and management.
  - **Bulk Operations**: Bulk deletion allows users to manage multiple flashcards in a single request.
  - **Learning Sessions**: The learning session endpoints interact with a spaced repetition algorithm, either built-in or through an external service, to determine the next flashcard for review and update its review schedule based on user feedback.
  - **Error Handling**: Any errors during the AI generation process are logged into the `generation_error_logs` table, and the API responds with actionable error messages for the client. 
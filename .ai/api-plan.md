# REST API Plan

## 1. Resources

- **Users**: Corresponds to the `users` table. Stores user information including id, email, encrypted_password, confirmed_at, and created_at. Managed by Supabase authentication.

- **Generations**: Maps to the `generations` table. Holds records of AI generation requests with details such as user_id, model used, generated flashcards count, accepted flashcards counts (unedited and edited), source text hash and length, generation duration, and timestamps.

- **Flashcards**: Based on the `flashcards` table. Contains flashcard content with fields for front and back text (with character limits), source (one of 'ai-full', 'ai-edited', 'manual'), timestamps, and foreign keys linking to a generation and a user. A trigger automatically updates the updated_at column.

- **Generation Error Logs**: Relates to the `generation_error_logs` table. Logs errors occurring during AI flashcard generation, including user_id, model, source text details, error code, error message, and a timestamp.

## 2. Endpoints

### 2.1. Flashcard Endpoints

1. **List Flashcards**
   - **Method**: GET
   - **URL**: `/flashcards`
   - **Description**: Retrieves a paginated list of flashcards for the authenticated user.
   - **Query Parameters**: `page` (default: 1), `limit` (default: 10), `sortBy`, `order`.
   - **Response JSON**:
     ```json
     {
       "data": [
         {
           "id": "number",
           "front": "string",
           "back": "string",
           "source": "ai-full" | "ai-edited" | "manual",
           "generation_id": "number" | "null",
           "created_at": "timestamp",
           "updated_at": "timestamp"
         }
       ],
       "pagination": { "page": 1, "limit": 10, "total": 100 }
     }
     ```
   - **Success Codes**: 200 OK

2. **Get Flashcard by ID**
   - **Method**: GET
   - **URL**: `/flashcards/:id`
   - **Description**: Retrieves details of a specific flashcard by its id.
   - **Response JSON**: Similar to the flashcard object in the list.
   - **Success Codes**: 200 OK
   - **Error Codes**: 404 Not Found

3. **Create Flashcard(s)**
   - **Method**: POST
   - **URL**: `/flashcards`
   - **Description**: Creates one or more flashcards, either manually or from AI generation.
   - **Request JSON**:
     ```json
     {
       "flashcards": [
         {
           "front": "string (max 200 characters)",
           "back": "string (max 500 characters)",
           "source": "manual" | "ai-full" | "ai-edited",
           "generation_id": "number" | "null"
         }
       ]
     }
     ```
   - **Response JSON**:
     ```json
     {
       "flashcards": [
         {
           "id": "number",
           "front": "string",
           "back": "string",
           "source": "manual" | "ai-full" | "ai-edited",
           "generation_id": "number" | "null",
           "created_at": "timestamp",
           "updated_at": "timestamp"
         }
       ]
     }
     ```
   - **Success Codes**: 201 Created
   - **Error Codes**: 400 Bad Request

4. **Update Flashcard**
   - **Method**: PUT
   - **URL**: `/flashcards/:id`
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
   - **Validations:
      - front: max length: 200 characters
      - back: max length: 500 characters
      - source: "ai-edited" or "manual"
   - **Success Codes**: 200 OK
   - **Error Codes**: 400 Bad Request, 404 Not Found, 401 Unauthorized

5. **Delete Flashcard**
   - **Method**: DELETE
   - **URL**: `/flashcards/:id`
   - **Description**: Deletes a specified flashcard.
   - **Response JSON**:
     ```json
     { "message": "Flashcard deleted successfully" }
     ```
   - **Success Codes**: 200 OK
   - **Error Codes**: 404 Not Found

6. **Bulk Delete Flashcards**
   - **Method**: DELETE
   - **URL**: `/flashcards`
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
   - **URL**: `/generations`
   - **Description**: Submits source text for AI-based flashcard generation. Creates a new generation record and associated flashcards.
   - **Request JSON**:
     ```json
     {
       "source_text": "string (1000-10000 characters)",
       "model": "string"
     }
     ```
   - **Response JSON**:
     ```json
     {
       "generation_id": "number",
       "flashcards_proposals": [
         {
           "id": "number",
           "front": "string",
           "back": "string",
           "source": "ai-full"
         },
         "generated_count": "number"
       ]
     }
     ```
   - **Success Codes**: 200 OK or 201 Created
   - **Error Codes**: 400 Bad Request, 500 Internal Server Error (logs recorded in "generation_error_logs")

2. **List Generations**
   - **Method**: GET
   - **URL**: `/generations`
   - **Description**: Retrieves a paginated list of generations for the authenticated user.
   - **Query Parameters**: `page` (default: 1), `limit` (default: 10)
   - **Response JSON**:
     ```json
     {
       "data": [
         {
           "id": "number",
           "user_id": "uuid",
           "model": "string",
           "generated_count": "number",
           "accepted_unedited_count": "number",
           "accepted_edited_count": "number",
           "source_text_hash": "string",
           "source_text_length": "number",
           "generation_duration": "number",
           "created_at": "timestamp",
           "updated_at": "timestamp"
         }
       ],
       "pagination": { "page": 1, "limit": 10, "total": 100 }
     }
     ```
   - **Success Codes**: 200 OK

3. **Get Generation Details**
   - **Method**: GET
   - **URL**: `/generations/:id`
   - **Description**: Retrieves details about a specific AI generation process.
   - **Response JSON**:
     ```json
     {
       "id": "number",
       "user_id": "uuid",
       "model": "string",
       "generated_count": "number",
       "accepted_unedited_count": "number",
       "accepted_edited_count": "number",
       "source_text_hash": "string",
       "source_text_length": "number",
       "generation_duration": "number",
       "created_at": "timestamp",
       "updated_at": "timestamp"
     }
     ```
   - **Success Codes**: 200 OK
   - **Error Codes**: 404 Not Found

### 2.4. Generation Error Log Endpoints

1. **List Generation Error Logs**
   - **Method**: GET
   - **URL**: `/generation-error-logs`
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
  - **AI Generation**: When a user submits text for AI generation, a new generation record is created in the `generations` table. The AI service processes the text and generates flashcards proposals which can be later saved and stored in the `flashcards` table, linked via the `generation_id`.
  - **Flashcard Review**: Users can review generated flashcards. They have the option to accept a flashcard as-is (recorded as `ai-full`) or edit it (updating the source to `ai-edited`).
  - **Pagination, Filtering, and Sorting**: The list endpoint for flashcards supports query parameters to enable efficient browsing and management.
  - **Bulk Operations**: Bulk deletion allows users to manage multiple flashcards in a single request.
  - **Error Handling**: Any errors during the AI generation process are logged into the `generation_error_logs` table, and the API responds with actionable error messages for the client. 
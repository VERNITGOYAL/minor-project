ResearchAI
Full-stack research workspace with React frontend, FastAPI backend,
authentication/OTP, Google Login, user-paper relationships, cloud PDF
storage, RAG/chunking/embeddings, and chat features.

This README is based on the project files/code shared in our
conversation. Commands that depend on an exact project-specific setup
are marked accordingly.

1. Requirements
Install:

Git

Node.js + npm

Python 3.10+

Database configured by the backend

Supabase project

Google OAuth credentials

SMTP/email credentials for OTP

Check:

git --version
node --version
npm --version
python --version
2. Project Structure
Expected layout:

ResearchAI/
├── frontend/
├── backend/
│   └── app/
├── .gitignore
└── README.md
Run commands from the directory containing the relevant package.json
or backend files.

3. Backend Setup
cd backend
Create virtual environment.

Windows PowerShell
py -m venv .venv
.venv\Scripts\Activate.ps1
If PowerShell blocks activation:

Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Windows CMD
py -m venv .venv
.venv\Scripts\activate
Linux/macOS
python3 -m venv .venv
source .venv/bin/activate
Install dependencies:

python -m pip install --upgrade pip
pip install -r requirements.txt
If you add a Python dependency and your project uses requirements.txt:

pip freeze > requirements.txt
4. Backend .env
Create:

backend/.env
Use the exact variable names already expected by your
app/core/config.py.

Typical values are:

DATABASE_URL=your_database_url

SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USERNAME=your_email
SMTP_PASSWORD=your_email_password
SMTP_FROM=your_email

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

FRONTEND_URL=http://localhost:5173
Never commit the real .env.

The Supabase service-role key, Google client secret, SMTP password,
database credentials, and other private keys must remain backend-only.

5. Start Backend
From backend/:

uvicorn app.main:app --reload
Typical API:

http://127.0.0.1:8000
Swagger:

http://127.0.0.1:8000/docs
ReDoc:

http://127.0.0.1:8000/redoc
Other useful commands:

uvicorn app.main:app --reload --port 8000
uvicorn app.main:app --host 0.0.0.0 --port 8000
pip list
pip show fastapi
6. Database
The backend uses SQLAlchemy models including:

User
EmailOTP
Paper
The User ↔ Paper relationship means each paper belongs to an
authenticated user.

If your project has Alembic:

alembic upgrade head
Create a migration:

alembic revision --autogenerate -m "describe change"
Then:

alembic upgrade head
Only use Alembic commands if your project actually contains an Alembic
setup.

7. Frontend Setup
Open a second terminal:

cd frontend
npm install
npm run dev
Typical frontend:

http://localhost:5173
Useful commands:

npm run
npm run dev
npm run build
npm run preview
npm update
If the frontend uses Vite environment variables, create frontend/.env
with variables such as:

VITE_API_URL=http://127.0.0.1:8000
Never put a Supabase service-role key in frontend code.

8. Run the Complete Project
Terminal 1 --- Backend
cd backend
Windows:

.venv\Scripts\Activate.ps1
Linux/macOS:

source .venv/bin/activate
Then:

uvicorn app.main:app --reload
Terminal 2 --- Frontend
cd frontend
npm install
npm run dev
Open:

http://localhost:5173
9. Authentication
Signup:

POST /auth/signup
OTP verification:

POST /auth/verify-otp
Resend OTP:

POST /auth/resend-otp
The signup flow is:

Signup form
   ↓
FastAPI /auth/signup
   ↓
User created as unverified
   ↓
6-digit OTP generated
   ↓
OTP hashed and stored
   ↓
OTP emailed
   ↓
User enters OTP
   ↓
/auth/verify-otp
   ↓
User becomes verified
   ↓
Session created
   ↓
Dashboard
Your OTP system includes expiry, attempt limits, previous-OTP
invalidation, and a purpose field.

Google Login uses the OAuth flow already implemented in the project. For
production, update Google OAuth redirect URLs and frontend/backend URLs.

10. Profile Email Change
Changing an email should verify the new email before replacing the
existing one:

User enters new email
        ↓
Backend detects email change
        ↓
Generate OTP
        ↓
Send OTP to new email
        ↓
User enters OTP
        ↓
OTP verified
        ↓
Database email updated
        ↓
Session refreshed
Do not permanently change the email before verification.

11. Supabase PDF Storage
The intended architecture is:

PDF file
   ↓
Supabase Storage

Paper metadata
   ↓
SQL database
The database should keep metadata such as:

user ID

paper ID

title

original filename

file size

cloud storage path/key

timestamps

The actual PDF should live in Supabase Storage.

Important: the Supabase service-role key must only be used by the
backend.

12. Paper API
Upload:

POST /api/papers/upload
List current user's papers:

GET /api/papers
Delete:

DELETE /api/papers/{paper_id}
Open/view:

GET /api/papers/{paper_id}/file
Paper access must always verify ownership using the authenticated user.

13. RAG / Chunking / Embeddings
Typical pipeline:

PDF
 ↓
Text extraction
 ↓
Cleaning
 ↓
Chunking
 ↓
Embeddings
 ↓
Vector storage
 ↓
Similarity search
 ↓
Relevant chunks
 ↓
LLM
 ↓
Answer
Recommended separation:

PDFs          → Supabase Storage
Paper metadata → SQL database
Chunks         → database/vector storage
Embeddings     → vector storage/database
Chats          → database
Use the exact RAG/vector implementation already present in your project
rather than adding a second storage system unnecessarily.

14. Security
Create a root .gitignore containing:

.env
.env.*
!.env.example

.venv/
venv/
__pycache__/
*.py[cod]

node_modules/
dist/
build/
.vite/

uploads/
storage/

.vscode/
.idea/

*.log
*.db
*.sqlite
*.sqlite3

.DS_Store
Thumbs.db
Create .env.example with placeholders only:

DATABASE_URL=

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

SMTP_HOST=
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_FROM=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

FRONTEND_URL=http://localhost:5173
Never commit:

.env
Supabase service-role key
Google client secret
SMTP password
database passwords
private API keys
If a secret has already been pushed to GitHub, rotate/revoke it.
Removing it from the latest commit is not sufficient to make an exposed
credential safe.

15. GitHub --- First Upload
From the project root:

git status
If Git has not been initialized:

git init
Add GitHub remote:

git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
Verify:

git remote -v
Create the first commit:

git add .
git status
git commit -m "Initial project setup"
git branch -M main
git push -u origin main
16. Normal Git Workflow
After making changes:

git status
git diff
git add .
git commit -m "Describe the changes"
git push
Pull latest changes:

git pull
View history:

git log --oneline
View branches:

git branch
Create development branch:

git switch -c development
Switch branch:

git switch main
17. Git Safety Check Before Push
Always run:

git status
git diff
Confirm that .env is ignored.

You can also search your staged files for suspicious names:

password
secret
service_role
api_key
token
client_secret
If GitHub detects a secret, do not bypass the protection. Remove the
credential and rotate it.

18. Architecture
                 React Frontend
                       │
                       │ HTTP
                       ▼
                 FastAPI Backend
                  │      │      │
                  │      │      └── Google / Email Auth
                  │      │
                  │      └───────── RAG / AI
                  │
             ┌────┴────┐
             ▼         ▼
        SQL Database  Supabase
                      Storage
                         │
                         ▼
                        PDFs
Conceptually:

User
 ├── Papers
 │    ├── Paper
 │    │    ├── Chunks
 │    │    └── Embeddings
 │    └── Paper
 │
 └── Chats
      └── Messages
19. Quick Command Cheat Sheet
Backend
cd backend
Windows:

.venv\Scripts\Activate.ps1
Linux/macOS:

source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
Frontend
cd frontend
npm install
npm run dev
Git
git status
git add .
git commit -m "message"
git push
Build frontend
npm run build
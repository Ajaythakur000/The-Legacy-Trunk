# 🔱 The Legacy Trunk

*Preserving family stories and memories across generations.*

---

## 📖 About The Project

For the Great Zanetti family, the circus is a hundred-year-old bond forged in sawdust and starlight. Their heritage is a tapestry of legendary acts and whispered family stories passed from grandparent to grandchild. But as the elder Zanettis take their final bow, this precious heritage is fading.

**The Legacy Trunk** is a private digital hearth where every family member can safeguard their stories, media, and heirlooms, ensuring their kinship and magic live on forever. It's a secure space to build a collective family memory, accessible anytime, anywhere.

## ✨ Core Features 

Our backend currently supports the following core features:

* ✅ **User Authentication & Authorization:** Secure user registration and login system using JWT and password hashing.
* ✅ **Protected Routes:** Custom middleware ensures that a user can only access and modify their own data.
* ✅ **Story Management (Full CRUD):**
    * Create, Read, Update, and Delete stories.
    * Includes text, tags, and media (images/videos) uploads.
* ✅ **Media Uploads:** Seamless integration with **Cloudinary** for scalable cloud storage of all media files.
* ✅ **Timeline & Events System:** Users can create personal timelines and add important life events to them.
* ✅ **Private Family Circles & Sharing:**
    * Create private groups (circles) for family members.
    * Add and remove members from circles.
    * Share stories securely with one or more circles.
* ✅ **Role-Based Permissions:** A foundational system for "parent" and "kid" roles, allowing parents to manage their children's stories.
* ✅ **Search Functionality:** A powerful search API to find stories, timelines, and events using keywords.
* ✅ **Story Export to PDF:** Users can export collections of their stories into a beautifully formatted, book-style PDF file using **Puppeteer**.

## 🚀 Tech Stack

### Backend
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (with Mongoose ODM)
* **Authentication:** JSON Web Tokens (jsonwebtoken), bcryptjs
* **File Uploads:** Multer, Cloudinary
* **PDF Generation:** Puppeteer
* **Real-time (Future):** Socket.IO

### Frontend
* **Framework:** Next.js (React)
* **Styling:** Tailwind CSS
* **Animations:** Framer Motion

## ⚙️ Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

* Node.js
* NPM
* MongoDB Atlas account

### Installation & Setup

1.  **Clone the repo:**
    ```sh
    git clone [https://github.com/Ajaythakur000/THE-LEGACY-TRUNK---935.git](https://github.com/Ajaythakur000/THE-LEGACY-TRUNK---935.git)
    ```
2.  **Navigate to the project directory:**
    ```sh
    cd THE-LEGACY-TRUNK---935
    ```

3.  **Setup Backend:**
    * Navigate to the backend folder:
        ```sh
        cd backend
        ```
    * Install NPM packages:
        ```sh
        npm install
        ```
    * Create a `.env` file in the `backend` root and add the following variables:
        ```env
        MONGO_URI=your_mongodb_connection_string
        PORT=8000
        JWT_SECRET=your_jwt_secret_key
        CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
        CLOUDINary_API_KEY=your_cloudinary_api_key
        CLOUDINARY_API_SECRET=your_cloudinary_api_secret
        ```
    * Start the backend server:
        ```sh
        npm start
        ```
        The server will be running on `http://localhost:8000`.

4.  **Setup Frontend:**
    * Open a new terminal and navigate to the frontend folder:
        ```sh
        cd frontend
        ```
    * Install NPM packages:
        ```sh
        npm install
        ```
    * Create a `.env.local` file in the `frontend` root and add the following variable:
        ```env
        NEXT_PUBLIC_API_URL=http://localhost:8000
        ```
    * Start the frontend development server:
        ```sh
        npm run dev
        ```
        Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## 🤝 Team TRIDENT

* **Ajay Thakur**
* **Aayush Kohli**
* **Abhishek Pachlaniya**


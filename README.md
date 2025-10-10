# 🔱 The Legacy Trunk

[cite_start]*Preserving family stories and memories across generations.* [cite: 13]

---

## 📖 About The Project

[cite_start]For the Great Zanetti family, the circus is a hundred-year-old bond forged in sawdust and starlight. [cite: 9] [cite_start]Their heritage is a tapestry of legendary acts and whispered family stories passed from grandparent to grandchild. [cite: 10] [cite_start]But as the elder Zanettis take their final bow, this precious heritage is fading. [cite: 11]

[cite_start]**The Legacy Trunk** is a private digital hearth where every family member can safeguard their stories, media, and heirlooms, ensuring their kinship and magic live on forever. [cite: 13] It's a secure space to build a collective family memory, accessible anytime, anywhere.

## ✨ Core Features (Backend Complete)

Our backend currently supports the following core features:

* [cite_start]✅ **User Authentication & Authorization:** Secure user registration and login system using JWT and password hashing. [cite: 31]
* ✅ **Protected Routes:** Custom middleware ensures that a user can only access and modify their own data.
* ✅ **Story Management (Full CRUD):**
    * [cite_start]Create, Read, Update, and Delete stories. [cite: 26]
    * Includes text, tags, and media (images/videos) uploads.
* [cite_start]✅ **Media Uploads:** Seamless integration with **Cloudinary** for scalable cloud storage of all media files. [cite: 49, 50]
* [cite_start]✅ **Timeline & Events System:** Users can create personal timelines and add important life events to them. [cite: 27]
* ✅ **Private Family Circles & Sharing:**
    * [cite_start]Create private groups (circles) for family members. [cite: 29]
    * Add and remove members from circles.
    * [cite_start]Share stories securely with one or more circles. [cite: 29]
* [cite_start]✅ **Role-Based Permissions:** A foundational system for "parent" and "kid" roles, allowing parents to manage their children's stories. [cite: 31]
* [cite_start]✅ **Search Functionality:** A powerful search API to find stories, timelines, and events using keywords. [cite: 30]
* [cite_start]✅ **Story Export to PDF:** Users can export collections of their stories into a beautifully formatted, book-style PDF file using **Puppeteer**. [cite: 61]

## 🚀 Tech Stack

### Backend
* **Runtime:** Node.js
* **Framework:** Express.js
* [cite_start]**Database:** MongoDB (with Mongoose ODM) [cite: 41]
* [cite_start]**Authentication:** JSON Web Tokens (jsonwebtoken), bcryptjs [cite: 44]
* [cite_start]**File Uploads:** Multer, Cloudinary [cite: 49]
* [cite_start]**PDF Generation:** Puppeteer [cite: 60, 61]
* [cite_start]**Real-time (Future):** Socket.IO [cite: 57]

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
        CLOUDINARY_API_KEY=your_cloudinary_api_key
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

## [cite_start]🤝 Team TRIDENT [cite: 4]

* [cite_start]**Ajay Thakur** [cite: 5]
* [cite_start]**Aayush Kohli** [cite: 6]
* [cite_start]**Abhishek Pachlaniya** [cite: 7]

## 📜 License

Distributed under the MIT License. See `LICENSE` file for more information.


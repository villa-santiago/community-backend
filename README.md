# comm.unity — Backend

This is the backend API for **comm.unity**, a community-driven platform for publishing and browsing posts related to services, products, events, and information.

Built with [Express], connected to [MongoDB Atlas], and secured with JWT authentication.

---

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- CORS / Cookie Parser / Dotenv
- Hosted on [Render]

---

## Auth Routes

| Method | Endpoint       | Description                        
| ------ | -------------- | ---------------------------------- 
| POST   | `/auth/signup` | Register a new user                
| POST   | `/auth/login`  | Login a user and receive a token   
| GET    | `/auth/verify` | Verifies JWT and returns user data 

---

## User Routes

| Method | Endpoint               | Description                              
| ------ | ---------------------- | ---------------------------------------- 
| GET    | `/users/:userId`       | Get public profile (username, bio, etc.) 
| GET    | `/users/:userId/posts` | Get all posts made by a specific user    
| GET    | `/users/my-posts`      | Get logged-in user's own posts           
| PATCH  | `/users/profile`       | Update profile (bio, location, image)    
| PATCH  | `/users/password`      | Change user password                     
| DELETE | `/users/delete`        | Delete account (and user's posts)

---

## Post Routes

| Method | Endpoint     | Description                    
| ------ | ------------ | ------------------------------ 
| GET    | `/posts`     | Get all posts (sorted by da) 
| GET    | `/posts/:id` | Get a single post by ID        
| POST   | `/posts`     | Create a new post              
| PUT    | `/posts/:id` | Edit a post (only owner)       
| DELETE | `/posts/:id` | Delete a post (only owner)  


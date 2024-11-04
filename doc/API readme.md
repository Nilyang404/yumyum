# Comprehensive API Documentation

## Base URL

- **URL**: `https://9900yumyumbackend.vercel.app`

## General Information

- **Authentication**: Most endpoints require JWT (JSON Web Tokens) for access. Tokens must be included in the request header as `Authorization: Bearer <token>`.

## Endpoints Description

### User Operations

1. **User Registration**
   
   - **Endpoint**: `/api/user/register`
   - **Method**: `POST`
   - **Description**: Registers a new user.
   - **Request Body**:
     
     ```json
     {
       "username": "String",
       "email": "String",
       "password": "String"
     }
     ```
   - **Response**: `201 Created`, returns user ID and JWT token.

2. **User Login**
   
   - **Endpoint**: `/api/user/login`
   - **Method**: `POST`
   - **Description**: Authenticates user and returns a JWT token.
   - **Request Body**:
     
     ```json
     {
       "email": "String",
       "password": "String"
     }
     ```
   - **Response**: `200 OK`, returns JWT token and user ID.

3. **View User Profile**
   
   - **Endpoint**: `/api/profile/user/info`
   - **Method**: `GET`
   - **Description**: Retrieves the authenticated user's profile.
   - **Response**: `200 OK`, returns user profile details.

4. **Update User Profile**
   
   - **Endpoint**: `/api/profile/user/edit`
   - **Method**: `PUT`
   - **Description**: Updates the user's profile information.
   - **Request Body**:
     
     ```json
     {
       "username": "String (optional)",
       "preferences": "String (optional)",
       "avatar": "String (optional)",
       "is_subscribed": "Boolean (optional)"
     }
     ```
   - **Response**: `200 OK`, returns updated profile details.

### Restaurant Operations

1. **Restaurant Registration**
   
   - **Endpoint**: `/api/eatery/register`
   - **Method**: `POST`
   - **Description**: Registers a new restaurant.
   - **Request Body**:
     
     ```json
     {
       "username": "String",
       "email": "String",
       "password": "String"
     }
     ```
   - **Response**: `201 Created`, returns restaurant ID and JWT token.

2. **Restaurant Login**
   
   - **Endpoint**: `/api/eatery/login`
   - **Method**: `POST`
   - **Description**: Authenticates restaurant and returns a JWT token.
   - **Request Body**:
     
     ```json
     {
       "email": "String",
       "password": "String"
     }
     ```
   - **Response**: `200 OK`, returns JWT token and restaurant ID.

3. **View Restaurant Profile**
   
   - **Endpoint**: `/api/profile/eatery/info`
   - **Method**: `GET`
   - **Description**: Retrieves the authenticated restaurant's profile.
   - **Response**: `200 OK`, returns restaurant profile details.

### Menu Item Management

1. **Add Menu Item**
   
   - **Endpoint**: `/api/menu/eatery/add`
   - **Method**: `POST`
   - **Description**: Adds a new menu item to the restaurant's menu.
   - **Request Body**:
     
     ```json
     {
       "name": "String",
       "price": "Number",
       "description": "String",
       "image": "String"
     }
     ```
   - **Response**: `201 Created`, returns the added menu item details.

2. **Edit Menu Item**
   
   - **Endpoint**: `/api/menu/eatery/edit/{id}`
   - **Method**: `PUT`
   - **Description**: Edits an existing menu item.
   - **Path Parameters**:
     - `id`: ID of the menu item to edit
   - **Request Body**:
     
     ```json
     {
       "name": "String",
       "price": "Number",
       "description": "String",
       "image": "String"
     }
     ```
   - **Response**: `200 OK`, returns the updated menu item details.

3. **Delete Menu Item**
   
   - **Endpoint**: `/api/menu/eatery/delete/{id}`
   - **Method**: `DELETE`
   - **Description**: Deletes a menu item.
   - **Path Parameters**:
     - `id`: ID of the menu item to delete
   - **Response**: `200 OK`, confirmation of deletion.

### Voucher Management

1. **Add Voucher**
   
   - **Endpoint**: `/api/voucher/add`
   - **Method**: `POST`
   - **Description**: Adds a new promotional voucher.
   - **Request Body**:
     
     ```json
     {
       "discount": "Number",
       "start_time": "DateTime",
       "end_time": "DateTime",
       "details": "String",
       "selected_items": ["String"],
       "quantity": "Number",
       "weeklyRepeat": "Boolean"
     }
     ```
   - **Response**: `201 Created`, returns voucher details.

2. **Edit Voucher**
   
   - **Endpoint**: `/api/voucher/edit/{setid}`
   - **Method**: `PUT`
   - **Description**: Edits details of an existing voucher.
   - **Path Parameters**:
     - `setid`: Set ID of the voucher to edit
   - **Request Body**:
     
     ```json
     {
       "discount": "Number",
       "start_time": "DateTime",
       "end_time": "DateTime",
       "details": "String",
       "selected_items": ["String"],
       "quantity": "Number",
       "weeklyRepeat": "Boolean"
     }
     ```
   - **Response**: `200 OK`, returns updated voucher details.

3. **Delete Voucher**
   
   - **Endpoint**: `/api/voucher/delete/{setid}`
   - **Method**: `DELETE`
   - **Description**: Deletes a voucher set.
   - **Path Parameters**:
     - `setid`: Set ID of the voucher to delete
   - **Response**: `200 OK`, confirmation of deletion.

### Voucher Information and Claims

4. **View Voucher Set**
   
   - **Endpoint**: `/api/voucher/info/{setid}`
   - **Method**: `GET`
   - **Description**: Retrieves details for a specific set of vouchers.
   - **Path Parameters**:
     - `setid`: Set ID of the voucher to view
   - **Response**: `200 OK`, returns details of the voucher set.

5. **Claim Voucher**
   
   - **Endpoint**: `/api/voucher/claim/{setid}`
   - **Method**: `PUT`
   - **Description**: Claims a voucher from a set by a user.
   - **Path Parameters**:
     - `setid`: Set ID of the voucher to claim
   - **Request Body**:
     
     ```json
     {
       "customer": "UserID"
     }
     ```
   - **Response**: `201 Created`, returns details of the claimed voucher.

6. **Redeem Voucher**
   
   - **Endpoint**: `/api/voucher/redeem/{encodedVoucherId}`
   - **Method**: `PUT`
   - **Description**: Redeems a voucher by a customer.
   - **Path Parameters**:
     - `encodedVoucherId`: Encoded ID of the voucher to redeem
   - **Request Body**:
     
     ```json
     {
       "current_time": "DateTime"
     }
     ```
   - **Response**: `201 Created`, returns confirmation and details of the redeemed voucher.

### Comments and Ratings

1. **Post Comment**
   
   - **Endpoint**: `/api/user/comments`
   - **Method**: `POST`
   - **Description**: Allows users to post comments and ratings for an eatery.
   - **Request Body**:
     
     ```json
     {
       "eateryId": "EateryID",
       "text": "String",
       "rating": "Number"
     }
     ```
   - **Response**: `201 Created`, returns the posted comment details.

2. **Edit Comment**
   
   - **Endpoint**: `/api/user/comments/{commentId}`
   - **Method**: `PUT`
   - **Description**: Allows users to edit their own comments.
   - **Path Parameters**:
     - `commentId`: ID of the comment to edit
   - **Request Body**:
     
     ```json
     {
       "text": "String",
       "rating": "Number"
     }
     ```
   - **Response**: `200 OK`, returns updated comment details.

3. **Delete Comment**
   
   - **Endpoint**: `/api/user/comments/{commentId}`
   - **Method**: `DELETE`
   - **Description**: Allows users to delete their own comments.
   - **Path Parameters**:
     - `commentId`: ID of the comment to delete
   - **Response**: `200 OK`, confirmation of deletion.

4. **View Comments by Eatery**
   
   - **Endpoint**: `/api/eatery/comments/{eateryId}`
   - **Method**: `GET`
   - **Description**: Retrieves all comments made for a specific eatery.
   - **Path Parameters**:
     - `eateryId`: ID of the eatery
   - **Response**: `200 OK`, returns a list of all comments and ratings for the eatery.

#### General User and Eatery Utilities

1. **Recommendation System**
   
   - **Endpoint**: `/api/recommendation`
   - **Method**: `GET`
   - **Description**: Provides a list of three recommended eateries based on certain criteria.
   - **Response**: `200 OK`, returns details of recommended eateries.

2. **Search Eateries**
   
   - **Endpoint**: `/api/search/eatery`
   - **Method**: `GET`
   - **Description**: Returns eateries based on search criteria like name, cuisine type, or proximity.
   - **Query Parameters**:
     - `keywords`: Search term for name or address
     - `cuisineType`: Cuisine type
     - `lat`: Latitude for proximity-based search
     - `lng`: Longitude for proximity-based search
     - `distance`: Distance in kilometers for proximity-based search
   - **Response**: `200 OK`, returns list of eateries matching the search criteria.

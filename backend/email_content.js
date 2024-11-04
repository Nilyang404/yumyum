function createEmailContent(eateries, user) {
let logo_url = "https://raw.githubusercontent.com/Nilyang404/MERN-CRUD-APP-Demo/main/frontend/public/yumyum_logo.png"
let avatars = [
    "https://raw.githubusercontent.com/Nilyang404/MERN-CRUD-APP-Demo/main/frontend/public/1.png",
    "https://raw.githubusercontent.com/Nilyang404/MERN-CRUD-APP-Demo/main/frontend/public/2.png",
    "https://raw.githubusercontent.com/Nilyang404/MERN-CRUD-APP-Demo/main/frontend/public/3.png"
];
    let html = `
<html>
<head>
<style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; color: #333; background-color: #f4f4f4; }
        .email-container { max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
        .header { background-color: #4CAF50; color: #ffffff; padding: 20px 40px; text-align: center; }
        .content { padding: 20px 40px; line-height: 1.6; }
        .restaurant { margin-bottom: 20px; padding: 20px; background-color: #f8f8f8; border-left: 5px solid #4CAF50; display: flex; align-items: center; }
        .restaurant-info { flex: 1; }
        .avatar {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            margin-right: 20px;
            object-fit: cover;
            object-position: center;
          }
        .center-image { text-align: center; margin-bottom: 20px; }
        .title { font-size: 18px; color: #333; margin: 0 0 5px 0; }
        .info { margin: 0; font-size: 14px; }
        .footer { text-align: center; padding: 10px 40px; font-size: 12px; background-color: #f0f0f0; }
</style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Welcome to Your YumYum Adventure!</h1>
        </div>
        <div class="content">
        <div class="center-image">
                <img src="${logo_url}" alt="Logo" style="max-height: 80px;">
            </div>
            <p>Hi ${user},</p>
            <p>Welcome to a world where your taste buds get to travel as much as you do, without breaking the bank! At Our Dining Discount Platform, we believe that the best meals are the ones shared with loved ones, spiced up with a great deal. Dive into a sea of options—whether you're craving the coziness of a café or the bustle of a bustling restaurant, find exclusive deals and book your next feast in just a few clicks.</p>
            <h2>Recommended Restaurants</h2>
    `;
    let index = 0;
    eateries.forEach(eatery => {
        html += `
            <div class="restaurant">
                <img src="${avatars[index]}" alt="${eatery.username}" class="avatar">
                <div class="restaurant-info">
                    <h3 class="title">${eatery.username}</h3>
                    <p class="info"><strong>Address:</strong> ${eatery.address}</p>
                    <p class="info"><strong>Cuisine:</strong> ${eatery.cuisine.join(", ")}</p>
                    <p class="info"><strong>Rating:</strong> ${eatery.rating_average} (from ${eatery.rating_quantity} reviews)</p>
                </div>
            </div>
        `;
        index++;
    });

    html += `
        </div>
        <div class="footer">
            <p>Thank you for joining us on this delicious journey!</p>
        </div>
    </div>
</body>
</html>
    `;

    return html;
}


const eateries = [
    {
        "_id": "66211006d29e19e6d331b5a6",
        "userId": "66211006d29e19e6d331b5a2",
        "username": "bb seafood",
        "opening_hours": [
            "2024-04-18T00:00:05.152Z",
            "2024-04-18T10:30:15.159Z"
        ],
        "is_public": true,
        "is_subscribed": true,
        "cuisine": [
            "Seafood",
            "Indian"
        ],
        "rating_average": 5,
        "rating_quantity": 1,
        "avatar": "data:image/jpeg;base64,/9j/4AA..",
        "address": "234 Sussex St, Sydney NSW 2000, Australia",
        "geo_coordinates": {
            "type": "Point",
            "coordinates": [
                151.2043704,
                -33.8722917
            ]
        }
    },

];
const username = "Helen";

const emailContent = createEmailContent(eateries, username);
export { createEmailContent };


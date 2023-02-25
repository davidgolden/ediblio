## Ediblio

#### About

Ediblio is a web application for adding, sharing, and managing recipes and grocery lists. The primary application is for
adding recipes from users' favorite food blogs etc, sharing with others, and quickly adding those recipes to their menus and grocery lists.
Users may also upload their own recipes. Users also can create collections of recipes which serve as a categorization method for their
own or others' recipes, and users have the ability to follow other users' collections. When populating a grocery list, Ediblio smartly
adds ingredients together so that users only see one of each ingredient needed whenever possible.

#### Tech

Ediblio uses NextJS to server-side render a Node/React application with PostgreSQL as its database.

#### Notable Features

- Ediblio is a Progressive Web App - download Ediblio to your homescreen and view recipes and your grocery lists offline!
- Edit or delete just about anything! Edit or remove ingredients from a recipe before adding them to your grocery list, edit or delete ingredients in your grocery list, and of course edit or delete anything you want in recipes you have submitted.
- Store mode for grocery lists creates new page without all the added weight of editing or adding ingredients. This mode is intended for use in-store with any mobile device. - <em>Coming soon!</em>
- Scrapes URL metadata for recipe image when submitting new recipe with URL.
- Autopopulate grocery list with auto-conversions and auto-totaling.
- Rate yours' and others' recipes
- Follow others' collections 

#### Setup

The following environmental variables are required:
  - AWS_ACCESS_KEY_ID
  - AWS_SECRET_ACCESS_KEY 
  - CDN_URL (AWS credentials and CDN_URL are required for image uploads and access to work)
  - MAILGUN_API (necessary for forgot password and user invites to work)
  - JWT_SECRET (some random string)
  - DATABASE_URL (connection uri, i.e. postgresql://username:password@host:port/database)
  - APP_URL (full url the app is hosted on)

When logging on for the first time, visit <APP_URL>/register. The application will allow the first user to register without an invite token. All future users must be invited.

#### Roadmap

- Add admin permissions structure, so only admins can invite other users, and admins can delete non-admin users. This probably requires superadmin permissions as well, for designating other admins.
- Revamp how email works so we don't require a Mailgun API key
- Revamp how image storage works so we don't require AWS credentials or CDN_URL
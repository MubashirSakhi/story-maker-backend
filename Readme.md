# GraphQl Story Maker Backend

I was going through an article that mentions grapql is better than rest api as it allows you to return what is required and avoid extra redundant details thhat are not covered. 
While i had an idea of doing a very basic project which allows user to create titles and other users can develop their own stories around those titles and then users can rate and comment on the stories developed for a certain title. 
I followed graphql tutorial for nodejs https://www.howtographql.com/graphql-js/1-getting-started/ 
but I tweaked it around my needs and added passport js to include social media oauth logins for the user to easily signup. Used **Sequelize** and **sqlite3** for this project

I created two postman collections to test my code,
first is to unit test individual queries and second is end to end to test calling all queries in order and storing variables in environmental variables to pass it to other queries.
```
1.Unit Test Postman Collection: https://www.getpostman.com/collections/c8364a125e8b32a07bb
2.End to End Collection https://www.getpostman.com/collections/5b716aea1daa4498ac5f
```
Learn how to create collections and writes tests in postman
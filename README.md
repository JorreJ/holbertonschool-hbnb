# Objective

Create a high-level package diagram that illustrates the three-layer architecture of the HBnB application and the communication between these layers via the facade pattern. This diagram will provide a conceptual overview of how the different components of the application are organized and how they interact with each other.
---
```mermaid
classDiagram
class PresentationLayer {
    <<Interface>>
    +ServiceAPI
}
class FacadePattern {
    +handleRequest
}
class BusinessLogicLayer {
    +ModelClasses
}
class PersistenceLayer {
    +DatabaseAccess
}
PresentationLayer --> FacadePattern : Calls API
FacadePattern --> BusinessLogicLayer : Calls Business Methods
BusinessLogicLayer --> PersistenceLayer : Database Operations
```
```mermaid
classDiagram
direction RL
class BaseModel:::className {
    <<Abstract Base Class>>
    int id
    string datetime
    add()
    update()
    del()
}
class User {
    string Email
    string First Name
    string Last Name
    string Password
    boolean Administrator
    list places
    change_permission()
    list_places()
}
class Place {
    string Title
    string Description
    float Price
    float Latitude
    float Longitude
    list Amenities
    list_amenities()
    list_review()
}
class Review {
    float Rating
    string Comment
}
class Amenity {
    string Name
    string Description
}
User <|-- BaseModel
Place <|-- BaseModel
Review <|-- BaseModel
Amenity <|-- BaseModel
User "1.*" <|--|>"1" Place
User "0.n" <|--|> "1" Review
Place "0.n" <|--|> "1" Review
Place "0.n" <|--|> "1" Amenity
```
Represents data, implements business logic and handles storage.

Try to make your models independent from the outside world. They don’t need to know about other models and they should never include them. They don’t need to know about controllers or who uses them. They should never receive request or response objects. They should never return http errros, but they should return model specific errors.

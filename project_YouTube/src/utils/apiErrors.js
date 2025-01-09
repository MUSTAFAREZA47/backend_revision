class ApiError extends Error {
    constructor(
        statusCode,
        message= "something went wrong",
        error= [],
        stack= "",

    ){
        super(message)
        this.statusCode = statusCode
        this.error = error
        this.success = false
        this.data = null
        this.message = message
    }
}

export { ApiError }
//Generic return class for all responses

class GenericReturn {

    statusCode: number;
    message: string;
    result: string;
    data: any;
    id: string;


    constructor(
        id: string,
        statusCode: number,
        message: string,
        result: string,
        data: any

    ) {
        this.id = id;
        this.statusCode = statusCode;
        this.message = message;
        this.result = result;
        this.data = data;
    }
}

export default GenericReturn;
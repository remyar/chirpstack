const OK = 200;
const CREATED = 201;
const NO_CONTENT = 204;
const NOT_FOUND = 404;
const METHOD_NOT_ALLOWED = 405;
const EPIC_FAIL = 500;
const GATEWAY_TIMEOUT = 504;
const NOT_AUTHORIZED = 403;
const INVALID_FORM_DATAS = 417;

const mdw = (err) => {

    if (err.status === undefined) {

        err.status = EPIC_FAIL;

        //-- process message
        if (err.message !== undefined) {
            switch (err.message) {
                case ("Failed to fetch"): {
                    err.status = GATEWAY_TIMEOUT;
                    break;
                }
                default:
                    break;
            }
        }
    }

    switch (err.status) {
        case (GATEWAY_TIMEOUT): {
            err.message = "COMMON.Request Timeout";
            break;
        }
        case (METHOD_NOT_ALLOWED): {
            err.message = "ERROR.Method Not Allowed";
            break;
        }
        case (NOT_FOUND): {
            err.message = "ERROR.Resource not found";
            break;
        }
        default:
            break;
    }


    return err;
};

export default {
    // general status code
    OK,
    CREATED,
    NOT_FOUND,
    EPIC_FAIL,
    NO_CONTENT,
    GATEWAY_TIMEOUT,
    NOT_AUTHORIZED,
    INVALID_FORM_DATAS,

    mdw,
}
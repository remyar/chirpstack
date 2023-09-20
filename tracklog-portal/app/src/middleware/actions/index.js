export default (fn) => {
    const factory =  (...args) => async (dispatch, getState, extra) => {
        try {
           return fn(...args, { getState, dispatch, extra });
        } catch (error) {
            throw error;
        }
    }

    return factory;
}
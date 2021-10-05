const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass


//Check if deliverTo is valid
const isDeliverToValid = (req, res, next) => {
    const { data: { deliverTo } } = req.body;
    if(!deliverTo){
        next({
            status: 400,
            message: 'Order must include a deliverTo',
        });
    };
    return true;
};

//Check if mobile number is valid
const isMobileNoValid = (req, res, next) => {
    const { data: { mobileNumber } } = req.body;
    if(!mobileNumber){
        next({
            status: 400,
            message: 'Order must include a mobileNumber',
        });
    };
    return true;
};

//Check if ordered dishes are valid
const areDishesValid = (req, res, next) => {
    const { data: { dishes } } = req.body;
    if(!dishes){
        next({
            status: 400,
            message: 'Order must include a dish',
        });
    };
    if(typeof(dishes) != "object" || !dishes.length){
        next({
            status: 400,
            message: 'Order must include at least one dish',
        });
    };
    return true;
};

//Check if dish quantitiy is valid
const isQuantityValid = (req, res, next) => {
    const { data: { dishes } } = req.body;
    dishes.forEach(({quantity},index) => {
        if(!quantity || typeof(quantity) !== "number" || quantity<=0){
            next({
                status: 400,
                message:`Dish ${index} must have a quantity that is an integer greater than 0`
            });
        };
    });
    return true;
};

// Check if order is valid
const isOrderValid = (req, res, next) => {
  return (
    isDeliverToValid(req, res, next) &&
    isMobileNoValid(req, res, next) &&
    areDishesValid(req, res, next) &&
    isQuantityValid(req, res, next) &&
    next()
  );
};

//Check if order exists
const orderExists = (req, res, next) => {
    const { orderId } = req.params;
    const foundOrder = orders.find(({id}) => id === orderId);
    if(foundOrder){
        res.locals.order = foundOrder;
        return next();
    };
    next({
        status: 404,
        message: `Order ${orderId} not found!`,
    });
};

//Check if order id in req (if provided) matches order id in url
const orderIdMatches = (req, res, next) => {
    const { orderId } = req.params;
    const { data: { id }} = req.body;
    if( id && id!==orderId){
        next({
            status: 400,
            message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`
        });
    };
    return next();
};

//Check if order status id valid
const isOrdStatValid = (req, res, next) => {
    const { data: {status}} = req.body;
    const statusList = ['pending', 'preparing', 'out-for-delivery', 'delivered']
    if(!status || !statusList.includes(status)){
        next({
            status: 400,
            message: `Order must have a status of pending, preparing, out-for-delivery, delivered`
        });
    };
    if(status==="delivered"){
        next({
            status: 400,
            message: `A delivered order cannot be changed`
        });
    };
    return next();
};

//Check if order is pending
const isOrdPending = (req, res, next) => {
    const { order } = res.locals;
    if(order.status !== "pending"){
        next({
            status: 400,
            message: `An order cannot be deleted unless it is pending`
        });
    };
    return next();
}

//List the orders
const list = (req, res, next) => res.json({ data: orders });

//Create a new order
const create = (req, res, next) => {
    const { data: order } = req.body;
    const newOrder = {
        id: nextId(), 
        ...order,
    };
    orders.push(newOrder);
    res.status(201).json({ data: newOrder})
};

//Read a specific order
const read = (req, res, next) => {
    const { order } = res.locals;
    res.json({ data: order });
};

//Update an order
const update = (req, res, next) => {
    const { order } = res.locals;
    const { data: update } = req.body;
    for(let prop in update){
        if(update[prop]){
        order[prop] = update[prop];
        };
    };
    res.json({ data: order });
};

//delete an order
const destroy = (req, res, next) => {
    const { orderId } = req.params;
    const index = orders.findIndex(({id}) => id===orderId);
    orders.splice(index, 1);
    res.sendStatus(204);
}


module.exports = {
    list,
    create:[isOrderValid, create],
    read: [orderExists, read],
    update: [orderExists, isOrderValid, orderIdMatches, isOrdStatValid, update],
    delete: [orderExists, isOrdPending, destroy],
};

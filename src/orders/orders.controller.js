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
        if(!quantity || isNaN(quantity) || quantity<=0){
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
        message: `No matching order found!`,
    });
};


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




module.exports = {
    list,
    create:[isOrderValid, create],
    read: [orderExists, read],
};

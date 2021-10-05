const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

//Check if the name is valid
 const isNameValid = (req, res, next) => {
    const { data:{ name } } = req.body;    
    if( !name || name.length<=0 ){
        next({
            status: 400,
            message: 'Dish must include a name',
        })
    }
    return true;
 };

//Check if the description is valid
const isDescriptionValid = (req, res, next) => {
    const { data:{ description } } = req.body;    
    if( !description ){
        next({
            status: 400,
            message: 'Dish must include a description',
        })
    }
    return true;
 };

//Check if price is valid
const isPriceValid = (req, res, next) => {
    const { data:{ price } } = req.body;
    if( price === undefined ){
        next({
            status: 400,
            message: 'Dish must include a price',
        })
    };
    if( typeof(price) != "number" || price<=0 ){
        next({
            status: 400,
            message: 'Dish must have a price that is an integer greater than 0',
        })
    }
    return true;
 };

//Check if image url is valid
const isImageValid = (req, res, next) => {
    const { data:{ image_url } } = req.body;
    if( !image_url ){
        next({
            status: 400,
            message: 'Dish must include a image_url',
        })
    }
    return true;
 };

//Validate new dish entry
const isValidDish = (req, res, next) => {
  return (
    isNameValid(req, res, next) &&
    isDescriptionValid(req, res, next) &&
    isPriceValid(req, res, next) &&
    isImageValid(req, res, next) &&
    next()
  );
};

//Check dish exists
const dishExists = (req, res, next) => {
    const { dishId } = req.params;
    const foundDish = dishes.find(({id}) => id === dishId);
    if(foundDish){
        res.locals.dish = foundDish;
        return next();
    }else{
        next({ 
            status: 404, 
            message: 'No matching dish found!'
        });
    };
};

//Check if dish id in the req body (if provided) 
//matches the dishId in the url
const dishIdMatches = (req, res, next) => {
    const { data:{id} = {} } = req.body; 
    const { dishId } = req.params;
    if(id && id!==dishId){        
            next({
                status: 400,
                message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
            });
    };
    return next();
}


//List all the dishes
const list = (req, res, next) => res.json({ data: dishes });


//Create a new dish entry
const create = (req, res, next) => {
    const { data:{ name, description, price, image_url } } = req.body;
    const newDish = {
        name,
        description,
        price,
        image_url,
        id: nextId(),
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish })
};

//Read a specific dish
const read = (req, res, next) => {
    const { dish } = res.locals;
    res.json({ data: dish });
};


//Update a dish entry
const update = (req, res, next) => {
    const { dish } = res.locals;    
    const { data: update } = req.body;
    for(let prop in update){
        dish[prop] = update[prop];
    }
    res.json({ data: dish })
}


module.exports = {
    list,
    create: [isValidDish, create],
    read: [dishExists, read],
    update: [dishExists, isValidDish, dishIdMatches, update]
}
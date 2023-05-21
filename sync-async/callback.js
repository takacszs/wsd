const removeNegs = (array, my_callback) => {    
    //empty array to add the pos ones
    const pos_array = []

    for (const elem of array)
        {
            if(my_callback(elem)) pos_array.push(elem)
        }
    return pos_array
}

const array = [1,2,3,-2,-5,-7,9]

console.log(removeNegs(array,(x) => x>=0))


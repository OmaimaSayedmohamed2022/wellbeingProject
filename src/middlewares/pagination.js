export const pagination = async (model, query, page = 1, limit = 3, sort = {}) => {
  
    const skip = (parseInt(page) - 1) * limit;
  
    const items = await model.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit);
    const totalItems = await model.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);
  
    return { items, totalPages, totalItems, page: parseInt(page) };
  };
  